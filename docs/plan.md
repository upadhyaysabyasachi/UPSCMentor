# AI-Agentic UPSC Preparation Ecosystem – Implementation Plan

## 📋 Overview
This document outlines the technical implementation plan for the AI-powered UPSC preparation platform based on the PRD requirements.

---

## 🏗️ System Architecture

### High-Level Components
```
┌─────────────────┐
│   Frontend      │ (React/Next.js)
│   - Assessment  │
│   - Dashboard   │
│   - Mentor UI   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │ (FastAPI/Python)
│   - Auth        │
│   - Assessment  │
│   - Evaluation  │
│   - Booking     │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌──────┐ ┌──────────┐
│ Groq   │ │ Vector │ │ OCR  │ │PostgreSQL│
│  LLM   │ │ Store  │ │Engine│ │  + S3    │
└────────┘ └────────┘ └──────┘ └──────────┘
```

---

## 🗓️ Development Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Set up infrastructure and core services

#### 1.1 Backend Infrastructure
- [ ] Initialize FastAPI project structure
- [ ] Set up PostgreSQL database with schemas
- [ ] Configure environment management (.env, configs)
- [ ] Implement authentication (JWT-based)
- [ ] Set up S3/cloud storage for file uploads

#### 1.2 RAG System Setup
- [ ] Collect and preprocess NCERT/PYQ documents
- [ ] Implement document chunking strategy (500-1000 tokens)
- [ ] Generate embeddings using sentence-transformers
- [ ] Set up vector database (Pinecone/Weaviate/ChromaDB)
- [ ] Index all study materials
- [ ] Build RAG retrieval pipeline

#### 1.3 LLM Integration
- [ ] Integrate Groq API client
- [ ] Implement OpenAI GPT-4 fallback logic
- [ ] Create prompt templates for evaluation
- [ ] Build structured JSON response parser
- [ ] Implement retry and error handling

---

### Phase 2: Core Assessment Engine (Week 2-3)
**Goal:** Build assessment creation and evaluation system

#### 2.1 Question Bank System
- [ ] Design question schema (MCQ + Subjective)
- [ ] Build CRUD APIs for questions
- [ ] Implement topic/subject tagging
- [ ] Create difficulty level classification
- [ ] Build question selection algorithm (adaptive)

#### 2.2 MCQ Evaluation
- [ ] Implement auto-grading logic
- [ ] Calculate scores and analytics
- [ ] Generate immediate feedback
- [ ] Track answer patterns

#### 2.3 Subjective Evaluation
- [ ] Integrate OCR service (Tesseract/Google Vision API)
- [ ] Implement image upload and preprocessing
- [ ] Build text extraction pipeline
- [ ] Create evaluation rubric system
- [ ] Implement Groq-based answer evaluation
- [ ] Generate structured feedback with RAG citations
- [ ] Build concept gap identification logic

---

### Phase 3: Feedback & Recommendations (Week 3-4)
**Goal:** Generate actionable insights and study recommendations

#### 3.1 Feedback Generation
- [ ] Design feedback data structure
- [ ] Implement scoring algorithm (0-100 scale)
- [ ] Build gap analysis logic
- [ ] Generate personalized feedback summaries
- [ ] Create ConceptCard system

#### 3.2 Recommendation Engine
- [ ] Build NCERT/PYQ retrieval based on gaps
- [ ] Implement relevance scoring
- [ ] Create study material ranking
- [ ] Generate practice question suggestions
- [ ] Build topic-wise resource mapping

#### 3.3 Progress Tracking
- [ ] Design progress schema (historical scores)
- [ ] Implement comparison logic (current vs previous)
- [ ] Build visualization data endpoints
- [ ] Create improvement metrics dashboard

---

### Phase 4: Mentor Ecosystem (Week 4-5)
**Goal:** Enable mentor matching and booking

#### 4.1 Mentor Management
- [ ] Design mentor profile schema
- [ ] Build mentor onboarding flow
- [ ] Implement subject/expertise tagging
- [ ] Create rating and review system
- [ ] Build mentor catalogue API

#### 4.2 Booking System
- [ ] Design availability calendar schema
- [ ] Implement slot management
- [ ] Build booking API (create, update, cancel)
- [ ] Create waitlist notification system
- [ ] Implement email notifications (mentor + aspirant)
- [ ] Build session confirmation workflow

#### 4.3 Session Preparation
- [ ] Generate AI summary for mentors
- [ ] Create student performance report
- [ ] Build pre-session briefing document

---

### Phase 5: Frontend Development (Week 5-6)
**Goal:** Build user-facing interfaces

