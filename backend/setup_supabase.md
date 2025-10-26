# Supabase Setup Guide

This guide will help you set up Supabase for the UPSC Prep Ecosystem backend.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name:** UPSC Prep Ecosystem
   - **Database Password:** (save this!)
   - **Region:** Choose closest to you
4. Click "Create new project"
5. Wait for project to initialize (~2 minutes)

## 2. Get Connection Details

### Database URL
1. Go to **Settings** → **Database**
2. Find **Connection string** section
3. Copy the **Connection pooling** URL (recommended for serverless)
4. Format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:6543/postgres?pgbouncer=true`

### API Keys
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (for frontend - public safe)
   - **service_role** key (for backend - keep secret!)

## 3. Update Backend `.env`

Create `/backend/.env` file:

```env
# Supabase Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_service_role_key_here

# JWT (use the JWT secret from Supabase Settings → API)
SECRET_KEY=your_jwt_secret_from_supabase
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

## 4. Enable Required Extensions

Run these SQL commands in Supabase **SQL Editor**:

```sql
-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify extensions
SELECT * FROM pg_extension;
```

## 5. Create Storage Bucket

### Via SQL Editor:
```sql
-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('upsc-uploads', 'upsc-uploads', true);
```

### Or via Dashboard:
1. Go to **Storage** in sidebar
2. Click "Create a new bucket"
3. Name: `upsc-uploads`
4. Check "Public bucket"
5. Click "Create bucket"

## 6. Set Up Row Level Security (RLS)

By default, Supabase enables RLS. For development, you can disable it or create policies:

### Option A: Disable for Development (NOT for production!)
```sql
-- Disable RLS on all tables (development only)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE mentors DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
```

### Option B: Create Basic Policies (Recommended)
```sql
-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can view their own assessments
CREATE POLICY "Users can view own assessments" ON assessments
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Add similar policies for other tables
```

## 7. Initialize Database Tables

Run the backend to auto-create tables:

```bash
cd backend
python main.py
```

The tables will be created automatically via SQLAlchemy.

## 8. Verify Setup

### Check Tables
Go to **Table Editor** in Supabase dashboard and verify tables exist:
- users
- mentors
- assessments
- questions
- responses
- evaluations
- bookings
- progress_snapshots
- document_chunks

### Test Connection
```python
# Test script
from supabase import create_client

url = "your_supabase_url"
key = "your_service_role_key"

supabase = create_client(url, key)

# Test query
result = supabase.table('users').select("*").limit(1).execute()
print("Connection successful!", result)
```

## 9. Optional: Set Up Realtime

If you want realtime features:

```sql
-- Enable realtime for specific tables
ALTER TABLE bookings REPLICA IDENTITY FULL;

-- In Supabase dashboard, go to Database → Replication
-- Enable replication for desired tables
```

## 10. Production Checklist

Before deploying to production:

- [ ] Enable RLS on all tables
- [ ] Create specific security policies
- [ ] Use connection pooling URL (pgbouncer)
- [ ] Set up database backups
- [ ] Configure proper CORS settings
- [ ] Use service_role key only in backend (never expose to frontend)
- [ ] Set up monitoring and alerts
- [ ] Enable 2FA on Supabase account

## Database Schema

The backend will automatically create these tables:

```
users (id, email, password_hash, full_name, role, created_at, last_login, is_active)
mentors (id, user_id, bio, subjects, expertise, experience_years, rating, ...)
assessments (id, user_id, subject, topic, difficulty_level, status, ...)
questions (id, type, subject, topic, difficulty, question_text, options, ...)
responses (id, assessment_id, question_id, user_answer, image_url, ocr_text, ...)
evaluations (id, assessment_id, score, feedback_text, strengths, weaknesses, ...)
bookings (id, user_id, mentor_id, assessment_id, scheduled_at, status, ...)
progress_snapshots (id, user_id, assessment_id, subject, topic, score, ...)
document_chunks (id, source_document, subject, topic, chunk_text, embedding_id, ...)
```

## Useful SQL Queries

### View all users
```sql
SELECT id, email, full_name, role, created_at
FROM users
ORDER BY created_at DESC;
```

### Check storage usage
```sql
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(CAST(metadata->>'size' AS INTEGER)) as total_size
FROM storage.objects
GROUP BY bucket_id;
```

### Recent assessments
```sql
SELECT 
  a.id,
  u.full_name,
  a.subject,
  a.topic,
  a.status,
  a.created_at
FROM assessments a
JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC
LIMIT 10;
```

## Troubleshooting

### Connection Issues
- Check if DATABASE_URL has correct password
- Ensure you're using port 6543 (pooler) or 5432 (direct)
- Verify IP allowlist in Supabase settings

### Extension Errors
- Extensions must be created by Supabase admin
- Contact Supabase support if pgvector is not available

### Storage Issues
- Verify bucket is public if accessing via URL
- Check file size limits (default 50MB)
- Ensure CORS is configured for your frontend domain

## Support

- Supabase Docs: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions
- Discord: https://discord.supabase.com

---

**Next Steps:**
1. Complete `.env` configuration
2. Run `python main.py` to start backend
3. Access API docs at http://localhost:8000/docs
4. Initialize RAG system with NCERT documents

