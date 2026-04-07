import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <a href="/">🎓 LearnHub LMS</a>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            {user.role === 'admin' && (
              <>
                <a href="/admin" className="nav-admin-link">🛡️ Admin</a>
                <a href="/admin/activity" className="nav-admin-link">📊 Activity Log</a>
              </>
            )}
            {user.role === 'teacher' && (
              <a href="/teacher" className="nav-teacher-link">👨‍🏫 Teacher</a>
            )}
            {user.role === 'student' && (
              <>
                <a href="/dashboard">Dashboard</a>
                <a href="/performance">Performance</a>
              </>
            )}
            <a href="/courses">Courses</a>
            <span className="nav-user">
              Hi, {user.full_name}
              {user.role === 'admin' && <span className="badge badge-admin" style={{ marginLeft: '0.5rem' }}>Admin</span>}
              {user.role === 'teacher' && <span className="badge badge-teacher" style={{ marginLeft: '0.5rem' }}>Teacher</span>}
            </span>
            <button onClick={logout} className="btn btn-sm btn-outline">Logout</button>
          </>
        ) : (
          <>
            <a href="/courses">Courses</a>
            <a href="/login" className="btn btn-sm btn-primary">Login</a>
            <a href="/register" className="btn btn-sm btn-outline">Register</a>
          </>
        )}
      </div>
    </nav>
  );
}