#### 5.1 Authentication & Onboarding
- [ ] Login/Signup UI
- [ ] Profile setup flow
- [ ] Preference selection (subjects, difficulty)

#### 5.2 Assessment Interface
- [ ] Topic/subject selection screen
- [ ] MCQ test UI with timer
- [ ] Subjective answer input (text + image upload)
- [ ] Progress indicator
- [ ] Submit and review flow

#### 5.3 Feedback Dashboard
- [ ] Score display with breakdown
- [ ] Gap analysis visualization
- [ ] Recommended resources section
- [ ] ConceptCard display
- [ ] Action items (Book Mentor / Study)

#### 5.4 Mentor Catalogue & Booking
- [ ] Mentor search and filter UI
- [ ] Profile detail page
- [ ] Calendar selection interface
- [ ] Booking confirmation screen
- [ ] Session management dashboard

#### 5.5 Progress Tracking
- [ ] Historical performance charts
- [ ] Comparison views (before/after)
- [ ] Topic-wise improvement heatmap
- [ ] Goal setting and tracking

---

### Phase 6: Testing & Optimization (Week 6-7)
**Goal:** Ensure reliability and performance

#### 6.1 Testing Strategy
- [ ] Unit tests for core logic (pytest)
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical user flows
- [ ] Load testing (locust/k6)
- [ ] Latency optimization (target: P50 < 8s)

#### 6.2 Model Evaluation
- [ ] Test evaluation accuracy with sample answers
- [ ] Measure hallucination rate (<5% target)
- [ ] A/B test Groq vs GPT-4 performance
- [ ] Validate RAG citation quality

#### 6.3 Security & Privacy
- [ ] Implement PII anonymization
- [ ] Secure file upload validation
- [ ] API rate limiting
- [ ] SQL injection prevention
- [ ] CORS and authentication checks

---

## 🛠️ Technical Stack

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Database:** PostgreSQL 14+
- **ORM:** SQLAlchemy
- **Migration:** Alembic
- **Task Queue:** Celery + Redis (for async processing)
- **File Storage:** AWS S3 / MinIO

### AI/ML
- **Primary LLM:** Groq (Llama 3.x)
- **Fallback LLM:** OpenAI GPT-4
- **Embeddings:** sentence-transformers (all-MiniLM-L6-v2)
- **Vector DB:** Pinecone / Weaviate / ChromaDB
- **OCR:** Tesseract / Google Vision API

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** TailwindCSS
- **State Management:** Zustand / React Query
- **Charts:** Recharts / Chart.js

### DevOps
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)

---

## 🗄️ Database Schema Design

### Core Tables

#### users
```sql
- id (PK)
- email (unique)
- password_hash
- full_name
- role (aspirant/mentor)
- created_at
- last_login
```

#### assessments
```sql
- id (PK)
- user_id (FK)
- subject
- topic
- difficulty_level
- status (in_progress/completed)
- created_at
- completed_at
```

#### questions
```sql
- id (PK)
- type (mcq/subjective)
- subject
- topic
- difficulty
- question_text
- correct_answer (for MCQ)
- rubric (for subjective)
- source_reference
```

#### responses
```sql
- id (PK)
- assessment_id (FK)
- question_id (FK)
- user_answer
- image_url (for handwritten)
- ocr_text
- is_correct (for MCQ)
- score (for subjective)
- created_at
```

#### evaluations
```sql
- id (PK)
- response_id (FK)
- score
- feedback_text
- concept_gaps (JSON)
- recommendations (JSON)
- llm_model_used
- evaluation_time_ms
- created_at
```

#### mentors
```sql
- id (PK)
- user_id (FK)
- bio
- subjects (JSON)
- experience_years
- rating
- total_sessions
- availability (JSON)
```

#### bookings
```sql
- id (PK)
- user_id (FK)
- mentor_id (FK)
- assessment_id (FK)
- scheduled_at
- duration_minutes
- status (pending/confirmed/completed/cancelled)
- meeting_link
- ai_summary (JSON)
- created_at
```

#### progress_snapshots
```sql
- id (PK)
- user_id (FK)
- subject
- topic
- score
- test_date
- comparison_baseline_id (FK, self-reference)
```

---

## 🔌 API Design

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Assessments
- `GET /api/assessments` - List available assessments
- `POST /api/assessments` - Create new assessment
- `GET /api/assessments/{id}` - Get assessment details
- `POST /api/assessments/{id}/submit` - Submit assessment

### Evaluation
- `POST /api/evaluate/mcq` - Auto-evaluate MCQ
- `POST /api/evaluate/subjective` - AI-evaluate subjective answer
- `POST /api/ocr/extract` - Extract text from image
- `GET /api/evaluations/{assessment_id}` - Get feedback

