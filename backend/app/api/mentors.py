"""
Mentor management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Mentor, User
from app.schemas import MentorProfileResponse, MentorFilter
from app.api.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[MentorProfileResponse])
async def list_mentors(
    subject: Optional[str] = None,
    min_rating: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """List all mentors with optional filters"""
    
    query = db.query(Mentor).join(User)
    
    # Apply filters
    if subject:
        query = query.filter(Mentor.subjects.contains([subject]))
    
    if min_rating:
        query = query.filter(Mentor.rating >= min_rating)
    
    mentors = query.all()
    
    # Format response
    mentor_list = []
    for mentor in mentors:
        mentor_data = MentorProfileResponse.from_orm(mentor)
        mentor_data.name = mentor.user.full_name
        mentor_list.append(mentor_data)
    
    return mentor_list


@router.get("/{mentor_id}", response_model=MentorProfileResponse)
async def get_mentor(mentor_id: int, db: Session = Depends(get_db)):
    """Get mentor details"""
    
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )
    
    mentor_data = MentorProfileResponse.from_orm(mentor)
    mentor_data.name = mentor.user.full_name
    
    return mentor_data


@router.get("/{mentor_id}/availability")
async def get_mentor_availability(
    mentor_id: int,
    db: Session = Depends(get_db)
):
    """Get mentor's availability calendar"""
    
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )
    
    # Return availability data
    return {
        "mentor_id": mentor_id,
        "availability": mentor.availability or {},
        "hourly_rate": mentor.hourly_rate
    }

