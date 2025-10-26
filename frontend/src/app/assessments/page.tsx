'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { assessmentApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useState } from 'react'

export default function AssessmentsPage() {
  const user = useAuthStore((state) => state.user)
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch assessments
  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => assessmentApi.list(),
  })

  const assessments = assessmentsData?.data || []

  // Filter assessments
  const filteredAssessments = assessments.filter((assessment: any) => {
    const matchesFilter = filter === 'all' || assessment.status === filter
    const matchesSearch = 
      assessment.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.topic?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Group by status
  const stats = {
    total: assessments.length,
    completed: assessments.filter((a: any) => a.status === 'completed').length,
    in_progress: assessments.filter((a: any) => a.status === 'in_progress').length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={14} />
            Completed
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock size={14} />
            In Progress
          </span>
        )
      case 'abandoned':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle size={14} />
            Abandoned
          </span>
        )
      default:
        return null
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'hard':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
            <p className="text-gray-600 mt-2">
              Track your test history and performance
            </p>
          </div>
          <Link href="/assessments/new" className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            New Assessment
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.in_progress}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by subject or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'completed'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'in_progress'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                In Progress
              </button>
            </div>
          </div>
        </div>

        {/* Assessments List */}
        {isLoading ? (
          <div className="card">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading assessments...</p>
            </div>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mt-4">
                {assessments.length === 0 ? 'No assessments yet' : 'No matching assessments'}
              </h3>
              <p className="text-gray-600 mt-2">
                {assessments.length === 0 
                  ? 'Start your first assessment to track your progress'
                  : 'Try adjusting your search or filter'
                }
              </p>
              {assessments.length === 0 && (
                <Link href="/assessments/new" className="btn-primary mt-6 inline-flex items-center gap-2">
                  <Plus size={20} />
                  Create Assessment
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssessments.map((assessment: any) => (
              <div key={assessment.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assessment.subject}
                      </h3>
                      {getStatusBadge(assessment.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(assessment.difficulty_level)}`}>
                        {assessment.difficulty_level}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{assessment.topic}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        {formatDate(assessment.created_at)}
                      </div>
                      {assessment.completed_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle size={16} />
                          Completed {formatDate(assessment.completed_at)}
                        </div>
                      )}
                      {assessment.total_score !== null && (
                        <div className="flex items-center gap-1">
                          <TrendingUp size={16} />
                          Score: {assessment.total_score}%
                        </div>
                      )}
                      {assessment.time_taken_seconds && (
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          {Math.floor(assessment.time_taken_seconds / 60)} mins
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {assessment.status === 'in_progress' && (
                      <Link 
                        href={`/assessments/${assessment.id}/take`}
                        className="btn-primary"
                      >
                        Continue
                      </Link>
                    )}
                    {assessment.status === 'completed' && (
                      <Link 
                        href={`/assessments/${assessment.id}/feedback`}
                        className="btn-secondary"
                      >
                        View Feedback
                      </Link>
                    )}
                    {assessment.status === 'abandoned' && (
                      <Link 
                        href={`/assessments/${assessment.id}/take`}
                        className="btn-secondary"
                      >
                        Retry
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

