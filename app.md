# LMS Website — Project Reference

## Overview
- **Name**: LearnHub LMS
- **Stack**: Flask (Python) backend + React 19 (Vite) frontend
- **DB**: SQLite (`backend/instance/lms.db`) via SQLAlchemy
- **Auth**: In-memory token dict, werkzeug password hashing
- **Port**: Backend 5000, Frontend Vite dev server
- **Run Backend**: `cd backend && python app.py`
- **Run Frontend**: `cd frontend && npm run dev`

## Backend (backend/app.py)

### Database Models
| Model | Key Fields |
|-------|-----------|
| **User** | id, username (unique), email (unique), password_hash, full_name, role (student/admin), is_approved, approved_at, created_at |
| **Course** | id, title, description, thumbnail, instructor_name, category, created_at |
| **Lesson** | id, title, description, video_url, duration_minutes, order, course_id (FK) |
| **LessonProgress** | id, user_id (FK), lesson_id (FK), completed, completed_at |
| **Quiz** | id, title, description, course_id (FK), time_limit_minutes, pass_percentage (default 60) |
| **Question** | id, text, option_a/b/c/d, correct_answer, explanation, order, quiz_id (FK) |
| **QuizAttempt** | id, user_id (FK), quiz_id (FK), score, total_questions, correct_answers, passed, completed_at |
| **Activity** | id, user_id (FK), action, description, timestamp |
| **Enrollments** | (join table) user_id (FK), course_id (FK), enrolled_at |

### API Endpoints
- **Auth**: POST /api/register, POST /api/login, GET /api/me, POST /api/logout
- **Courses**: GET /api/courses, GET /api/courses/<id>, POST /api/courses/<id>/enroll
- **Lessons**: GET /api/lessons/<id>, POST /api/lessons/<id>/complete
- **Quizzes**: GET /api/quizzes/<id>, GET /api/quizzes/<id>/questions, POST /api/quizzes/<id>/submit
- **Dashboard**: GET /api/dashboard, GET /api/performance
- **Admin**: GET /api/admin/stats, GET /api/admin/pending-users, GET /api/admin/users, POST /api/admin/approve-user/<uid>, POST /api/admin/reject-user/<uid>

### Auth Decorators
- `@login_required_api` — checks Bearer token in active_tokens dict
- `@admin_required_api` — checks role='admin'

### Email
- Gmail SMTP (hardicksoni1@gmail.com) for approval/rejection notifications

### Seed Data (created on init)
- Admin: `admin` / `admin123`
- Student: `student` / `student123`
- 3 Courses: Web Dev (4 lessons + quiz), Python (5 lessons + quiz), Digital Marketing (3 lessons + quiz)

## Frontend (React + Vite)

### Dependencies
- react 19.2.4, react-dom 19.2.4, react-router-dom 7.14, axios 1.14
- Dev: vite 8.0.4, @vitejs/plugin-react 6.0.1, eslint

### Key Files
| File | Purpose |
|------|---------|
| `main.jsx` | Entry point — BrowserRouter + AuthProvider |
| `App.jsx` | Route definitions (public, private, admin) |
| `AuthContext.jsx` | Global auth state — login/register/logout, localStorage token, auto-logout on 401 |
| `api.js` | Axios instance (base: localhost:5000/api), request/response interceptors |
| `index.css` | Full stylesheet (~800 lines), CSS variables, responsive @768px breakpoint |

### Routes
- **Public**: /login, /register, /courses, /courses/:id
- **Private** (requires user): /dashboard, /lessons/:id, /quizzes/:id, /performance
- **Admin** (requires admin role): /admin
- Root `/` redirects to /courses

### Components
| Component | Purpose |
|-----------|---------|
| `Login.jsx` | Login form, shows demo credentials, pending approval message |
| `Register.jsx` | Registration form, "submitted" confirmation page |
| `Navbar.jsx` | Logo "🎓 LearnHub LMS", nav links, admin link if admin, logout |
| `Dashboard.jsx` | Stats cards, enrolled courses with progress bars, recent activity |
| `Courses.jsx` | Grid of course cards with category/enrolled badges, progress |
| `CourseDetail.jsx` | Course header + lessons list + quizzes list, enroll button |
| `Lesson.jsx` | Sidebar nav + YouTube iframe + prev/next + mark complete |
| `QuizPage.jsx` | 3 phases: info → taking (A-D options) → result (score + review) |
| `Performance.jsx` | Stats, course progress bars, score bar chart, quiz history table, activity log |
| `AdminDashboard.jsx` | Stats, 2 tabs (pending approvals + all users), reject modal |

### CSS Design System
- Primary: #4f46e5 (indigo), Success: #10b981, Error: #ef4444, Warning: #f59e0b
- Font: Inter
- Key classes: .btn-*, .card, .badge-*, .stats-grid, .stat-card, .progress-bar, .auth-*, .course-*, .lesson-*, .quiz-*, .admin-*, .modal-*
- Responsive breakpoint: 768px
