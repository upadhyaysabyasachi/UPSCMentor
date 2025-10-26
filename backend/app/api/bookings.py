"""
Booking management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import Booking, BookingStatus, Mentor
from app.schemas import BookingCreate, BookingResponse
from app.api.auth import get_current_user
from app.models import User

router = APIRouter()


@router.get("/me", response_model=List[BookingResponse])
async def list_user_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all bookings for current user"""
    
    bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id
    ).order_by(Booking.scheduled_at.desc()).all()
    
    return bookings


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new mentor booking"""
    
    # Verify mentor exists
    mentor = db.query(Mentor).filter(Mentor.id == booking_data.mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )
    
    # Create booking
    new_booking = Booking(
        user_id=current_user.id,
        mentor_id=booking_data.mentor_id,
        assessment_id=booking_data.assessment_id,
        scheduled_at=booking_data.scheduled_at,
        duration_minutes=booking_data.duration_minutes,
        status=BookingStatus.PENDING,
        meeting_link=None,  # Will be generated later
        created_at=datetime.utcnow()
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    # TODO: Send email notification to mentor
    # TODO: Generate meeting link (Google Meet, Zoom, etc.)
    
    return new_booking


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get booking details"""
    
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return booking


@router.patch("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: int,
    status: BookingStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update booking status"""
    
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    booking.status = status
    booking.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(booking)
    
    return booking


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a booking"""
    
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    booking.status = BookingStatus.CANCELLED
    booking.updated_at = datetime.utcnow()
    
    db.commit()
    
    # TODO: Send cancellation email to mentor
    
    return None

