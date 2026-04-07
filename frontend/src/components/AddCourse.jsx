import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCourse } from '../api';

export default function AddCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', category: '', thumbnail: '',
  });

  const [lessons, setLessons] = useState([
    { title: '', description: '', video_url: '', duration_minutes: '' }
  ]);

  const [includeQuiz, setIncludeQuiz] = useState(false);
  const [quiz, setQuiz] = useState({
    title: '', description: '', time_limit_minutes: '', pass_percentage: 60,
    questions: [{ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '' }]
  });

  const addLesson = () => setLessons([...lessons, { title: '', description: '', video_url: '', duration_minutes: '' }]);
  const removeLesson = (i) => setLessons(lessons.filter((_, idx) => idx !== i));
  const updateLesson = (i, field, value) => {
    const updated = [...lessons];
    updated[i][field] = value;
    setLessons(updated);
  };

  const addQuestion = () => setQuiz({
    ...quiz,
    questions: [...quiz.questions, { text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '' }]
  });
  const removeQuestion = (i) => setQuiz({
    ...quiz,
    questions: quiz.questions.filter((_, idx) => idx !== i)
  });
  const updateQuestion = (i, field, value) => {
    const updated = [...quiz.questions];
    updated[i][field] = value;
    setQuiz({ ...quiz, questions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        lessons: lessons.filter(l => l.title.trim()),
      };
      if (includeQuiz && quiz.title.trim()) {
        payload.quiz = {
          ...quiz,
          questions: quiz.questions.filter(q => q.text.trim()),
        };
      }
      await createCourse(payload);
      navigate('/teacher');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-course-page">
      <div className="page-header">
        <Link to="/teacher" className="btn btn-outline btn-sm">← Back to Dashboard</Link>
        <h1>Create New Course</h1>
        <p>Add a course with lessons and an optional quiz</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Course Details */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📚 Course Details</h3>
          <div className="form-group">
            <label>Course Title *</label>
            <input type="text" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Advanced React Development" required />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what students will learn..." rows={3} required />
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Category</label>
              <input type="text" value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="e.g., Programming, Marketing" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Thumbnail URL</label>
              <input type="text" value={form.thumbnail}
                onChange={e => setForm({ ...form, thumbnail: e.target.value })}
                placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>📖 Lessons</h3>
            <button type="button" className="btn btn-sm btn-outline" onClick={addLesson}>+ Add Lesson</button>
          </div>
          {lessons.map((lesson, i) => (
            <div key={i} className="lesson-form-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Lesson {i + 1}</strong>
                {lessons.length > 1 && (
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => removeLesson(i)}>Remove</button>
                )}
              </div>
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={lesson.title}
                  onChange={e => updateLesson(i, 'title', e.target.value)}
                  placeholder="Lesson title" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" value={lesson.description}
                  onChange={e => updateLesson(i, 'description', e.target.value)}
                  placeholder="Brief description" />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Video URL (YouTube embed)</label>
                  <input type="text" value={lesson.video_url}
                    onChange={e => updateLesson(i, 'video_url', e.target.value)}
                    placeholder="https://www.youtube.com/embed/..." />
                </div>
                <div className="form-group" style={{ width: '140px' }}>
                  <label>Duration (min)</label>
                  <input type="number" value={lesson.duration_minutes}
                    onChange={e => updateLesson(i, 'duration_minutes', e.target.value)}
                    min="0" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quiz */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>📝 Quiz (Optional)</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={includeQuiz}
                onChange={e => setIncludeQuiz(e.target.checked)} />
              Include Quiz
            </label>
          </div>

          {includeQuiz && (
            <>
              <div className="form-group">
                <label>Quiz Title</label>
                <input type="text" value={quiz.title}
                  onChange={e => setQuiz({ ...quiz, title: e.target.value })}
                  placeholder="e.g., Module 1 Assessment" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" value={quiz.description}
                  onChange={e => setQuiz({ ...quiz, description: e.target.value })}
                  placeholder="Quiz description" />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Time Limit (minutes, 0 = no limit)</label>
                  <input type="number" value={quiz.time_limit_minutes}
                    onChange={e => setQuiz({ ...quiz, time_limit_minutes: e.target.value })}
                    min="0" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Pass Percentage</label>
                  <input type="number" value={quiz.pass_percentage}
                    onChange={e => setQuiz({ ...quiz, pass_percentage: e.target.value })}
                    min="0" max="100" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0 1rem' }}>
                <h4>Questions</h4>
                <button type="button" className="btn btn-sm btn-outline" onClick={addQuestion}>+ Add Question</button>
              </div>

              {quiz.questions.map((q, i) => (
                <div key={i} className="question-form-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Question {i + 1}</strong>
                    {quiz.questions.length > 1 && (
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => removeQuestion(i)}>Remove</button>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Question Text</label>
                    <input type="text" value={q.text}
                      onChange={e => updateQuestion(i, 'text', e.target.value)}
                      placeholder="Enter the question" />
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Option A</label>
                      <input type="text" value={q.option_a}
                        onChange={e => updateQuestion(i, 'option_a', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Option B</label>
                      <input type="text" value={q.option_b}
                        onChange={e => updateQuestion(i, 'option_b', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Option C</label>
                      <input type="text" value={q.option_c}
                        onChange={e => updateQuestion(i, 'option_c', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Option D</label>
                      <input type="text" value={q.option_d}
                        onChange={e => updateQuestion(i, 'option_d', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ width: '140px' }}>
                      <label>Correct Answer</label>
                      <select value={q.correct_answer}
                        onChange={e => updateQuestion(i, 'correct_answer', e.target.value)}>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Explanation</label>
                      <input type="text" value={q.explanation}
                        onChange={e => updateQuestion(i, 'explanation', e.target.value)}
                        placeholder="Explain why this is the correct answer" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Creating Course...' : 'Create Course'}
          </button>
          <Link to="/teacher" className="btn btn-outline btn-lg">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
