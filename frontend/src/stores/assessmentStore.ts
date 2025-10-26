import { create } from 'zustand'

interface Question {
  id: string
  type: 'mcq' | 'subjective'
  subject: string
  topic: string
  question_text: string
  options?: string[]
  correct_answer?: string
}

interface Response {
  question_id: string
  user_answer: string
  image_url?: string
}

interface AssessmentState {
  currentAssessment: {
    id: string
    subject: string
    topic: string
    questions: Question[]
  } | null
  responses: Response[]
  currentQuestionIndex: number
  
  setAssessment: (assessment: any) => void
  addResponse: (response: Response) => void
  nextQuestion: () => void
  previousQuestion: () => void
  resetAssessment: () => void
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  currentAssessment: null,
  responses: [],
  currentQuestionIndex: 0,
  
  setAssessment: (assessment) => set({ 
    currentAssessment: assessment,
    responses: [],
    currentQuestionIndex: 0
  }),
  
  addResponse: (response) => set((state) => ({
    responses: [...state.responses.filter(r => r.question_id !== response.question_id), response]
  })),
  
  nextQuestion: () => set((state) => ({
    currentQuestionIndex: Math.min(
      state.currentQuestionIndex + 1,
      (state.currentAssessment?.questions.length || 1) - 1
    )
  })),
  
  previousQuestion: () => set((state) => ({
    currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0)
  })),
  
  resetAssessment: () => set({
    currentAssessment: null,
    responses: [],
    currentQuestionIndex: 0
  }),
}))

