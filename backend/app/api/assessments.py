"""
Assessment management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime
from uuid import UUID
import random

from app.database import get_db
from app.models import Assessment, Question, AssessmentQuestion, Response, AssessmentStatus, QuestionType
from app.schemas import AssessmentCreate, AssessmentResponse, QuestionResponse
from app.api.auth import get_current_user
from app.models import User
from app.services.question_generation_service import question_generator

router = APIRouter()


def _normalize_options(options):
    """
    Normalize options to dict format.
    Handles legacy list format: ["Option A", "Option B", ...] 
    Converts to dict format: {"A": "Option A", "B": "Option B", ...}
    """
    if options is None:
        return None
    
    if isinstance(options, dict):
        # Already in correct format
        return options
    
    if isinstance(options, list):
        # Convert list to dict with A, B, C, D keys
        labels = ["A", "B", "C", "D", "E", "F", "G", "H"]
        return {labels[i]: option for i, option in enumerate(options) if i < len(labels)}
    
    return options


@router.get("/", response_model=List[AssessmentResponse])
async def list_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all assessments for current user"""
    
    # Load assessments with questions using eager loading
    assessments = (
        db.query(Assessment)
        .options(
            joinedload(Assessment.questions).joinedload(AssessmentQuestion.question)
        )
        .filter(Assessment.user_id == current_user.id)
        .order_by(Assessment.created_at.desc())
        .all()
    )
    
    # Format each assessment with its questions
    formatted_assessments = []
    for assessment in assessments:
        assessment_dict = {
            "id": assessment.id,
            "user_id": assessment.user_id,
            "subject": assessment.subject,
            "topic": assessment.topic,
            "difficulty_level": assessment.difficulty_level,
            "status": assessment.status,
            "created_at": assessment.created_at,
            "completed_at": assessment.completed_at,
            "total_score": assessment.total_score,
            "time_taken_seconds": assessment.time_taken_seconds,
            "questions": [
                {
                    "id": aq.question.id,
                    "type": aq.question.type,
                    "subject": aq.question.subject,
                    "topic": aq.question.topic,
                    "difficulty": aq.question.difficulty,
                    "question_text": aq.question.question_text,
                    "options": _normalize_options(aq.question.options),
                    "correct_answer": aq.question.correct_answer,
                    "rubric": aq.question.rubric,
                    "max_marks": aq.question.max_marks,
                    "source_reference": aq.question.source_reference,
                    "created_at": aq.question.created_at
                }
                for aq in sorted(assessment.questions, key=lambda x: x.order)
            ]
        }
        formatted_assessments.append(AssessmentResponse(**assessment_dict))
    
    return formatted_assessments


