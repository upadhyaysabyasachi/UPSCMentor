'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { mentorApi } from '@/lib/api'
import Link from 'next/link'
import { 
  Search, 
  Star, 
  BookOpen, 
  Users, 
  Award,
  Filter,
  MapPin,
  Calendar,
  Video,
  CheckCircle
} from 'lucide-react'

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [minRating, setMinRating] = useState(0)

  const { data: mentorsData, isLoading } = useQuery({
    queryKey: ['mentors', selectedSubject, minRating],
    queryFn: () => mentorApi.list({ subject: selectedSubject || undefined, min_rating: minRating || undefined }),
  })

  // Mock mentor data
  const mentors = [
    {
      id: '1',
      name: 'Dr. Rajesh Sharma',
      avatar: '👨‍🏫',
      rating: 4.9,
      total_sessions: 245,
      experience_years: 15,
      subjects: ['History', 'Culture'],
      bio: 'Former IAS officer with extensive experience in UPSC coaching. Specialized in Ancient and Medieval Indian History.',
      expertise: ['Ancient India', 'Medieval History', 'Art & Culture'],
      achievements: [
        'Mentored 50+ successful UPSC candidates',
        'Author of "Mastering Indian History"',
        '15 years teaching experience'
      ],
      availability: 'Available this week',
      hourly_rate: '₹2,500',
    },
    {
      id: '2',
      name: 'Prof. Anita Verma',
      avatar: '👩‍🏫',
      rating: 4.8,
      total_sessions: 189,
      experience_years: 12,
      subjects: ['Geography', 'Environment'],
      bio: 'Geography professor with a PhD in Environmental Studies. Helps students master physical and human geography concepts.',
      expertise: ['Physical Geography', 'Climate Change', 'Map Reading'],
      achievements: [
        'PhD in Environmental Studies',
        '40+ students cleared Mains',
        'Published researcher'
      ],
      availability: 'Available tomorrow',
      hourly_rate: '₹2,000',
    },
    {
      id: '3',
      name: 'Mr. Vikram Singh',
      avatar: '👨‍💼',
      rating: 4.7,
      total_sessions: 156,
      experience_years: 10,
      subjects: ['Economics', 'Current Affairs'],
      bio: 'Economist and policy analyst. Simplifies complex economic concepts for UPSC aspirants.',
      expertise: ['Indian Economy', 'Economic Survey', 'Budget Analysis'],
      achievements: [
        'Top economics mentor 2024',
        'Ex-policy advisor',
        '100+ success stories'
      ],
      availability: 'Available today',
      hourly_rate: '₹1,800',
    },
    {
      id: '4',
      name: 'Dr. Priya Malhotra',
      avatar: '👩‍⚖️',
      rating: 4.9,
      total_sessions: 312,
      experience_years: 18,
      subjects: ['Polity', 'Governance'],
      bio: 'Constitutional expert and former bureaucrat. Deep expertise in Indian Polity and Governance.',
      expertise: ['Constitution', 'Judiciary', 'Public Administration'],
      achievements: [
        'Former IAS officer',
        'Constitutional law expert',
        'Guest faculty at top institutes'
      ],
      availability: 'Available next week',
      hourly_rate: '₹3,000',
    },
  ]

  const subjects = ['All', 'History', 'Geography', 'Economics', 'Polity', 'Environment', 'Current Affairs']

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.bio.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = !selectedSubject || selectedSubject === 'All' || 
      mentor.subjects.some(s => s.toLowerCase() === selectedSubject.toLowerCase())
    const matchesRating = minRating === 0 || mentor.rating >= minRating
    
    return matchesSearch && matchesSubject && matchesRating
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Your Mentor</h1>
          <p className="text-gray-600 mt-2">
            Connect with experienced mentors to accelerate your UPSC preparation
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search mentors by name or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field md:w-48"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="input-field md:w-48"
            >
              <option value={0}>All Ratings</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={4.0}>4.0+ Stars</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Total Mentors</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{filteredMentors.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Avg Rating</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-1">
              4.8 <Star className="text-yellow-500" size={20} fill="currentColor" />
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Total Sessions</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">900+</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">94%</p>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMentors.map((mentor) => (
            <div key={mentor.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-4xl flex-shrink-0">
                  {mentor.avatar}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-500" size={16} fill="currentColor" />
                          <span className="font-semibold text-gray-900">{mentor.rating}</span>
                          <span>({mentor.total_sessions} sessions)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award size={16} />
                          <span>{mentor.experience_years} years exp</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {mentor.subjects.map((subject, index) => (
                      <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {subject}
                      </span>
                    ))}
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {mentor.bio}
                  </p>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {mentor.expertise.slice(0, 3).map((exp, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {exp}
                      </span>
                    ))}
                  </div>

                  {/* Achievements */}
                  <div className="mt-4 space-y-1">
                    {mentor.achievements.slice(0, 2).map((achievement, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-gray-700">{achievement}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{mentor.availability}</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {mentor.hourly_rate}/hour
                      </div>
                    </div>
                    <Link href={`/mentors/${mentor.id}`} className="btn-primary text-sm">
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="card text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}

        {/* CTA Banner */}
        <div className="card bg-gradient-to-r from-purple-600 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Want to become a mentor?</h3>
              <p className="text-purple-100">
                Share your expertise and help UPSC aspirants achieve their dreams
              </p>
            </div>
            <button className="btn-secondary bg-white text-purple-600 hover:bg-gray-100">
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

