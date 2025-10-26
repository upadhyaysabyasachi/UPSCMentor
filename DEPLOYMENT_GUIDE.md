# 🚀 UPSC Prep Ecosystem - Complete Deployment Guide

This guide will help you get the entire UPSC Prep Ecosystem (Frontend + Backend) running from scratch.

## 📋 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    UPSC Prep Ecosystem                      │
├──────────────────────┬──────────────────────────────────────┤
│      Frontend        │            Backend                   │
│   (Next.js 14)       │         (FastAPI)                    │
│                      │                                       │
│  - Login/Register    │  - JWT Authentication                │
│  - Dashboard         │  - Assessment APIs                   │
│  - Assessments       │  - AI Evaluation (Groq/OpenAI)      │
│  - Feedback          │  - RAG System (NCERT docs)          │
│  - Mentors           │  - OCR Service                       │
│  - Progress          │  - Mentor Management                 │
│                      │  - Booking System                    │
└──────────────────────┴──────────────────────────────────────┘
           │                            │
           └────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │   Supabase PostgreSQL        │
         │   - User data                │
         │   - Assessments              │
         │   - Vector embeddings        │
         └──────────────────────────────┘
```

## 🎯 Prerequisites

### Required Software
- **Node.js** 18+ (for frontend)
- **Python** 3.10+ (for backend)
- **Tesseract OCR** (for handwritten answer processing)
- **Git** (version control)

### Required Accounts & API Keys
1. **Supabase** account (free tier works)
2. **Groq API** key (free tier available)
3. **OpenAI API** key (fallback LLM)

---

## 📦 Part 1: Supabase Setup (5 minutes)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Fill in details:
   - Name: `upsc-prep`
   - Database Password: **Save this securely!**
   - Region: Choose closest to you
4. Click "Create new project" (takes ~2 minutes)

### 1.2 Get Connection Details

Once project is ready:

1. Go to **Settings → Database**
2. Copy **Connection pooling** URL:
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
   ```

3. Go to **Settings → API**
4. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **service_role key** (secret): For backend only

### 1.3 Enable Extensions

1. Go to **SQL Editor**
2. Run this SQL:

```sql
-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify
SELECT * FROM pg_extension;
```

### 1.4 Create Storage Bucket

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('upsc-uploads', 'upsc-uploads', true);
```

### 1.5 Disable RLS for Development

```sql
-- For development only! Enable RLS in production
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE mentors DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
```

---

## 🔑 Part 2: Get API Keys (5 minutes)

### 2.1 Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / Login
3. Go to **API Keys**
4. Click "Create API Key"
5. Copy and save the key

### 2.2 OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Login
3. Go to **API Keys**
4. Click "Create new secret key"
5. Copy and save the key

---

## 🔧 Part 3: Backend Setup (10 minutes)

### 3.1 Install Dependencies

```bash
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python packages
pip install -r requirements.txt
```

### 3.2 Install Tesseract OCR

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

### 3.3 Configure Environment

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:6543/postgres?pgbouncer=true
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_service_role_key_here

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# LLM APIs
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Optional (not needed for local dev)
PINECONE_API_KEY=
GOOGLE_VISION_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Development
ENVIRONMENT=development
DEBUG=True
```

### 3.4 Initialize Database

```bash
# Start the backend server
python main.py
```

This will:
- Create all database tables
- Initialize the RAG system
- Start the API server on http://localhost:8000

### 3.5 Verify Backend

Open http://localhost:8000/docs to see the API documentation.

Test health endpoint:
```bash
curl http://localhost:8000/health
```

---

## 🎨 Part 4: Frontend Setup (5 minutes)

### 4.1 Install Dependencies

```bash
# Open a new terminal
cd frontend
npm install
```

### 4.2 Configure Environment

