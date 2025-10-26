# 🎯 UPSC Prep Ecosystem

An AI-powered UPSC (Union Public Service Commission) preparation platform featuring intelligent answer evaluation, RAG-based study recommendations, and mentor booking system.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)](https://supabase.com/)

## ✨ Features

### 🤖 AI-Powered Evaluation
- **Intelligent Answer Assessment**: RAG-based evaluation using NCERT content
- **Multi-dimensional Scoring**: Analysis across 6 skill dimensions
- **Personalized Feedback**: Detailed strengths, weaknesses, and improvement suggestions
- **Handwritten Text Recognition**: OCR support for uploaded answer sheets
- **Dual LLM System**: Groq (primary) with OpenAI (fallback) for reliability

### 📚 RAG System
- **Semantic Search**: Vector-based search over NCERT study materials
- **Context-Aware Evaluation**: Answers evaluated against official curriculum
- **Smart Recommendations**: NCERT chapter and PYQ suggestions based on concept gaps
- **Supabase pgvector**: Persistent vector storage for fast retrieval

### 👥 Mentor System
- **Mentor Discovery**: Browse and filter mentors by subject and rating
- **Calendar Booking**: Interactive scheduling with availability management
- **Session Management**: Track upcoming and completed mentor sessions
- **Reviews & Ratings**: Community-driven mentor feedback

### 📊 Progress Tracking
- **Performance Analytics**: Historical score tracking and improvement metrics
- **Subject-wise Analysis**: Detailed breakdown by topic and difficulty
- **Skills Development**: Radar charts showing competency across dimensions
- **Milestone Achievements**: Gamified progress indicators

### 🎓 Assessment System
- **Custom Test Creation**: 3-step wizard (Subject → Topic → Difficulty)
- **MCQ Support**: Automatic grading for multiple-choice questions
- **Subjective Answers**: Text and image upload support
- **Real-time Saving**: Auto-save with progress tracking

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                     │
│  ┌──────────┬──────────┬──────────┬──────────┬───────────┐ │
│  │Dashboard │Assessment│ Feedback │ Mentors  │ Progress  │ │
│  └──────────┴──────────┴──────────┴──────────┴───────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
┌──────────────────────────┴──────────────────────────────────┐
│                   Backend (FastAPI)                          │
│  ┌─────────────┬─────────────┬──────────────┬─────────────┐│
│  │ RAG Service │ LLM Service │ Auth Service │ OCR Service ││
│  └─────────────┴─────────────┴──────────────┴─────────────┘│
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│            Supabase (PostgreSQL + pgvector)                  │
│  ┌─────────┬────────────┬─────────────┬──────────────────┐ │
│  │ Users   │Assessments │ Evaluations │ Vector Embeddings││
│  └─────────┴────────────┴─────────────┴──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Tesseract OCR** (for handwritten answer processing)
- **Supabase** account (free tier works)
- **API Keys**: Groq and OpenAI

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/upadhyaysabyasachi/UPSCMentor.git
cd UPSCMentor
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Tesseract OCR
# macOS
brew install tesseract

# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

#### 3. Configure Backend Environment

Create `backend/.env`:

```env
# Supabase Configuration
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_service_role_key

# JWT Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# LLM API Keys
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Environment
DEBUG=True
ENVIRONMENT=development
```

**Get your Supabase connection string:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → Settings → Database
3. Copy the "Session Pooler" connection string

**Enable pgvector extension** in Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### 4. Start Backend

```bash
python main.py
```

Backend will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs

#### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=UPSC Prep Ecosystem
```

#### 6. Start Frontend

```bash
npm run dev
```

Frontend will be available at: http://localhost:3000

## 📖 Usage

### Creating Your First Assessment

1. **Register** a new account at http://localhost:3000/register
2. **Login** and navigate to Dashboard
3. Click **"Start New Test"**
4. Select **Subject → Topic → Difficulty**
5. Answer questions (text or upload images for handwritten answers)
6. **Submit** to receive AI-powered feedback

### Adding Study Materials

Place your NCERT PDFs in the `data/` directory:

```
data/
├── history/
│   └── your_history_ncert.pdf
├── geography/
│   └── your_geography_ncert.pdf
└── polity/
    └── your_polity_ncert.pdf
```

The RAG system will automatically index them on startup.

### Testing the RAG System

```python
python test_db_connection.py  # Test database connection

# Test RAG queries
python -c "
import asyncio
from app.services.rag_service import rag_service

async def test():
    await rag_service.initialize()
    result = await rag_service.query('What is Gupta Empire?', subject='history')
    print(result['response'])

asyncio.run(test())
"
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **UI Components**: Lucide React, React Dropzone

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **Database**: Supabase (PostgreSQL + pgvector)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (python-jose + bcrypt)

### AI/ML
- **Primary LLM**: Groq (Llama 3.1 70B)
- **Fallback LLM**: OpenAI GPT-4
- **Embeddings**: OpenAI (text-embedding-3-small)
- **RAG Framework**: LlamaIndex
- **Vector Store**: Supabase pgvector
- **OCR**: Tesseract

## 📁 Project Structure

```
RAG/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # API client & utilities
│   │   └── stores/          # Zustand stores
│   └── package.json
│
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── database.py      # Database configuration
│   ├── main.py              # Application entry point
│   ├── config.py            # Settings
│   └── requirements.txt
│
├── data/                     # Study materials (PDFs)
│   ├── history/
│   ├── geography/
│   └── polity/
│
├── docs/                     # Documentation
│   ├── prd.md
│   └── plan.md
│
├── .gitignore
├── CLAUDE.md                 # Developer guide
├── DEPLOYMENT_GUIDE.md       # Complete setup instructions
├── PROJECT_SUMMARY.md        # Feature list
└── README.md                 # This file
```

## 🧪 Testing

### Test Database Connection
```bash
python test_db_connection.py
```

### Run Backend Tests
```bash
cd backend
pytest
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

## 🔒 Security

- **JWT Authentication**: Access and refresh tokens with secure expiration
- **Password Hashing**: bcrypt for secure password storage
- **Environment Variables**: Sensitive data in `.env` files (gitignored)
- **CORS Configuration**: Restricted origins
- **Input Validation**: Pydantic schemas for API validation
- **SQL Injection Prevention**: SQLAlchemy ORM

## 📊 API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

```
Authentication
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/refresh

Assessments
  GET    /api/assessments
  POST   /api/assessments
  POST   /api/assessments/{id}/submit

Evaluation
  POST   /api/evaluate/{assessment_id}/evaluate
  GET    /api/evaluate/{assessment_id}

Mentors
  GET    /api/mentors
  GET    /api/mentors/{id}
  POST   /api/bookings

Progress
  GET    /api/progress/user/{user_id}
```

## 🚢 Deployment

### Backend Deployment (Railway/Render/Fly.io)

1. Connect your GitHub repository
2. Set environment variables from `.env`
3. Set `DEBUG=False` and `ENVIRONMENT=production`
4. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Connect your GitHub repository
2. Set `NEXT_PUBLIC_API_BASE_URL` to your backend URL
3. Deploy

### Production Checklist

- [ ] Enable Supabase Row Level Security (RLS)
- [ ] Set up database backups
- [ ] Configure domain and SSL
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure email service (Resend)
- [ ] Set up CI/CD pipeline
- [ ] Rotate API keys and secrets

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## 🙏 Acknowledgments

- **LlamaIndex** for the RAG framework
- **Supabase** for the database and vector storage
- **Groq** for fast LLM inference
- **OpenAI** for embeddings and fallback LLM
- **FastAPI** for the excellent backend framework
- **Next.js** for the amazing frontend framework

## 📞 Support

For questions or issues:
- Check the [CLAUDE.md](CLAUDE.md) for developer guidance
- Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for setup help
- Check [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for feature details
- Open an issue on GitHub



---

**Built with ❤️ for UPSC Aspirants**

[⭐ Star this repo](https://github.com/upadhyaysabyasachi/UPSCMentor) if you find it helpful!