### Recommendations
- `GET /api/recommendations/{assessment_id}` - Get study recommendations
- `GET /api/concept-cards/{topic}` - Get concept explanations

### Mentors
- `GET /api/mentors` - List mentors with filters
- `GET /api/mentors/{id}` - Get mentor details
- `GET /api/mentors/{id}/availability` - Get available slots

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/{id}` - Get booking details
- `PATCH /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

### Progress
- `GET /api/progress/user/{user_id}` - Get user progress
- `GET /api/progress/comparison` - Compare test results

---

## 📝 Prompt Engineering Strategy

### Evaluation Prompt Template
```python
EVALUATION_PROMPT = """
You are an expert UPSC examiner. Evaluate the following answer.

Question: {question}
Rubric: {rubric}
Student Answer: {answer}

Context from NCERT/PYQ:
{rag_context}

Evaluate based on:
1. Structure and organization
2. Factual accuracy
3. Relevance to question
4. Depth of understanding

Provide response in JSON format:
{
  "score": <0-100>,
  "strengths": ["point1", "point2"],
  "weaknesses": ["point1", "point2"],
  "concept_gaps": ["concept1", "concept2"],
  "feedback": "detailed feedback",
  "recommendations": ["resource1", "resource2"]
}
"""
```

### Gap Analysis Prompt
```python
GAP_ANALYSIS_PROMPT = """
Based on the user's performance across {num_questions} questions,
identify the top 3 conceptual gaps in {subject} - {topic}.

Performance data:
{performance_summary}

Return JSON:
{
  "primary_gaps": ["gap1", "gap2", "gap3"],
  "ncert_references": ["chapter X section Y", ...],
  "pyq_recommendations": ["2022-Q5", "2021-Q12"]
}
"""
```

---

## 🎯 Success Metrics & Monitoring

### Technical Metrics
- **Latency:** P50 < 8s, P95 < 15s (evaluation time)
- **Uptime:** 99.5% availability
- **Error Rate:** < 1% API errors
- **Hallucination Rate:** < 5% (manual spot checks)

### Business Metrics (from PRD)
- **Assessment Completion:** % users completing tests
- **Mentor Booking Rate:** % users booking after feedback
- **Feedback Satisfaction:** Avg rating > 4.0/5.0

### Monitoring Dashboard
- Real-time API latency (Grafana)
- LLM response times by model
- OCR success rate
- Database query performance
- Storage usage trends

---

## 🚀 Deployment Strategy

### Environment Setup
1. **Development:** Local Docker Compose
2. **Staging:** AWS ECS / Google Cloud Run
3. **Production:** Kubernetes cluster with auto-scaling

### Rollout Plan
1. Internal testing with sample data
2. Beta launch with 50 aspirants
3. Mentor onboarding (10-15 verified mentors)
4. Public launch with monitoring
5. Iterative improvements based on feedback

---

## ⚠️ Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Groq API downtime | Implement GPT-4 fallback with circuit breaker |
| High evaluation latency | Use async task queue, show progress indicators |
| OCR accuracy issues | Allow manual text entry, show extracted text for verification |
| Low mentor availability | Build waitlist system, send notifications |
| Data privacy concerns | Anonymize PII, implement data retention policy |
| Poor feedback quality | A/B test prompts, collect user ratings on feedback |

---

## 📚 Documentation Deliverables
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema diagram
- [ ] Deployment guide
- [ ] User manual
- [ ] Mentor onboarding guide
- [ ] Troubleshooting guide

---

## 🎓 Learning & Iteration
- Weekly sprint reviews
- User feedback collection post-session
- Monthly model performance audits
- A/B testing for prompt optimization
- Community feature requests prioritization

---

## 📅 Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1 | Week 1-2 | Infrastructure + RAG setup |
| Phase 2 | Week 2-3 | Assessment engine |
| Phase 3 | Week 3-4 | Feedback system |
| Phase 4 | Week 4-5 | Mentor ecosystem |
| Phase 5 | Week 5-6 | Frontend UI |
| Phase 6 | Week 6-7 | Testing & launch |

**Total:** 7 weeks to MVP
**Buffer:** +2 weeks for iterations = **9 weeks to production**

---

## 🔄 Post-Launch Roadmap
1. **Month 1-2:** Bug fixes, performance optimization
2. **Month 3:** Mobile app development
3. **Month 4:** Peer discussion forums
4. **Month 5:** AI study plan generator
5. **Month 6:** Gamification and leaderboards

---

*Last Updated: October 26, 2025*

