# UPSC Prep Ecosystem - Frontend

A modern, AI-powered UPSC preparation platform built with Next.js 14, TypeScript, and TailwindCSS.

## 🚀 Features

### ✅ Implemented
- **Authentication System**
  - Login/Register pages with form validation
  - JWT-based authentication
  - Role-based access (Aspirant/Mentor)

- **Dashboard**
  - Overview of performance metrics
  - Subject-wise performance visualization
  - Upcoming mentorship sessions
  - Recent activity feed

- **Assessment System**
  - Multi-step assessment creation flow
  - Subject and topic selection
  - MCQ and subjective question support
  - Image upload for handwritten answers
  - OCR processing for handwritten responses
  - Progress tracking during tests

- **Feedback & Analysis**
  - Detailed score breakdown
  - Strengths and weaknesses identification
  - Concept gap analysis with priority levels
  - NCERT and PYQ recommendations
  - Skill-based radar charts

- **Mentor Ecosystem**
  - Mentor catalogue with search and filters
  - Detailed mentor profiles
  - Rating and review system
  - Booking interface with calendar
  - Session management

- **Progress Tracking**
  - Score progression timeline
  - Subject-wise progress bars
  - Skills analysis radar chart
  - Weekly activity charts
  - Milestone tracking
  - Recent test history

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React
- **File Upload:** React Dropzone

## 📦 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=UPSC Prep Ecosystem
```

3. **Run development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── dashboard/         # Main dashboard
│   │   ├── assessments/       # Assessment pages
│   │   │   ├── new/          # Create assessment
│   │   │   └── [id]/         # Assessment details
│   │   │       ├── take/     # Take assessment
│   │   │       └── feedback/ # View feedback
│   │   ├── mentors/           # Mentor pages
│   │   │   └── [id]/         # Mentor profile
│   │   └── progress/          # Progress tracking
│   ├── components/            # Reusable components
│   │   ├── layout/           # Layout components
│   │   └── providers/        # Context providers
│   ├── lib/                   # Utilities and API
│   │   ├── api.ts            # API client
│   │   └── utils.ts          # Helper functions
│   └── stores/                # Zustand stores
│       ├── authStore.ts      # Authentication state
│       └── assessmentStore.ts # Assessment state
├── public/                    # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## 🎨 Key Components

### Authentication
- JWT-based authentication with refresh tokens
- Persistent auth state using Zustand
- Protected routes and middleware

### Assessment Flow
1. **Topic Selection:** Choose subject, topic, and difficulty
2. **Test Taking:** Answer MCQs and subjective questions
3. **Image Upload:** Upload handwritten answers for OCR
4. **Evaluation:** AI-powered feedback and scoring
5. **Recommendations:** NCERT/PYQ suggestions based on gaps

### API Integration
All API calls are centralized in `src/lib/api.ts` with:
- Automatic token injection
- Token refresh on 401 errors
- Type-safe endpoints
- Error handling

### State Management
- **Auth Store:** User authentication and profile
- **Assessment Store:** Current test state and responses
- **React Query:** Server state caching and synchronization

## 🎯 User Flows

### Aspirant Journey
1. Register/Login → Dashboard
2. View performance metrics
3. Start new assessment
4. Complete test (MCQ + Subjective)
5. Receive AI feedback
6. Book mentor session
7. Track progress over time

### Mentor Journey
1. Register as mentor
2. Set availability
3. View student requests
4. Conduct sessions
5. Provide guidance

## 🧪 Development

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Consistent component patterns
- Reusable utility functions

### Best Practices
- Server and Client components separation
- Optimistic UI updates
- Error boundary handling
- Loading states
- Responsive design

## 📊 Charts & Visualizations

Using Recharts for data visualization:
- **Line Charts:** Score progression over time
- **Bar Charts:** Subject-wise performance
- **Radar Charts:** Skills analysis
- **Area Charts:** Trend analysis

## 🔐 Security

- JWT tokens stored in localStorage
- Automatic token refresh
- CSRF protection
- Input validation with Zod
- Secure API communication

## 🚀 Performance

- Next.js App Router for optimal performance
- Server-side rendering where needed
- Image optimization
- Code splitting
- Lazy loading

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly interfaces
- Adaptive layouts

## 🎨 Design System

### Colors
- Primary: Blue (#0ea5e9)
- Secondary: Purple (#a855f7)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Error: Red (#ef4444)

### Typography
- Font: Inter
- Headings: Bold, 2xl-4xl
- Body: Regular, sm-base

### Components
- Cards with shadow-sm
- Rounded corners (lg, xl)
- Consistent spacing (4, 6, 8)
- Hover states and transitions

## 🔄 API Endpoints

See `src/lib/api.ts` for complete API documentation:
- `/api/auth/*` - Authentication
- `/api/assessments/*` - Assessments
- `/api/evaluate/*` - Evaluation
- `/api/mentors/*` - Mentors
- `/api/bookings/*` - Bookings
- `/api/progress/*` - Progress tracking

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `UPSC Prep Ecosystem` |

## 🤝 Contributing

1. Create a feature branch
2. Make changes with proper TypeScript types
3. Test thoroughly
4. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for UPSC aspirants**

