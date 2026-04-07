import { Routes, Route, Navigate } from 'react-router-dom';
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
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

function TeacherRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'teacher') return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
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
      </main>
    </div>
  );
}

export default App;
