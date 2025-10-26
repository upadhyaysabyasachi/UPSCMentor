# Quick Start Guide 🚀

Get the UPSC Prep Ecosystem frontend up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running (optional for development)

## Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Zustand (state management)
- TanStack Query (data fetching)
- Recharts (visualizations)
- And more...

## Step 2: Environment Setup

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=UPSC Prep Ecosystem
```

> **Note:** The app will work without a backend running, using mock data for demonstration.

## Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 4: Explore the App

### 1. **Login/Register**
- Navigate to `/login` (auto-redirects from home)
- Create an account as an **Aspirant** or **Mentor**
- Mock credentials work without backend:
  - Email: `demo@example.com`
  - Password: `password123`

### 2. **Dashboard** (`/dashboard`)
After login, you'll see:
- Performance metrics (Questions attempted, avg score, sessions)
- Subject-wise performance charts
- Upcoming mentorship sessions
- Recent activity feed
- Quick action buttons

### 3. **Take Assessment** (`/assessments/new`)
Create a new test:
- **Step 1:** Select subject (History, Geography, Economics, etc.)
- **Step 2:** Choose specific topic
- **Step 3:** Set difficulty level (Easy/Medium/Hard)
- Start the assessment!

### 4. **Assessment Interface** (`/assessments/[id]/take`)
- Answer MCQ questions (radio buttons)
- Write subjective answers (text or image upload)
- Upload handwritten answers for OCR processing
- Navigate between questions
- Submit when complete

### 5. **View Feedback** (`/assessments/[id]/feedback`)
After submission, see:
- Overall score and performance
- Strengths and weaknesses
- Concept gaps with priority levels
- Skill-based radar chart
- NCERT and PYQ recommendations
- Next steps (book mentor or retake test)

### 6. **Browse Mentors** (`/mentors`)
- Search mentors by name or expertise
- Filter by subject and rating
- View mentor profiles with:
  - Experience and credentials
  - Student reviews
  - Availability calendar
  - Booking interface

### 7. **Track Progress** (`/progress`)
Monitor your improvement:
- Score progression timeline
- Subject-wise progress bars
- Skills analysis radar
- Weekly activity charts
- Milestone achievements
- Recent test history

## 🎯 Key Features to Try

### 1. Assessment with Image Upload
1. Go to `/assessments/new`
2. Select History → Ancient India → Medium
3. Answer a subjective question
4. Drag & drop or click to upload a handwritten answer image
5. See OCR processing message
6. Submit and view AI-generated feedback

### 2. Mentor Booking
1. Navigate to `/mentors`
2. Browse mentor profiles
3. Click "View Profile" on any mentor
4. Select a date and time slot
5. Confirm booking
6. (In production: Would create calendar event and send notifications)

### 3. Progress Tracking
1. Go to `/progress`
2. Filter by subject or time range
3. View score trends over time
4. Compare current vs previous performance
5. See skill improvements on radar chart

## 📱 Responsive Testing

Test the app on different screen sizes:
- Desktop: Full layout with sidebar
- Tablet: Responsive grid layouts
- Mobile: Touch-friendly, stacked components

## 🛠️ Development Tools

### VS Code Extensions (Recommended)
- ESLint
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### Browser DevTools
- React Developer Tools
- Redux DevTools (for Zustand)

## 🎨 Customization

### Change Color Scheme
Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### Modify API Endpoints
Edit `src/lib/api.ts` to change or add endpoints.

### Update Mock Data
Each page has mock data at the top - modify as needed for testing.

## 📦 Build for Production

```bash
npm run build
npm start
```

Production build will be in `.next/` directory.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use different port
PORT=3001 npm run dev
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### TypeScript Errors
```bash
# Check types
npm run lint
```

## 🔗 Important URLs

- **Home/Login:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard
- **New Assessment:** http://localhost:3000/assessments/new
- **Mentors:** http://localhost:3000/mentors
- **Progress:** http://localhost:3000/progress

## 📚 Next Steps

1. **Connect to Backend:** Update API base URL when backend is ready
2. **Add Authentication:** Integrate with real auth endpoints
3. **Test All Flows:** Go through complete user journeys
4. **Customize Content:** Update subjects, topics, and mock data
5. **Deploy:** Choose Vercel, Netlify, or your preferred platform

## 🤝 Need Help?

- Check `README.md` for detailed documentation
- Review `docs/plan.md` for architecture details
- Look at component code - well-commented and typed
- API structure is in `src/lib/api.ts`

## 🎉 You're All Set!

The frontend is now running with:
- ✅ Full authentication flow
- ✅ Complete assessment system
- ✅ AI feedback dashboard
- ✅ Mentor booking interface
- ✅ Progress tracking
- ✅ Beautiful, responsive UI

Start exploring and building! 🚀

