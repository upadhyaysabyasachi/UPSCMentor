from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
import uuid

from app.database import Base


class UserRole(str, enum.Enum):
    ASPIRANT = "aspirant"
    MENTOR = "mentor"
    ADMIN = "admin"


class AssessmentStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class QuestionType(str, enum.Enum):
    MCQ = "mcq"
    SUBJECTIVE = "subjective"


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="aspirant")  # Changed from Enum to String for compatibility
    created_at = Column(DateTime, server_default=func.now())
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    assessments = relationship("Assessment", back_populates="user")
    mentor_profile = relationship("Mentor", back_populates="user", uselist=False)
    bookings = relationship("Booking", foreign_keys="Booking.user_id", back_populates="user")


class Mentor(Base):
    __tablename__ = "mentors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    bio = Column(Text)
    subjects = Column(JSON)  # List of subjects
    expertise = Column(JSON)  # List of expertise areas
    experience_years = Column(Integer)
    rating = Column(Float, default=0.0)
    total_sessions = Column(Integer, default=0)
    availability = Column(JSON)  # Calendar availability
    hourly_rate = Column(Float)
    achievements = Column(JSON)  # List of achievements
    education = Column(JSON)  # List of education credentials
    languages = Column(JSON)  # List of languages
    location = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="mentor_profile")
    bookings = relationship("Booking", back_populates="mentor")
    reviews = relationship("MentorReview", back_populates="mentor")


class MentorReview(Base):
    __tablename__ = "mentor_reviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    mentor_id = Column(UUID(as_uuid=True), ForeignKey("mentors.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"))
    rating = Column(Integer)  # 1-5
    comment = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    mentor = relationship("Mentor", back_populates="reviews")


class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    difficulty_level = Column(String, nullable=False)
    status = Column(String, default="in_progress")  # Changed from Enum to String
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    total_score = Column(Float, nullable=True)
    time_taken_seconds = Column(Integer, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="assessments")
    questions = relationship("AssessmentQuestion", back_populates="assessment")
    responses = relationship("Response", back_populates="assessment")
    evaluation = relationship("Evaluation", back_populates="assessment", uselist=False)


class Question(Base):
    __tablename__ = "questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    type = Column(String, nullable=False)  # Changed from Enum to String
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)  # For MCQ
    correct_answer = Column(String, nullable=True)  # For MCQ
    rubric = Column(Text, nullable=True)  # For subjective
    max_marks = Column(Integer, default=1)
    source_reference = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    assessments = relationship("AssessmentQuestion", back_populates="question")


class AssessmentQuestion(Base):
    """Junction table for assessments and questions"""
    __tablename__ = "assessment_questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"))
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"))
    order = Column(Integer)  # Question order in assessment
    
    # Relationships
    assessment = relationship("Assessment", back_populates="questions")
    question = relationship("Question", back_populates="assessments")


class Response(Base):
    __tablename__ = "responses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"))
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"))
    user_answer = Column(Text)
    image_url = Column(String, nullable=True)  # For handwritten answers
    ocr_text = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)  # For MCQ
    score = Column(Float, nullable=True)  # For subjective
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    assessment = relationship("Assessment", back_populates="responses")


class Evaluation(Base):
    __tablename__ = "evaluations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"), unique=True)
    score = Column(Float, nullable=False)
    feedback_text = Column(Text)
    strengths = Column(JSON)  # List of strengths
    weaknesses = Column(JSON)  # List of weaknesses
    concept_gaps = Column(JSON)  # List of concept gaps with severity
    recommendations = Column(JSON)  # NCERT/PYQ recommendations
    skill_analysis = Column(JSON)  # Skill-wise scores
    llm_model_used = Column(String)
    evaluation_time_ms = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    assessment = relationship("Assessment", back_populates="evaluation")


class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    mentor_id = Column(UUID(as_uuid=True), ForeignKey("mentors.id"))
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=True)
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    status = Column(String, default="pending")  # Changed from Enum to String
    meeting_link = Column(String, nullable=True)
    ai_summary = Column(JSON, nullable=True)  # Summary for mentor
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="bookings")
    mentor = relationship("Mentor", back_populates="bookings")


class ProgressSnapshot(Base):
    __tablename__ = "progress_snapshots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"))
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    test_date = Column(DateTime, nullable=False)
    comparison_baseline_id = Column(UUID(as_uuid=True), ForeignKey("progress_snapshots.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class DocumentChunk(Base):
    """Store processed document chunks for RAG"""
    __tablename__ = "document_chunks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    source_document = Column(String, nullable=False)  # e.g., "NCERT Class 11 History"
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=True)
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer)
    page_number = Column(Integer, nullable=True)
    embedding_id = Column(String, nullable=True)  # ID in vector store
    metadata_ = Column("metadata", JSON, nullable=True)  # Renamed to avoid SQLAlchemy reserved keyword
    created_at = Column(DateTime, server_default=func.now())

