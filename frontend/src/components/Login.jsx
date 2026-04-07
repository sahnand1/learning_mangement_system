import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingApproval(false);
    setLoading(true);
    try {
      const data = await login(username, password);
      const role = data.user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'teacher') navigate('/teacher');
      else navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.pending_approval) {
        setPendingApproval(true);
        setError(data.error);
      } else {
        setError(data?.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue learning</p>
        {pendingApproval && (
          <div className="alert alert-warning">
            ⏳ {error}
          </div>
        )}
        {error && !pendingApproval && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username or Email</label>
            <input type="text" value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username or email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p className="auth-demo">
          Admin: <strong>admin</strong> / <strong>admin123</strong><br />
          Teacher: <strong>teacher</strong> / <strong>teacher123</strong><br />
          Student: <strong>student</strong> / <strong>student123</strong>
        </p>
      </div>
    </div>
  );
}
