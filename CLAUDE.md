# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered UPSC (Union Public Service Commission) preparation platform with:
- **Frontend**: Next.js 14 (App Router) with TypeScript and TailwindCSS
- **Backend**: FastAPI with Python 3.10+
- **Database**: Supabase (PostgreSQL + pgvector for vector embeddings)
- **AI/ML**: RAG-based answer evaluation using LlamaIndex, OpenAI embeddings, and dual LLM system (Groq primary, OpenAI fallback)
- **OCR**: Tesseract for handwritten answer extraction

## Commands

### Backend Commands

```bash
# From /backend directory

# Start development server (with auto-reload)
python main.py
# Or: uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Install dependencies
pip install -r requirements.txt

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Verify environment variables
python verify_env.py

# Test RAG system
python -c "
import asyncio
from app.services.rag_service import rag_service

async def test():
    await rag_service.initialize()
    result = await rag_service.query('What is Gupta Empire?', subject='history')
    print(result['response'])

asyncio.run(test())
"

# Rebuild RAG index (if PDFs updated)
python -c "
import asyncio
from app.services.rag_service import rag_service

async def rebuild():
    await rag_service.create_index()
    print('Index rebuilt successfully!')

asyncio.run(rebuild())
"
```

### Frontend Commands

```bash
# From /frontend directory

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Install dependencies
npm install
```

### Testing Checklist

```bash
# Backend health check
curl http://localhost:8000/health

# API documentation (requires backend running with DEBUG=True)
open http://localhost:8000/docs

# Frontend access
open http://localhost:3000
```

## Architecture

### High-Level System Flow

```
User → Frontend (Next.js) → Backend API (FastAPI) → Supabase (PostgreSQL + pgvector)
                                    ↓
                        RAG Service (LlamaIndex + OpenAI Embeddings)
                                    ↓
                        LLM Service (Groq primary → OpenAI fallback)
                                    ↓
                            Answer Evaluation & Feedback
```

### Backend Architecture

**Key Services Pattern**: The backend uses a service-layer architecture where business logic is separated from API routes:

- **API Layer** ([backend/app/api/](backend/app/api/)): FastAPI route handlers
  - [auth.py](backend/app/api/auth.py): JWT authentication (register, login, token refresh)
  - [assessments.py](backend/app/api/assessments.py): Test creation, question management, submission
  - [evaluations.py](backend/app/api/evaluations.py): AI-powered answer evaluation
  - [mentors.py](backend/app/api/mentors.py): Mentor search, profiles, availability
  - [bookings.py](backend/app/api/bookings.py): Session scheduling and management
  - [progress.py](backend/app/api/progress.py): Performance tracking and analytics
  - [ocr.py](backend/app/api/ocr.py): Handwritten text extraction

- **Service Layer** ([backend/app/services/](backend/app/services/)): Core business logic
  - [rag_service.py](backend/app/services/rag_service.py): Document processing, vector embeddings, semantic search
  - [llm_service.py](backend/app/services/llm_service.py): LLM interactions with fallback handling
  - [auth_service.py](backend/app/services/auth_service.py): Password hashing, JWT token generation
  - [ocr_service.py](backend/app/services/ocr_service.py): Image preprocessing, Tesseract integration

**RAG System**: Uses LlamaIndex with Supabase pgvector for persistent vector storage. Documents in [data/](data/) are automatically indexed on startup. The system:
1. Loads PDFs from subject-specific folders ([data/history/](data/history/), [data/geography/](data/geography/))
2. Chunks documents with 1024 token size and 200 token overlap
3. Creates OpenAI embeddings (text-embedding-3-small, 1536 dimensions)
4. Stores in Supabase pgvector collection named "document_embeddings"
5. Provides semantic search for answer evaluation context

**LLM Service**: Implements circuit breaker pattern with Groq as primary (fast, high rate limits with Llama 3.1 70B) and OpenAI GPT-4 as fallback for reliability. Both return structured JSON responses for evaluation consistency.

**Database Models** ([backend/app/models.py](backend/app/models.py)): All models use UUID primary keys. Key relationships:
- `User` → `Assessment` (one-to-many)
- `Assessment` → `Question` (many-to-many via `AssessmentQuestion`)
- `Assessment` → `Response` (one-to-many)
- `Assessment` → `Evaluation` (one-to-one)
- `User` → `Mentor` (one-to-one for mentor profiles)
- `Mentor` → `Booking` (one-to-many)

### Frontend Architecture

**App Router Structure**: Uses Next.js 14 App Router with file-based routing:

- [src/app/](frontend/src/app/) - Page routes:
  - [login/page.tsx](frontend/src/app/login/page.tsx), [register/page.tsx](frontend/src/app/register/page.tsx) - Authentication UI
  - [dashboard/page.tsx](frontend/src/app/dashboard/page.tsx) - Main dashboard with metrics, charts, quick actions
  - [assessments/new/page.tsx](frontend/src/app/assessments/new/page.tsx) - 3-step test creation wizard
  - [assessments/[id]/take/page.tsx](frontend/src/app/assessments/[id]/take/page.tsx) - Test taking interface
  - [assessments/[id]/feedback/page.tsx](frontend/src/app/assessments/[id]/feedback/page.tsx) - AI feedback display
  - [mentors/page.tsx](frontend/src/app/mentors/page.tsx) - Mentor catalogue with filters
  - [mentors/[id]/page.tsx](frontend/src/app/mentors/[id]/page.tsx) - Mentor detail and booking
  - [progress/page.tsx](frontend/src/app/progress/page.tsx) - Performance tracking with charts

