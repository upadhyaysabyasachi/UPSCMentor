from fastapi import APIRouter

from app.api import auth, assessments, evaluations, mentors, bookings, progress, ocr

router = APIRouter()

# Include all route modules
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(assessments.router, prefix="/assessments", tags=["Assessments"])
router.include_router(evaluations.router, prefix="/evaluate", tags=["Evaluation"])
router.include_router(mentors.router, prefix="/mentors", tags=["Mentors"])
router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
router.include_router(progress.router, prefix="/progress", tags=["Progress"])
router.include_router(ocr.router, prefix="/ocr", tags=["OCR"])