@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new assessment with AI-generated questions from NCERT PDFs
    
    This endpoint:
    1. Creates an assessment record
    2. Uses RAG to retrieve relevant content from NCERT PDFs
    3. Uses LLM (Groq/OpenAI) to generate UPSC-style questions
    4. Saves questions to database
    5. Links questions to the assessment
    """
    
    # Create assessment
    new_assessment = Assessment(
        user_id=current_user.id,
        subject=assessment_data.subject,
        topic=assessment_data.topic,
        difficulty_level=assessment_data.difficulty_level,
        status=AssessmentStatus.IN_PROGRESS,
        created_at=datetime.utcnow()
    )
    
    db.add(new_assessment)
    db.flush()  # Get ID without committing
    
    # Generate questions from NCERT PDFs using RAG + LLM
    questions = await question_generator.generate_questions(
        db=db,
        subject=assessment_data.subject,
        topic=assessment_data.topic,
        difficulty=assessment_data.difficulty_level,
        num_mcq=8,
        num_subjective=4
    )
    
    # Select a random subset for this assessment (e.g., 10 questions)
    selected_questions = random.sample(questions, min(10, len(questions)))
    
    # Associate questions with assessment
    for idx, question in enumerate(selected_questions):
        assessment_question = AssessmentQuestion(
            assessment_id=new_assessment.id,
            question_id=question.id,
            order=idx + 1
        )
        db.add(assessment_question)
    
    db.commit()
    db.refresh(new_assessment)
    
    # Load assessment with questions using eager loading
    assessment_with_questions = (
        db.query(Assessment)
        .options(
            joinedload(Assessment.questions).joinedload(AssessmentQuestion.question)
        )
        .filter(Assessment.id == new_assessment.id)
        .first()
    )
    
    # Format response manually to ensure proper structure
    response_dict = {
        "id": assessment_with_questions.id,
        "user_id": assessment_with_questions.user_id,
        "subject": assessment_with_questions.subject,
        "topic": assessment_with_questions.topic,
        "difficulty_level": assessment_with_questions.difficulty_level,
        "status": assessment_with_questions.status,
        "created_at": assessment_with_questions.created_at,
        "completed_at": assessment_with_questions.completed_at,
        "total_score": assessment_with_questions.total_score,
        "time_taken_seconds": assessment_with_questions.time_taken_seconds,
        "questions": [
            {
                "id": aq.question.id,
                "type": aq.question.type,
                "subject": aq.question.subject,
                "topic": aq.question.topic,
                "difficulty": aq.question.difficulty,
                "question_text": aq.question.question_text,
                "options": aq.question.options,
                "correct_answer": aq.question.correct_answer,
                "rubric": aq.question.rubric,
                "max_marks": aq.question.max_marks,
                "source_reference": aq.question.source_reference,
                "created_at": aq.question.created_at
            }
            for aq in sorted(assessment_with_questions.questions, key=lambda x: x.order)
        ]
    }
    
    return AssessmentResponse(**response_dict)


@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get assessment details with questions"""
    
    assessment = (
        db.query(Assessment)
        .options(
            joinedload(Assessment.questions).joinedload(AssessmentQuestion.question)
        )
        .filter(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id
        )
        .first()
    )
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # Format response manually
    response_dict = {
        "id": assessment.id,
        "user_id": assessment.user_id,
        "subject": assessment.subject,
        "topic": assessment.topic,
        "difficulty_level": assessment.difficulty_level,
        "status": assessment.status,
        "created_at": assessment.created_at,
        "completed_at": assessment.completed_at,
        "total_score": assessment.total_score,
        "time_taken_seconds": assessment.time_taken_seconds,
        "questions": [
            {
                "id": aq.question.id,
                "type": aq.question.type,
                "subject": aq.question.subject,
                "topic": aq.question.topic,
                "difficulty": aq.question.difficulty,
                "question_text": aq.question.question_text,
                "options": _normalize_options(aq.question.options),
                "correct_answer": aq.question.correct_answer,
                "rubric": aq.question.rubric,
                "max_marks": aq.question.max_marks,
                "source_reference": aq.question.source_reference,
                "created_at": aq.question.created_at
            }
            for aq in sorted(assessment.questions, key=lambda x: x.order)
        ]
    }
    
    return AssessmentResponse(**response_dict)


@router.post("/{assessment_id}/submit", status_code=status.HTTP_200_OK)
async def submit_assessment(
    assessment_id: UUID,
    responses: List[dict],  # Changed to accept list of responses
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit assessment responses"""
    
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id
    ).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # Save responses
    for response_data in responses:
        response = Response(
            assessment_id=assessment_id,
            question_id=UUID(response_data["question_id"]),
            user_answer=response_data["user_answer"],
            image_url=response_data.get("image_url"),
            created_at=datetime.utcnow()
        )
        db.add(response)
    
    # Update assessment status
    assessment.status = AssessmentStatus.COMPLETED
    assessment.completed_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Assessment submitted successfully", "assessment_id": str(assessment_id)}


def _create_sample_questions(db: Session, subject: str, topic: str, difficulty: str) -> List[Question]:
    """Create sample questions for demonstration"""
    
    sample_questions = [
        # MCQ Questions
        Question(
            type=QuestionType.MCQ,
            subject=subject,
            topic=topic,
            difficulty=difficulty,
            question_text=f"Which of the following is a key characteristic of {topic}?",
            options={"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"},
            correct_answer="B",
            max_marks=1
        ),
        Question(
            type=QuestionType.MCQ,
            subject=subject,
            topic=topic,
            difficulty=difficulty,
            question_text=f"What was the primary cause of developments in {topic}?",
            options={"A": "Economic factors", "B": "Political factors", "C": "Social factors", "D": "All of the above"},
            correct_answer="D",
            max_marks=1
        ),
        # Subjective Questions
        Question(
            type=QuestionType.SUBJECTIVE,
            subject=subject,
            topic=topic,
            difficulty=difficulty,
            question_text=f"Discuss the significance of {topic} in historical context. (10 marks)",
            rubric="Evaluate structure, accuracy, depth of analysis, and use of examples",
            max_marks=10
        ),
        Question(
            type=QuestionType.SUBJECTIVE,
            subject=subject,
            topic=topic,
            difficulty=difficulty,
            question_text=f"Analyze the key features and impact of {topic}. (15 marks)",
            rubric="Assess factual knowledge, analytical skills, and presentation",
            max_marks=15
        ),
    ]
    
    for question in sample_questions:
        db.add(question)
    
    db.flush()
    return sample_questions

