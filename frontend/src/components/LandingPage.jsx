import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useState } from 'react';
import { GraduationCap, Menu, X, BookOpen, Video, Award, Users, Clock, ShieldCheck, Sparkles, Monitor, MessageCircle } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardLink = user
    ? user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/dashboard'
    : null;

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-left">
            <a href="#" onClick={scrollToTop} className="landing-logo">
              <div className="landing-logo-icon">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="landing-logo-text">
                Learn<span className="text-green-400">Hub</span>
              </span>
            </a>
            <div className="landing-nav-links">
              <a href="#" onClick={scrollToTop} className="landing-nav-link landing-nav-link-active">Home</a>
              <Link to="/courses" className="landing-nav-link">Courses</Link>
              <Link to="/about" className="landing-nav-link">About</Link>
              <Link to="/contact" className="landing-nav-link">Contact</Link>
            </div>
          </div>
          <div className="landing-nav-right">
            {user ? (
              <Link to={dashboardLink} className="landing-login-btn">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="landing-login-btn">
                log in
              </Link>
            )}
          </div>
          <button className="landing-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="landing-mobile-menu">
            <a href="#" className="landing-mobile-link" onClick={(e) => { scrollToTop(e); setMobileOpen(false); }}>Home</a>
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

      {/* ── Hero Section ── */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          {/* Left side */}
          <div className="landing-hero-left">
            <h1 className="landing-brand">
              Learn<span className="landing-brand-accent">Hub</span>
              <span className="landing-brand-emoji">🎯</span>
            </h1>
            <h2 className="landing-tagline">The best teachers choice</h2>
            <p className="landing-subtitle">
              Easily hold your class online using the{' '}
              <span className="landing-highlight">LearnHub service</span>
            </p>
            <div className="landing-cta-row">
              <Link to="/courses" className="landing-cta-primary">
                Browse Courses
              </Link>
              <Link to="/register" className="landing-cta-secondary">
                Get Started
              </Link>
            </div>
            {/* Decorative arrow */}
            <div className="landing-arrow">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M8 8 C8 28, 20 32, 32 28" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M26 24 L32 28 L26 32" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
          </div>

          {/* Right side — learning image grid */}
          <div className="landing-hero-right">
            <div className="landing-image-grid">
              <div className="landing-grid-item landing-grid-large">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=350&fit=crop"
                  alt="Students collaborating"
                />
                <div className="landing-grid-overlay">
                  <span>Collaborative Learning</span>
                </div>
              </div>
              <div className="landing-grid-item landing-grid-small-top">
                <img
                  src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=300&h=200&fit=crop"
                  alt="Online study"
                />
                <div className="landing-grid-overlay">
                  <span>Self-Paced Study</span>
                </div>
              </div>
              <div className="landing-grid-item landing-grid-small-bottom">
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300&h=200&fit=crop"
                  alt="Classroom teaching"
                />
                <div className="landing-grid-overlay">
                  <span>Expert Instructors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features / Stats bar ── */}
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

      {/* ── Why LearnHub ── */}
      <section className="landing-why">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-badge">Why LearnHub?</span>
            <h2 className="landing-section-title">Everything you need to succeed</h2>
            <p className="landing-section-desc">
              Our platform is built with cutting-edge tools to deliver the best learning experience for students and teachers alike.
            </p>
          </div>
          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-icon landing-feature-icon-green">
                <Video className="w-5 h-5" />
              </div>
              <h3>HD Video Lessons</h3>
              <p>Stream high-quality video lectures with YouTube integration. Pause, rewind, and learn at your own pace.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon landing-feature-icon-blue">
                <Award className="w-5 h-5" />
              </div>
              <h3>Interactive Quizzes</h3>
              <p>Test your knowledge with timed quizzes, instant scoring, and detailed explanations for every question.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon landing-feature-icon-purple">
                <Monitor className="w-5 h-5" />
              </div>
              <h3>Progress Tracking</h3>
              <p>Visual dashboards show your completion rate, quiz scores, and learning streaks in real time.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon landing-feature-icon-orange">
                <Users className="w-5 h-5" />
              </div>
              <h3>Expert Teachers</h3>
              <p>Learn from verified professionals with years of industry experience and proven teaching methods.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon landing-feature-icon-pink">
                <Clock className="w-5 h-5" />
              </div>
              <h3>Learn Anytime</h3>
              <p>Access all courses 24/7 from any device. No deadlines, no pressure — just consistent growth.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon landing-feature-icon-teal">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3>Teacher Feedback</h3>
              <p>Get personalized feedback from your instructors to improve your performance and stay motivated.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="landing-how">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-badge">How It Works</span>
            <h2 className="landing-section-title">Start learning in 3 simple steps</h2>
          </div>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-number">1</div>
              <h3>Create an Account</h3>
              <p>Sign up as a student or teacher in seconds. No credit card required.</p>
            </div>
            <div className="landing-step-connector"></div>
            <div className="landing-step">
              <div className="landing-step-number">2</div>
              <h3>Enroll in Courses</h3>
              <p>Browse our catalog and enroll in courses that match your interests and goals.</p>
            </div>
            <div className="landing-step-connector"></div>
            <div className="landing-step">
              <div className="landing-step-number">3</div>
              <h3>Learn & Grow</h3>
              <p>Watch lessons, take quizzes, track your progress, and earn your way to mastery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="landing-testimonials">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-badge">What Learners Say</span>
            <h2 className="landing-section-title">Loved by thousands of students</h2>
          </div>
          <div className="landing-testimonials-grid">
            <div className="landing-testimonial-card">
              <div className="landing-testimonial-stars">★★★★★</div>
              <p>"LearnHub completely changed how I study. The video lessons are top-notch and the quizzes keep me on track."</p>
              <div className="landing-testimonial-author">
                <div className="landing-testimonial-avatar">A</div>
                <div>
                  <strong>Ananya Sharma</strong>
                  <span>Computer Science Student</span>
                </div>
              </div>
            </div>
            <div className="landing-testimonial-card">
              <div className="landing-testimonial-stars">★★★★★</div>
              <p>"As a teacher, the course creation tools are amazing. I can upload lessons, create quizzes, and track my students effortlessly."</p>
              <div className="landing-testimonial-author">
                <div className="landing-testimonial-avatar">R</div>
                <div>
                  <strong>Rahul Verma</strong>
                  <span>Web Development Instructor</span>
                </div>
              </div>
            </div>
            <div className="landing-testimonial-card">
              <div className="landing-testimonial-stars">★★★★★</div>
              <p>"The progress dashboard is incredible. I can see exactly where I stand and what I need to improve. Highly recommend!"</p>
              <div className="landing-testimonial-author">
                <div className="landing-testimonial-avatar">P</div>
                <div>
                  <strong>Priya Patel</strong>
                  <span>Digital Marketing Learner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="landing-cta-banner">
        <div className="landing-section-inner">
          <Sparkles className="landing-cta-sparkle" />
          <h2>Ready to start your learning journey?</h2>
          <p>Join thousands of learners and teachers on LearnHub today. It's free to get started.</p>
          <div className="landing-cta-row" style={{ justifyContent: 'center', marginBottom: 0 }}>
            <Link to="/register" className="landing-cta-primary">
              Create Free Account
            </Link>
            <Link to="/courses" className="landing-cta-secondary">
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-logo" style={{ marginBottom: '0.75rem' }}>
              <div className="landing-logo-icon">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="landing-logo-text">
                Learn<span className="text-green-400">Hub</span>
              </span>
            </div>
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
            <span className="landing-footer-dot">·</span>
            <Link to="/terms-and-conditions">Terms</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
