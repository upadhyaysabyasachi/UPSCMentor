'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useRouter } from 'next/navigation'
import { assessmentApi } from '@/lib/api'
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react'

const SUBJECTS = [
  { id: 'history', name: 'History', icon: '📚', topics: ['Ancient India', 'Medieval India', 'Modern India', 'World History'] },
  { id: 'geography', name: 'Geography', icon: '🌍', topics: ['Physical Geography', 'Human Geography', 'Indian Geography', 'World Geography'] },
  { id: 'economics', name: 'Economics', icon: '💰', topics: ['Microeconomics', 'Macroeconomics', 'Indian Economy', 'Development Economics'] },
  { id: 'polity', name: 'Polity', icon: '⚖️', topics: ['Constitution', 'Governance', 'Political Theory', 'International Relations'] },
  { id: 'environment', name: 'Environment', icon: '🌱', topics: ['Ecology', 'Climate Change', 'Biodiversity', 'Environmental Laws'] },
]

const DIFFICULTY_LEVELS = [
  { id: 'easy', name: 'Easy', description: 'Basic concepts and fundamentals' },
  { id: 'medium', name: 'Medium', description: 'Intermediate level questions' },
  { id: 'hard', name: 'Hard', description: 'Advanced analysis and application' },
]

export default function NewAssessmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    difficulty: 'medium',
  })

  const selectedSubject = SUBJECTS.find(s => s.id === formData.subject)

  const handleStartAssessment = async () => {
    setIsLoading(true)
    try {
      const response = await assessmentApi.create({
        subject: formData.subject,
        topic: formData.topic,
        difficulty_level: formData.difficulty,
      })
      
      router.push(`/assessments/${response.data.id}/take`)
    } catch (error) {
      console.error('Failed to create assessment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s, index) => (
              <div key={s} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {s}
                </div>
                {index < 2 && (
                  <div className={`w-24 h-1 mx-2 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm">
            <span className={step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-600'}>
              Select Subject
            </span>
            <span className={step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-600'}>
              Choose Topic
            </span>
            <span className={step >= 3 ? 'text-primary-600 font-medium' : 'text-gray-600'}>
              Set Difficulty
            </span>
          </div>
        </div>

        {/* Step 1: Select Subject */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Choose Your Subject</h1>
              <p className="text-gray-600 mt-2">Select a subject to begin your assessment</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => {
                    setFormData({ ...formData, subject: subject.id, topic: '' })
                  }}
                  className={`
                    p-6 rounded-xl border-2 transition-all text-left
                    ${formData.subject === subject.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className="text-4xl mb-3">{subject.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900">{subject.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {subject.topics.length} topics available
                  </p>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.subject}
                className="btn-primary flex items-center gap-2"
              >
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Topic */}
        {step === 2 && selectedSubject && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Select a Topic in {selectedSubject.name}
              </h1>
              <p className="text-gray-600 mt-2">Pick the specific area you want to focus on</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSubject.topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setFormData({ ...formData, topic })}
                  className={`
                    p-6 rounded-xl border-2 transition-all text-left
                    ${formData.topic === topic
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{topic}</h3>
                      <p className="text-sm text-gray-600 mt-2">
                        15-20 questions • 30 mins
                      </p>
                    </div>
                    <BookOpen className="text-gray-400" size={24} />
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.topic}
                className="btn-primary flex items-center gap-2"
              >
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Set Difficulty */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Choose Difficulty Level</h1>
              <p className="text-gray-600 mt-2">Select the challenge level that matches your preparation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setFormData({ ...formData, difficulty: level.id })}
                  className={`
                    p-6 rounded-xl border-2 transition-all text-center
                    ${formData.difficulty === level.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <h3 className="text-xl font-bold text-gray-900">{level.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">{level.description}</p>
                </button>
              ))}
            </div>

            {/* Summary Card */}
            <div className="card bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-4">Assessment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium text-gray-900">
                    {selectedSubject?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Topic:</span>
                  <span className="font-medium text-gray-900">{formData.topic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {formData.difficulty}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Estimated Time:</span>
                  <span className="font-medium text-gray-900">30 minutes</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary">
                Back
              </button>
              <button
                onClick={handleStartAssessment}
                disabled={isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Assessment
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

