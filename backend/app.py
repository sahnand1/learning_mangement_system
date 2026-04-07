"""
LMS Website — REST API Backend
Flask API serving the React.js frontend.

Run:   cd backend && python app.py       (API at http://localhost:5000)
React: cd frontend && npm run dev        (Frontend at http://localhost:5173)
Demo:  student / student123
"""

import os
import secrets
import smtplib
from datetime import datetime
from html import escape as html_escape
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from functools import wraps

from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

# ── App Config ──────────────────────────────────────────────
app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///lms.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Email Config (from environment variables)
app.config['MAIL_SENDER'] = os.environ.get('MAIL_SENDER', '')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', '')
app.config['MAIL_SMTP_HOST'] = os.environ.get('MAIL_SMTP_HOST', 'smtp.gmail.com')
app.config['MAIL_SMTP_PORT'] = int(os.environ.get('MAIL_SMTP_PORT', 587))

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')

# Fix Render PostgreSQL URL (postgres:// -> postgresql://)
if app.config['SQLALCHEMY_DATABASE_URI'].startswith('postgres://'):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace(
        'postgres://', 'postgresql://', 1
    )

db = SQLAlchemy(app)

ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:5174').split(',')
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Simple token store
active_tokens = {}

# ══════════════════════════════════════════════════════════════
#  DATABASE MODELS
# ══════════════════════════════════════════════════════════════

enrollments = db.Table('enrollments',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('course_id', db.Integer, db.ForeignKey('course.id'), primary_key=True),
    db.Column('enrolled_at', db.DateTime, default=datetime.utcnow)
)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(20), default='student')  # student, teacher, admin
    is_approved = db.Column(db.Boolean, default=False)
    approved_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Teacher-specific fields
    qualification = db.Column(db.String(200), nullable=True)
    experience_years = db.Column(db.Integer, nullable=True)
    specialization = db.Column(db.String(200), nullable=True)
    bio = db.Column(db.Text, nullable=True)

    enrolled_courses = db.relationship('Course', secondary=enrollments, backref='students')
    quiz_attempts = db.relationship('QuizAttempt', backref='student', lazy='dynamic')
    activities = db.relationship('Activity', backref='user', lazy='dynamic',
                                 order_by='Activity.timestamp.desc()')
    lesson_progress = db.relationship('LessonProgress', backref='user', lazy='dynamic')
    created_courses = db.relationship('Course', backref='teacher', lazy='dynamic',
                                      foreign_keys='Course.teacher_id')
    feedbacks_given = db.relationship('Feedback', backref='teacher', lazy='dynamic',
                                      foreign_keys='Feedback.teacher_id')

    def set_password(self, pw):
        self.password_hash = generate_password_hash(pw)

    def check_password(self, pw):
        return check_password_hash(self.password_hash, pw)

    def get_course_progress(self, course):
        total = Lesson.query.filter_by(course_id=course.id).count()
        if total == 0:
            return 0
        done = LessonProgress.query.filter_by(
            user_id=self.id, completed=True
        ).join(Lesson).filter(Lesson.course_id == course.id).count()
        return int(done / total * 100)

    def to_dict(self):
        d = {'id': self.id, 'username': self.username, 'email': self.email,
             'full_name': self.full_name, 'role': self.role,
             'is_approved': self.is_approved,
             'created_at': self.created_at.isoformat() if self.created_at else None}
        if self.role == 'teacher':
            d['qualification'] = self.qualification
            d['experience_years'] = self.experience_years
            d['specialization'] = self.specialization
            d['bio'] = self.bio
        return d


class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    thumbnail = db.Column(db.String(300), default='')
    instructor_name = db.Column(db.String(100), default='Instructor')
    category = db.Column(db.String(50))
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    lessons = db.relationship('Lesson', backref='course', lazy='dynamic',
                              order_by='Lesson.order')
    quizzes = db.relationship('Quiz', backref='course', lazy='dynamic')

    def to_dict(self, include_lessons=False):
        d = {'id': self.id, 'title': self.title, 'description': self.description,
             'thumbnail': self.thumbnail, 'instructor_name': self.instructor_name,
             'category': self.category, 'lesson_count': self.lessons.count(),
             'quiz_count': self.quizzes.count(), 'student_count': len(self.students),
             'teacher_id': self.teacher_id}
        if include_lessons:
            d['lessons'] = [l.to_dict() for l in self.lessons.all()]
            d['quizzes'] = [q.to_dict() for q in self.quizzes.all()]
        return d


class Lesson(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    video_url = db.Column(db.String(500))
    duration_minutes = db.Column(db.Integer, default=0)
    order = db.Column(db.Integer, default=0)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)

    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'description': self.description,
                'video_url': self.video_url, 'duration_minutes': self.duration_minutes,
                'order': self.order, 'course_id': self.course_id}


class LessonProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lesson.id'), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)


class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    time_limit_minutes = db.Column(db.Integer, default=0)
    pass_percentage = db.Column(db.Integer, default=60)

    questions = db.relationship('Question', backref='quiz', lazy='dynamic',
                                order_by='Question.order')
    attempts = db.relationship('QuizAttempt', backref='quiz', lazy='dynamic')

    def to_dict(self, include_questions=False):
        d = {'id': self.id, 'title': self.title, 'description': self.description,
             'course_id': self.course_id, 'time_limit_minutes': self.time_limit_minutes,
             'pass_percentage': self.pass_percentage,
             'question_count': self.questions.count()}
        if include_questions:
            d['questions'] = [q.to_dict() for q in self.questions.all()]
        return d


class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(300), nullable=False)
    option_b = db.Column(db.String(300), nullable=False)
    option_c = db.Column(db.String(300), nullable=False)
    option_d = db.Column(db.String(300), nullable=False)
    correct_answer = db.Column(db.String(1), nullable=False)
    explanation = db.Column(db.Text)
    order = db.Column(db.Integer, default=0)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)

    def to_dict(self, hide_answer=True):
        d = {'id': self.id, 'text': self.text,
             'options': {'A': self.option_a, 'B': self.option_b,
                         'C': self.option_c, 'D': self.option_d}}
        if not hide_answer:
            d['correct_answer'] = self.correct_answer
            d['explanation'] = self.explanation
        return d


class QuizAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    score = db.Column(db.Float, default=0)
    total_questions = db.Column(db.Integer, default=0)
    correct_answers = db.Column(db.Integer, default=0)
    passed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {'id': self.id, 'quiz_id': self.quiz_id,
                'quiz_title': self.quiz.title,
                'course_title': self.quiz.course.title,
                'score': self.score, 'total_questions': self.total_questions,
                'correct_answers': self.correct_answers, 'passed': self.passed,
                'completed_at': self.completed_at.isoformat() if self.completed_at else None}


