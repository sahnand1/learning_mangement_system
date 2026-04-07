import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminUserProfile } from '../api';

export default function AdminUserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminUserProfile(id)
      .then((res) => setUser(res.data.user))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!user) return <div className="error-msg">User not found</div>;

  return (
    <div className="admin-user-profile">
      <div className="page-header">
        <Link to="/admin" className="btn btn-outline btn-sm">← Back to Admin</Link>
        <h1>
          {user.role === 'teacher' ? '👨‍🏫' : user.role === 'admin' ? '🛡️' : '👤'}{' '}
          {user.full_name}
        </h1>
        <p>
          @{user.username} • {user.email} •{' '}
          <span className={`badge ${user.role === 'teacher' ? 'badge-teacher' : user.role === 'admin' ? 'badge-admin' : ''}`}>
            {user.role}
          </span>{' '}
          <span className={`badge ${user.is_approved ? 'badge-success' : 'badge-pending'}`}>
            {user.is_approved ? 'Approved' : 'Pending'}
          </span>
        </p>
      </div>

      {/* Basic Info */}
      <div className="card">
        <h3>Profile Information</h3>
        <div className="profile-info-grid">
          <div><strong>Full Name:</strong> {user.full_name}</div>
          <div><strong>Username:</strong> {user.username}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Role:</strong> {user.role}</div>
          <div><strong>Registered:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</div>
          <div><strong>Approved:</strong> {user.approved_at ? new Date(user.approved_at).toLocaleString() : 'N/A'}</div>
          {user.role === 'teacher' && (
            <>
              <div><strong>Qualification:</strong> {user.qualification || 'N/A'}</div>
              <div><strong>Specialization:</strong> {user.specialization || 'N/A'}</div>
              <div><strong>Experience:</strong> {user.experience_years ? `${user.experience_years} years` : 'N/A'}</div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Bio:</strong> {user.bio || 'N/A'}</div>
            </>
          )}
        </div>
      </div>

      {/* Student Performance */}
      {user.role === 'student' && user.performance && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{user.performance.enrolled_courses}</div>
              <div className="stat-label">Enrolled Courses</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{user.performance.lessons_completed}</div>
              <div className="stat-label">Lessons Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{user.performance.quizzes_taken}</div>
              <div className="stat-label">Quizzes Taken</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{user.performance.quizzes_passed}</div>
              <div className="stat-label">Quizzes Passed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{user.performance.avg_score}%</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>

          {/* Course Progress */}
          {user.courses && user.courses.length > 0 && (
            <div className="card">
              <h3>Course Progress</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Progress</th>
                    <th>Quizzes Taken</th>
                    <th>Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {user.courses.map(({ course, progress, quizzes_taken, avg_score }) => (
                    <tr key={course.id}>
                      <td><strong>{course.title}</strong></td>
                      <td>
                        <div className="progress-bar-container" style={{ minWidth: '120px' }}>
                          <div className="progress-bar" style={{ width: `${progress}%` }} />
                        </div>
                        <small>{progress}%</small>
                      </td>
                      <td>{quizzes_taken}</td>
                      <td>{avg_score}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quiz Attempts */}
          {user.quiz_attempts && user.quiz_attempts.length > 0 && (
            <div className="card">
              <h3>Quiz History</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Course</th>
                    <th>Score</th>
                    <th>Result</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {user.quiz_attempts.map((a) => (
                    <tr key={a.id}>
                      <td>{a.quiz_title}</td>
                      <td>{a.course_title}</td>
                      <td>{a.score}% ({a.correct_answers}/{a.total_questions})</td>
                      <td>
                        <span className={`badge ${a.passed ? 'badge-success' : 'badge-error'}`}>
                          {a.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td>{a.completed_at ? new Date(a.completed_at).toLocaleDateString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Feedback received */}
          {user.feedbacks && user.feedbacks.length > 0 && (
            <div className="card">
              <h3>Feedback from Teachers</h3>
              {user.feedbacks.map((f) => (
                <div key={f.id} className="feedback-item">
                  <div className="feedback-meta">
                    <strong>{f.teacher_name}</strong>
                    {f.course_title && <span className="badge">{f.course_title}</span>}
                    <span className="feedback-date">
                      {f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="feedback-text">{f.text}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Teacher Stats */}
      {user.role === 'teacher' && user.teacher_stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{user.teacher_stats.total_courses}</div>
              <div className="stat-label">Courses Created</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{user.teacher_stats.total_students}</div>
              <div className="stat-label">Total Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{user.teacher_stats.feedbacks_given}</div>
              <div className="stat-label">Feedbacks Given</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{user.teacher_stats.exams_scheduled}</div>
              <div className="stat-label">Exams Scheduled</div>
            </div>
          </div>

          {/* Teacher's Courses */}
          {user.courses && user.courses.length > 0 && (
            <div className="card">
              <h3>Courses Created</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Category</th>
                    <th>Lessons</th>
                    <th>Quizzes</th>
                    <th>Students</th>
                  </tr>
                </thead>
                <tbody>
                  {user.courses.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.title}</strong></td>
                      <td><span className="badge">{c.category}</span></td>
                      <td>{c.lesson_count}</td>
                      <td>{c.quiz_count}</td>
                      <td>{c.student_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
