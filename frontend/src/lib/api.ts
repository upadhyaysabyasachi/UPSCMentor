import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('Added auth token to request:', config.url)
      } else {
        console.warn('No access token found for request:', config.url)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          })
          localStorage.setItem('access_token', response.data.access_token)
          // Retry original request
          error.config.headers.Authorization = `Bearer ${response.data.access_token}`
          return axios(error.config)
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: { email: string; password: string; full_name: string; role: string }) =>
    api.post('/auth/register', data),
  
  refresh: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),
  
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
}

// Assessment API
export const assessmentApi = {
  list: () => api.get('/assessments'),
  
  create: (data: { subject: string; topic: string; difficulty_level: string }) =>
    api.post('/assessments', data),
  
  getById: (id: string) => api.get(`/assessments/${id}`),
  
  submit: (id: string, responses: any[]) =>
    api.post(`/assessments/${id}/submit`, { responses }),
}

// Evaluation API
export const evaluationApi = {
  evaluateMCQ: (data: { question_id: string; answer: string }) =>
    api.post('/evaluate/mcq', data),
  
  evaluateSubjective: (data: { question_id: string; answer: string; image_url?: string }) =>
    api.post('/evaluate/subjective', data),
  
  extractOCR: (formData: FormData) =>
    api.post('/ocr/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  getFeedback: (assessment_id: string) =>
    api.get(`/evaluations/${assessment_id}`),
}

// Recommendation API
export const recommendationApi = {
  getRecommendations: (assessment_id: string) =>
    api.get(`/recommendations/${assessment_id}`),
  
  getConceptCard: (topic: string) =>
    api.get(`/concept-cards/${topic}`),
}

// Mentor API
export const mentorApi = {
  list: (params?: { subject?: string; min_rating?: number }) =>
    api.get('/mentors', { params }),
  
  getById: (id: string) => api.get(`/mentors/${id}`),
  
  getAvailability: (id: string) => api.get(`/mentors/${id}/availability`),
}

// Booking API
export const bookingApi = {
  create: (data: {
    mentor_id: string
    assessment_id: string
    scheduled_at: string
    duration_minutes: number
  }) => api.post('/bookings', data),
  
  getById: (id: string) => api.get(`/bookings/${id}`),
  
  update: (id: string, data: any) => api.patch(`/bookings/${id}`, data),
  
  cancel: (id: string) => api.delete(`/bookings/${id}`),
  
  listUserBookings: () => api.get('/bookings/me'),
}

// Progress API
export const progressApi = {
  getUserProgress: (user_id: string) => api.get(`/progress/user/${user_id}`),
  
  getComparison: (params: { subject: string; topic: string }) =>
    api.get('/progress/comparison', { params }),
}

