import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminActivityLog } from '../api';

export default function AdminActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getAdminActivityLog()
      .then((res) => setActivities(res.data.activities))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? activities
    : activities.filter((a) => a.role === filter);

  const actionIcon = (action) => {
    switch (action) {
      case 'login': return '🔑';
      case 'registered': return '🆕';
      case 'enrolled': return '📚';
      case 'lesson_completed': return '✅';
      case 'quiz_completed': return '📝';
      case 'course_created': return '📖';
      case 'feedback_given': return '💬';
      case 'exam_scheduled': return '📋';
      default: return '📌';
    }
  };

  if (loading) return <div className="loading">Loading activity log...</div>;

  return (
    <div className="admin-activity-log">
      <div className="page-header">
        <Link to="/admin" className="btn btn-outline btn-sm">← Back to Admin</Link>
        <h1>📊 Activity Log</h1>
        <p>Login and activity history of all teachers and students</p>
      </div>

      {/* Filter Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}>All ({activities.length})</button>
        <button className={`admin-tab ${filter === 'student' ? 'active' : ''}`}
          onClick={() => setFilter('student')}>Students ({activities.filter(a => a.role === 'student').length})</button>
        <button className={`admin-tab ${filter === 'teacher' ? 'active' : ''}`}
          onClick={() => setFilter('teacher')}>Teachers ({activities.filter(a => a.role === 'teacher').length})</button>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No activity recorded yet.</p></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Activity</th>
                <th>Description</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link to={`/admin/users/${a.user_id}`} style={{ fontWeight: 600 }}>
                      {a.full_name}
                    </Link>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{a.username}</div>
                  </td>
                  <td>
                    <span className={`badge ${a.role === 'teacher' ? 'badge-teacher' : ''}`}>
                      {a.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ marginRight: '0.5rem' }}>{actionIcon(a.action)}</span>
                    {a.action.replace('_', ' ')}
                  </td>
                  <td>{a.description}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
