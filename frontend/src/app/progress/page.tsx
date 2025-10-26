'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { progressApi } from '@/lib/api'
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  Award,
  BookOpen,
  ChevronRight,
  Filter
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { formatDate } from '@/lib/utils'

export default function ProgressPage() {
  const user = useAuthStore((state) => state.user)
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('3m')

  // Mock progress data
  const overallProgress = {
    current_score: 78,
    previous_score: 65,
    improvement: 13,
    total_assessments: 24,
    study_streak: 15,
    total_study_hours: 156,
    rank_percentile: 85,
  }

  const scoreTimeline = [
    { date: 'Week 1', score: 65, average: 60 },
    { date: 'Week 2', score: 68, average: 62 },
    { date: 'Week 3', score: 70, average: 64 },
    { date: 'Week 4', score: 72, average: 66 },
    { date: 'Week 5', score: 74, average: 68 },
    { date: 'Week 6', score: 73, average: 69 },
    { date: 'Week 7', score: 76, average: 70 },
    { date: 'Week 8', score: 75, average: 71 },
    { date: 'Week 9', score: 77, average: 72 },
    { date: 'Week 10', score: 79, average: 73 },
    { date: 'Week 11', score: 78, average: 74 },
    { date: 'Week 12', score: 80, average: 75 },
  ]

  const subjectProgress = [
    { subject: 'History', current: 82, previous: 70, tests: 6, improvement: 12 },
    { subject: 'Geography', current: 78, previous: 72, tests: 5, improvement: 6 },
    { subject: 'Economics', current: 74, previous: 60, tests: 4, improvement: 14 },
    { subject: 'Polity', current: 76, previous: 68, tests: 5, improvement: 8 },
    { subject: 'Environment', current: 80, previous: 75, tests: 4, improvement: 5 },
  ]

  const skillRadarData = [
    { skill: 'Factual Knowledge', current: 85, previous: 70 },
    { skill: 'Analysis', current: 78, previous: 65 },
    { skill: 'Critical Thinking', current: 72, previous: 60 },
    { skill: 'Answer Structure', current: 88, previous: 80 },
    { skill: 'Time Management', current: 76, previous: 68 },
    { skill: 'Relevance', current: 82, previous: 72 },
  ]

  const weeklyActivity = [
    { day: 'Mon', hours: 4.5, tests: 2 },
    { day: 'Tue', hours: 3.2, tests: 1 },
    { day: 'Wed', hours: 5.1, tests: 3 },
    { day: 'Thu', hours: 4.8, tests: 2 },
    { day: 'Fri', hours: 3.5, tests: 1 },
    { day: 'Sat', hours: 6.2, tests: 4 },
    { day: 'Sun', hours: 5.8, tests: 3 },
  ]

  const recentTests = [
    {
      subject: 'History',
      topic: 'Ancient India',
      score: 82,
      date: '2025-10-25',
      improvement: '+8',
      rank: 'Top 15%',
    },
    {
      subject: 'Geography',
      topic: 'Physical Geography',
      score: 78,
      date: '2025-10-23',
      improvement: '+5',
      rank: 'Top 20%',
    },
    {
      subject: 'Economics',
      topic: 'Indian Economy',
      score: 74,
      date: '2025-10-21',
      improvement: '+12',
      rank: 'Top 25%',
    },
  ]

  const milestones = [
    { title: 'First 70+ Score', date: '2025-09-15', icon: '🎯' },
    { title: '10 Tests Completed', date: '2025-09-28', icon: '📝' },
    { title: 'History Master', date: '2025-10-05', icon: '📚' },
    { title: '2 Week Streak', date: '2025-10-12', icon: '🔥' },
    { title: 'First 80+ Score', date: '2025-10-18', icon: '🏆' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
            <p className="text-gray-600 mt-2">Track your improvement and analyze your performance</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field w-48"
            >
              <option value="all">All Subjects</option>
              <option value="history">History</option>
              <option value="geography">Geography</option>
              <option value="economics">Economics</option>
              <option value="polity">Polity</option>
              <option value="environment">Environment</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-field w-32"
            >
              <option value="1m">1 Month</option>
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Current Average</p>
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{overallProgress.current_score}%</p>
            <p className="text-sm text-green-600 mt-2">
              +{overallProgress.improvement}% from last month
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Tests Completed</p>
              <Target className="text-blue-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{overallProgress.total_assessments}</p>
            <p className="text-sm text-gray-600 mt-2">
              Across {subjectProgress.length} subjects
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Study Streak</p>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{overallProgress.study_streak}</p>
            <p className="text-sm text-gray-600 mt-2">
              Days in a row
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Percentile Rank</p>
              <Award className="text-purple-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{overallProgress.rank_percentile}%</p>
            <p className="text-sm text-gray-600 mt-2">
              Top 15% nationally
            </p>
          </div>
        </div>

        {/* Score Timeline */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Score Progression</h2>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={scoreTimeline}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[50, 100]} />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#0ea5e9" 
                fillOpacity={1} 
                fill="url(#colorScore)" 
                name="Your Score"
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#94a3b8" 
                strokeDasharray="5 5"
                name="Average Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Progress & Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Progress */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Subject-wise Progress</h2>
            <div className="space-y-4">
              {subjectProgress.map((subject) => (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{subject.subject}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{subject.tests} tests</span>
                      <span className={`text-sm font-semibold ${
                        subject.improvement > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {subject.improvement > 0 ? '+' : ''}{subject.improvement}%
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-600 rounded-full transition-all"
                        style={{ width: `${subject.current}%` }}
                      />
                    </div>
                    <div 
                      className="absolute top-0 h-2 w-1 bg-gray-400"
                      style={{ left: `${subject.previous}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Previous: {subject.previous}%</span>
                    <span>Current: {subject.current}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Radar */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Skills Analysis</h2>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={skillRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar 
                  name="Current" 
                  dataKey="current" 
                  stroke="#0ea5e9" 
                  fill="#0ea5e9" 
                  fillOpacity={0.6} 
                />
                <Radar 
                  name="Previous" 
                  dataKey="previous" 
                  stroke="#94a3b8" 
                  fill="#94a3b8" 
                  fillOpacity={0.3} 
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="hours" fill="#0ea5e9" name="Study Hours" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="tests" fill="#a855f7" name="Tests Taken" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Tests & Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tests */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Tests</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {recentTests.map((test, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{test.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">{test.topic}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="text-gray-600">{formatDate(test.date)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-green-600 font-medium">{test.improvement}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-primary-600">{test.rank}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{test.score}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Milestones Achieved 🎉</h2>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl flex-shrink-0">
                    {milestone.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{formatDate(milestone.date)}</p>
                  </div>
                  <Award className="text-yellow-500" size={20} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison CTA */}
        <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ready to Test Your Progress?</h3>
              <p className="text-gray-600 mt-1">
                Take a retest to see how much you've improved in your weak areas
              </p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              Start Retest
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

