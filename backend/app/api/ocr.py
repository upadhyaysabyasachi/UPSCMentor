"""
OCR processing endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import Dict
import logging

from app.services.ocr_service import ocr_service
from app.schemas import OCRRequest, OCRResponse
from app.api.auth import get_current_user
from app.models import User

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/extract", response_model=OCRResponse)
async def extract_text_from_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Extract text from uploaded image"""
    
    try:
        # Read file content
        contents = await file.read()
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Extract text
        result = await ocr_service.extract_text(contents)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OCR extraction failed: {result.get('error')}"
            )
        
        return OCRResponse(
            extracted_text=result["extracted_text"],
            confidence=result["confidence"]
        )
        
    except Exception as e:
        logger.error(f"OCR endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/extract-base64", response_model=OCRResponse)
async def extract_text_from_base64(
    request: OCRRequest,
    current_user: User = Depends(get_current_user)
):
    """Extract text from base64 encoded image"""
    
    try:
        result = await ocr_service.extract_from_base64(request.image_url)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OCR extraction failed: {result.get('error')}"
            )
        
        return OCRResponse(
            extracted_text=result["extracted_text"],
            confidence=result["confidence"]
        )
        
    except Exception as e:
        logger.error(f"OCR base64 endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

