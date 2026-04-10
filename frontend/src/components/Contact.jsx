import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useState } from 'react';
import { GraduationCap, Menu, X, Mail, MapPin, Phone, Send } from 'lucide-react';

export default function Contact() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const dashboardLink = user
    ? user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/dashboard'
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="landing-page">
      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-left">
            <Link to="/" className="landing-logo">
              <div className="landing-logo-icon">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="landing-logo-text">
                Learn<span className="text-green-400">Hub</span>
              </span>
            </Link>
            <div className="landing-nav-links">
              <Link to="/" className="landing-nav-link">Home</Link>
              <Link to="/courses" className="landing-nav-link">Courses</Link>
              <Link to="/about" className="landing-nav-link">About</Link>
              <Link to="/contact" className="landing-nav-link landing-nav-link-active">Contact</Link>
            </div>
          </div>
          <div className="landing-nav-right">
            {user ? (
              <Link to={dashboardLink} className="landing-login-btn">Dashboard</Link>
            ) : (
              <Link to="/login" className="landing-login-btn">log in</Link>
            )}
          </div>
          <button className="landing-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="landing-mobile-menu">
            <Link to="/" className="landing-mobile-link" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/courses" className="landing-mobile-link" onClick={() => setMobileOpen(false)}>Courses</Link>
            <Link to="/about" className="landing-mobile-link" onClick={() => setMobileOpen(false)}>About</Link>
            <Link to="/contact" className="landing-mobile-link" onClick={() => setMobileOpen(false)}>Contact</Link>
            {user ? (
              <Link to={dashboardLink} className="landing-mobile-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            ) : (
              <Link to="/login" className="landing-mobile-link" onClick={() => setMobileOpen(false)}>Log in</Link>
            )}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="landing-section-inner">
          <span className="landing-section-badge">Contact Us</span>
          <h1 className="about-hero-title">We'd love to hear from you</h1>
          <p className="about-hero-desc">
            Have a question, suggestion, or need help? Reach out and our team will get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* ── Contact Content ── */}
      <section className="contact-section">
        <div className="landing-section-inner">
          <div className="contact-grid">
            {/* Left — Info cards */}
            <div className="contact-info">
              <div className="contact-info-card">
                <div className="landing-feature-icon landing-feature-icon-green">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4>Email Us</h4>
                  <p>support@learnhub.com</p>
                  <p className="contact-info-note">We reply within 24 hours</p>
                </div>
              </div>
              <div className="contact-info-card">
                <div className="landing-feature-icon landing-feature-icon-blue">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4>Call Us</h4>
                  <p>+91 98765 43210</p>
                  <p className="contact-info-note">Mon–Fri, 9 AM – 6 PM IST</p>
                </div>
              </div>
              <div className="contact-info-card">
                <div className="landing-feature-icon landing-feature-icon-purple">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4>Visit Us</h4>
                  <p>LearnHub HQ</p>
                  <p className="contact-info-note">Bangalore, Karnataka, India</p>
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="contact-form-wrapper">
              {submitted ? (
                <div className="contact-success">
                  <div className="contact-success-icon">✓</div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                    className="landing-cta-secondary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <h3>Send us a message</h3>
                  <div className="contact-form-row">
                    <div className="contact-field">
                      <label>Your Name</label>
                      <input type="text" placeholder="John Doe" required
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="contact-field">
                      <label>Email Address</label>
                      <input type="email" placeholder="john@example.com" required
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="contact-field">
                    <label>Subject</label>
                    <input type="text" placeholder="How can we help?" required
                      value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                  </div>
                  <div className="contact-field">
                    <label>Message</label>
                    <textarea rows="5" placeholder="Tell us more about your question or feedback..." required
                      value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
                  </div>
                  <button type="submit" className="contact-submit-btn">
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <Link to="/" className="landing-logo" style={{ marginBottom: '0.75rem' }}>
              <div className="landing-logo-icon">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="landing-logo-text">
                Learn<span className="text-green-400">Hub</span>
              </span>
            </Link>
            <p>Empowering learners and educators with a modern, intuitive online learning platform.</p>
          </div>
          <div className="landing-footer-links">
            <h4>Platform</h4>
            <Link to="/courses">Courses</Link>
            <Link to="/register">Sign Up</Link>
            <Link to="/login">Log In</Link>
          </div>
          <div className="landing-footer-links">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="landing-footer-links">
            <h4>Legal</h4>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms & Conditions</Link>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>&copy; 2026 LearnHub. All rights reserved.</span>
          <span className="landing-footer-legal-links">
            <Link to="/privacy-policy">Privacy</Link>
            <span className="landing-footer-dot">&middot;</span>
            <Link to="/terms-and-conditions">Terms</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