class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(300))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {'id': self.id, 'action': self.action,
                'description': self.description,
                'timestamp': self.timestamp.isoformat() if self.timestamp else None}


class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=True)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', foreign_keys=[student_id], backref='feedbacks_received')
    course = db.relationship('Course', backref='feedbacks')

    def to_dict(self):
        return {
            'id': self.id, 'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.full_name,
            'student_id': self.student_id,
            'student_name': self.student.full_name,
            'course_id': self.course_id,
            'course_title': self.course.title if self.course else None,
            'text': self.text,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class ScheduledExam(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    scheduled_date = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, default=60)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    teacher_user = db.relationship('User', backref='scheduled_exams')
    quiz = db.relationship('Quiz', backref='scheduled_exams')
    course_rel = db.relationship('Course', backref='scheduled_exams')

    def to_dict(self):
        return {
            'id': self.id, 'teacher_id': self.teacher_id,
            'quiz_id': self.quiz_id, 'quiz_title': self.quiz.title,
            'course_id': self.course_id, 'course_title': self.course_rel.title,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'duration_minutes': self.duration_minutes,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ══════════════════════════════════════════════════════════════
#  AUTH HELPERS
# ══════════════════════════════════════════════════════════════

def generate_token(user_id):
    token = secrets.token_hex(32)
    active_tokens[token] = user_id
    return token


def get_current_user():
    auth = request.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        uid = active_tokens.get(auth[7:])
        if uid:
            return db.session.get(User, uid)
    return None


def login_required_api(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated


def log_activity(uid, action, desc):
    db.session.add(Activity(user_id=uid, action=action, description=desc))
    db.session.commit()


def admin_required_api(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        request.current_user = user
        return f(*args, **kwargs)
    return decorated


def teacher_required_api(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        if user.role != 'teacher':
            return jsonify({'error': 'Teacher access required'}), 403
        request.current_user = user
        return f(*args, **kwargs)
    return decorated


# ══════════════════════════════════════════════════════════════
#  EMAIL SERVICE
# ══════════════════════════════════════════════════════════════

def send_approval_email(to_email, full_name):
    """Send approval notification email via Gmail SMTP."""
    try:
        sender = app.config['MAIL_SENDER']
        password = app.config['MAIL_PASSWORD']

        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Your LearnHub LMS Account Has Been Approved!'
        msg['From'] = sender
        msg['To'] = to_email

        html = f"""
        <html>
        <body style="font-family: 'Inter', Arial, sans-serif; background: #f8fafc; padding: 40px 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 40px; border: 1px solid #e2e8f0;">
            <h1 style="color: #4f46e5; text-align: center; margin-bottom: 8px;">🎓 LearnHub LMS</h1>
            <h2 style="text-align: center; color: #1e293b; margin-bottom: 24px;">Account Approved!</h2>
            <p style="color: #334155; font-size: 16px;">Hi <strong>{full_name}</strong>,</p>
            <p style="color: #334155; font-size: 16px;">
              Great news! Your LearnHub LMS account has been approved by the administrator.
              You can now log in and start your learning journey.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="{FRONTEND_URL}/login"
                 style="background: #4f46e5; color: #fff; padding: 12px 32px;
                        border-radius: 8px; text-decoration: none; font-weight: 600;
                        font-size: 16px;">
                Log In Now
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center;">
              Start exploring courses, watch lessons, and take quizzes to track your progress.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              This email was sent from LearnHub LMS. If you did not register, please ignore this email.
            </p>
          </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP(app.config['MAIL_SMTP_HOST'], app.config['MAIL_SMTP_PORT']) as server:
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, to_email, msg.as_string())

        print(f'  ✉ Approval email sent to {to_email}')
        return True
    except Exception as e:
        print(f'  ✉ Email send failed: {e}')
        return False


def send_rejection_email(to_email, full_name, reason=''):
    """Send rejection notification email via Gmail SMTP."""
    try:
        sender = app.config['MAIL_SENDER']
        password = app.config['MAIL_PASSWORD']

        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'LearnHub LMS — Registration Update'
        msg['From'] = sender
        msg['To'] = to_email

        reason_safe = html_escape(reason)
        reason_html = f'<p style="color: #334155; font-size: 16px;"><strong>Reason:</strong> {reason_safe}</p>' if reason else ''

        html = f"""
        <html>
        <body style="font-family: 'Inter', Arial, sans-serif; background: #f8fafc; padding: 40px 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 40px; border: 1px solid #e2e8f0;">
            <h1 style="color: #4f46e5; text-align: center; margin-bottom: 8px;">🎓 LearnHub LMS</h1>
            <h2 style="text-align: center; color: #1e293b; margin-bottom: 24px;">Registration Update</h2>
            <p style="color: #334155; font-size: 16px;">Hi <strong>{full_name}</strong>,</p>
            <p style="color: #334155; font-size: 16px;">
              We regret to inform you that your registration request for LearnHub LMS
              has not been approved at this time.
            </p>
            {reason_html}
            <p style="color: #334155; font-size: 16px;">
              If you believe this was a mistake, please contact the administrator.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              This email was sent from LearnHub LMS.
            </p>
          </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP(app.config['MAIL_SMTP_HOST'], app.config['MAIL_SMTP_PORT']) as server:
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, to_email, msg.as_string())

        print(f'  ✉ Rejection email sent to {to_email}')
        return True
    except Exception as e:
        print(f'  ✉ Email send failed: {e}')
        return False


def send_teacher_selection_email(to_email, full_name):
    """Send formal teacher selection email via Gmail SMTP."""
    try:
        sender = app.config['MAIL_SENDER']
        password = app.config['MAIL_PASSWORD']

        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Congratulations! You Have Been Selected as a Teacher — LearnHub LMS'
        msg['From'] = sender
        msg['To'] = to_email

        html = f"""
        <html>
        <body style="font-family: 'Inter', Arial, sans-serif; background: #f8fafc; padding: 40px 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 40px; border: 1px solid #e2e8f0;">
            <h1 style="color: #4f46e5; text-align: center; margin-bottom: 8px;">🎓 LearnHub LMS</h1>
            <h2 style="text-align: center; color: #1e293b; margin-bottom: 24px;">🎉 Congratulations, You're Selected!</h2>
            <p style="color: #334155; font-size: 16px;">Dear <strong>{full_name}</strong>,</p>
            <p style="color: #334155; font-size: 16px;">
              We are pleased to inform you that your application to join LearnHub LMS as a
              <strong>Teacher</strong> has been reviewed and <strong>approved</strong> by the administrator.
            </p>
            <p style="color: #334155; font-size: 16px;">
              You have been officially selected as a teacher on our platform. You can now:
            </p>
            <ul style="color: #334155; font-size: 15px; line-height: 1.8;">
              <li>Create and manage courses</li>
              <li>Add lessons and quizzes</li>
              <li>Schedule exams for students</li>
              <li>View student profiles and performance</li>
              <li>Provide feedback to students</li>
            </ul>
            <div style="text-align: center; margin: 32px 0;">
              <a href="{FRONTEND_URL}/login"
                 style="background: #4f46e5; color: #fff; padding: 12px 32px;
                        border-radius: 8px; text-decoration: none; font-weight: 600;
                        font-size: 16px;">
                Log In to Your Teacher Dashboard
              </a>
            </div>
            <p style="color: #334155; font-size: 16px;">
              We look forward to having you as part of our teaching community. Welcome aboard!
            </p>
            <p style="color: #334155; font-size: 16px;">
              Warm regards,<br>
              <strong>LearnHub LMS Administration</strong>
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              This is an official communication from LearnHub LMS. If you did not apply, please ignore this email.
            </p>
          </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP(app.config['MAIL_SMTP_HOST'], app.config['MAIL_SMTP_PORT']) as server:
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, to_email, msg.as_string())

        print(f'  ✉ Teacher selection email sent to {to_email}')
        return True
    except Exception as e:
        print(f'  ✉ Email send failed: {e}')
        return False


# ══════════════════════════════════════════════════════════════
#  API — AUTH
# ══════════════════════════════════════════════════════════════

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400

    full_name = (data.get('full_name') or '').strip()
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip()
    password = data.get('password', '')
    role = (data.get('role') or 'student').strip()

    if role not in ('student', 'teacher'):
        return jsonify({'error': 'Invalid role. Must be student or teacher.'}), 400

    errors = []
    if not full_name:
        errors.append('Full name is required.')
    if not username or len(username) < 3:
        errors.append('Username must be at least 3 characters.')
    if not email or '@' not in email:
        errors.append('Valid email is required.')
    if len(password) < 8:
        errors.append('Password must be at least 8 characters.')
    if User.query.filter_by(username=username).first():
        errors.append('Username already taken.')
    if User.query.filter_by(email=email).first():
        errors.append('Email already registered.')

    # Teacher-specific validation
    if role == 'teacher':
        qualification = (data.get('qualification') or '').strip()
        specialization = (data.get('specialization') or '').strip()
        experience_years = data.get('experience_years')
        bio = (data.get('bio') or '').strip()
        if not qualification:
            errors.append('Qualification is required for teachers.')
        if not specialization:
            errors.append('Specialization is required for teachers.')

    if errors:
        return jsonify({'error': errors[0], 'errors': errors}), 400

    user = User(full_name=full_name, username=username, email=email,
                role=role, is_approved=False)
    user.set_password(password)

    if role == 'teacher':
        user.qualification = qualification
        user.specialization = specialization
        user.experience_years = int(experience_years) if experience_years else None
        user.bio = bio

    db.session.add(user)
    db.session.commit()
    role_label = 'Teacher' if role == 'teacher' else 'Student'
    log_activity(user.id, 'registered', f'{full_name} registered as {role_label} (pending approval)')
    return jsonify({
        'message': f'Registration submitted! Your {role_label.lower()} account is pending admin approval. '
                   'You will receive an email once approved.',
        'pending': True
    }), 201


@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400
    username = (data.get('username') or '').strip()
    password = data.get('password', '')
    user = User.query.filter(
        (User.username == username) | (User.email == username)
    ).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401
    if not user.is_approved:
        return jsonify({
            'error': 'Your account is pending admin approval. Please wait for the approval email.',
            'pending_approval': True
        }), 403
    token = generate_token(user.id)
    log_activity(user.id, 'login', 'Logged in')
    return jsonify({'token': token, 'user': user.to_dict()})


@app.route('/api/me', methods=['GET'])
@login_required_api
def api_me():
    return jsonify({'user': request.current_user.to_dict()})


@app.route('/api/logout', methods=['POST'])
@login_required_api
def api_logout():
    auth = request.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        active_tokens.pop(auth[7:], None)
    return jsonify({'message': 'Logged out'})

# ══════════════════════════════════════════════════════════════
#  API — COURSES
# ══════════════════════════════════════════════════════════════

@app.route('/api/courses', methods=['GET'])
def api_courses():
    courses = Course.query.all()
    result = []
    user = get_current_user()
    for c in courses:
        d = c.to_dict()
        if user:
            d['is_enrolled'] = c in user.enrolled_courses
            d['progress'] = user.get_course_progress(c)
        else:
            d['is_enrolled'] = False
            d['progress'] = 0
        result.append(d)
    return jsonify({'courses': result})


@app.route('/api/courses/<int:cid>', methods=['GET'])
def api_course_detail(cid):
    course = db.session.get(Course, cid)
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    d = course.to_dict(include_lessons=True)
    user = get_current_user()
    if user:
        d['is_enrolled'] = course in user.enrolled_courses
        d['progress'] = user.get_course_progress(course)
        d['completed_lesson_ids'] = [
            lp.lesson_id for lp in
            LessonProgress.query.filter_by(user_id=user.id, completed=True).all()
        ]
    else:
        d['is_enrolled'] = False
        d['progress'] = 0
        d['completed_lesson_ids'] = []
    return jsonify(d)


@app.route('/api/courses/<int:cid>/enroll', methods=['POST'])
@login_required_api
def api_enroll(cid):
    course = db.session.get(Course, cid)
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    user = request.current_user
    if user.role != 'student':
        return jsonify({'error': 'Only students can enroll in courses'}), 403
    if course not in user.enrolled_courses:
        user.enrolled_courses.append(course)
        db.session.commit()
        log_activity(user.id, 'enrolled', f'Enrolled in "{course.title}"')
    return jsonify({'message': f'Enrolled in {course.title}', 'is_enrolled': True})

# ══════════════════════════════════════════════════════════════
#  API — LESSONS
# ══════════════════════════════════════════════════════════════

@app.route('/api/lessons/<int:lid>', methods=['GET'])
@login_required_api
def api_lesson(lid):
    lesson = db.session.get(Lesson, lid)
    if not lesson:
        return jsonify({'error': 'Lesson not found'}), 404
    course = lesson.course
    user = request.current_user
    if course not in user.enrolled_courses:
        return jsonify({'error': 'Not enrolled in this course'}), 403

    all_lessons = course.lessons.all()
    completed_ids = [lp.lesson_id for lp in
                     LessonProgress.query.filter_by(user_id=user.id, completed=True).all()]
    idx = next((i for i, l in enumerate(all_lessons) if l.id == lesson.id), 0)
    prev_id = all_lessons[idx - 1].id if idx > 0 else None
    next_id = all_lessons[idx + 1].id if idx < len(all_lessons) - 1 else None
    prog = LessonProgress.query.filter_by(user_id=user.id, lesson_id=lesson.id).first()

    return jsonify({
        'lesson': lesson.to_dict(),
        'course': {'id': course.id, 'title': course.title},
        'all_lessons': [l.to_dict() for l in all_lessons],
        'completed_lesson_ids': completed_ids,
        'is_completed': prog.completed if prog else False,
        'prev_lesson_id': prev_id, 'next_lesson_id': next_id,
    })


@app.route('/api/lessons/<int:lid>/complete', methods=['POST'])
@login_required_api
def api_complete_lesson(lid):
    lesson = db.session.get(Lesson, lid)
    if not lesson:
        return jsonify({'error': 'Lesson not found'}), 404
    user = request.current_user
    prog = LessonProgress.query.filter_by(user_id=user.id, lesson_id=lesson.id).first()
    if not prog:
        prog = LessonProgress(user_id=user.id, lesson_id=lesson.id)
        db.session.add(prog)
    if not prog.completed:
        prog.completed = True
        prog.completed_at = datetime.utcnow()
        db.session.commit()
        log_activity(user.id, 'lesson_completed',
                     f'Completed "{lesson.title}" in "{lesson.course.title}"')
    all_lessons = lesson.course.lessons.all()
    idx = next((i for i, l in enumerate(all_lessons) if l.id == lesson.id), 0)
    next_id = all_lessons[idx + 1].id if idx < len(all_lessons) - 1 else None
    return jsonify({'message': 'Lesson completed', 'next_lesson_id': next_id})

# ══════════════════════════════════════════════════════════════
#  API — QUIZZES
# ══════════════════════════════════════════════════════════════

@app.route('/api/quizzes/<int:qid>', methods=['GET'])
@login_required_api
def api_quiz(qid):
    quiz = db.session.get(Quiz, qid)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    attempts = QuizAttempt.query.filter_by(
        user_id=request.current_user.id, quiz_id=quiz.id
    ).order_by(QuizAttempt.completed_at.desc()).all()
    return jsonify({
        'quiz': quiz.to_dict(),
        'course': {'id': quiz.course.id, 'title': quiz.course.title},
        'past_attempts': [a.to_dict() for a in attempts],
    })


@app.route('/api/quizzes/<int:qid>/questions', methods=['GET'])
@login_required_api
def api_quiz_questions(qid):
    quiz = db.session.get(Quiz, qid)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    return jsonify({
        'quiz': quiz.to_dict(),
        'questions': [q.to_dict(hide_answer=True) for q in quiz.questions.all()],
    })


@app.route('/api/quizzes/<int:qid>/submit', methods=['POST'])
@login_required_api
def api_quiz_submit(qid):
    quiz = db.session.get(Quiz, qid)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    data = request.get_json()
    answers = data.get('answers', {})
    questions = quiz.questions.all()
    correct = 0
    total = len(questions)
    results = []
    for q in questions:
        ua = answers.get(str(q.id), '').upper()
        ok = ua == q.correct_answer
        if ok:
            correct += 1
        results.append({
            'question_id': q.id, 'question': q.text,
            'user_answer': ua, 'correct_answer': q.correct_answer,
            'is_correct': ok, 'explanation': q.explanation,
            'options': {'A': q.option_a, 'B': q.option_b,
                        'C': q.option_c, 'D': q.option_d},
        })
    score = (correct / total * 100) if total > 0 else 0
    passed = score >= quiz.pass_percentage
    attempt = QuizAttempt(
        user_id=request.current_user.id, quiz_id=quiz.id,
        score=round(score, 1), total_questions=total,
        correct_answers=correct, passed=passed, completed_at=datetime.utcnow()
    )
    db.session.add(attempt)
    db.session.commit()
    log_activity(request.current_user.id, 'quiz_completed',
                 f'Scored {score:.0f}% on "{quiz.title}"')
    return jsonify({
        'score': round(score, 1), 'correct': correct, 'total': total,
        'passed': passed, 'pass_percentage': quiz.pass_percentage,
        'results': results, 'attempt_id': attempt.id,
    })

# ══════════════════════════════════════════════════════════════
#  API — DASHBOARD & PERFORMANCE
# ══════════════════════════════════════════════════════════════

@app.route('/api/dashboard', methods=['GET'])
@login_required_api
def api_dashboard():
    user = request.current_user
    attempts = user.quiz_attempts.all()
    total_q = len(attempts)
    passed_q = sum(1 for a in attempts if a.passed)
    avg = sum(a.score for a in attempts) / total_q if total_q > 0 else 0
    lessons_done = LessonProgress.query.filter_by(user_id=user.id, completed=True).count()
    enrolled_data = [{**c.to_dict(), 'progress': user.get_course_progress(c)}
                     for c in user.enrolled_courses]
    return jsonify({
        'user': user.to_dict(),
        'stats': {'enrolled_courses': len(user.enrolled_courses),
                  'lessons_completed': lessons_done,
                  'quizzes_taken': total_q, 'quizzes_passed': passed_q,
                  'avg_score': round(avg, 1)},
        'enrolled_courses': enrolled_data,
        'recent_activity': [a.to_dict() for a in user.activities.limit(10).all()],
    })


@app.route('/api/performance', methods=['GET'])
@login_required_api
def api_performance():
    user = request.current_user
    attempts = user.quiz_attempts.order_by(QuizAttempt.completed_at.desc()).all()
    course_stats = {}
    for c in user.enrolled_courses:
        ca = [a for a in attempts if a.quiz.course_id == c.id]
        avg = sum(a.score for a in ca) / len(ca) if ca else 0
        course_stats[c.id] = {'title': c.title,
                              'progress': user.get_course_progress(c),
                              'quizzes_taken': len(ca), 'avg_score': round(avg, 1)}
    scores = [{'quiz': a.quiz.title, 'score': a.score,
               'date': a.completed_at.strftime('%b %d') if a.completed_at else '',
               'passed': a.passed} for a in attempts[:10]]
    scores.reverse()
    total_q = len(attempts)
    passed = sum(1 for a in attempts if a.passed)
    avg = sum(a.score for a in attempts) / total_q if total_q > 0 else 0
    lessons_done = LessonProgress.query.filter_by(user_id=user.id, completed=True).count()
    return jsonify({
        'course_stats': course_stats,
        'recent_scores': scores,
        'all_activity': [a.to_dict() for a in user.activities.limit(30).all()],
        'total_quizzes': total_q, 'passed': passed,
        'avg_score': round(avg, 1), 'lessons_done': lessons_done,
        'attempts': [a.to_dict() for a in attempts],
    })

# ══════════════════════════════════════════════════════════════
#  API — ADMIN
# ══════════════════════════════════════════════════════════════

@app.route('/api/admin/pending-users', methods=['GET'])
@admin_required_api
def api_pending_users():
    users = User.query.filter_by(is_approved=False).filter(
        User.role.in_(['student', 'teacher'])
    ).order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]})


@app.route('/api/admin/users', methods=['GET'])
@admin_required_api
def api_all_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]})


@app.route('/api/admin/approve-user/<int:uid>', methods=['POST'])
@admin_required_api
def api_approve_user(uid):
    user = db.session.get(User, uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.is_approved:
        return jsonify({'message': 'User already approved'}), 200
    user.is_approved = True
    user.approved_at = datetime.utcnow()
    db.session.commit()
    log_activity(request.current_user.id, 'user_approved',
                 f'Approved user "{user.full_name}" ({user.username})')
    # Send approval email
    if user.role == 'teacher':
        send_teacher_selection_email(user.email, user.full_name)
    else:
        send_approval_email(user.email, user.full_name)
    return jsonify({'message': f'{user.full_name} has been approved', 'user': user.to_dict()})


@app.route('/api/admin/reject-user/<int:uid>', methods=['POST'])
@admin_required_api
def api_reject_user(uid):
    user = db.session.get(User, uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    reason = (request.get_json() or {}).get('reason', '')
    send_rejection_email(user.email, user.full_name, reason)
    log_activity(request.current_user.id, 'user_rejected',
                 f'Rejected user "{user.full_name}" ({user.username})')
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': f'{user.full_name} has been rejected and removed'})


@app.route('/api/admin/stats', methods=['GET'])
@admin_required_api
def api_admin_stats():
    total_students = User.query.filter_by(role='student').count()
    pending = User.query.filter_by(is_approved=False).filter(
        User.role.in_(['student', 'teacher'])
    ).count()
    approved_students = User.query.filter_by(is_approved=True, role='student').count()
    total_teachers = User.query.filter_by(role='teacher').count()
    approved_teachers = User.query.filter_by(is_approved=True, role='teacher').count()
    pending_teachers = User.query.filter_by(is_approved=False, role='teacher').count()
    total_courses = Course.query.count()
    total_enrollments = db.session.query(enrollments).count()
    return jsonify({
        'total_students': total_students,
        'pending_approvals': pending,
        'approved_students': approved_students,
        'total_teachers': total_teachers,
        'approved_teachers': approved_teachers,
        'pending_teachers': pending_teachers,
        'total_courses': total_courses,
        'total_enrollments': total_enrollments,
    })


@app.route('/api/admin/users/<int:uid>', methods=['GET'])
@admin_required_api
def api_admin_user_profile(uid):
    """Admin can view full profile of any teacher or student."""
    user = db.session.get(User, uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    profile = user.to_dict()
    profile['approved_at'] = user.approved_at.isoformat() if user.approved_at else None

    if user.role == 'student':
        attempts = user.quiz_attempts.all()
        total_q = len(attempts)
        passed_q = sum(1 for a in attempts if a.passed)
        avg = sum(a.score for a in attempts) / total_q if total_q > 0 else 0
        lessons_done = LessonProgress.query.filter_by(user_id=user.id, completed=True).count()
        enrolled_data = []
        for c in user.enrolled_courses:
            progress = user.get_course_progress(c)
            ca = [a for a in attempts if a.quiz.course_id == c.id]
            cavg = sum(a.score for a in ca) / len(ca) if ca else 0
            enrolled_data.append({
                'course': c.to_dict(),
                'progress': progress,
                'quizzes_taken': len(ca),
                'avg_score': round(cavg, 1),
            })
        feedbacks = Feedback.query.filter_by(student_id=user.id).order_by(
            Feedback.created_at.desc()
        ).all()
        profile['performance'] = {
            'enrolled_courses': len(user.enrolled_courses),
            'lessons_completed': lessons_done,
            'quizzes_taken': total_q,
            'quizzes_passed': passed_q,
            'avg_score': round(avg, 1),
        }
        profile['courses'] = enrolled_data
        profile['quiz_attempts'] = [a.to_dict() for a in attempts]
        profile['feedbacks'] = [f.to_dict() for f in feedbacks]

    elif user.role == 'teacher':
        courses = user.created_courses.all()
        total_students = set()
        for c in courses:
            total_students.update([s.id for s in c.students])
        feedbacks_given = Feedback.query.filter_by(teacher_id=user.id).count()
        exams_scheduled = ScheduledExam.query.filter_by(teacher_id=user.id).count()
        profile['teacher_stats'] = {
            'total_courses': len(courses),
            'total_students': len(total_students),
            'feedbacks_given': feedbacks_given,
            'exams_scheduled': exams_scheduled,
        }
        profile['courses'] = [c.to_dict() for c in courses]

    return jsonify({'user': profile})


@app.route('/api/admin/students-performance', methods=['GET'])
@admin_required_api
def api_admin_students_performance():
    """Admin can view all students with their performance metrics."""
    students = User.query.filter_by(role='student', is_approved=True).order_by(
        User.full_name
    ).all()
    result = []
    for s in students:
        attempts = s.quiz_attempts.all()
        total_q = len(attempts)
        passed_q = sum(1 for a in attempts if a.passed)
        avg = sum(a.score for a in attempts) / total_q if total_q > 0 else 0
        lessons_done = LessonProgress.query.filter_by(user_id=s.id, completed=True).count()
        enrolled = len(s.enrolled_courses)
        course_progress = []
        for c in s.enrolled_courses:
            course_progress.append({
                'course_id': c.id,
                'course_title': c.title,
                'progress': s.get_course_progress(c),
            })
        result.append({
            'id': s.id,
            'full_name': s.full_name,
            'username': s.username,
            'email': s.email,
            'enrolled_courses': enrolled,
            'lessons_completed': lessons_done,
            'quizzes_taken': total_q,
            'quizzes_passed': passed_q,
            'avg_score': round(avg, 1),
            'course_progress': course_progress,
        })
    return jsonify({'students': result})


@app.route('/api/admin/activity-log', methods=['GET'])
@admin_required_api
def api_admin_activity_log():
    """Admin can view login activity of all teachers and students."""
    activities = Activity.query.join(User).filter(
        User.role.in_(['student', 'teacher'])
    ).order_by(Activity.timestamp.desc()).limit(200).all()
    result = []
    for a in activities:
        u = db.session.get(User, a.user_id)
        result.append({
            'id': a.id,
            'user_id': a.user_id,
            'full_name': u.full_name if u else 'Unknown',
            'username': u.username if u else 'Unknown',
            'role': u.role if u else 'Unknown',
            'action': a.action,
            'description': a.description,
            'timestamp': a.timestamp.isoformat() if a.timestamp else None,
        })
    return jsonify({'activities': result})


@app.route('/api/student/feedbacks', methods=['GET'])
@login_required_api
def api_student_feedbacks():
    """Student can view feedback received from teachers."""
    user = request.current_user
    if user.role != 'student':
        return jsonify({'error': 'Student access required'}), 403
    feedbacks = Feedback.query.filter_by(student_id=user.id).order_by(
        Feedback.created_at.desc()
    ).all()
    return jsonify({'feedbacks': [f.to_dict() for f in feedbacks]})


# ══════════════════════════════════════════════════════════════
#  API — TEACHER
# ══════════════════════════════════════════════════════════════

@app.route('/api/teacher/dashboard', methods=['GET'])
@teacher_required_api
def api_teacher_dashboard():
    teacher = request.current_user
    courses = teacher.created_courses.all()
    total_students = set()
    total_lessons = 0
    total_quizzes = 0
    for c in courses:
        total_students.update([s.id for s in c.students])
        total_lessons += c.lessons.count()
        total_quizzes += c.quizzes.count()
    feedbacks = Feedback.query.filter_by(teacher_id=teacher.id).count()
    exams = ScheduledExam.query.filter_by(teacher_id=teacher.id, is_active=True).count()
    return jsonify({
        'stats': {
            'total_courses': len(courses),
            'total_students': len(total_students),
            'total_lessons': total_lessons,
            'total_quizzes': total_quizzes,
            'feedbacks_given': feedbacks,
            'scheduled_exams': exams,
        },
        'courses': [c.to_dict(include_lessons=True) for c in courses],
        'recent_activity': [a.to_dict() for a in teacher.activities.limit(10).all()],
    })


@app.route('/api/teacher/courses', methods=['GET'])
@teacher_required_api
def api_teacher_courses():
    courses = request.current_user.created_courses.all()
    return jsonify({'courses': [c.to_dict(include_lessons=True) for c in courses]})


@app.route('/api/teacher/courses', methods=['POST'])
@teacher_required_api
def api_teacher_create_course():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400

    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip()
    category = (data.get('category') or '').strip()
    thumbnail = (data.get('thumbnail') or '').strip()

    if not title:
        return jsonify({'error': 'Course title is required'}), 400
    if not description:
        return jsonify({'error': 'Course description is required'}), 400

    teacher = request.current_user
    course = Course(
        title=title, description=description, category=category,
        thumbnail=thumbnail, instructor_name=teacher.full_name,
        teacher_id=teacher.id
    )
    db.session.add(course)
    db.session.flush()

    # Add lessons if provided
    lessons_data = data.get('lessons', [])
    for i, lesson in enumerate(lessons_data):
        l_title = (lesson.get('title') or '').strip()
        if not l_title:
            continue
        db.session.add(Lesson(
            title=l_title,
            description=(lesson.get('description') or '').strip(),
            video_url=(lesson.get('video_url') or '').strip(),
            duration_minutes=int(lesson.get('duration_minutes') or 0),
            order=i + 1,
            course_id=course.id
        ))

    # Add quiz if provided
    quiz_data = data.get('quiz')
    if quiz_data and (quiz_data.get('title') or '').strip():
        quiz = Quiz(
            title=(quiz_data.get('title') or '').strip(),
            description=(quiz_data.get('description') or '').strip(),
            course_id=course.id,
            time_limit_minutes=int(quiz_data.get('time_limit_minutes') or 0),
            pass_percentage=int(quiz_data.get('pass_percentage') or 60),
        )
        db.session.add(quiz)
        db.session.flush()

        for j, q in enumerate(quiz_data.get('questions', [])):
            q_text = (q.get('text') or '').strip()
            if not q_text:
                continue
            db.session.add(Question(
                text=q_text,
                option_a=(q.get('option_a') or '').strip(),
                option_b=(q.get('option_b') or '').strip(),
                option_c=(q.get('option_c') or '').strip(),
                option_d=(q.get('option_d') or '').strip(),
                correct_answer=(q.get('correct_answer') or 'A').strip().upper(),
                explanation=(q.get('explanation') or '').strip(),
                order=j + 1,
                quiz_id=quiz.id
            ))

    db.session.commit()
    log_activity(teacher.id, 'course_created', f'Created course "{title}"')
    return jsonify({'message': f'Course "{title}" created successfully', 'course': course.to_dict()}), 201


@app.route('/api/teacher/students', methods=['GET'])
@teacher_required_api
def api_teacher_students():
    teacher = request.current_user
    courses = teacher.created_courses.all()
    student_map = {}
    for c in courses:
        for s in c.students:
            if s.id not in student_map:
                student_map[s.id] = {
                    **s.to_dict(),
                    'enrolled_courses': [],
                }
            student_map[s.id]['enrolled_courses'].append({
                'id': c.id, 'title': c.title,
                'progress': s.get_course_progress(c),
            })
    return jsonify({'students': list(student_map.values())})


@app.route('/api/teacher/students/<int:sid>', methods=['GET'])
@teacher_required_api
def api_teacher_student_profile(sid):
    student = db.session.get(User, sid)
    if not student or student.role != 'student':
        return jsonify({'error': 'Student not found'}), 404

    teacher = request.current_user
    teacher_courses = teacher.created_courses.all()
    teacher_course_ids = [c.id for c in teacher_courses]

    # Only show data for courses this teacher owns
    enrolled_courses = [c for c in student.enrolled_courses if c.id in teacher_course_ids]
    if not enrolled_courses:
        return jsonify({'error': 'Student not found in your courses'}), 404
    course_data = []
    for c in enrolled_courses:
        progress = student.get_course_progress(c)
        attempts = QuizAttempt.query.filter_by(user_id=sid).join(Quiz).filter(
            Quiz.course_id == c.id
        ).order_by(QuizAttempt.completed_at.desc()).all()
        lessons_done = LessonProgress.query.filter_by(
            user_id=sid, completed=True
        ).join(Lesson).filter(Lesson.course_id == c.id).count()
        total_lessons = c.lessons.count()
        course_data.append({
            'course': c.to_dict(),
            'progress': progress,
            'lessons_completed': lessons_done,
            'total_lessons': total_lessons,
            'quiz_attempts': [a.to_dict() for a in attempts],
        })

    all_attempts = QuizAttempt.query.filter_by(user_id=sid).join(Quiz).filter(
        Quiz.course_id.in_(teacher_course_ids)
    ).all()
    total_q = len(all_attempts)
    avg_score = sum(a.score for a in all_attempts) / total_q if total_q > 0 else 0
    passed_q = sum(1 for a in all_attempts if a.passed)

    feedbacks = Feedback.query.filter_by(
        teacher_id=teacher.id, student_id=sid
    ).order_by(Feedback.created_at.desc()).all()

    return jsonify({
        'student': student.to_dict(),
        'courses': course_data,
        'stats': {
            'total_quizzes': total_q,
            'quizzes_passed': passed_q,
            'avg_score': round(avg_score, 1),
        },
        'feedbacks': [f.to_dict() for f in feedbacks],
    })


@app.route('/api/teacher/feedback', methods=['POST'])
@teacher_required_api
def api_teacher_give_feedback():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400

    student_id = data.get('student_id')
    course_id = data.get('course_id')
    text = (data.get('text') or '').strip()

    if not student_id or not text:
        return jsonify({'error': 'Student and feedback text are required'}), 400

    student = db.session.get(User, student_id)
    if not student or student.role != 'student':
        return jsonify({'error': 'Student not found'}), 404

    teacher = request.current_user
    feedback = Feedback(
        teacher_id=teacher.id, student_id=student_id,
        course_id=course_id if course_id else None, text=text
    )
    db.session.add(feedback)
    db.session.commit()
    log_activity(teacher.id, 'feedback_given',
                 f'Gave feedback to {student.full_name}')
    return jsonify({'message': 'Feedback submitted', 'feedback': feedback.to_dict()}), 201


@app.route('/api/teacher/schedule-exam', methods=['POST'])
@teacher_required_api
def api_teacher_schedule_exam():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400

    quiz_id = data.get('quiz_id')
    course_id = data.get('course_id')
    scheduled_date = data.get('scheduled_date')
    duration_minutes = data.get('duration_minutes', 60)

    if not quiz_id or not course_id or not scheduled_date:
        return jsonify({'error': 'Quiz, course, and scheduled date are required'}), 400

    quiz = db.session.get(Quiz, quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404

    teacher = request.current_user
    course = db.session.get(Course, course_id)
    if not course or course.teacher_id != teacher.id:
        return jsonify({'error': 'Course not found or not owned by you'}), 403

    exam = ScheduledExam(
        teacher_id=teacher.id, quiz_id=quiz_id, course_id=course_id,
        scheduled_date=datetime.fromisoformat(scheduled_date),
        duration_minutes=int(duration_minutes),
    )
    db.session.add(exam)
    db.session.commit()
    log_activity(teacher.id, 'exam_scheduled',
                 f'Scheduled exam "{quiz.title}" for {course.title}')
    return jsonify({'message': 'Exam scheduled', 'exam': exam.to_dict()}), 201


@app.route('/api/teacher/scheduled-exams', methods=['GET'])
@teacher_required_api
def api_teacher_scheduled_exams():
    teacher = request.current_user
    exams = ScheduledExam.query.filter_by(teacher_id=teacher.id).order_by(
        ScheduledExam.scheduled_date.desc()
    ).all()
    return jsonify({'exams': [e.to_dict() for e in exams]})


@app.route('/api/teacher/scheduled-exams/<int:eid>', methods=['DELETE'])
@teacher_required_api
def api_teacher_cancel_exam(eid):
    exam = db.session.get(ScheduledExam, eid)
    if not exam or exam.teacher_id != request.current_user.id:
        return jsonify({'error': 'Exam not found'}), 404
    db.session.delete(exam)
    db.session.commit()
    return jsonify({'message': 'Scheduled exam cancelled'})


# ══════════════════════════════════════════════════════════════
#  SERVE REACT (production build)
# ══════════════════════════════════════════════════════════════

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path and os.path.exists(os.path.join(app.static_folder or '', path)):
        return send_from_directory(app.static_folder, path)
    if app.static_folder and os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({'message': 'LMS API running. Start React: cd frontend && npm run dev'})

# ══════════════════════════════════════════════════════════════
#  SEED DATA
# ══════════════════════════════════════════════════════════════

def seed_database():
    if User.query.first():
        return
    admin = User(full_name='Admin', username='admin', email='admin@lms.com',
                 role='admin', is_approved=True)
    admin.set_password('admin123')
    student = User(full_name='Demo Student', username='student',
                   email='student@lms.com', role='student', is_approved=True)
    student.set_password('student123')
    teacher = User(full_name='Demo Teacher', username='teacher',
                   email='teacher@lms.com', role='teacher', is_approved=True,
                   qualification='M.Tech Computer Science',
                   experience_years=5, specialization='Web Development & Python',
                   bio='Experienced educator with 5+ years in software development and teaching.')
    teacher.set_password('teacher123')
    db.session.add_all([admin, student, teacher])
    db.session.flush()

    # Course 1 — Web Development
    c1 = Course(title='Web Development Fundamentals',
                description='Learn HTML, CSS, and JavaScript from scratch. Build real websites with hands-on projects.',
                instructor_name='Demo Teacher', category='Programming', teacher_id=teacher.id)
    db.session.add(c1)
    db.session.flush()
    for i, (t, d, u, dur) in enumerate([
        ('Introduction to HTML', 'Learn the building blocks of every website.',
         'https://www.youtube.com/embed/qz0aGYrrlhU', 15),
        ('CSS Styling Basics', 'Style your pages with colors, fonts, and layouts.',
         'https://www.youtube.com/embed/1PnVor36_40', 20),
        ('JavaScript Fundamentals', 'Add interactivity with JavaScript.',
         'https://www.youtube.com/embed/W6NZfCO5SIk', 25),
        ('Building a Portfolio Site', 'Build and deploy your first portfolio.',
         'https://www.youtube.com/embed/xV7S8BhIeBo', 30),
    ]):
        db.session.add(Lesson(title=t, description=d, video_url=u,
                              duration_minutes=dur, order=i+1, course_id=c1.id))

    q1 = Quiz(title='HTML & CSS Quiz', description='Test your HTML and CSS knowledge.',
              course_id=c1.id, pass_percentage=60)
    db.session.add(q1); db.session.flush()
    for i, (txt, a, b, c, d, ans, exp) in enumerate([
        ('What does HTML stand for?', 'Hyper Text Markup Language',
         'High Tech Modern Language', 'Hyper Transfer Markup Language',
         'Home Tool Markup Language', 'A', 'HTML = Hyper Text Markup Language.'),
        ('Which CSS property changes text color?', 'font-color', 'color',
         'text-color', 'foreground-color', 'B', 'The "color" property sets text color.'),
        ('Which tag is the largest heading?', '<heading>', '<h6>', '<h1>',
         '<head>', 'C', '<h1> is the largest heading.'),
        ('What does CSS stand for?', 'Creative Style Sheets', 'Cascading Style Sheets',
         'Computer Styled Sections', 'Colorful Style Sheets', 'B',
         'CSS = Cascading Style Sheets.'),
        ('Which attribute provides image alt text?', 'title', 'src', 'alt',
         'longdesc', 'C', 'The alt attribute provides alternative text.'),
    ]):
        db.session.add(Question(text=txt, option_a=a, option_b=b, option_c=c,
                                option_d=d, correct_answer=ans, explanation=exp,
                                order=i+1, quiz_id=q1.id))

    # Course 2 — Python
    c2 = Course(title='Python for Beginners',
                description='Master Python from zero to hero. Variables, data structures, OOP, and real projects.',
                instructor_name='Demo Teacher', category='Programming', teacher_id=teacher.id)
    db.session.add(c2); db.session.flush()
    for i, (t, d, u, dur) in enumerate([
        ('Getting Started with Python', 'Install Python and write your first program.',
         'https://www.youtube.com/embed/kqtD5dpn9C8', 18),
        ('Variables & Data Types', 'Strings, integers, floats, lists, and dicts.',
         'https://www.youtube.com/embed/cQT33yu9pY8', 22),
        ('Control Flow & Loops', 'if/else, for loops, while loops.',
         'https://www.youtube.com/embed/Zp5MuPOtsSY', 20),
        ('Functions & Modules', 'Write reusable code with functions.',
         'https://www.youtube.com/embed/9Os0o3wzS_I', 25),
        ('Object-Oriented Programming', 'Classes, objects, inheritance.',
         'https://www.youtube.com/embed/JeznW_7DlB0', 30),
    ]):
        db.session.add(Lesson(title=t, description=d, video_url=u,
                              duration_minutes=dur, order=i+1, course_id=c2.id))

    q2 = Quiz(title='Python Basics Quiz', description='Test your Python knowledge.',
              course_id=c2.id, pass_percentage=60)
    db.session.add(q2); db.session.flush()
    for i, (txt, a, b, c, d, ans, exp) in enumerate([
        ('How to create a variable in Python?', 'var x = 5', 'x = 5',
         'int x = 5', 'declare x = 5', 'B', 'Python uses x = 5.'),
        ('Which type stores text?', 'int', 'float', 'str', 'char', 'C',
         'str (string) stores text.'),
        ('Output of print(type(3.14))?', "class 'int'", "class 'float'",
         "class 'double'", "class 'decimal'", 'B', '3.14 is a float.'),
        ('Keyword to define a function?', 'function', 'func', 'def', 'define',
         'C', '"def" defines a function.'),
        ('What does len() return?', 'Last element', 'Length/count', 'Largest item',
         'Removes last', 'B', 'len() returns item count.'),
    ]):
        db.session.add(Question(text=txt, option_a=a, option_b=b, option_c=c,
                                option_d=d, correct_answer=ans, explanation=exp,
                                order=i+1, quiz_id=q2.id))

    # Course 3 — Digital Marketing
    c3 = Course(title='Digital Marketing 101',
                description='Learn SEO, social media marketing, email campaigns, and analytics.',
                instructor_name='Demo Teacher', category='Marketing', teacher_id=teacher.id)
    db.session.add(c3); db.session.flush()
    for i, (t, d, u, dur) in enumerate([
        ('What is Digital Marketing?', 'Overview of digital marketing channels.',
         'https://www.youtube.com/embed/bixR-KIJKYM', 12),
        ('SEO Fundamentals', 'How search engines work and ranking.',
         'https://www.youtube.com/embed/DvwS7cV9GmQ', 20),
        ('Social Media Marketing', 'Build brand presence on social platforms.',
         'https://www.youtube.com/embed/I2pwcAVonKI', 18),
    ]):
        db.session.add(Lesson(title=t, description=d, video_url=u,
                              duration_minutes=dur, order=i+1, course_id=c3.id))

    q3 = Quiz(title='Marketing Quiz', description='Test your marketing knowledge.',
              course_id=c3.id, pass_percentage=60)
    db.session.add(q3); db.session.flush()
    for i, (txt, a, b, c, d, ans, exp) in enumerate([
        ('What does SEO stand for?', 'Social Engine Optimization',
         'Search Engine Optimization', 'Search Email Outreach',
         'Site Enhancement Operations', 'B', 'SEO = Search Engine Optimization.'),
        ('What measures single-page visit rate?', 'Click rate', 'Bounce rate',
         'Exit rate', 'Return rate', 'B', 'Bounce rate = single-page visit %.'),
        ('What is a CTA?', 'Click Through Analytics', 'Call To Action',
         'Customer Tracking Algorithm', 'Content To Audience', 'B',
         'CTA = Call To Action.'),
        ('Best B2B marketing platform?', 'TikTok', 'Instagram', 'LinkedIn',
         'Snapchat', 'C', 'LinkedIn is the B2B leader.'),
    ]):
        db.session.add(Question(text=txt, option_a=a, option_b=b, option_c=c,
                                option_d=d, correct_answer=ans, explanation=exp,
                                order=i+1, quiz_id=q3.id))

    db.session.commit()
    print('  Seeded: 3 courses, 12 lessons, 3 quizzes, 14 questions')
    print('  Accounts: admin/admin123 | student/student123 | teacher/teacher123')


# ── Error Handlers ──────────────────────────────────────────
@app.errorhandler(404)
def handle_not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def handle_server_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# ── Initialize DB (for gunicorn / Render) ────────────────────
with app.app_context():
    db.create_all()
    seed_database()


if __name__ == '__main__':
    print('\n  LMS API:   http://localhost:5000/api/')
    print('  React dev: cd ../frontend && npm run dev\n')
    app.run(debug=True, host='0.0.0.0', port=5000)