The `.env.local` file should already exist, but verify it points to your backend:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=UPSC Prep Ecosystem
```

### 4.3 Start Development Server

```bash
npm run dev
```

Frontend will be available at: http://localhost:3000

---

## ✅ Part 5: Verification & Testing (5 minutes)

### 5.1 Test Authentication

1. Open http://localhost:3000
2. Click "Sign up for free"
3. Create an account:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Aspirant
4. You should be redirected to dashboard

### 5.2 Test Assessment Flow

1. Click "Start New Test" on dashboard
2. Select: History → Ancient India → Medium
3. Click "Start Assessment"
4. Answer a few questions:
   - For MCQ: Select an option
   - For Subjective: Type or upload an image
5. Click "Submit Assessment"
6. View AI-generated feedback

### 5.3 Test RAG System

From backend terminal:

```python
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

---

## 📊 Part 6: Add Your NCERT Books

Your NCERT PDFs are already in `data/` folder. The backend will automatically process them.

### Verify Documents

```bash
ls -R data/
# Should show:
# data/history/Spectrum.pdf
# data/geography/ilovepdf_merged.pdf
```

### Rebuild RAG Index (if needed)

```bash
cd backend
python -c "
import asyncio
from app.services.rag_service import rag_service

async def rebuild():
    await rag_service.create_index()
    print('Index rebuilt successfully!')

asyncio.run(rebuild())
"
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Issue:** Database connection error
```bash
# Check database URL
echo $DATABASE_URL

# Test connection
python -c "from app.database import engine; print(engine.connect())"
```

**Issue:** Missing API keys
```bash
# Verify .env file exists
cat backend/.env | grep API_KEY
```

### Frontend Won't Connect

**Issue:** CORS errors
- Verify backend is running on port 8000
- Check `NEXT_PUBLIC_API_BASE_URL` in frontend/.env.local

**Issue:** 401 Unauthorized
- Clear localStorage in browser
- Try logging in again

### RAG System Issues

**Issue:** No documents found
```bash
# Check data directory
ls -la data/

# Rebuild index
cd backend
rm -rf storage/  # Clear old index
python main.py  # Restart to rebuild
```

**Issue:** Slow query responses
- First query is always slow (building index)
- Subsequent queries should be fast
- Check network latency to OpenAI/Groq

---

## 🚀 Production Deployment

### Backend (Railway / Render / Fly.io)

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables:
   - All variables from `.env`
   - Set `DEBUG=False`
   - Set `ENVIRONMENT=production`
4. Deploy!

### Frontend (Vercel / Netlify)

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set environment variables:
   - `NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com`
4. Deploy!

### Database

- Supabase is already production-ready
- Enable Row Level Security (RLS) for production
- Set up backups in Supabase dashboard
- Configure proper CORS settings

---

## 📖 What's Next?

### For Development:
1. Add more questions to the database
2. Customize evaluation rubrics
3. Add more NCERT/study material PDFs
4. Create mentor profiles
5. Test booking flow

### For Production:
1. Set up domain names
2. Configure SSL certificates
3. Enable RLS on Supabase
4. Set up monitoring (Sentry, LogRocket)
5. Configure email service (Resend)
6. Add payment integration (Stripe)
7. Set up CI/CD pipeline

---

## 📚 Documentation Links

- **Frontend README**: `frontend/README.md`
- **Frontend Quick Start**: `frontend/QUICKSTART.md`
- **Backend README**: `backend/README.md`
- **Supabase Setup**: `backend/setup_supabase.md`
- **Implementation Plan**: `docs/plan.md`
- **PRD**: `docs/prd.md`

---

## 🎉 Congratulations!

You now have a fully functional AI-powered UPSC preparation platform running locally!

### Test Credentials
- Email: test@example.com
- Password: password123

### Key URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Supabase Dashboard: https://app.supabase.com

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review the API documentation at `/docs`
3. Check backend logs for errors
4. Verify all environment variables are set correctly
5. Ensure all dependencies are installed

## 🎯 Success Checklist

- [ ] Supabase project created and configured
- [ ] Groq and OpenAI API keys obtained
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can register and login
- [ ] Can create and take assessments
- [ ] Can view AI feedback
- [ ] RAG system returning context from NCERT books
- [ ] OCR extracting text from images

**Happy coding! 🚀**

