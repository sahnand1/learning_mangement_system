import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getPendingUsers, getAllUsers, getAdminStudentsPerformance, approveUser, rejectUser } from '../api';

export default function AdminDashboard() {
  const [tab, setTab] = useState('pending');
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [studentsPerf, setStudentsPerf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, allRes, perfRes] = await Promise.all([
        getAdminStats(),
        getPendingUsers(),
        getAllUsers(),
        getAdminStudentsPerformance(),
      ]);
      setStats(statsRes.data);
      setPendingUsers(pendingRes.data.users);
      setAllUsers(allRes.data.users);
      setStudentsPerf(perfRes.data.students);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    setMessage('');
    try {
      const res = await approveUser(userId);
      setMessage(res.data.message);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      setAllUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_approved: true } : u));
      if (stats) {
        setStats({
          ...stats,
          pending_approvals: stats.pending_approvals - 1,
          approved_students: stats.approved_students + 1,
        });
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (user) => {
    setRejectModal(user);
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id);
    setMessage('');
    try {
      const res = await rejectUser(rejectModal.id, rejectReason);
      setMessage(res.data.message);
      setPendingUsers((prev) => prev.filter((u) => u.id !== rejectModal.id));
      setAllUsers((prev) => prev.filter((u) => u.id !== rejectModal.id));
      if (stats) {
        setStats({
          ...stats,
          pending_approvals: Math.max(0, stats.pending_approvals - 1),
          total_students: Math.max(0, stats.total_students - 1),
        });
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Rejection failed');
    } finally {
      setActionLoading(null);
      setRejectModal(null);
    }
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Manage students, approve registrations, and monitor platform activity</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.pending_approvals}</div>
            <div className="stat-label">Pending Approvals</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.approved_students}</div>
            <div className="stat-label">Approved Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.approved_teachers}</div>
            <div className="stat-label">Approved Teachers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_courses}</div>
            <div className="stat-label">Total Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_enrollments}</div>
            <div className="stat-label">Total Enrollments</div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          ✅ {message}
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === 'pending' ? 'active' : ''}`}
          onClick={() => setTab('pending')}
        >
          Pending Approvals ({pendingUsers.length})
        </button>
        <button
          className={`admin-tab ${tab === 'all' ? 'active' : ''}`}
          onClick={() => setTab('all')}
        >
          All Users ({allUsers.length})
        </button>
        <button
          className={`admin-tab ${tab === 'performance' ? 'active' : ''}`}
          onClick={() => setTab('performance')}
        >
          Student Performance
        </button>
      </div>

      {/* Pending Users Tab */}
      {tab === 'pending' && (
        <div className="card">
          {pendingUsers.length === 0 ? (
            <div className="empty-state">
              <p>✅ No pending registrations</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.full_name}</strong>
                      {u.role === 'teacher' && u.qualification && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          {u.qualification} • {u.specialization}
                          {u.experience_years ? ` • ${u.experience_years}yr exp` : ''}
                        </div>
                      )}
                    </td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'teacher' ? 'badge-teacher' : ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="admin-actions">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleApprove(u.id)}
                        disabled={actionLoading === u.id}
                      >
                        {actionLoading === u.id ? '...' : '✓ Approve'}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => openRejectModal(u)}
                        disabled={actionLoading === u.id}
                      >
                        ✗ Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* All Users Tab */}
      {tab === 'all' && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.full_name}</strong></td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-admin' : u.role === 'teacher' ? 'badge-teacher' : ''}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_approved ? 'badge-success' : 'badge-pending'}`}>
                      {u.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <Link to={`/admin/users/${u.id}`} className="btn btn-sm btn-primary">
                        View Profile
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Performance Tab */}
      {tab === 'performance' && (
        <div className="card">
          {studentsPerf.length === 0 ? (
            <div className="empty-state"><p>No approved students yet.</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Enrolled</th>
                  <th>Lessons</th>
                  <th>Quizzes</th>
                  <th>Passed</th>
                  <th>Avg Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentsPerf.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.full_name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{s.username}</div>
                    </td>
                    <td>{s.enrolled_courses}</td>
                    <td>{s.lessons_completed}</td>
                    <td>{s.quizzes_taken}</td>
                    <td>{s.quizzes_passed}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: s.avg_score >= 60 ? 'var(--success)' : s.avg_score > 0 ? 'var(--error)' : 'var(--text-muted)' }}>
                        {s.avg_score}%
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/users/${s.id}`} className="btn btn-sm btn-primary">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Registration</h3>
            <p>Reject <strong>{rejectModal.full_name}</strong> ({rejectModal.email})?</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              This will delete their account and send a rejection email.
            </p>
            <div className="form-group">
              <label>Reason (optional)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                rows={3}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setRejectModal(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={actionLoading === rejectModal.id}
              >
                {actionLoading === rejectModal.id ? 'Rejecting...' : 'Reject & Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
