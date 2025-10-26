'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { progressApi, assessmentApi, bookingApi } from '@/lib/api'
import { 
  FileText, 
  Target, 
  Users, 
  TrendingUp,
  Calendar,
  BookOpen,
  Award,
  ArrowRight,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  // Fetch dashboard data
  const { data: progressData } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: () => progressApi.getUserProgress(user?.id || ''),
    enabled: !!user?.id,
  })

  const { data: assessmentsData } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => assessmentApi.list(),
  })

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingApi.listUserBookings(),
  })

  // Mock data for demonstration
  const stats = [
    {
      name: 'Questions Attempted',
      value: assessmentsData?.data?.total_questions || 0,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      name: 'Average Score',
      value: `${progressData?.data?.average_score || 0}%`,
      icon: Target,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      name: 'Mentorship Sessions',
      value: bookingsData?.data?.completed_sessions || 0,
      icon: Users,
      color: 'bg-purple-500',
      change: '+2',
    },
    {
      name: 'Study Streak',
      value: `${progressData?.data?.study_streak || 0} days`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: 'Active',
    },
  ]

  const subjectPerformance = [
    { subject: 'History', score: 78, attempted: 45 },
    { subject: 'Geography', score: 82, attempted: 38 },
    { subject: 'Economics', score: 65, attempted: 32 },
    { subject: 'Polity', score: 71, attempted: 41 },
    { subject: 'Environment', score: 88, attempted: 28 },
  ]

  const recentActivity = [
    {
      type: 'assessment',
      title: 'History: Ancient India',
      score: 78,
      date: '2 hours ago',
    },
    {
      type: 'booking',
      title: 'Mentorship with Dr. Sharma',
      date: 'Tomorrow, 4:00 PM',
    },
    {
      type: 'assessment',
      title: 'Geography: Physical Features',
      score: 85,
      date: 'Yesterday',
    },
  ]

  const upcomingSessions = [
    {
      mentor: 'Dr. Rajesh Sharma',
      subject: 'History',
      date: '2025-10-27T16:00:00',
      duration: 60,
    },
    {
      mentor: 'Prof. Anita Verma',
      subject: 'Geography',
      date: '2025-10-29T14:00:00',
      duration: 45,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your preparation progress and upcoming activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-2">{stat.change}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject-wise Performance */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Subject-wise Performance</h2>
              <Link href="/progress" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View Details →
              </Link>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-5 gap-4 mt-6">
              {subjectPerformance.map((subject) => (
                <div key={subject.subject} className="text-center">
                  <p className="text-xs text-gray-600">{subject.subject}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {subject.attempted} Qs
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            
            <div className="space-y-3">
              <Link href="/assessments/new" className="block">
                <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center">
                      <FileText className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">New Assessment</p>
                      <p className="text-xs text-gray-600">Start a new test</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/mentors" className="block">
                <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center">
                      <Users className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Book Mentor</p>
                      <p className="text-xs text-gray-600">Get expert guidance</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/progress" className="block">
                <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 group-hover:bg-green-200 flex items-center justify-center">
                      <TrendingUp className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">View Progress</p>
                      <p className="text-xs text-gray-600">Track improvement</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
              <Link href="/bookings" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </Link>
            </div>

            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{session.mentor}</p>
                        <p className="text-sm text-gray-600 mt-1">{session.subject}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(session.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {session.duration} mins
                          </div>
                        </div>
                      </div>
                      <button className="btn-secondary text-sm px-4 py-2">
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto text-gray-400" size={48} />
                <p className="text-gray-600 mt-4">No upcoming sessions</p>
                <Link href="/mentors" className="btn-primary mt-4 inline-flex items-center gap-2">
                  Book a Session
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${activity.type === 'assessment' ? 'bg-blue-100' : 'bg-purple-100'}
                  `}>
                    {activity.type === 'assessment' ? (
                      <FileText className="text-blue-600" size={20} />
                    ) : (
                      <Users className="text-purple-600" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    {activity.score && (
                      <p className="text-sm text-green-600 mt-1">Score: {activity.score}%</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Continue Your Preparation</h3>
              <p className="text-gray-600 mt-1">
                You're making great progress! Let's keep the momentum going.
              </p>
            </div>
            <Link href="/assessments/new" className="btn-primary">
              Start New Test
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

