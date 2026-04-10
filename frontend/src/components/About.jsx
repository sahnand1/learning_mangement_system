import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useState } from 'react';
import { GraduationCap, Menu, X, BookOpen, Users, Award, Globe, Target, Heart } from 'lucide-react';

export default function About() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardLink = user
    ? user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/dashboard'
    : null;

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
              <Link to="/about" className="landing-nav-link landing-nav-link-active">About</Link>
              <Link to="/contact" className="landing-nav-link">Contact</Link>
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
          <span className="landing-section-badge">About Us</span>
          <h1 className="about-hero-title">Empowering education,<br />one lesson at a time</h1>
          <p className="about-hero-desc">
            LearnHub is a modern learning management platform built to make quality education
            accessible, interactive, and enjoyable for everyone — students and teachers alike.
          </p>
        </div>
      </section>

      {/* ── Mission / Vision / Values ── */}
      <section className="about-values">
        <div className="landing-section-inner">
          <div className="about-values-grid">
            <div className="about-value-card">
              <div className="landing-feature-icon landing-feature-icon-green">
                <Target className="w-5 h-5" />
              </div>
              <h3>Our Mission</h3>
              <p>
                To democratize education by providing a platform where passionate teachers can share
                their expertise and curious learners can grow without barriers. We believe great education
                shouldn't be limited by geography, finances, or time.
              </p>
            </div>
            <div className="about-value-card">
              <div className="landing-feature-icon landing-feature-icon-blue">
                <Globe className="w-5 h-5" />
              </div>
              <h3>Our Vision</h3>
              <p>
                To become the most trusted and user-friendly online learning platform, where every student
                has the tools to succeed and every teacher has the freedom to inspire. We envision a world
                where lifelong learning is the norm.
              </p>
            </div>
            <div className="about-value-card">
              <div className="landing-feature-icon landing-feature-icon-pink">
                <Heart className="w-5 h-5" />
              </div>
              <h3>Our Values</h3>
              <p>
                Accessibility, quality, and community drive everything we do. We prioritize a seamless user
                experience, rigorous content standards, and a supportive environment where both learners and
                educators thrive together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What We Offer ── */}
      <section className="about-offer">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-badge">What We Offer</span>
            <h2 className="landing-section-title">A complete learning ecosystem</h2>
          </div>
          <div className="about-offer-grid">
            <div className="about-offer-item">
              <BookOpen className="w-6 h-6 text-green-400" />
              <div>
                <h4>Structured Courses</h4>
                <p>Courses organized with sequential lessons, video content, and supplementary materials for focused learning paths.</p>
              </div>
            </div>
            <div className="about-offer-item">
              <Award className="w-6 h-6 text-blue-400" />
              <div>
                <h4>Interactive Assessments</h4>
                <p>Timed quizzes with multiple-choice questions, instant scoring, pass/fail criteria, and detailed explanations.</p>
              </div>
            </div>
            <div className="about-offer-item">
              <Users className="w-6 h-6 text-purple-400" />
              <div>
                <h4>Verified Teachers</h4>
                <p>All teachers go through an approval process. Their qualifications, experience, and specializations are verified by admins.</p>
              </div>
            </div>
            <div className="about-offer-item">
              <Target className="w-6 h-6 text-orange-400" />
              <div>
                <h4>Progress Tracking</h4>
                <p>Real-time dashboards with completion rates, quiz scores, learning streaks, and activity history to keep you on track.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="landing-stats">
        <div className="landing-stats-inner">
          <div className="landing-stat-item">
            <span className="landing-stat-number">200+</span>
            <span className="landing-stat-label">Active Courses</span>
          </div>
          <div className="landing-stat-divider"></div>
          <div className="landing-stat-item">
            <span className="landing-stat-number">50+</span>
            <span className="landing-stat-label">Expert Teachers</span>
          </div>
          <div className="landing-stat-divider"></div>
          <div className="landing-stat-item">
            <span className="landing-stat-number">10k+</span>
            <span className="landing-stat-label">Students Enrolled</span>
          </div>
          <div className="landing-stat-divider"></div>
          <div className="landing-stat-item">
            <span className="landing-stat-number">95%</span>
            <span className="landing-stat-label">Satisfaction Rate</span>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta-banner">
        <div className="landing-section-inner" style={{ textAlign: 'center' }}>
          <h2>Want to be part of LearnHub?</h2>
          <p>Whether you're a learner seeking knowledge or a teacher ready to inspire — we'd love to have you.</p>
          <div className="landing-cta-row" style={{ justifyContent: 'center', marginBottom: 0 }}>
            <Link to="/register" className="landing-cta-primary">Join Now — It's Free</Link>
            <Link to="/contact" className="landing-cta-secondary">Get in Touch</Link>
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
