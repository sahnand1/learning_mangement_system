import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    full_name: '', username: '', email: '', password: '', role: 'student',
    qualification: '', specialization: '', experience_years: '', bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(form);
      if (res.pending) {
        setPendingMessage(res.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (pendingMessage) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2>Registration Submitted!</h2>
            <p className="auth-subtitle" style={{ marginTop: '1rem', lineHeight: '1.8' }}>
              {pendingMessage}
            </p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Start your learning journey</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>I want to register as</label>
            <div className="role-selector">
              <button type="button"
                className={`role-btn ${form.role === 'student' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'student' })}>
                🎓 Student
              </button>
              <button type="button"
                className={`role-btn ${form.role === 'teacher' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'teacher' })}>
                👨‍🏫 Teacher
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={form.full_name} onChange={update('full_name')}
              placeholder="Your full name" required />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={form.username} onChange={update('username')}
              placeholder="Choose a username" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={update('email')}
              placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={update('password')}
              placeholder="Min 6 characters" required />
          </div>

          {form.role === 'teacher' && (
            <>
              <div className="teacher-fields-divider">Teacher Details</div>
              <div className="form-group">
                <label>Qualification *</label>
                <input type="text" value={form.qualification} onChange={update('qualification')}
                  placeholder="e.g., M.Tech Computer Science" required />
              </div>
              <div className="form-group">
                <label>Specialization *</label>
                <input type="text" value={form.specialization} onChange={update('specialization')}
                  placeholder="e.g., Web Development, Data Science" required />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input type="number" value={form.experience_years} onChange={update('experience_years')}
                  placeholder="e.g., 5" min="0" />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea value={form.bio} onChange={update('bio')}
                  placeholder="Tell us about your teaching experience..." rows={3} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating...' : `Register as ${form.role === 'teacher' ? 'Teacher' : 'Student'}`}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
