import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import CourseDetail from './components/CourseDetail';
import Lesson from './components/Lesson';
import QuizPage from './components/QuizPage';
import Performance from './components/Performance';
import AdminDashboard from './components/AdminDashboard';
import AdminUserProfile from './components/AdminUserProfile';
import AdminActivityLog from './components/AdminActivityLog';
import TeacherDashboard from './components/TeacherDashboard';
import AddCourse from './components/AddCourse';
import StudentProfile from './components/StudentProfile';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

function TeacherRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'teacher') return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#dbeafe' }}>
      <Navbar />
      {/* Spacer for sidebar on desktop */}
      <div className="hidden md:block w-[220px] shrink-0" />
      {/* Main content area */}
      <main className="flex-1 p-3 md:p-4 min-h-screen">
        <div className="rounded-2xl overflow-auto bg-white/80 backdrop-blur-sm"
          style={{ minHeight: 'calc(100vh - 2rem)' }}>
          <Routes>
            <Route path="/courses" element={<Courses />} />
            <Route path="/my-courses" element={<PrivateRoute><Courses myCoursesOnly /></PrivateRoute>} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/lessons/:id" element={<PrivateRoute><Lesson /></PrivateRoute>} />
            <Route path="/quizzes/:id" element={<PrivateRoute><QuizPage /></PrivateRoute>} />
            <Route path="/performance" element={<PrivateRoute><Performance /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users/:id" element={<AdminRoute><AdminUserProfile /></AdminRoute>} />
            <Route path="/admin/activity" element={<AdminRoute><AdminActivityLog /></AdminRoute>} />
            <Route path="/teacher" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
            <Route path="/teacher/add-course" element={<TeacherRoute><AddCourse /></TeacherRoute>} />
            <Route path="/teacher/students/:id" element={<TeacherRoute><StudentProfile /></TeacherRoute>} />
            <Route path="/" element={<Navigate to="/courses" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
