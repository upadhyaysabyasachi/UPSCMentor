"""
OCR Service for processing handwritten answers
"""
import logging
from typing import Dict
from PIL import Image
import pytesseract
import io
import base64

logger = logging.getLogger(__name__)


class OCRService:
    """Service for extracting text from images"""
    
    async def extract_text(self, image_data: bytes) -> Dict:
        """
        Extract text from image using Tesseract OCR
        
        Args:
            image_data: Image bytes
            
        Returns:
            Dictionary with extracted text and confidence
        """
        try:
            # Open image
            image = Image.open(io.BytesIO(image_data))
            
            # Preprocess image (convert to grayscale, enhance)
            image = image.convert('L')  # Convert to grayscale
            
            # Extract text with confidence
            text = pytesseract.image_to_string(image, lang='eng')
            
            # Get detailed data with confidence scores
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            
            # Calculate average confidence
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            logger.info(f"OCR extracted {len(text)} characters with {avg_confidence:.2f}% confidence")
            
            return {
                "extracted_text": text.strip(),
                "confidence": avg_confidence,
                "word_count": len(text.split()),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return {
                "extracted_text": "",
                "confidence": 0.0,
                "error": str(e),
                "success": False
            }
    
    async def extract_from_base64(self, base64_image: str) -> Dict:
        """
        Extract text from base64 encoded image
        
        Args:
            base64_image: Base64 encoded image string
            
        Returns:
            Dictionary with extracted text and confidence
        """
        try:
            # Remove data:image prefix if present
            if ',' in base64_image:
                base64_image = base64_image.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(base64_image)
            
            return await self.extract_text(image_data)
            
        except Exception as e:
            logger.error(f"Failed to decode base64 image: {e}")
            return {
                "extracted_text": "",
                "confidence": 0.0,
                "error": str(e),
                "success": False
            }


# Global OCR service instance
ocr_service = OCRService()

