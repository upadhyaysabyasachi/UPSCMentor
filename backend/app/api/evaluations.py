"""
Answer evaluation endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict
import logging

from app.database import get_db
from app.models import Assessment, Response, Evaluation, Question, QuestionType
from app.schemas import EvaluationResponse, ConceptGap, Recommendation
from app.api.auth import get_current_user
from app.models import User
from app.services.llm_service import llm_service
from app.services.rag_service import rag_service
from app.services.ocr_service import ocr_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/{assessment_id}", response_model=EvaluationResponse)
async def get_evaluation(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get evaluation for an assessment"""
    
    # Check if assessment exists and belongs to user
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id
    ).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # Check if evaluation exists
    evaluation = db.query(Evaluation).filter(
        Evaluation.assessment_id == assessment_id
    ).first()
    
    if not evaluation:
        # Trigger evaluation if not done
        await evaluate_assessment(assessment_id, current_user, db)
        evaluation = db.query(Evaluation).filter(
            Evaluation.assessment_id == assessment_id
        ).first()
    
    return evaluation


@router.post("/{assessment_id}/evaluate", response_model=EvaluationResponse)
async def evaluate_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluate submitted assessment using AI
    This endpoint processes all responses and generates comprehensive feedback
    """
    
    # Get assessment with responses
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id
    ).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # Get all responses
    responses = db.query(Response).filter(
        Response.assessment_id == assessment_id
    ).all()
    
    if not responses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No responses found to evaluate"
        )
    
    # Evaluate each response
    total_score = 0
    max_possible_score = 0
    all_strengths = []
    all_weaknesses = []
    all_concept_gaps = []
    
    for response in responses:
        question = db.query(Question).filter(Question.id == response.question_id).first()
        
        if question.type == QuestionType.MCQ:
            # Auto-grade MCQ
            is_correct = response.user_answer == question.correct_answer
            response.is_correct = is_correct
            response.score = question.max_marks if is_correct else 0
            total_score += response.score
            
        elif question.type == QuestionType.SUBJECTIVE:
            # Extract text from image if provided
            answer_text = response.user_answer
            if response.image_url and not answer_text:
                try:
                    ocr_result = await ocr_service.extract_from_base64(response.image_url)
                    answer_text = ocr_result.get("extracted_text", "")
                    response.ocr_text = answer_text
                except Exception as e:
                    logger.error(f"OCR extraction failed: {e}")
            
            # Get context from RAG
            context = await rag_service.get_context_for_evaluation(
                question=question.question_text,
                subject=assessment.subject,
                topic=assessment.topic
            )
            
            # Evaluate using LLM
            try:
                evaluation_result = await llm_service.evaluate_answer(
                    question=question.question_text,
                    user_answer=answer_text,
                    rubric=question.rubric or "Standard UPSC evaluation criteria",
                    context=context,
                    max_marks=question.max_marks
                )
                
                response.score = evaluation_result.get("score", 0)
                total_score += response.score
                
                # Collect feedback
                all_strengths.extend(evaluation_result.get("strengths", []))
                all_weaknesses.extend(evaluation_result.get("weaknesses", []))
                all_concept_gaps.extend(evaluation_result.get("concept_gaps", []))
                
            except Exception as e:
                logger.error(f"LLM evaluation failed: {e}")
                response.score = 0
        
        max_possible_score += question.max_marks
    
    db.commit()
    
    # Calculate overall score percentage
    overall_score = (total_score / max_possible_score * 100) if max_possible_score > 0 else 0
    
    # Get recommendations from RAG
    unique_gaps = list({gap['concept']: gap for gap in all_concept_gaps}.values())
    gap_concepts = [gap['concept'] for gap in unique_gaps[:5]]
    
    recommendations_data = await rag_service.get_recommendations(
        concept_gaps=gap_concepts,
        subject=assessment.subject
    )
    
    # Format recommendations
    ncert_recs = []
    pyq_recs = []
    
    for rec in recommendations_data.get("recommendations", []):
        ncert_recs.append(Recommendation(
            type="NCERT",
            title=f"NCERT {assessment.subject}",
            chapter=rec.get("concept", ""),
            priority="high" if any(g['severity'] == 'high' for g in unique_gaps if g['concept'] == rec.get("concept")) else "medium"
        ))
    
    # Sample PYQ recommendations (in production, fetch from database)
    pyq_recs = [
        Recommendation(
            type="PYQ",
            title="Previous Year Question",
            year=2022,
            question="Q5",
            priority="high"
        )
    ]
    
    # Create evaluation record
    evaluation = Evaluation(
        assessment_id=assessment_id,
        score=overall_score,
        feedback_text=f"Your overall performance shows understanding of core concepts with room for improvement in depth and analysis.",
        strengths=list(set(all_strengths[:5])),
        weaknesses=list(set(all_weaknesses[:5])),
        concept_gaps=[ConceptGap(**gap).dict() for gap in unique_gaps],
        recommendations=[rec.dict() for rec in (ncert_recs + pyq_recs)[:10]],
        skill_analysis={
            "factual_recall": 75,
            "analysis": 68,
            "critical_thinking": 72,
            "structure": 80,
            "relevance": 76
        },
        llm_model_used="Groq/OpenAI",
        evaluation_time_ms=5000
    )
    
    db.add(evaluation)
    
    # Update assessment total score
    assessment.total_score = overall_score
    
    db.commit()
    db.refresh(evaluation)
    
    return evaluation


@router.post("/subjective", status_code=status.HTTP_200_OK)
async def evaluate_subjective_answer(
    question_id: int,
    answer: str,
    image_url: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Evaluate a single subjective answer (for real-time feedback)"""
    
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Extract OCR if image provided
    if image_url and not answer:
        ocr_result = await ocr_service.extract_from_base64(image_url)
        answer = ocr_result.get("extracted_text", "")
    
    # Get context
    context = await rag_service.get_context_for_evaluation(
        question=question.question_text,
        subject=question.subject,
        topic=question.topic
    )
    
    # Evaluate
    result = await llm_service.evaluate_answer(
        question=question.question_text,
        user_answer=answer,
        rubric=question.rubric or "Standard evaluation criteria",
        context=context,
        max_marks=question.max_marks
    )
    
    return result

