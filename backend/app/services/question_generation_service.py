"""
Question Generation Service
Generates UPSC-style questions from NCERT PDFs using RAG + LLM
"""
import logging
from typing import List, Dict, Optional
import json
from groq import Groq
from openai import OpenAI

from config import settings
from app.services.rag_service import rag_service
from app.models import Question, QuestionType
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class QuestionGenerationService:
    """Service for generating questions from NCERT content using RAG + LLM"""
    
    def __init__(self):
        # Initialize LLM clients
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.primary_model = "llama-3.3-70b-versatile"  # Groq
        self.fallback_model = settings.OPENAI_MODEL
    
    async def generate_questions(
        self,
        db: Session,
        subject: str,
        topic: str,
        difficulty: str,
        num_mcq: int = 10,
        num_subjective: int = 5
    ) -> List[Question]:
        """
        Generate questions from NCERT PDFs using RAG
        
        Args:
            db: Database session
            subject: Subject (e.g., "history", "geography")
            topic: Topic (e.g., "Medieval India", "Climate")
            difficulty: "easy", "medium", or "hard"
            num_mcq: Number of MCQ questions
            num_subjective: Number of subjective questions
            
        Returns:
            List of generated Question objects
        """
        try:
            # Check if questions already exist in DB for this topic
            existing_questions = db.query(Question).filter(
                Question.subject == subject,
                Question.topic == topic,
                Question.difficulty == difficulty
            ).all()
            
            if len(existing_questions) >= (num_mcq + num_subjective):
                logger.info(f"Using {len(existing_questions)} existing questions for {subject}/{topic}")
                return existing_questions[:num_mcq + num_subjective]
            
            # Generate new questions using RAG
            logger.info(f"Generating questions for {subject}/{topic} ({difficulty})")
            
            # Step 1: Get relevant content from NCERT PDFs using RAG
            context = await self._get_relevant_content(subject, topic)
            
            if not context or len(context.strip()) < 100:
                logger.warning(f"Insufficient context from RAG, using fallback")
                context = f"Generate UPSC preparation questions on {topic} in {subject}."
            
            # Step 2: Generate MCQ questions
            mcq_questions = await self._generate_mcq_questions(
                context=context,
                subject=subject,
                topic=topic,
                difficulty=difficulty,
                num_questions=num_mcq
            )
            
            # Step 3: Generate subjective questions
            subjective_questions = await self._generate_subjective_questions(
                context=context,
                subject=subject,
                topic=topic,
                difficulty=difficulty,
                num_questions=num_subjective
            )
            
            # Step 4: Save to database
            all_questions = []
            
            for q_data in mcq_questions:
                question = Question(
                    type="mcq",
                    subject=subject,
                    topic=topic,
                    difficulty=difficulty,
                    question_text=q_data["question"],
                    options=q_data["options"],
                    correct_answer=q_data["correct_answer"],
                    max_marks=1,
                    source_reference=q_data.get("source", "NCERT")
                )
                db.add(question)
                all_questions.append(question)
            
            for q_data in subjective_questions:
                question = Question(
                    type="subjective",
                    subject=subject,
                    topic=topic,
                    difficulty=difficulty,
                    question_text=q_data["question"],
                    rubric=q_data["rubric"],
                    max_marks=q_data["marks"],
                    source_reference=q_data.get("source", "NCERT")
                )
                db.add(question)
                all_questions.append(question)
            
            db.flush()  # Get IDs without committing
            logger.info(f"✅ Generated {len(all_questions)} questions for {subject}/{topic}")
            
            return all_questions
            
        except Exception as e:
            logger.error(f"Error generating questions: {e}")
            # Fallback to sample questions
            return self._create_fallback_questions(db, subject, topic, difficulty)
    
    async def _get_relevant_content(self, subject: str, topic: str) -> str:
        """Get relevant content from NCERT PDFs using RAG"""
        try:
            # Initialize RAG if not already done
            if not rag_service.query_engine:
                await rag_service.initialize()
            
            # Query for relevant content
            result = await rag_service.query(
                query=f"Provide comprehensive content about {topic} suitable for UPSC exam preparation. Include key concepts, facts, and important details.",
                subject=subject,
                topic=topic,
                top_k=5
            )
            
            # Combine response and sources
            context_parts = [result["response"]]
            for source in result["sources"]:
                context_parts.append(source["text"])
            
            context = "\n\n".join(context_parts)
            logger.info(f"Retrieved {len(context)} characters of context from RAG")
            
            return context[:8000]  # Limit context size for LLM
            
        except Exception as e:
            logger.error(f"Error getting RAG content: {e}")
            return ""
    
    async def _generate_mcq_questions(
        self,
        context: str,
        subject: str,
        topic: str,
        difficulty: str,
        num_questions: int
    ) -> List[Dict]:
        """Generate MCQ questions using LLM"""
        
        prompt = f"""You are an expert UPSC exam question paper setter. Generate {num_questions} multiple-choice questions (MCQs) based on the following NCERT content.

Subject: {subject}
Topic: {topic}
Difficulty: {difficulty}
Number of questions: {num_questions}

NCERT Content:
{context}

Requirements:
1. Questions should be UPSC-style (factual, analytical, application-based)
2. Each question should have 4 options (A, B, C, D)
3. Only one correct answer
4. Difficulty level: {difficulty}
   - Easy: Direct recall, basic concepts
   - Medium: Understanding, application of concepts
   - Hard: Analysis, evaluation, synthesis
5. Questions should be based strictly on the provided NCERT content

Return ONLY a valid JSON array with this exact format:
[
  {{
    "question": "Question text here?",
    "options": {{"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"}},
    "correct_answer": "A",
    "source": "Brief reference to NCERT content"
  }}
]

JSON array:"""
        
        try:
            # Try Groq first
            response = self.groq_client.chat.completions.create(
                model=self.primary_model,
                messages=[
                    {"role": "system", "content": "You are a UPSC exam question generator. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            )
            
            content = response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.warning(f"Groq failed, using OpenAI fallback: {e}")
            # Fallback to OpenAI
            response = self.openai_client.chat.completions.create(
                model=self.fallback_model,
                messages=[
                    {"role": "system", "content": "You are a UPSC exam question generator. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            )
            content = response.choices[0].message.content.strip()
        
        # Parse JSON
        try:
            # Remove markdown code blocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            questions = json.loads(content)
            
            # Validate format
            if not isinstance(questions, list):
                raise ValueError("Response is not a list")
            
            return questions
            
        except Exception as e:
            logger.error(f"Error parsing MCQ JSON: {e}")
            logger.error(f"Content: {content[:500]}")
            return []
    
    async def _generate_subjective_questions(
        self,
        context: str,
        subject: str,
        topic: str,
        difficulty: str,
        num_questions: int
    ) -> List[Dict]:
        """Generate subjective questions using LLM"""
        
        prompt = f"""You are an expert UPSC exam question paper setter. Generate {num_questions} subjective (descriptive/essay-type) questions based on the following NCERT content.

Subject: {subject}
Topic: {topic}
Difficulty: {difficulty}
Number of questions: {num_questions}

NCERT Content:
{context}

Requirements:
1. Questions should be UPSC Mains-style (analytical, evaluative, comprehensive)
2. Each question should require detailed written answers
3. Include marks allocation (5, 10, or 15 marks based on depth required)
4. Include evaluation rubric for each question
5. Difficulty level: {difficulty}
   - Easy: Explain, describe (5-10 marks)
   - Medium: Analyze, compare (10-15 marks)
   - Hard: Critically evaluate, synthesize (15+ marks)
6. Questions should be based strictly on the provided NCERT content

Return ONLY a valid JSON array with this exact format:
[
  {{
    "question": "Question text here",
    "marks": 10,
    "rubric": "Evaluation criteria: structure, accuracy, depth, examples",
    "source": "Brief reference to NCERT content"
  }}
]

JSON array:"""
        
        try:
            # Try Groq first
            response = self.groq_client.chat.completions.create(
                model=self.primary_model,
                messages=[
                    {"role": "system", "content": "You are a UPSC exam question generator. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=3000
            )
            
            content = response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.warning(f"Groq failed, using OpenAI fallback: {e}")
            # Fallback to OpenAI
            response = self.openai_client.chat.completions.create(
                model=self.fallback_model,
                messages=[
                    {"role": "system", "content": "You are a UPSC exam question generator. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=3000
            )
            content = response.choices[0].message.content.strip()
        
        # Parse JSON
        try:
            # Remove markdown code blocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            questions = json.loads(content)
            
            # Validate format
            if not isinstance(questions, list):
                raise ValueError("Response is not a list")
            
            return questions
            
        except Exception as e:
            logger.error(f"Error parsing subjective JSON: {e}")
            logger.error(f"Content: {content[:500]}")
            return []
    
    def _create_fallback_questions(
        self,
        db: Session,
        subject: str,
        topic: str,
        difficulty: str
    ) -> List[Question]:
        """Create basic fallback questions if generation fails"""
        logger.warning("Using fallback questions due to generation failure")
        
        questions = [
            Question(
                type="mcq",
                subject=subject,
                topic=topic,
                difficulty=difficulty,
                question_text=f"Which of the following is a key characteristic of {topic}?",
                options={"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"},
                correct_answer="B",
                max_marks=1,
                source_reference="Generated"
            ),
            Question(
                type="subjective",
                subject=subject,
                topic=topic,
                difficulty=difficulty,
                question_text=f"Discuss the significance of {topic} in {subject}. (10 marks)",
                rubric="Evaluate structure, factual accuracy, depth of analysis, and use of relevant examples.",
                max_marks=10,
                source_reference="Generated"
            ),
        ]
        
        for q in questions:
            db.add(q)
        
        db.flush()
        return questions


# Global instance
question_generator = QuestionGenerationService()

