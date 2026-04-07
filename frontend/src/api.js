import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => api.post('/login', data);
export const register = (data) => api.post('/register', data);
export const getMe = () => api.get('/me');
export const logout = () => api.post('/logout');

// Courses
export const getCourses = () => api.get('/courses');
export const getCourse = (id) => api.get(`/courses/${id}`);
export const enrollCourse = (id) => api.post(`/courses/${id}/enroll`);

// Lessons
export const getLesson = (id) => api.get(`/lessons/${id}`);
export const completeLesson = (id) => api.post(`/lessons/${id}/complete`);

// Quizzes
export const getQuiz = (id) => api.get(`/quizzes/${id}`);
export const getQuizQuestions = (id) => api.get(`/quizzes/${id}/questions`);
export const submitQuiz = (id, answers) => api.post(`/quizzes/${id}/submit`, { answers });

// Dashboard & Performance
export const getDashboard = () => api.get('/dashboard');
export const getPerformance = () => api.get('/performance');

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getPendingUsers = () => api.get('/admin/pending-users');
export const getAllUsers = () => api.get('/admin/users');
export const getAdminUserProfile = (id) => api.get(`/admin/users/${id}`);
export const getAdminStudentsPerformance = () => api.get('/admin/students-performance');
export const getAdminActivityLog = () => api.get('/admin/activity-log');
export const approveUser = (id) => api.post(`/admin/approve-user/${id}`);
export const rejectUser = (id, reason = '') => api.post(`/admin/reject-user/${id}`, { reason });

// Student
export const getStudentFeedbacks = () => api.get('/student/feedbacks');

// Teacher
export const getTeacherDashboard = () => api.get('/teacher/dashboard');
export const getTeacherCourses = () => api.get('/teacher/courses');
export const createCourse = (data) => api.post('/teacher/courses', data);
export const getTeacherStudents = () => api.get('/teacher/students');
export const getTeacherStudentProfile = (id) => api.get(`/teacher/students/${id}`);
export const giveFeedback = (data) => api.post('/teacher/feedback', data);
export const scheduleExam = (data) => api.post('/teacher/schedule-exam', data);
export const getScheduledExams = () => api.get('/teacher/scheduled-exams');
export const cancelScheduledExam = (id) => api.delete(`/teacher/scheduled-exams/${id}`);

export default api;
