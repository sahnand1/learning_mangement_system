import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourse, enrollCourse } from '../api';
import { useAuth } from '../AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    getCourse(id)
      .then((res) => setCourse(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      await enrollCourse(id);
      setCourse({ ...course, is_enrolled: true });
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="loading">Loading course...</div>;
  if (!course) return <div className="error-msg">Course not found</div>;

  return (
    <div className="course-detail">
      <div className="course-detail-header">
        <div>
          <span className="badge">{course.category}</span>
          <h1>{course.title}</h1>
          <p className="course-desc">{course.description}</p>
          <div className="course-meta">
            <span>👨‍🏫 {course.instructor_name}</span>
            <span>📖 {course.lesson_count} lessons</span>
            <span>👥 {course.student_count} students</span>
          </div>
        </div>
        <div className="course-actions">
          {course.is_enrolled ? (
            <>
              <div className="progress-info">
                <div className="progress-bar-container large">
                  <div className="progress-bar" style={{ width: `${course.progress}%` }} />
                </div>
                <span>{course.progress}% complete</span>
              </div>
              {course.lessons && course.lessons.length > 0 && (
                <Link to={`/lessons/${course.lessons[0].id}`}
                  className="btn btn-primary">
                  {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                </Link>
              )}
            </>
          ) : user && user.role === 'student' ? (
            <button onClick={handleEnroll} className="btn btn-primary btn-lg"
              disabled={enrolling}>
              {enrolling ? 'Enrolling...' : 'Enroll Now — Free'}
            </button>
          ) : user && (user.role === 'admin' || user.role === 'teacher') ? (
            <div className="alert" style={{ background: '#f1f5f9', color: 'var(--text-muted)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              {user.role === 'admin' ? '🛡️ Admins cannot enroll in courses' : '👨‍🏫 Teachers cannot enroll in courses'}
            </div>
          ) : (
            <button onClick={handleEnroll} className="btn btn-primary btn-lg"
              disabled={enrolling}>
              {enrolling ? 'Enrolling...' : 'Enroll Now — Free'}
            </button>
          )}
        </div>
      </div>

      <div className="course-content-grid">
        <div className="card">
          <h3>📖 Lessons ({course.lessons?.length || 0})</h3>
          <ul className="lesson-list">
            {(course.lessons || []).map((lesson, idx) => {
              const completed = (course.completed_lesson_ids || []).includes(lesson.id);
              return (
                <li key={lesson.id} className={`lesson-item ${completed ? 'completed' : ''}`}>
                  <span className="lesson-number">{idx + 1}</span>
                  <div className="lesson-info">
                    <strong>{lesson.title}</strong>
                    <small>{lesson.duration_minutes} min</small>
                  </div>
                  {completed && <span className="check">✅</span>}
                  {course.is_enrolled && (
                    <Link to={`/lessons/${lesson.id}`} className="btn btn-sm btn-outline">
                      {completed ? 'Review' : 'Start'}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card">
          <h3>📝 Quizzes ({course.quizzes?.length || 0})</h3>
          <ul className="quiz-list">
            {(course.quizzes || []).map((quiz) => (
              <li key={quiz.id} className="quiz-item">
                <div>
                  <strong>{quiz.title}</strong>
                  <small>{quiz.question_count} questions · Pass: {quiz.pass_percentage}%</small>
                </div>
                {course.is_enrolled && (
                  <Link to={`/quizzes/${quiz.id}`} className="btn btn-sm btn-primary">
                    Take Quiz
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
