# How Environment Variables Work in This Project

## ✅ Yes, We ARE Using the .env File!

All services are correctly configured to use environment variables from your `.env` file. Here's how it works:

---

## 🔧 Architecture

```
.env file
    ↓
config.py (loads .env using pydantic-settings)
    ↓
settings object (singleton)
    ↓
All services import settings
    ↓
Services use: settings.GROQ_API_KEY, settings.SUPABASE_URL, etc.
```

---

## 📝 Configuration Flow

### 1. `.env` File (Your Configuration)
```env
GROQ_API_KEY=gsk_xxxxx
OPENAI_API_KEY=sk-xxxxx
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx...
```

### 2. `config.py` (Loads Environment)
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str       # Required
    OPENAI_API_KEY: str     # Required
    DATABASE_URL: str       # Required
    
    class Config:
        env_file = ".env"    # 👈 Automatically loads .env
        case_sensitive = True

settings = Settings()  # 👈 Singleton instance
```

### 3. Services Use Settings
```python
# app/services/llm_service.py
from config import settings  # 👈 Import settings

class LLMService:
    def __init__(self):
        # 👇 Using environment variables from .env
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
```

```python
# app/services/rag_service.py  
from config import settings  # 👈 Import settings

class RAGService:
    def __init__(self):
        # 👇 Using environment variables from .env
        Settings.embed_model = OpenAIEmbedding(
            api_key=settings.OPENAI_API_KEY
        )
```

```python
# app/database.py
from config import settings  # 👈 Import settings

# 👇 Using environment variables from .env
engine = create_engine(settings.DATABASE_URL)
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
```

---

## 🔍 Verify Your Configuration

### Step 1: Check if .env exists
```bash
cd backend
ls -la .env
```

If not found, create it:
```bash
cp .env.example .env
nano .env  # or use your editor
```

### Step 2: Run verification script
```bash
python verify_env.py
```

This will show you:
- ✅ Which environment variables are loaded
- ❌ Which are missing
- 🔒 Masked API keys (for security)

Example output:
```
====================================================
🔍 Environment Variables Verification
====================================================

✅ REQUIRED Variables:
----------------------------------------------------

📌 Database:
  ✓ DATABASE_URL            = postgres...
  ✓ SUPABASE_URL            = https://xxxxx...
  ✓ SUPABASE_KEY            = eyJhbGc...

📌 JWT Authentication:
  ✓ SECRET_KEY              = your-sec...
  ✓ ALGORITHM               = HS256

📌 LLM APIs:
  ✓ GROQ_API_KEY            = gsk_xxxx...
  ✓ OPENAI_API_KEY          = sk-xxxx...
  ✓ OPENAI_MODEL            = gpt-4o-mini

✅ All required environment variables are configured!
```

### Step 3: Test in Python
```bash
python
```

```python
>>> from config import settings
>>> print(settings.GROQ_API_KEY[:10] + "...")
gsk_xxxxxx...
>>> print(settings.DATABASE_URL[:20] + "...")
postgresql://postgre...
>>> print(settings.SUPABASE_URL)
https://xxxxx.supabase.co
```

---

## 🎯 Where Each Variable is Used

| Environment Variable | Used In | Purpose |
|---------------------|---------|---------|
| `DATABASE_URL` | `app/database.py` | PostgreSQL connection |
| `SUPABASE_URL` | `app/database.py` | Supabase API client |
| `SUPABASE_KEY` | `app/database.py` | Supabase authentication |
| `GROQ_API_KEY` | `app/services/llm_service.py` | Primary LLM for evaluation |
| `OPENAI_API_KEY` | `app/services/llm_service.py`<br>`app/services/rag_service.py` | Fallback LLM + Embeddings |
| `SECRET_KEY` | `app/services/auth_service.py` | JWT token signing |

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore` (already done)
- Use different values for development and production
- Generate strong SECRET_KEY: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- Never commit API keys to git

### ❌ DON'T:
- Hardcode API keys in code
- Share `.env` file publicly
- Use default SECRET_KEY in production
- Commit `.env` to version control

---

## 🐛 Troubleshooting

### Problem: "API key not found" error
**Solution:**
```bash
# Check if .env exists
ls backend/.env

# Verify content
cat backend/.env | grep API_KEY

# Make sure no extra spaces
# WRONG: GROQ_API_KEY = gsk_xxx  (spaces around =)
# RIGHT: GROQ_API_KEY=gsk_xxx    (no spaces)
```

### Problem: Settings not loading
**Solution:**
```bash
# Make sure you're in backend directory when running
cd backend
python main.py

# NOT from project root:
# python backend/main.py  ❌ (won't find .env)
```

### Problem: "Field required" error
**Solution:**
```python
# Check which field is missing
python verify_env.py

# Add it to .env file
echo "GROQ_API_KEY=your_key_here" >> .env
```

---

## 📦 Deployment

### Development (.env file)
```bash
cd backend
python main.py
```
Loads from `.env` automatically.

### Production (Environment variables)
```bash
export DATABASE_URL="postgresql://..."
export GROQ_API_KEY="gsk_..."
export OPENAI_API_KEY="sk-..."
python main.py
```
Pydantic-settings will use system environment variables.

### Docker (docker-compose.yml)
```yaml
services:
  backend:
    image: upsc-backend
    env_file: .env  # Load from .env
    # OR
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - GROQ_API_KEY=${GROQ_API_KEY}
```

---

## ✅ Summary

**YES, we ARE using the .env file!** Every service correctly imports and uses `settings` from `config.py`, which automatically loads your `.env` file using `pydantic-settings`.

**Verification:**
```bash
cd backend
python verify_env.py  # Check your configuration
python main.py        # Start server (uses .env automatically)
```

**All services using .env:**
- ✅ Database connection → `settings.DATABASE_URL`
- ✅ Supabase → `settings.SUPABASE_URL`, `settings.SUPABASE_KEY`
- ✅ Groq LLM → `settings.GROQ_API_KEY`
- ✅ OpenAI → `settings.OPENAI_API_KEY`
- ✅ JWT → `settings.SECRET_KEY`
- ✅ All other configurations

**No hardcoded values!** Everything comes from your `.env` file. 🎉

