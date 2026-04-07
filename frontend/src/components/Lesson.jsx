import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLesson, completeLesson } from '../api';

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getLesson(id)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await completeLesson(id);
      setData({ ...data, is_completed: true });
      if (res.data.next_lesson_id) {
        navigate(`/lessons/${res.data.next_lesson_id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <div className="loading">Loading lesson...</div>;
  if (!data) return <div className="error-msg">Lesson not found</div>;

  const { lesson, course, all_lessons, completed_lesson_ids, is_completed,
          prev_lesson_id, next_lesson_id } = data;

  return (
    <div className="lesson-page">
      <div className="lesson-sidebar">
        <Link to={`/courses/${course.id}`} className="back-link">← {course.title}</Link>
        <ul className="sidebar-lessons">
          {all_lessons.map((l, idx) => (
            <li key={l.id} className={`sidebar-lesson-item
              ${l.id === lesson.id ? 'active' : ''}
              ${completed_lesson_ids.includes(l.id) ? 'completed' : ''}`}>
              <Link to={`/lessons/${l.id}`}>
                <span className="lesson-number">{idx + 1}</span>
                {l.title}
                {completed_lesson_ids.includes(l.id) && ' ✅'}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="lesson-main">
        <h1>{lesson.title}</h1>
        <p className="lesson-desc">{lesson.description}</p>

        {lesson.video_url && (
          <div className="video-container">
            <iframe
              src={lesson.video_url}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="lesson-duration">
          ⏱️ Duration: {lesson.duration_minutes} minutes
        </div>

        <div className="lesson-actions">
          {prev_lesson_id && (
            <Link to={`/lessons/${prev_lesson_id}`} className="btn btn-outline">
              ← Previous Lesson
            </Link>
          )}
          {!is_completed ? (
            <button onClick={handleComplete} className="btn btn-success"
              disabled={completing}>
              {completing ? 'Marking...' : '✅ Mark as Complete'}
            </button>
          ) : (
            <span className="completed-badge">✅ Completed</span>
          )}
          {next_lesson_id && (
            <Link to={`/lessons/${next_lesson_id}`} className="btn btn-primary">
              Next Lesson →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
