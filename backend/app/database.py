from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from supabase import create_client, Client
from config import settings
import logging

logger = logging.getLogger(__name__)

# Supabase client for Storage, Auth, and additional features
supabase: Client = None

# Create database engine for SQLAlchemy
# Using Supabase PostgreSQL connection
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG  # Log SQL queries in debug mode
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_supabase_client() -> Client:
    """Get Supabase client instance for Storage and additional features"""
    global supabase
    if supabase is None:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info(f"✅ Supabase client initialized: {settings.SUPABASE_URL}")
    return supabase


async def init_db():
    """Initialize database tables and Supabase features"""
    try:
        # Test database connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("✅ Database connection verified")
        
        # Note: Tables already exist in Supabase (created manually with UUIDs)
        # Uncomment below only if you need to create/sync tables:
        # Base.metadata.create_all(bind=engine)
        
        # Initialize Supabase client
        get_supabase_client()
        
        # Verify pgvector extension (already enabled in Supabase)
        with engine.connect() as conn:
            try:
                result = conn.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector'"))
                if result.fetchone():
                    logger.info("✅ pgvector extension is enabled")
                else:
                    logger.warning("⚠️  pgvector extension not found")
            except Exception as e:
                logger.warning(f"⚠️  Could not check pgvector: {e}")
        
        # Initialize Storage bucket
        try:
            storage = supabase.storage
            
            # Check if bucket exists
            buckets = storage.list_buckets()
            bucket_names = [b.name for b in buckets]
            
            if "upsc-uploads" not in bucket_names:
                # Create bucket for file uploads
                storage.create_bucket(
                    "upsc-uploads",
                    options={"public": True}
                )
                logger.info("✅ Supabase Storage bucket 'upsc-uploads' created")
            else:
                logger.info("✅ Supabase Storage bucket 'upsc-uploads' already exists")
                
        except Exception as e:
            logger.warning(f"⚠️  Could not initialize storage bucket: {e}")
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Supabase Storage helper
class SupabaseStorage:
    """
    Helper class for Supabase Storage operations
    All file uploads (images, documents) go to Supabase Storage
    """
    
    def __init__(self):
        self.client = get_supabase_client()
        self.bucket_name = "upsc-uploads"
    
    async def upload_file(
        self, 
        file_path: str, 
        file_data: bytes, 
        content_type: str = "image/jpeg"
    ) -> str:
        """
        Upload file to Supabase Storage
        
        Args:
            file_path: Path within bucket (e.g., "assessments/user123/answer.jpg")
            file_data: File bytes
            content_type: MIME type
            
        Returns:
            Public URL of uploaded file
        """
        try:
            # Upload file to Supabase Storage
            result = self.client.storage.from_(self.bucket_name).upload(
                file_path,
                file_data,
                {"content-type": content_type, "upsert": "true"}
            )
            
            # Get public URL
            url = self.client.storage.from_(self.bucket_name).get_public_url(file_path)
            logger.info(f"✅ File uploaded to Supabase Storage: {file_path}")
            
            return url
            
        except Exception as e:
            logger.error(f"❌ Supabase Storage upload failed: {e}")
            raise
    
    async def delete_file(self, file_path: str):
        """Delete file from Supabase Storage"""
        try:
            self.client.storage.from_(self.bucket_name).remove([file_path])
            logger.info(f"✅ File deleted from Supabase Storage: {file_path}")
        except Exception as e:
            logger.error(f"❌ Supabase Storage deletion failed: {e}")
            raise
    
    async def get_file_url(self, file_path: str) -> str:
        """Get public URL for a file in Supabase Storage"""
        return self.client.storage.from_(self.bucket_name).get_public_url(file_path)
    
    async def list_files(self, folder_path: str = "") -> list:
        """List files in a folder"""
        try:
            files = self.client.storage.from_(self.bucket_name).list(folder_path)
            return files
        except Exception as e:
            logger.error(f"❌ Failed to list files: {e}")
            return []


# Global storage instance
storage = SupabaseStorage()
