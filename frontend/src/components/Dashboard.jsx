import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, getStudentFeedbacks } from '../api';
import { useAuth } from '../AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getStudentFeedbacks(),
    ])
      .then(([dashRes, fbRes]) => {
        setData(dashRes.data);
        setFeedbacks(fbRes.data.feedbacks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!data) return <div className="error-msg">Failed to load dashboard</div>;

  const { stats, enrolled_courses } = data;

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Welcome back, {user?.full_name}!</h1>
        <p>Here's your learning overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.enrolled_courses}</div>
          <div className="stat-label">Enrolled Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.lessons_completed}</div>
          <div className="stat-label">Lessons Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.quizzes_taken}</div>
          <div className="stat-label">Quizzes Taken</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.avg_score}%</div>
          <div className="stat-label">Average Score</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>My Courses</h3>
          {enrolled_courses.length === 0 ? (
            <div className="empty-state">
              <p>You haven't enrolled in any courses yet.</p>
              <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
            </div>
          ) : (
            <div className="course-list-mini">
              {enrolled_courses.map((c) => (
                <Link to={`/courses/${c.id}`} key={c.id} className="course-item-mini">
                  <div className="course-item-info">
                    <strong>{c.title}</strong>
                    <span className="badge">{c.category}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${c.progress}%` }} />
                  </div>
                  <span className="progress-text">{c.progress}% complete</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3>💬 Feedback from Teachers</h3>
          {feedbacks.length === 0 ? (
            <p className="text-muted">No feedback received yet.</p>
          ) : (
            <div>
              {feedbacks.slice(0, 5).map((f) => (
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
        </div>
      </div>
    </div>
  );
}
