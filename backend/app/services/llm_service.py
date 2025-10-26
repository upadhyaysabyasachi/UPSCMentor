"""
LLM Service with Groq primary and OpenAI fallback
"""
import json
import time
import logging
from typing import Dict, List, Optional
from groq import Groq
from openai import OpenAI

from config import settings

logger = logging.getLogger(__name__)


class LLMService:
    """Service for LLM interactions with fallback support"""
    
    def __init__(self):
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.groq_model = "llama-3.1-70b-versatile"
        self.openai_model = settings.OPENAI_MODEL
        
    async def evaluate_answer(
        self,
        question: str,
        user_answer: str,
        rubric: str,
        context: str,
        max_marks: int = 10
    ) -> Dict:
        """
        Evaluate a subjective answer using LLM
        
        Args:
            question: The question text
            user_answer: Student's answer
            rubric: Evaluation rubric
            context: Relevant context from NCERT/RAG
            max_marks: Maximum marks for the question
            
        Returns:
            Evaluation results as dictionary
        """
        prompt = self._create_evaluation_prompt(
            question=question,
            user_answer=user_answer,
            rubric=rubric,
            context=context,
            max_marks=max_marks
        )
        
        # Try Groq first, fallback to OpenAI
        try:
            start_time = time.time()
            result = await self._call_groq(prompt)
            evaluation_time = int((time.time() - start_time) * 1000)
            model_used = f"Groq ({self.groq_model})"
            
        except Exception as e:
            logger.warning(f"Groq failed: {e}. Falling back to OpenAI...")
            try:
                start_time = time.time()
                result = await self._call_openai(prompt)
                evaluation_time = int((time.time() - start_time) * 1000)
                model_used = f"OpenAI ({self.openai_model})"
            except Exception as e2:
                logger.error(f"Both LLMs failed: {e2}")
                raise
        
        # Parse the JSON response
        try:
            evaluation = json.loads(result)
            evaluation["model_used"] = model_used
            evaluation["evaluation_time_ms"] = evaluation_time
            return evaluation
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response: {e}")
            logger.error(f"Response was: {result}")
            raise ValueError("LLM returned invalid JSON")
    
    async def analyze_gaps(
        self,
        assessment_data: Dict,
        subject: str,
        topic: str
    ) -> Dict:
        """
        Analyze overall performance and identify concept gaps
        
        Args:
            assessment_data: Dictionary with questions, answers, and scores
            subject: Subject name
            topic: Topic name
            
        Returns:
            Gap analysis with recommendations
        """
        prompt = self._create_gap_analysis_prompt(
            assessment_data=assessment_data,
            subject=subject,
            topic=topic
        )
        
        try:
            result = await self._call_groq(prompt)
        except Exception as e:
            logger.warning(f"Groq failed for gap analysis: {e}")
            result = await self._call_openai(prompt)
        
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            logger.error("Failed to parse gap analysis response")
            raise
    
    async def _call_groq(self, prompt: str) -> str:
        """Call Groq API"""
        try:
            response = self.groq_client.chat.completions.create(
                model=self.groq_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert UPSC examiner. Provide detailed, accurate, and constructive feedback. Always respond with valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=2000,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            raise
    
    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API"""
        try:
            response = self.openai_client.chat.completions.create(
                model=self.openai_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert UPSC examiner. Provide detailed, accurate, and constructive feedback. Always respond with valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise
    
    def _create_evaluation_prompt(
        self,
        question: str,
        user_answer: str,
        rubric: str,
        context: str,
        max_marks: int
    ) -> str:
        """Create evaluation prompt"""
        return f"""You are an expert UPSC examiner. Evaluate the following answer.

Question: {question}

Evaluation Rubric:
{rubric}

Student Answer:
{user_answer}

Relevant Context from NCERT/Study Material:
{context}

Evaluate the answer based on:
1. Structure and organization
2. Factual accuracy (compare with context)
3. Relevance to the question
4. Depth of understanding
5. Use of examples and evidence

Provide response in JSON format:
{{
  "score": <float between 0 and {max_marks}>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "concept_gaps": [
    {{
      "concept": "concept name",
      "severity": "high|medium|low",
      "description": "brief description"
    }}
  ],
  "feedback": "detailed constructive feedback in 3-4 sentences",
  "skill_scores": {{
    "factual_recall": <0-100>,
    "analysis": <0-100>,
    "critical_thinking": <0-100>,
    "structure": <0-100>,
    "relevance": <0-100>
  }}
}}"""
    
    def _create_gap_analysis_prompt(
        self,
        assessment_data: Dict,
        subject: str,
        topic: str
    ) -> str:
        """Create gap analysis prompt"""
        performance_summary = json.dumps(assessment_data, indent=2)
        
        return f"""Analyze the student's overall performance in {subject} - {topic}.

Performance Data:
{performance_summary}

Identify:
1. Top 3-5 primary conceptual gaps
2. Specific NCERT chapter references to address gaps
3. Relevant PYQ (Previous Year Questions) topics for practice

Provide response in JSON format:
{{
  "primary_gaps": [
    {{
      "concept": "concept name",
      "severity": "high|medium|low",
      "description": "what the student is missing"
    }}
  ],
  "ncert_recommendations": [
    {{
      "title": "NCERT Book Title",
      "chapter": "Chapter name",
      "pages": "page range",
      "priority": "high|medium|low",
      "reason": "why this is recommended"
    }}
  ],
  "pyq_recommendations": [
    {{
      "year": 2022,
      "question_number": "Q5",
      "topic": "topic name",
      "marks": 10,
      "relevance": "why practice this"
    }}
  ],
  "overall_assessment": "2-3 sentence summary of performance"
}}"""


# Global LLM service instance
llm_service = LLMService()

