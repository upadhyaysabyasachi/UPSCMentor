from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path


class Settings(BaseSettings):
    # App
    APP_NAME: str = "UPSC Prep Ecosystem API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Supabase (All-in-One: Database + Storage + Auth)
    # Get from: https://supabase.com/dashboard/project/[your-project]/settings/api
    DATABASE_URL: str  # Connection pooling URL
    SUPABASE_URL: str  # Project URL (e.g., https://xxxxx.supabase.co)
    SUPABASE_KEY: str  # service_role key (keep secret!)
    SUPABASE_ANON_KEY: Optional[str] = None  # anon public key (for frontend)
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # LLM APIs
    GROQ_API_KEY: str
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # Optional: OCR Enhancement (Tesseract is default)
    GOOGLE_VISION_API_KEY: Optional[str] = None
    
    # Optional: Email Notifications
    RESEND_API_KEY: Optional[str] = None
    FROM_EMAIL: str = "noreply@upscprep.com"
    
    # Optional: Task Queue
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    class Config:
        # Look for .env in the parent directory (project root)
        env_file = str(Path(__file__).parent.parent / ".env")
        case_sensitive = True


settings = Settings()
