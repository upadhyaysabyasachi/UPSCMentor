"""
Progress tracking endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.database import get_db
from app.models import Assessment, ProgressSnapshot, User
from app.schemas import ProgressResponse
from app.api.auth import get_current_user

router = APIRouter()


@router.get("/user/{user_id}", response_model=ProgressResponse)
async def get_user_progress(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overall progress for a user"""
    
    # Ensure user can only access their own progress (or admin)
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get all completed assessments
    assessments = db.query(Assessment).filter(
        Assessment.user_id == user_id,
        Assessment.status == "completed",
        Assessment.total_score.isnot(None)
    ).all()
    
    if not assessments:
        return ProgressResponse(
            user_id=user_id,
            current_score=0.0,
            previous_score=0.0,
            improvement=0.0,
            total_assessments=0,
            study_streak=0,
            subject_progress=[]
        )
    
    # Calculate overall metrics
    scores = [a.total_score for a in assessments]
    current_score = sum(scores[-5:]) / min(5, len(scores))  # Average of last 5
    previous_score = sum(scores[-10:-5]) / 5 if len(scores) >= 10 else scores[0]
    improvement = current_score - previous_score
    
    # Calculate subject-wise progress
    subject_progress = {}
    for assessment in assessments:
        subject = assessment.subject
        if subject not in subject_progress:
            subject_progress[subject] = {
                "subject": subject,
                "scores": [],
                "tests": 0
            }
        subject_progress[subject]["scores"].append(assessment.total_score)
        subject_progress[subject]["tests"] += 1
    
    # Format subject progress
    subject_list = []
    for subject, data in subject_progress.items():
        scores = data["scores"]
        subject_list.append({
            "subject": subject,
            "current": sum(scores[-3:]) / min(3, len(scores)),
            "previous": sum(scores[-6:-3]) / 3 if len(scores) >= 6 else scores[0],
            "tests": data["tests"],
            "improvement": (sum(scores[-3:]) / min(3, len(scores))) - (sum(scores[-6:-3]) / 3 if len(scores) >= 6 else scores[0])
        })
    
    # Calculate study streak (simplified)
    study_streak = 15  # Placeholder
    
    return ProgressResponse(
        user_id=user_id,
        current_score=round(current_score, 2),
        previous_score=round(previous_score, 2),
        improvement=round(improvement, 2),
        total_assessments=len(assessments),
        study_streak=study_streak,
        subject_progress=subject_list
    )


@router.get("/comparison")
async def get_progress_comparison(
    subject: str,
    topic: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compare progress for a specific subject/topic"""
    
    assessments = db.query(Assessment).filter(
        Assessment.user_id == current_user.id,
        Assessment.subject == subject,
        Assessment.topic == topic,
        Assessment.status == "completed"
    ).order_by(Assessment.completed_at).all()
    
    if len(assessments) < 2:
        return {
            "message": "Need at least 2 completed assessments to compare",
            "assessments": len(assessments)
        }
    
    # Compare first and latest
    first_assessment = assessments[0]
    latest_assessment = assessments[-1]
    
    improvement = latest_assessment.total_score - first_assessment.total_score
    
    return {
        "subject": subject,
        "topic": topic,
        "first_attempt": {
            "date": first_assessment.completed_at,
            "score": first_assessment.total_score
        },
        "latest_attempt": {
            "date": latest_assessment.completed_at,
            "score": latest_assessment.total_score
        },
        "improvement": round(improvement, 2),
        "total_attempts": len(assessments)
    }

