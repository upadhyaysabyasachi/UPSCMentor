'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { 
  Star, 
  Award, 
  Calendar, 
  Video,
  CheckCircle,
  ArrowRight,
  Mail,
  Linkedin,
  MapPin,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react'
import Link from 'next/link'

export default function MentorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const mentorId = params.id as string
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')

  // Mock mentor data
  const mentor = {
    id: mentorId,
    name: 'Dr. Rajesh Sharma',
    avatar: '👨‍🏫',
    rating: 4.9,
    total_sessions: 245,
    experience_years: 15,
    subjects: ['History', 'Culture', 'Heritage'],
    bio: 'Former IAS officer with extensive experience in UPSC coaching. Specialized in Ancient and Medieval Indian History. I have mentored over 50 successful UPSC candidates and authored several books on Indian History.',
    detailed_bio: `Dr. Rajesh Sharma is a distinguished educator and former IAS officer with over 15 years of experience in UPSC preparation mentoring. Having cleared the UPSC examination himself with an All India Rank in the top 50, he brings firsthand experience and insider knowledge to his teaching methodology.

His teaching philosophy emphasizes conceptual clarity over rote learning, and he has developed a unique framework for mastering Indian History that has helped hundreds of aspirants achieve their dreams. Dr. Sharma's sessions are known for being interactive, engaging, and results-oriented.`,
    expertise: [
      'Ancient Indian History',
      'Medieval Indian History',
      'Art & Culture',
      'Historical Analysis',
      'Answer Writing',
      'Source-based Questions'
    ],
    achievements: [
      'Mentored 50+ successful UPSC candidates',
      'Author of "Mastering Indian History for UPSC"',
      'Former IAS officer (Batch 2005)',
      '15 years of teaching experience',
      'Guest faculty at premier coaching institutes',
      'Published researcher in historical studies'
    ],
    education: [
      'PhD in History - Jawaharlal Nehru University',
      'MA in Ancient Indian History - Delhi University',
      'BA (Honors) History - St. Stephen\'s College'
    ],
    hourly_rate: '₹2,500',
    languages: ['English', 'Hindi'],
    location: 'Delhi',
    responseTime: '2 hours',
    successRate: '92%',
  }

  const availableSlots = [
    { date: '2025-10-27', day: 'Monday', slots: ['10:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'] },
    { date: '2025-10-28', day: 'Tuesday', slots: ['10:00 AM', '11:00 AM', '3:00 PM', '5:00 PM'] },
    { date: '2025-10-29', day: 'Wednesday', slots: ['9:00 AM', '2:00 PM', '4:00 PM'] },
    { date: '2025-10-30', day: 'Thursday', slots: ['10:00 AM', '1:00 PM', '3:00 PM', '6:00 PM'] },
    { date: '2025-10-31', day: 'Friday', slots: ['10:00 AM', '2:00 PM', '5:00 PM'] },
  ]

  const reviews = [
    {
      name: 'Priya K.',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Dr. Sharma\'s guidance was instrumental in my success. His teaching methodology and personalized feedback helped me score 140+ in History optional.',
    },
    {
      name: 'Amit R.',
      rating: 5,
      date: '1 month ago',
      comment: 'Excellent mentor! His deep understanding of UPSC patterns and answer writing techniques is remarkable. Highly recommended for History aspirants.',
    },
    {
      name: 'Sneha M.',
      rating: 4,
      date: '2 months ago',
      comment: 'Very knowledgeable and patient. Helped me overcome my weaknesses in Medieval History. The sessions were well-structured and productive.',
    },
  ]

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      router.push(`/mentors/${mentorId}/book?date=${selectedDate}&time=${selectedTime}`)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <Link href="/mentors" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-2">
          ← Back to Mentors
        </Link>

        {/* Profile Header */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-6xl flex-shrink-0">
              {mentor.avatar}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{mentor.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-500" size={20} fill="currentColor" />
                      <span className="font-semibold text-gray-900">{mentor.rating}</span>
                      <span className="text-sm">({mentor.total_sessions} sessions)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award size={18} />
                      <span className="text-sm">{mentor.experience_years} years experience</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={18} />
                      <span className="text-sm">{mentor.location}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <p className="text-3xl font-bold text-primary-600">{mentor.hourly_rate}</p>
                  <p className="text-sm text-gray-600">per hour</p>
                </div>
              </div>

              {/* Subjects */}
              <div className="flex flex-wrap gap-2 mt-4">
                {mentor.subjects.map((subject, index) => (
                  <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {subject}
                  </span>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="text-lg font-semibold text-gray-900">{mentor.responseTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-lg font-semibold text-gray-900">{mentor.successRate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Languages</p>
                  <p className="text-lg font-semibold text-gray-900">{mentor.languages.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {mentor.detailed_bio}
              </p>
            </div>

            {/* Expertise */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Areas of Expertise</h2>
              <div className="grid grid-cols-2 gap-3">
                {mentor.expertise.map((exp, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="text-primary-600 flex-shrink-0" size={18} />
                    <span className="text-sm text-gray-900">{exp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements & Credentials</h2>
              <div className="space-y-3">
                {mentor.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Award className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
              <div className="space-y-3">
                {mentor.education.map((edu, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-600 mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{edu}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Student Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="text-yellow-500" size={14} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{review.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Book a Session</h2>
              
              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <div className="space-y-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.date}
                      onClick={() => {
                        setSelectedDate(slot.date)
                        setSelectedTime('')
                      }}
                      className={`
                        w-full p-3 rounded-lg border-2 text-left transition-all
                        ${selectedDate === slot.date
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <p className="font-semibold text-gray-900">{slot.day}</p>
                      <p className="text-sm text-gray-600">{slot.date}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots
                      .find(s => s.date === selectedDate)
                      ?.slots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`
                            p-2 rounded-lg border-2 text-sm font-medium transition-all
                            ${selectedTime === time
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          {time}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Session Details */}
              {selectedDate && selectedTime && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-900">60 mins</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-gray-900">{mentor.hourly_rate}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                Confirm Booking
                <ArrowRight size={20} />
              </button>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Video size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Online video session via Google Meet</span>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Free rescheduling up to 24 hours before</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Instant confirmation via email</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

