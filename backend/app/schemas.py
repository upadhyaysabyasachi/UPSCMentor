from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


# Enums
class UserRole(str, Enum):
    ASPIRANT = "aspirant"
    MENTOR = "mentor"
    ADMIN = "admin"


class AssessmentStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class QuestionType(str, Enum):
    MCQ = "mcq"
    SUBJECTIVE = "subjective"


# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72, description="Password must be 8-72 characters")
    full_name: str = Field(..., min_length=1, max_length=255)
    role: UserRole = UserRole.ASPIRANT


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: UserRole
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


# Assessment Schemas
class AssessmentCreate(BaseModel):
    subject: str
    topic: str
    difficulty_level: str


class QuestionResponse(BaseModel):
    id: UUID
    type: QuestionType
    subject: str
    topic: str
    difficulty: str
    question_text: str
    options: Optional[dict] = None  # Changed to dict for {A: ..., B: ..., C: ..., D: ...}
    correct_answer: Optional[str] = None
    rubric: Optional[str] = None
    max_marks: int
    source_reference: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class AssessmentResponse(BaseModel):
    id: UUID
    user_id: UUID
    subject: str
    topic: str
    difficulty_level: str
    status: AssessmentStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    total_score: Optional[float] = None
    time_taken_seconds: Optional[int] = None
    questions: List[QuestionResponse] = []
    
    class Config:
        from_attributes = True


# Response Schemas
class ResponseSubmit(BaseModel):
    question_id: UUID
    user_answer: str
    image_url: Optional[str] = None


class AssessmentSubmit(BaseModel):
    responses: List[ResponseSubmit]


# Evaluation Schemas
class ConceptGap(BaseModel):
    concept: str
    severity: str
    description: str


class Recommendation(BaseModel):
    type: str  # "NCERT" or "PYQ"
    title: str
    chapter: Optional[str] = None
    pages: Optional[str] = None
    year: Optional[int] = None
    question: Optional[str] = None
    priority: str = "medium"


class EvaluationResponse(BaseModel):
    id: UUID
    score: float
    feedback_text: str
    strengths: List[str]
    weaknesses: List[str]
    concept_gaps: List[ConceptGap]
    recommendations: List[Recommendation]
    skill_analysis: dict
    created_at: datetime
    
    class Config:
        from_attributes = True


# OCR Schemas
class OCRRequest(BaseModel):
    image_url: str


class OCRResponse(BaseModel):
    extracted_text: str
    confidence: float


# Mentor Schemas
class MentorProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    bio: str
    subjects: List[str]
    expertise: List[str]
    experience_years: int
    rating: float
    total_sessions: int
    hourly_rate: float
    availability: dict
    achievements: List[str]
    education: List[str]
    languages: List[str]
    location: Optional[str] = None
    
    class Config:
        from_attributes = True


class MentorFilter(BaseModel):
    subject: Optional[str] = None
    min_rating: Optional[float] = None


# Booking Schemas
class BookingCreate(BaseModel):
    mentor_id: UUID
    assessment_id: Optional[UUID] = None
    scheduled_at: datetime
    duration_minutes: int = 60


class BookingResponse(BaseModel):
    id: UUID
    mentor_id: UUID
    scheduled_at: datetime
    duration_minutes: int
    status: str
    meeting_link: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Progress Schemas
class ProgressResponse(BaseModel):
    user_id: UUID
    current_score: float
    previous_score: float
    improvement: float
    total_assessments: int
    study_streak: int
    subject_progress: List[dict]
    
    class Config:
        from_attributes = True

