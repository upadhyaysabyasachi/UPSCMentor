import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  email: string
  full_name: string
  role: 'aspirant' | 'mentor'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => {
        console.log('Setting user:', user)
        set({ user, isAuthenticated: !!user })
      },
      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false })
      },
      initialize: () => {
        // Check if token exists and user is set
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null
        
        if (token && storedUser) {
          try {
            const parsed = JSON.parse(storedUser)
            if (parsed.state?.user) {
              set({ user: parsed.state.user, isAuthenticated: true })
            }
          } catch (e) {
            console.error('Failed to parse stored user:', e)
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

