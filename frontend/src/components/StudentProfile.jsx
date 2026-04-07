import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTeacherStudentProfile, giveFeedback } from '../api';

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCourse, setFeedbackCourse] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadProfile(); }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getTeacherStudentProfile(id);
      setStudent(res.data.student);
      setCourses(res.data.courses);
      setStats(res.data.stats);
      setFeedbacks(res.data.feedbacks);
    } catch (err) {
      console.error('Failed to load student profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    setMessage('');
    try {
      const res = await giveFeedback({
        student_id: Number(id),
        course_id: feedbackCourse ? Number(feedbackCourse) : null,
        text: feedbackText,
      });
      setFeedbacks([res.data.feedback, ...feedbacks]);
      setFeedbackText('');
      setFeedbackCourse('');
      setMessage('Feedback submitted!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading student profile...</div>;
  if (!student) return <div className="loading">Student not found.</div>;

  return (
    <div className="student-profile-page">
      <div className="page-header">
        <Link to="/teacher" className="btn btn-outline btn-sm">← Back to Dashboard</Link>
        <h1>👤 {student.full_name}</h1>
        <p>{student.email} • @{student.username}</p>
      </div>

      {/* Performance Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{courses.length}</div>
            <div className="stat-label">Enrolled Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_quizzes}</div>
            <div className="stat-label">Quizzes Taken</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.quizzes_passed}</div>
            <div className="stat-label">Quizzes Passed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.avg_score}%</div>
            <div className="stat-label">Avg Score</div>
          </div>
        </div>
      )}

      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{message}</div>
      )}

      {/* Course Progress */}
      <h3 style={{ marginBottom: '1rem' }}>Course Progress</h3>
      {courses.length === 0 ? (
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <p>This student hasn't enrolled in any of your courses.</p>
        </div>
      ) : (
        <div className="courses-grid" style={{ marginBottom: '1.5rem' }}>
          {courses.map(({ course, progress, lessons_completed, total_lessons, quiz_attempts }) => (
            <div key={course.id} className="card">
              <h4>{course.title}</h4>
              <div className="progress-bar-container" style={{ marginTop: '0.75rem' }}>
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {lessons_completed}/{total_lessons} lessons • {progress}% complete
              </p>
              {quiz_attempts.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong style={{ fontSize: '0.85rem' }}>Quiz Attempts:</strong>
                  {quiz_attempts.map(a => (
                    <div key={a.id} style={{ fontSize: '0.8rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{a.quiz_title}</span>
                      <span className={`badge ${a.passed ? 'badge-success' : 'badge-error'}`}>
                        {a.score}% {a.passed ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Feedback Section */}
      <h3 style={{ marginBottom: '1rem' }}>Give Feedback</h3>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleFeedback}>
          <div className="form-group">
            <label>Course (optional)</label>
            <select value={feedbackCourse} onChange={e => setFeedbackCourse(e.target.value)}>
              <option value="">General Feedback</option>
              {courses.map(({ course }) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Feedback *</label>
            <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
              placeholder="Write your feedback for this student..."
              rows={3} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={feedbackLoading}>
            {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      {/* Feedback History */}
      {feedbacks.length > 0 && (
        <>
          <h3 style={{ marginBottom: '1rem' }}>Feedback History</h3>
          <div className="card">
            {feedbacks.map(f => (
              <div key={f.id} className="feedback-item">
                <div className="feedback-meta">
                  {f.course_title && <span className="badge">{f.course_title}</span>}
                  <span className="feedback-date">
                    {f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="feedback-text">{f.text}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
