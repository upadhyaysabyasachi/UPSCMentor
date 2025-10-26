'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { assessmentApi, evaluationApi } from '@/lib/api'
import { useAssessmentStore } from '@/stores/assessmentStore'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useDropzone } from 'react-dropzone'
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Upload,
  Image as ImageIcon,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react'

export default function TakeAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string
  
  const {
    currentAssessment,
    currentQuestionIndex,
    responses,
    setAssessment,
    addResponse,
    nextQuestion,
    previousQuestion,
  } = useAssessmentStore()

  const [textAnswer, setTextAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch assessment data
  const { data: assessmentData, isLoading } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => assessmentApi.getById(assessmentId),
    onSuccess: (data) => {
      setAssessment(data.data)
    },
  })

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
  })

  if (isLoading || !currentAssessment) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin text-primary-600" size={48} />
        </div>
      </DashboardLayout>
    )
  }

  const currentQuestion = currentAssessment.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === currentAssessment.questions.length - 1
  const currentResponse = responses.find(r => r.question_id === currentQuestion.id)

  const handleSaveAndNext = () => {
    if (currentQuestion.type === 'mcq') {
      addResponse({
        question_id: currentQuestion.id,
        user_answer: selectedOption,
      })
    } else {
      addResponse({
        question_id: currentQuestion.id,
        user_answer: textAnswer,
        image_url: imagePreview,
      })
    }

    if (!isLastQuestion) {
      nextQuestion()
      setTextAnswer('')
      setSelectedOption('')
      setUploadedImage(null)
      setImagePreview('')
    }
  }

  const handleSubmitAssessment = async () => {
    // Save current answer first
    handleSaveAndNext()
    
    setIsSubmitting(true)
    try {
      await assessmentApi.submit(assessmentId, responses)
      router.push(`/assessments/${assessmentId}/feedback`)
    } catch (error) {
      console.error('Failed to submit assessment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header with Progress */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentAssessment.subject} - {currentAssessment.topic}
              </h1>
              <p className="text-gray-600 mt-1">
                Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={20} />
              <span className="font-mono font-semibold">25:30</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card mb-6">
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                {currentQuestionIndex + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${currentQuestion.type === 'mcq' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}
                  `}>
                    {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'Subjective'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {currentQuestion.type === 'mcq' ? '1 mark' : '10 marks'}
                  </span>
                </div>
                <p className="text-lg text-gray-900 leading-relaxed">
                  {currentQuestion.question_text}
                </p>
              </div>
            </div>
          </div>

          {/* MCQ Options */}
          {currentQuestion.type === 'mcq' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`
                    block p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${selectedOption === option
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="mcq-option"
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="w-5 h-5 text-primary-600"
                    />
                    <span className="text-gray-900">{option}</span>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Subjective Answer */}
          {currentQuestion.type === 'subjective' && (
            <div className="space-y-6">
              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type your answer
                </label>
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  rows={8}
                  className="input-field resize-none"
                  placeholder="Write your detailed answer here..."
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-sm text-gray-600">OR</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload handwritten answer
                </label>
                
                {!imagePreview ? (
                  <div
                    {...getRootProps()}
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                      ${isDragActive ? 'border-primary-600 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
                    `}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-900 font-medium mb-1">
                      {isDragActive ? 'Drop the image here' : 'Drag & drop your answer image'}
                    </p>
                    <p className="text-sm text-gray-600">
                      or click to browse (PNG, JPG up to 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Uploaded answer"
                      className="w-full rounded-lg border border-gray-300"
                    />
                    <button
                      onClick={() => {
                        setUploadedImage(null)
                        setImagePreview('')
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {imagePreview && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-blue-800">
                    Your handwritten answer will be processed using OCR technology and evaluated by our AI system.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="flex gap-2">
            {currentAssessment.questions.map((_, index) => (
              <div
                key={index}
                className={`
                  w-3 h-3 rounded-full
                  ${index === currentQuestionIndex ? 'bg-primary-600' : 
                    responses.find(r => r.question_id === currentAssessment.questions[index].id)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }
                `}
              />
            ))}
          </div>

          {!isLastQuestion ? (
            <button
              onClick={handleSaveAndNext}
              className="btn-primary flex items-center gap-2"
            >
              Save & Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmitAssessment}
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Assessment
                  <Check size={20} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

