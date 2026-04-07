import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getQuiz, getQuizQuestions, submitQuiz } from '../api';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState('info'); // info | taking | result
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getQuiz(id)
      .then((res) => {
        setQuiz(res.data);
        setPhase('info');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const res = await getQuizQuestions(id);
      setQuestions(res.data.questions);
      setAnswers({});
      setPhase('taking');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (qId, option) => {
    setAnswers({ ...answers, [qId]: option });
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      if (!window.confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) return;
    }
    setSubmitting(true);
    try {
      const res = await submitQuiz(id, answers);
      setResult(res.data);
      setPhase('result');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (!quiz) return <div className="error-msg">Quiz not found</div>;

  // ── INFO Phase ──
  if (phase === 'info') {
    return (
      <div className="quiz-page">
        <Link to={`/courses/${quiz.course.id}`} className="back-link">
          ← {quiz.course.title}
        </Link>
        <div className="quiz-info-card">
          <h1>{quiz.quiz.title}</h1>
          <p>{quiz.quiz.description}</p>
          <div className="quiz-meta">
            <span>📝 {quiz.quiz.question_count} questions</span>
            <span>🎯 Pass: {quiz.quiz.pass_percentage}%</span>
            {quiz.quiz.time_limit_minutes > 0 && (
              <span>⏱️ {quiz.quiz.time_limit_minutes} min</span>
            )}
          </div>

          {quiz.past_attempts.length > 0 && (
            <div className="past-attempts">
              <h3>Past Attempts</h3>
              <table>
                <thead>
                  <tr><th>Date</th><th>Score</th><th>Result</th></tr>
                </thead>
                <tbody>
                  {quiz.past_attempts.map((a) => (
                    <tr key={a.id}>
                      <td>{new Date(a.completed_at).toLocaleDateString()}</td>
                      <td>{a.score}% ({a.correct_answers}/{a.total_questions})</td>
                      <td><span className={`badge ${a.passed ? 'badge-success' : 'badge-error'}`}>
                        {a.passed ? 'PASSED' : 'FAILED'}
                      </span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button onClick={startQuiz} className="btn btn-primary btn-lg">
            {quiz.past_attempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
          </button>
        </div>
      </div>
    );
  }

  // ── TAKING Phase ──
  if (phase === 'taking') {
    const answered = Object.keys(answers).length;
    return (
      <div className="quiz-page">
        <div className="quiz-header">
          <h2>{quiz.quiz.title}</h2>
          <span className="quiz-progress">{answered}/{questions.length} answered</span>
        </div>
        <div className="questions-list">
          {questions.map((q, idx) => (
            <div key={q.id} className={`question-card ${answers[q.id] ? 'answered' : ''}`}>
              <h4>Q{idx + 1}. {q.text}</h4>
              <div className="options">
                {Object.entries(q.options).map(([key, val]) => (
                  <label key={key}
                    className={`option ${answers[q.id] === key ? 'selected' : ''}`}
                    onClick={() => selectAnswer(q.id, key)}>
                    <span className="option-key">{key}</span>
                    <span>{val}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="quiz-submit-bar">
          <button onClick={handleSubmit} className="btn btn-primary btn-lg"
            disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT Phase ──
  return (
    <div className="quiz-page">
      <div className={`result-banner ${result.passed ? 'passed' : 'failed'}`}>
        <h1>{result.passed ? '🎉 Congratulations!' : '😔 Better luck next time'}</h1>
        <div className="result-score">{result.score}%</div>
        <p>{result.correct}/{result.total} correct · Pass: {result.pass_percentage}%</p>
        <span className={`badge ${result.passed ? 'badge-success' : 'badge-error'} badge-lg`}>
          {result.passed ? 'PASSED' : 'FAILED'}
        </span>
      </div>

      <div className="result-details">
        <h3>Question Review</h3>
        {result.results.map((r, idx) => (
          <div key={r.question_id}
            className={`result-question ${r.is_correct ? 'correct' : 'incorrect'}`}>
            <h4>
              {r.is_correct ? '✅' : '❌'} Q{idx + 1}. {r.question}
            </h4>
            <div className="result-options">
              {Object.entries(r.options).map(([key, val]) => (
                <div key={key} className={`result-option
                  ${key === r.correct_answer ? 'correct-answer' : ''}
                  ${key === r.user_answer && !r.is_correct ? 'wrong-answer' : ''}`}>
                  <span className="option-key">{key}</span> {val}
                </div>
              ))}
            </div>
            {r.explanation && <p className="explanation">💡 {r.explanation}</p>}
          </div>
        ))}
      </div>

      <div className="result-actions">
        <button onClick={() => { setPhase('info'); setResult(null); }}
          className="btn btn-outline">Back to Quiz Info</button>
        <button onClick={startQuiz} className="btn btn-primary">Retake Quiz</button>
        <Link to={`/courses/${quiz.course.id}`} className="btn btn-outline">
          Back to Course
        </Link>
      </div>
    </div>
  );
}
