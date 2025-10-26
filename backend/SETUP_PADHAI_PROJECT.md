# 🚀 Connect to Your PadhAI Supabase Project

This guide will help you connect the backend to your existing **PadhAI** Supabase project.

---

## 📋 Prerequisites

You already have a Supabase project called **"PadhAI"**. Let's connect to it!

---

## Step 1: Get Your PadhAI Project Credentials

### 1.1 Go to Your Project
1. Visit: https://supabase.com/dashboard
2. Select your **PadhAI** project

### 1.2 Get Database URL
1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **Connection pooling** (recommended)
4. Copy the URL that looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

### 1.3 Get API Keys
1. Go to **Settings** → **API**
2. Copy these three values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key (for frontend): `eyJhbGciOiJIUzI1...` 
   - **service_role** key (for backend - secret!): `eyJhbGciOiJIUzI1...`

### 1.4 Optional: Get JWT Secret
1. Go to **Settings** → **API**
2. Scroll to **JWT Settings**
3. Copy the **JWT Secret** (you can use this as your SECRET_KEY)

---

## Step 2: Configure Backend .env

Create `/backend/.env` with your PadhAI credentials:

```env
# ==========================================
# SUPABASE - PadhAI Project
# ==========================================
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==========================================
# JWT (Use Supabase JWT Secret or generate new)
# ==========================================
SECRET_KEY=your_supabase_jwt_secret_or_generate_new
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ==========================================
# LLM APIs
# ==========================================
GROQ_API_KEY=gsk_your_groq_key
OPENAI_API_KEY=sk-your_openai_key
OPENAI_MODEL=gpt-4o-mini

# ==========================================
# OPTIONAL
# ==========================================
GOOGLE_VISION_API_KEY=
RESEND_API_KEY=
FROM_EMAIL=noreply@upscprep.com
REDIS_URL=redis://localhost:6379/0

ENVIRONMENT=development
DEBUG=True
```

---

## Step 3: Enable Required Extensions in PadhAI

Run these SQL commands in your PadhAI project:

### 3.1 Go to SQL Editor
1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**

### 3.2 Run This SQL

```sql
-- Enable pgvector for vector embeddings (RAG system)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify extensions are enabled
SELECT extname, extversion FROM pg_extension;
```

Click **Run** or press `Cmd/Ctrl + Enter`

You should see:
```
extname     | extversion
------------|------------
vector      | 0.5.0
uuid-ossp   | 1.1
```

---

## Step 4: Create Storage Bucket for File Uploads

### Option A: Via SQL Editor (Recommended)

```sql
-- Create storage bucket for uploaded images and files
INSERT INTO storage.buckets (id, name, public)
VALUES ('upsc-uploads', 'upsc-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Verify bucket was created
SELECT * FROM storage.buckets WHERE name = 'upsc-uploads';
```

### Option B: Via Dashboard

1. Go to **Storage** in left sidebar
2. Click **Create a new bucket**
3. Bucket name: `upsc-uploads`
4. ✅ Check **Public bucket**
5. Click **Create bucket**

---

## Step 5: Set Up Row Level Security (RLS)

### For Development (Disable RLS)

```sql
-- DEVELOPMENT ONLY - Disable RLS on tables
-- Re-enable this in production with proper policies!

ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mentors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progress_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS document_chunks DISABLE ROW LEVEL SECURITY;
```

---

## Step 6: Initialize Database Tables

The backend will automatically create all required tables when you start it:

```bash
cd backend
python main.py
```

You'll see logs like:
```
✅ Database tables created successfully
✅ pgvector extension enabled
✅ Supabase client initialized: https://xxxxx.supabase.co
✅ Supabase Storage bucket 'upsc-uploads' already exists
```

---

## Step 7: Verify Connection

### Check Tables in Supabase Dashboard

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - users
   - mentors
   - assessments
   - questions
   - responses
   - evaluations
   - bookings
   - progress_snapshots
   - document_chunks
   - mentor_reviews
   - assessment_questions

### Test Connection from Backend

```bash
cd backend
python verify_env.py
```

Should show:
```
✅ All required environment variables are configured!
✅ DATABASE_URL        = postgresql://postgres...
✅ SUPABASE_URL        = https://xxxxx.supabase.co
✅ SUPABASE_KEY        = eyJhbGci...
```

### Test API

```bash
# Start backend
python main.py

# In another terminal, test health endpoint
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "vector_store": "connected"
}
```

---

## Step 8: Configure Frontend to Use PadhAI

Update `frontend/.env.local`:

```env
# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Supabase (for direct client access if needed)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXT_PUBLIC_APP_NAME=UPSC Prep Ecosystem
```

---

## ✅ Verification Checklist

- [ ] PadhAI project credentials added to backend/.env
- [ ] pgvector extension enabled in PadhAI
- [ ] Storage bucket 'upsc-uploads' created
- [ ] RLS disabled for development
- [ ] Backend starts without errors: `python main.py`
- [ ] Tables visible in Supabase Table Editor
- [ ] Health check passes: `curl http://localhost:8000/health`
- [ ] Frontend can connect to backend

---

## 🎯 What's Stored in Supabase

Your **PadhAI** project now handles everything:

### 📊 PostgreSQL Database
- User accounts and authentication
- Assessments and questions
- Mentor profiles and bookings
- Student responses and evaluations
- Progress tracking data
- **Vector embeddings** for NCERT documents (pgvector)

### 📁 Supabase Storage
- Uploaded answer images (handwritten)
- Profile pictures
- Document files
- All file uploads from users

### 🔐 Supabase Auth (Optional)
- Can integrate Supabase Auth for social logins
- Currently using custom JWT authentication

---

## 🚀 Next Steps

1. **Start Backend:**
   ```bash
   cd backend
   python main.py
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the App:**
   - Open http://localhost:3000
   - Register a new user
   - Create an assessment
   - Upload an answer image
   - Check Supabase dashboard to see data!

---

## 📊 Monitor Your PadhAI Project

### View Data
- **Table Editor** → See all user data, assessments, etc.
- **Storage** → See uploaded images in 'upsc-uploads' bucket
- **SQL Editor** → Run queries on your data

### Monitor Usage
- **Database** → Check database size and usage
- **Storage** → See storage usage
- **Logs** → View API logs
- **Reports** → Usage statistics

---

## 🐛 Troubleshooting

### Connection Refused
- Check if DATABASE_URL has correct password
- Verify you're using **Connection pooling** URL (port 6543)
- Check if IP is allowed in Supabase settings

### pgvector Extension Error
- Make sure you ran the SQL to enable it
- Check Settings → Database → Extensions

### Storage Upload Fails
- Verify bucket exists: Storage → Buckets
- Check bucket is public
- Verify SUPABASE_KEY is the **service_role** key (not anon)

### Tables Not Created
- Check backend logs for errors
- Verify DATABASE_URL is correct
- Try running `python main.py` again

---

## 🎉 Success!

Your backend is now fully connected to your **PadhAI** Supabase project!

- ✅ All data stored in Supabase PostgreSQL
- ✅ All files stored in Supabase Storage
- ✅ Vector embeddings in pgvector
- ✅ No AWS dependencies!

**Everything in one place!** 🚀

