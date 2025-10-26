# AI-Agentic UPSC Preparation Ecosystem – PRD

## 📝 Abstract
An AI-powered UPSC preparation platform that helps repeat aspirants identify conceptual gaps, receive AI-driven feedback, and connect with verified mentors for improvement.  
The system automates answer evaluation, recommends study materials from NCERT/PYQs, and facilitates mentorship — combining AI precision with human insight.

---

## 🎯 Business Objectives
- Help repeat aspirants close their conceptual gaps faster through adaptive evaluation and mentorship.  
- Reduce reliance on generic coaching via automated, syllabus-aware assessments.  
- Build mentor engagement and structured peer learning loops within the aspirant community.  

---

## 📊 KPI

| GOAL | METRIC | QUESTION |
|------|---------|----------|
| AI Assessment Completion | % users completing MCQ + Subjective test | Are aspirants engaging with diagnostic assessments? |
| Mentor Booking Rate | % users booking a mentor session after feedback | Is feedback actionable and leading to mentorship? |
| Feedback Satisfaction | Avg. user rating of AI evaluation accuracy | Do users trust the AI’s insights? |



## 🚶‍♀️ User Journeys
**Primary user:** Repeat UPSC aspirant (attempted exam once).  
**Goal:** Identify weak areas, receive precise feedback, and book mentorship.

**Journey:**
1. Login → take AI-generated assessment (MCQ + subjective) based on topic/subject selected.  
2. Upload image or type response → AI evaluates.  
3. Get structured feedback and gap analysis.  
4. Book mentor session → receive personalized guidance.  
5. Retake same test after 4 weeks → track improvement.  

---

## 📖 Scenarios
- Candidate uploads handwritten answer → OCR → evaluated by Groq LLM.  
- Incorrect answers trigger ConceptCard + PYQ recommendations.  
- Mentor views AI summary before session.  
- User progress visualized after retest.  

---

## 🕹️ User Flow
**Happy Path**
1. Login → Assessment → Feedback → Mentor Booking → Session → Progress Tracking.  

**Alternate Paths**
- Skip mentorship → only see study recommendations.  
- Mentor unavailable → added to waitlist notification queue.  

---

## 🧰 Functional Requirements

| SECTION | SUB-SECTION | USER STORY & EXPECTED BEHAVIORS | SCREENS |
|----------|-------------|----------------------------------|----------|
| Assessment | MCQ & Subjective | User attempts questions; MCQ auto-evaluated, subjective via OCR + AI. | Assessment UI |
| Feedback | AI Summary | Shows scores, gaps, recommended NCERT/PYQ materials. | Feedback Dashboard |
| Mentor Matching | Catalogue | Display mentor profiles (bio, subject, rating). | Mentor Catalogue |
| Booking | Calendar | User books slot → mentor notified via email. | Booking Flow |
| Progress | Tracking | Compare new score with previous → visualize improvement. | Progress Page |

---

## 📐 Model Requirements

| SPECIFICATION | REQUIREMENT | RATIONALE |
|----------------|-------------|------------|
| Primary LLM | Groq | Low latency, on-device processing for hackathon deployment |
| Fallback LLM | OpenAI GPT-4 | High reliability and reasoning depth |
| Context Window | ≥8K tokens | Include full answer, rubric, and context |
| Modalities | Text + Image (OCR) | Handle handwritten responses |
| Fine Tuning | Not required V1 | RAG on NCERT/PYQ corpus sufficient |
| Latency Targets | P50 < 8s, P95 < 15s | Ensure good evaluation UX |
| Hallucination Tolerance | <5% | Maintain factual accuracy in feedback |

---

## 🧮 Data Requirements
- **Sources:** Digitized NCERTs, PYQs, and standard books.  
- **Vector Store:** Pre-indexed for Groq RAG lookups.  
- **Input:** Candidate answers, images (OCR), metadata.  
- **Retention:** 12 months; anonymized afterward.  
- **Storage:** PostgreSQL for structured data; Cloud Object Store for uploads.  
- **Privacy:** No PII in AI prompts; anonymized IDs.  

---

## 💬 Prompt Requirements
- Include explicit rubric: *“Evaluate structure, accuracy, relevance, and factual correctness.”*  
- Provide citations via RAG.  
- Return structured JSON:  
  ```json
  {"score": float, "feedback": "text", "recommendations": ["source1", "source2"]}
