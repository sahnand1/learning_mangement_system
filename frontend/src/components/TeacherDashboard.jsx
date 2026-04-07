import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getTeacherDashboard, getTeacherStudents, getScheduledExams,
  scheduleExam, cancelScheduledExam
} from '../api';

export default function TeacherDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Schedule exam form
  const [examForm, setExamForm] = useState({
    quiz_id: '', course_id: '', scheduled_date: '', duration_minutes: 60
  });
  const [examLoading, setExamLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, studRes, examRes] = await Promise.all([
        getTeacherDashboard(),
        getTeacherStudents(),
        getScheduledExams(),
      ]);
      setStats(dashRes.data.stats);
      setCourses(dashRes.data.courses);
      setStudents(studRes.data.students);
      setExams(examRes.data.exams);
    } catch (err) {
      console.error('Failed to load teacher data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleExam = async (e) => {
    e.preventDefault();
    setExamLoading(true);
    setMessage('');
    try {
      await scheduleExam(examForm);
      setMessage('Exam scheduled successfully!');
      setExamForm({ quiz_id: '', course_id: '', scheduled_date: '', duration_minutes: 60 });
      const res = await getScheduledExams();
      setExams(res.data.exams);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to schedule exam');
    } finally {
      setExamLoading(false);
    }
  };

  const handleCancelExam = async (id) => {
    try {
      await cancelScheduledExam(id);
      setExams(exams.filter(e => e.id !== id));
      setMessage('Exam cancelled');
    } catch (err) {
      setMessage('Failed to cancel exam');
    }
  };

  // Get all quizzes from courses for the schedule form
  const allQuizzes = [];
  courses.forEach(c => {
    if (c.quizzes) {
      c.quizzes.forEach(q => allQuizzes.push({ ...q, course_title: c.title, course_id: c.id }));
    }
  });

  if (loading) return <div className="loading">Loading teacher dashboard...</div>;

  return (
    <div className="teacher-dashboard">
      <div className="page-header">
        <h1>👨‍🏫 Teacher Dashboard</h1>
        <p>Manage your courses, students, and exams</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total_courses}</div>
            <div className="stat-label">My Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_students}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_lessons}</div>
            <div className="stat-label">Total Lessons</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.feedbacks_given}</div>
            <div className="stat-label">Feedbacks Given</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.scheduled_exams}</div>
            <div className="stat-label">Active Exams</div>
          </div>
        </div>
      )}

      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'overview' ? 'active' : ''}`}
          onClick={() => setTab('overview')}>My Courses</button>
        <button className={`admin-tab ${tab === 'students' ? 'active' : ''}`}
          onClick={() => setTab('students')}>Students ({students.length})</button>
        <button className={`admin-tab ${tab === 'exams' ? 'active' : ''}`}
          onClick={() => setTab('exams')}>Schedule Exams</button>
      </div>

      {/* Courses Tab */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>My Courses</h3>
            <Link to="/teacher/add-course" className="btn btn-primary">+ Add Course</Link>
          </div>
          {courses.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p>You haven't created any courses yet.</p>
              <Link to="/teacher/add-course" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Create Your First Course
              </Link>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map(c => (
                <div key={c.id} className="card course-card">
                  <div className="course-card-body">
                    <span className="badge">{c.category}</span>
                    <h3>{c.title}</h3>
                    <p>{c.description}</p>
                    <div className="course-meta">
                      <span>📚 {c.lesson_count} lessons</span>
                      <span>📝 {c.quiz_count} quizzes</span>
                      <span>👥 {c.student_count} students</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {tab === 'students' && (
        <div className="card">
          {students.length === 0 ? (
            <div className="empty-state"><p>No students enrolled in your courses yet.</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Enrolled Courses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.full_name}</strong></td>
                    <td>{s.username}</td>
                    <td>{s.email}</td>
                    <td>
                      {s.enrolled_courses.map(c => (
                        <div key={c.id} style={{ fontSize: '0.85rem' }}>
                          {c.title} — <span style={{ color: 'var(--primary)' }}>{c.progress}%</span>
                        </div>
                      ))}
                    </td>
                    <td>
                      <Link to={`/teacher/students/${s.id}`} className="btn btn-sm btn-primary">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Schedule Exams Tab */}
      {tab === 'exams' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Schedule New Exam</h3>
            {allQuizzes.length === 0 ? (
              <p>Create a course with a quiz first to schedule exams.</p>
            ) : (
              <form onSubmit={handleScheduleExam}>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Select Quiz</label>
                    <select value={examForm.quiz_id}
                      onChange={e => {
                        const q = allQuizzes.find(q => q.id === Number(e.target.value));
                        setExamForm({ ...examForm, quiz_id: e.target.value, course_id: q ? q.course_id : '' });
                      }} required>
                      <option value="">-- Select Quiz --</option>
                      {allQuizzes.map(q => (
                        <option key={q.id} value={q.id}>{q.title} ({q.course_title})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Scheduled Date & Time</label>
                    <input type="datetime-local" value={examForm.scheduled_date}
                      onChange={e => setExamForm({ ...examForm, scheduled_date: e.target.value })} required />
                  </div>
                  <div className="form-group" style={{ width: '140px' }}>
                    <label>Duration (min)</label>
                    <input type="number" value={examForm.duration_minutes}
                      onChange={e => setExamForm({ ...examForm, duration_minutes: e.target.value })}
                      min="5" required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={examLoading}>
                  {examLoading ? 'Scheduling...' : 'Schedule Exam'}
                </button>
              </form>
            )}
          </div>

          <h3 style={{ marginBottom: '1rem' }}>Scheduled Exams</h3>
          <div className="card">
            {exams.length === 0 ? (
              <div className="empty-state"><p>No exams scheduled yet.</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Course</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map(ex => {
                    const examDate = new Date(ex.scheduled_date);
                    const isPast = examDate < new Date();
                    return (
                      <tr key={ex.id}>
                        <td><strong>{ex.quiz_title}</strong></td>
                        <td>{ex.course_title}</td>
                        <td>{examDate.toLocaleString()}</td>
                        <td>{ex.duration_minutes} min</td>
                        <td>
                          <span className={`badge ${isPast ? 'badge-muted' : 'badge-success'}`}>
                            {isPast ? 'Completed' : 'Upcoming'}
                          </span>
                        </td>
                        <td>
                          {!isPast && (
                            <button className="btn btn-sm btn-danger"
                              onClick={() => handleCancelExam(ex.id)}>Cancel</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
