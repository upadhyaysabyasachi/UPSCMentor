# UPSC Prep Ecosystem - Backend API

FastAPI backend with Supabase database, RAG-powered evaluation, and Groq/OpenAI LLM integration.

## 🚀 Features

- **FastAPI** - Modern, high-performance web framework
- **Supabase PostgreSQL** - Database with vector embeddings support
- **RAG System** - Process NCERT books for contextual answer evaluation
- **Groq LLM** - Fast primary LLM with OpenAI fallback
- **OCR Service** - Extract text from handwritten answers
- **JWT Authentication** - Secure user authentication
- **SQLAlchemy ORM** - Type-safe database operations

## 📋 Prerequisites

- Python 3.10+
- PostgreSQL (via Supabase)
- Tesseract OCR (for handwritten answer processing)
- API Keys:
  - Groq API key
  - OpenAI API key
  - Supabase URL and key

## 🛠️ Installation

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Tesseract OCR

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**Windows:**
Download from: https://github.com/UB-Mannheim/tesseract/wiki

### 3. Set Up Supabase

Follow the detailed guide in `setup_supabase.md`:

1. Create Supabase project
2. Get database URL and API keys
3. Enable pgvector extension
4. Create storage bucket

### 4. Configure Environment Variables

Create `.env` file in backend directory:

```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_service_role_key

# JWT
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# LLM APIs
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Development
ENVIRONMENT=development
DEBUG=True
```

## 🚀 Running the Server

### Development Mode

```bash
cd backend
python main.py
```

Or use uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📚 API Documentation

### Authentication

**Register:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "aspirant"
}
```

**Login:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "aspirant"
  }
}
```

### Assessments

**Create Assessment:**
```http
POST /api/assessments
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "subject": "History",
  "topic": "Ancient India",
  "difficulty_level": "medium"
}
```

**Submit Assessment:**
```http
POST /api/assessments/{id}/submit
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "responses": [
    {
      "question_id": 1,
      "user_answer": "Option B",
      "image_url": null
    },
    {
      "question_id": 2,
      "user_answer": "The Gupta Empire...",
      "image_url": "data:image/jpeg;base64,..."
    }
  ]
}
```

### Evaluation

**Get Evaluation:**
```http
GET /api/evaluate/{assessment_id}
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": 1,
  "score": 78.5,
  "feedback_text": "Good understanding of core concepts...",
  "strengths": [
    "Clear structure",
    "Accurate facts",
    "Good examples"
  ],
  "weaknesses": [
    "Limited analysis",
    "Missing key points"
  ],
  "concept_gaps": [
    {
      "concept": "Gupta Administration",
      "severity": "high",
      "description": "Need to understand provincial governance"
    }
  ],
  "recommendations": [
    {
      "type": "NCERT",
      "title": "NCERT Class 11 History",
      "chapter": "Chapter 4",
      "priority": "high"
    }
  ],
  "skill_analysis": {
    "factual_recall": 85,
    "analysis": 68,
    "critical_thinking": 72
  }
}
```

### Mentors

**List Mentors:**
```http
GET /api/mentors?subject=History&min_rating=4.5
```

**Get Mentor Details:**
```http
GET /api/mentors/{id}
```

### Bookings

**Create Booking:**
```http
POST /api/bookings
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "mentor_id": 1,
  "assessment_id": 5,
  "scheduled_at": "2025-10-27T16:00:00Z",
  "duration_minutes": 60
}
```

### Progress

**Get User Progress:**
```http
GET /api/progress/user/{user_id}
Authorization: Bearer {access_token}
```

### OCR

**Extract Text from Image:**
```http
POST /api/ocr/extract
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [image file]
```

## 🧪 RAG System

### Initialize RAG

The RAG system automatically initializes on startup. To manually rebuild the index:

```python
from app.services.rag_service import rag_service

# Create index from NCERT PDFs in ../data/ directory
await rag_service.create_index()
```

### Query RAG

```python
result = await rag_service.query(
    query="What is the significance of Gupta period?",
    subject="History",
    topic="Ancient India",
    top_k=5
)
```

### Add New Documents

1. Place PDF files in `data/` directory organized by subject:
```
data/
├── history/
│   ├── ncert_class11.pdf
│   └── spectrum.pdf
├── geography/
│   └── ncert_geography.pdf
```

2. Restart server or call `rag_service.create_index()`

## 🗄️ Database Schema

### Tables

- **users** - User accounts
- **mentors** - Mentor profiles
- **assessments** - Test sessions
- **questions** - Question bank
- **responses** - User answers
- **evaluations** - AI evaluations
- **bookings** - Mentor sessions
- **progress_snapshots** - Performance history
- **document_chunks** - RAG embeddings

### Migrations

Using Alembic for database migrations:

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 🧪 Testing

Run tests:

```bash
pytest tests/
```

Run with coverage:

```bash
pytest --cov=app tests/
```

## 🔒 Security

- JWT tokens with expiration
- Password hashing with bcrypt
- CORS configuration
- Environment variable protection
- SQL injection prevention (SQLAlchemy)
- Input validation (Pydantic)

## 📊 Monitoring

Health check endpoint:

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "vector_store": "connected"
}
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection
python -c "from app.database import engine; print(engine.connect())"
```

### RAG System Issues

```bash
# Check if documents exist
ls -R ../data/

# Rebuild index
python -c "from app.services.rag_service import rag_service; import asyncio; asyncio.run(rag_service.create_index())"
```

### LLM API Issues

```bash
# Test Groq
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY"

# Test OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| DATABASE_URL | PostgreSQL connection string | Yes | - |
| SUPABASE_URL | Supabase project URL | Yes | - |
| SUPABASE_KEY | Supabase service role key | Yes | - |
| SECRET_KEY | JWT secret key | Yes | - |
| GROQ_API_KEY | Groq API key | Yes | - |
| OPENAI_API_KEY | OpenAI API key | Yes | - |
| DEBUG | Debug mode | No | True |

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t upsc-prep-backend .

# Run container
docker run -p 8000:8000 --env-file .env upsc-prep-backend
```

### Production Checklist

- [ ] Change SECRET_KEY to strong random value
- [ ] Set DEBUG=False
- [ ] Configure CORS for production domain
- [ ] Set up HTTPS/SSL
- [ ] Enable database connection pooling
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy
- [ ] Rate limiting
- [ ] API documentation security

## 📚 Additional Resources

- FastAPI Docs: https://fastapi.tiangolo.com
- Supabase Docs: https://supabase.com/docs
- LlamaIndex Docs: https://docs.llamaindex.ai
- Groq Docs: https://console.groq.com/docs

## 🤝 Support

For issues and questions:
- Check `/docs` endpoint for API documentation
- Review logs in `logs/` directory
- Consult `setup_supabase.md` for database setup

---

**Built with FastAPI, Supabase, and AI** 🚀

