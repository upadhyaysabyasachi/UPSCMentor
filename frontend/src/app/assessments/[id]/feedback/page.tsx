'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { evaluationApi, recommendationApi } from '@/lib/api'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  Users,
  ArrowRight,
  Download,
  Share2,
  Loader2,
  Target,
  Award,
  FileText
} from 'lucide-react'
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { getScoreColor, getScoreBgColor } from '@/lib/utils'

export default function FeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback', assessmentId],
    queryFn: () => evaluationApi.getFeedback(assessmentId),
  })

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', assessmentId],
    queryFn: () => recommendationApi.getRecommendations(assessmentId),
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
          <p className="text-gray-600">Analyzing your answers...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Mock data for demonstration
  const evaluationData = {
    score: 78,
    total_questions: 15,
    correct_answers: 12,
    time_taken: '28:45',
    subject: 'History',
    topic: 'Ancient India',
    strengths: [
      'Strong understanding of Gupta Empire timeline',
      'Excellent grasp of architectural developments',
      'Clear and structured presentation',
    ],
    weaknesses: [
      'Limited analysis of socio-economic factors',
      'Insufficient detail on trade routes',
      'Need more concrete examples',
    ],
    concept_gaps: [
      {
        concept: 'Gupta Administration',
        severity: 'high',
        description: 'Limited understanding of provincial governance structures'
      },
      {
        concept: 'Maritime Trade',
        severity: 'medium',
        description: 'Incomplete knowledge of trade routes and commodities'
      },
      {
        concept: 'Art and Culture',
        severity: 'low',
        description: 'Minor gaps in temple architecture evolution'
      },
    ],
  }

  const skillRadarData = [
    { skill: 'Factual Recall', value: 85 },
    { skill: 'Analysis', value: 68 },
    { skill: 'Critical Thinking', value: 72 },
    { skill: 'Structure', value: 88 },
    { skill: 'Relevance', value: 76 },
  ]

  const questionBreakdown = [
    { type: 'Correct', count: 12, fill: '#10b981' },
    { type: 'Partial', count: 2, fill: '#f59e0b' },
    { type: 'Incorrect', count: 1, fill: '#ef4444' },
  ]

  const ncertRecommendations = [
    {
      title: 'NCERT Class XI - Ancient India',
      chapter: 'Chapter 4: The Central Islamic Lands',
      pages: 'Pages 82-95',
      priority: 'high',
    },
    {
      title: 'NCERT Class XII - Themes in Indian History',
      chapter: 'Chapter 2: Kings, Farmers and Towns',
      pages: 'Pages 25-42',
      priority: 'medium',
    },
  ]

  const pyqRecommendations = [
    { year: 2022, question: 'Q5', topic: 'Gupta Administration', marks: 10 },
    { year: 2021, question: 'Q12', topic: 'Trade Routes', marks: 15 },
    { year: 2020, question: 'Q8', topic: 'Art and Culture', marks: 10 },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessment Feedback</h1>
            <p className="text-gray-600 mt-1">
              {evaluationData.subject} - {evaluationData.topic}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <Download size={18} />
              Export PDF
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>

        {/* Score Card */}
        <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 mb-2">Your Score</p>
              <div className="flex items-end gap-4">
                <h2 className="text-6xl font-bold">{evaluationData.score}%</h2>
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    {evaluationData.score >= 75 ? (
                      <>
                        <TrendingUp size={20} />
                        <span className="font-medium">Excellent Performance!</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown size={20} />
                        <span className="font-medium">Room for Improvement</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-6 mt-4 text-primary-100">
                <div>
                  <span className="text-sm">Questions</span>
                  <p className="text-white font-semibold">{evaluationData.correct_answers}/{evaluationData.total_questions}</p>
                </div>
                <div>
                  <span className="text-sm">Time Taken</span>
                  <p className="text-white font-semibold">{evaluationData.time_taken}</p>
                </div>
              </div>
            </div>
            <div className="text-8xl opacity-20">
              🎯
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Strengths</p>
                <p className="text-2xl font-bold text-gray-900">{evaluationData.strengths.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Areas to Improve</p>
                <p className="text-2xl font-bold text-gray-900">{evaluationData.weaknesses.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Target className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Concept Gaps</p>
                <p className="text-2xl font-bold text-gray-900">{evaluationData.concept_gaps.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills Radar */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Skill Assessment</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Your Score" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Question Breakdown */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Question Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={questionBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Award className="text-green-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Your Strengths</h3>
            </div>
            <div className="space-y-3">
              {evaluationData.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-gray-900">{strength}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-orange-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Areas to Improve</h3>
            </div>
            <div className="space-y-3">
              {evaluationData.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-gray-900">{weakness}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Concept Gaps */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Concept Gaps to Address</h3>
          <div className="space-y-4">
            {evaluationData.concept_gaps.map((gap, index) => (
              <div key={index} className="p-4 border-l-4 rounded-lg bg-gray-50" style={{
                borderColor: gap.severity === 'high' ? '#ef4444' : gap.severity === 'medium' ? '#f59e0b' : '#10b981'
              }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{gap.concept}</h4>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${gap.severity === 'high' ? 'bg-red-100 text-red-700' :
                          gap.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'}
                      `}>
                        {gap.severity} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{gap.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* NCERT Recommendations */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="text-primary-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">NCERT Recommendations</h3>
            </div>
            <div className="space-y-3">
              {ncertRecommendations.map((rec, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.chapter}</p>
                      <p className="text-sm text-primary-600 mt-1">{rec.pages}</p>
                    </div>
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium flex-shrink-0
                      ${rec.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                    `}>
                      {rec.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PYQ Recommendations */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-purple-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Practice with PYQs</h3>
            </div>
            <div className="space-y-3">
              {pyqRecommendations.map((pyq, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary-600">{pyq.year}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-semibold text-gray-900">{pyq.question}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{pyq.topic}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{pyq.marks} marks</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/mentors" className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Users className="text-purple-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Book a Mentor</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Get personalized guidance on your weak areas
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/assessments/new" className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Take Another Test</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Practice more to improve your score
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
          <Link href="/mentors" className="btn-primary flex items-center gap-2">
            Book Mentor Session
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

