# ⚡ Quick Setup - Get Your API Keys

I created a `.env` file for you with placeholders. Now let's fill it in with your actual credentials!

---

## 🎯 Step-by-Step: Get All Required Keys

### 1️⃣ Supabase (PadhAI Project) - 3 minutes

**Go to:** https://supabase.com/dashboard

1. **Select your "PadhAI" project** (or create one if it doesn't exist)

2. **Get Database URL:**
   - Click **Settings** (gear icon in sidebar)
   - Click **Database**
   - Scroll to **Connection string** section
   - Select **Connection pooling** tab
   - Copy the URL (looks like: `postgresql://postgres.xxxxx:[PASSWORD]@...`)
   - **Replace `[PASSWORD]` with your actual database password**

3. **Get API Keys:**
   - Click **Settings** → **API**
   - Copy these 3 values:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon public** key: `eyJhbGciOiJI...` (for frontend)
     - **service_role** key: `eyJhbGciOiJI...` (for backend - SECRET!)

4. **Paste them in your `.env` file:**
   ```env
   DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@...
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### 2️⃣ Groq API Key - 2 minutes (FREE!)

**Go to:** https://console.groq.com

1. **Sign up / Login** (free account, no credit card needed)
2. Click **API Keys** in the left sidebar
3. Click **Create API Key**
4. Give it a name: "UPSC Prep Backend"
5. Copy the key (starts with `gsk_...`)

6. **Paste in `.env`:**
   ```env
   GROQ_API_KEY=gsk_your_actual_groq_key_here
   ```

---

### 3️⃣ OpenAI API Key - 2 minutes (Paid)

**Go to:** https://platform.openai.com/api-keys

1. **Login** to your OpenAI account
2. Click **Create new secret key**
3. Give it a name: "UPSC Prep Backend"
4. Copy the key (starts with `sk-...`)
5. **Important:** Add credits to your account (minimum $5)

6. **Paste in `.env`:**
   ```env
   OPENAI_API_KEY=sk-your_actual_openai_key_here
   ```

---

### 4️⃣ Generate JWT Secret Key - 30 seconds

Run this command to generate a strong secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and paste in `.env`:
```env
SECRET_KEY=your-generated-secret-key-here
```

---

## ✅ Verify Your Configuration

After filling in all the values, test it:

```bash
cd backend
python verify_env.py
```

You should see:
```
✅ All required environment variables are configured!
✅ Connected to PadhAI Supabase project
✅ You're ready to start the backend server.
```

---

## 🚀 Start the Backend

Once verification passes:

```bash
python main.py
```

You should see:
```
✅ Database tables created successfully
✅ pgvector extension enabled
✅ Supabase client initialized
✅ Supabase Storage bucket 'upsc-uploads' created
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 🐛 If You Get Errors

### Error: "Field required"
- ❌ You forgot to replace a placeholder value
- ✅ Check `.env` file and replace ALL `your_xxx_here` values

### Error: "Invalid API key"
- ❌ You copied the key incorrectly
- ✅ Make sure there are NO spaces before or after the key
- ✅ Check the key format:
  - Groq: starts with `gsk_`
  - OpenAI: starts with `sk-`
  - Supabase: starts with `eyJ`

### Error: "Database connection failed"
- ❌ You didn't replace `[PASSWORD]` in DATABASE_URL
- ✅ Get your password from Supabase → Settings → Database → Reset password if needed

---

## 📝 Your `.env` File Should Look Like This:

```env
# Supabase - PadhAI Project
DATABASE_URL=postgresql://postgres.abcdefgh:[MyActualPassword123]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmd...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmd...

# JWT
SECRET_KEY=xYzAbC123456789aBcDeFgHiJkLmNoPqRsTuVwXyZ
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# LLM APIs
GROQ_API_KEY=gsk_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
OPENAI_API_KEY=sk-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567
OPENAI_MODEL=gpt-4o-mini

# Optional
GOOGLE_VISION_API_KEY=
RESEND_API_KEY=
FROM_EMAIL=noreply@upscprep.com
REDIS_URL=redis://localhost:6379/0

ENVIRONMENT=development
DEBUG=True
```

**Note:** All the long strings starting with `eyJ...`, `gsk_...`, `sk-...` are your ACTUAL keys (not these examples!)

---

## 🎉 Done!

Once `python verify_env.py` shows ✅, you're ready to:

1. **Start backend:** `python main.py`
2. **Start frontend:** `cd ../frontend && npm run dev`
3. **Test:** Open http://localhost:3000

---

## 💰 Cost Breakdown

- **Supabase**: FREE (for development)
- **Groq**: FREE (500 requests/day, no credit card)
- **OpenAI**: ~$0.01 per evaluation (need to add $5+ credits)
- **Tesseract OCR**: FREE (open source)

**Total to get started:** ~$5 (only for OpenAI)

---

## 📚 Need More Help?

- **Supabase Setup:** See `SETUP_PADHAI_PROJECT.md`
- **How .env Works:** See `HOW_ENV_WORKS.md`
- **Full Deployment:** See `../DEPLOYMENT_GUIDE.md`