**State Management**:
- Global state: Zustand stores in [src/stores/](frontend/src/stores/)
  - [authStore.ts](frontend/src/stores/authStore.ts): User auth state, JWT tokens, login/logout
  - [assessmentStore.ts](frontend/src/stores/assessmentStore.ts): Current test state, responses
- Server state: @tanstack/react-query for API data fetching and caching

**API Integration** ([src/lib/api.ts](frontend/src/lib/api.ts)): Centralized Axios client with automatic JWT token injection and refresh token handling on 401 responses.

### Data Flow for Assessment Evaluation

This is the core feature - understanding this flow is critical:

1. **Test Creation**: Frontend calls `POST /api/assessments` with subject, topic, difficulty
2. **Question Generation**: Backend queries question bank or generates questions matching criteria
3. **Test Taking**: Frontend displays questions, user submits answers (text or image)
4. **Answer Submission**: `POST /api/assessments/{id}/submit` stores responses in database
5. **Evaluation Trigger**: Frontend calls `POST /api/evaluate/{assessment_id}/evaluate`
6. **RAG Context Retrieval**: For each question, [rag_service.py](backend/app/services/rag_service.py) queries vector store for relevant NCERT content using `get_context_for_evaluation()`
7. **LLM Evaluation**: [llm_service.py](backend/app/services/llm_service.py) sends question + user_answer + context + rubric to Groq/OpenAI
8. **Structured Response**: LLM returns JSON with score, strengths, weaknesses, concept_gaps, skill_scores
9. **Gap Analysis**: Additional LLM call aggregates all responses to identify primary conceptual gaps
10. **Recommendations**: [rag_service.py](backend/app/services/rag_service.py) uses `get_recommendations()` to find relevant NCERT chapters for gaps
11. **Feedback Display**: Frontend shows comprehensive feedback with charts, action items, NCERT links

## Configuration

### Backend Environment Variables

Required variables in [backend/.env](backend/.env):

```env
# Database (from Supabase dashboard → Settings → Database)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_service_role_key

# JWT (generate SECRET_KEY: python -c "import secrets; print(secrets.token_hex(32))")
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# LLM APIs
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

**Supabase Setup**: Must enable pgvector extension:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Frontend Environment Variables

In [frontend/.env.local](frontend/.env.local):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=UPSC Prep Ecosystem
```

## Development Guidelines

### Adding New RAG Documents

1. Place PDFs in [data/{subject}/](data/) folders (e.g., [data/history/](data/history/))
2. Restart backend or manually rebuild index (see Commands section)
3. Documents auto-tagged with subject metadata for filtering

### Modifying Evaluation Rubrics

Rubrics are defined in [backend/app/services/llm_service.py](backend/app/services/llm_service.py):
- Edit `_create_evaluation_prompt()` for single-question evaluation criteria
- Edit `_create_gap_analysis_prompt()` for overall performance analysis
- LLM responses must match JSON schema defined in prompts

### Database Schema Changes

1. Modify models in [backend/app/models.py](backend/app/models.py)
2. Run backend to auto-create tables (SQLAlchemy creates on startup via `init_db()` in [main.py](backend/main.py:24))
3. For production, use Alembic migrations (not currently configured)

### Adding New API Endpoints

1. Create route handler in [backend/app/api/{module}.py](backend/app/api/)
2. Add route to main router in [backend/app/api/__init__.py](backend/app/api/__init__.py)
3. Update [backend/app/schemas.py](backend/app/schemas.py) for request/response models
4. Add corresponding API call in [frontend/src/lib/api.ts](frontend/src/lib/api.ts)

## Key Files Reference

- [backend/main.py](backend/main.py) - FastAPI app initialization, CORS, lifespan events
- [backend/config.py](backend/config.py) - All environment variables and settings
- [backend/app/database.py](backend/app/database.py) - SQLAlchemy engine, session management
- [backend/app/schemas.py](backend/app/schemas.py) - Pydantic models for API validation
- [frontend/src/app/layout.tsx](frontend/src/app/layout.tsx) - Root layout with providers
- [frontend/src/components/layout/DashboardLayout.tsx](frontend/src/components/layout/DashboardLayout.tsx) - Sidebar navigation
- [requirements.txt](requirements.txt) - Python dependencies
- [frontend/package.json](frontend/package.json) - Node.js dependencies

## Troubleshooting

### Backend won't start
- Check `DATABASE_URL` is correct connection pooling URL (port 6543, pgbouncer=true)
- Verify all required API keys in `.env`
- Ensure Tesseract OCR installed: `brew install tesseract` (macOS) or `apt-get install tesseract-ocr` (Linux)

### RAG queries returning no results
- Check [data/](data/) folder has PDFs
- Rebuild index: see Commands section
- Verify Supabase pgvector extension enabled
- First query always slow (building index), subsequent queries fast

### Frontend 401 errors
- Check `NEXT_PUBLIC_API_BASE_URL` matches backend port
- Clear localStorage and re-login
- Verify JWT tokens not expired (check browser DevTools → Application → localStorage)

### LLM evaluation failures
- Check both `GROQ_API_KEY` and `OPENAI_API_KEY` are valid
- Monitor backend logs for which LLM is being used
- Groq may rate limit; OpenAI fallback should trigger automatically

## Notes

- This is NOT a git repository (no version control configured)
- No tests currently exist (pytest infrastructure in requirements but no test files)
- Production deployment requires RLS (Row Level Security) enabled on Supabase tables
- API documentation auto-generated at `/docs` when `DEBUG=True`
- All UUIDs are v4, generated at model level
- Assessment status flow: `in_progress` → `completed` (no intermediate states)
