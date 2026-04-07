import { useState, useEffect } from 'react';
import { getPerformance } from '../api';

export default function Performance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPerformance()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading performance...</div>;
  if (!data) return <div className="error-msg">Failed to load performance data</div>;

  const { course_stats, recent_scores, all_activity, total_quizzes,
          passed, avg_score, lessons_done, attempts } = data;

  return (
    <div className="performance-page">
      <div className="page-header">
        <h1>My Performance</h1>
        <p>Track your learning progress and quiz scores</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{lessons_done}</div>
          <div className="stat-label">Lessons Done</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{total_quizzes}</div>
          <div className="stat-label">Quizzes Taken</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{passed}</div>
          <div className="stat-label">Quizzes Passed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{avg_score}%</div>
          <div className="stat-label">Average Score</div>
        </div>
      </div>

      {/* Course Progress */}
      {Object.keys(course_stats).length > 0 && (
        <div className="card">
          <h3>Course Progress</h3>
          <div className="course-progress-list">
            {Object.values(course_stats).map((cs, idx) => (
              <div key={idx} className="course-progress-item">
                <div className="course-progress-header">
                  <strong>{cs.title}</strong>
                  <span>{cs.progress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${cs.progress}%` }} />
                </div>
                <small>
                  {cs.quizzes_taken} quiz{cs.quizzes_taken !== 1 ? 'zes' : ''} taken ·
                  Avg: {cs.avg_score}%
                </small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score Trend */}
      {recent_scores.length > 0 && (
        <div className="card">
          <h3>Recent Quiz Scores</h3>
          <div className="score-chart">
            {recent_scores.map((s, idx) => (
              <div key={idx} className="score-bar-item">
                <div className="score-bar-wrapper">
                  <div className={`score-bar ${s.passed ? 'passed' : 'failed'}`}
                    style={{ height: `${Math.max(s.score, 5)}%` }}>
                    <span className="score-value">{s.score}%</span>
                  </div>
                </div>
                <span className="score-label">{s.quiz}</span>
                <small>{s.date}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz History */}
      {attempts.length > 0 && (
        <div className="card">
          <h3>Quiz History</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Quiz</th><th>Course</th><th>Score</th><th>Result</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>{a.quiz_title}</td>
                  <td>{a.course_title}</td>
                  <td>{a.score}% ({a.correct_answers}/{a.total_questions})</td>
                  <td>
                    <span className={`badge ${a.passed ? 'badge-success' : 'badge-error'}`}>
                      {a.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </td>
                  <td>{new Date(a.completed_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total_quizzes === 0 && lessons_done === 0 && (
        <div className="empty-state card">
          <h3>No Data Yet</h3>
          <p>Enroll in a course, complete lessons, and take quizzes to see your performance here!</p>
        </div>
      )}
    </div>
  );
}
