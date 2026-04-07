import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then((res) => setCourses(res.data.courses))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading courses...</div>;

  return (
    <div className="courses-page">
      <div className="page-header">
        <h1>Available Courses</h1>
        <p>Explore our collection of courses and start learning today</p>
      </div>

      <div className="courses-grid">
        {courses.map((course) => (
          <Link to={`/courses/${course.id}`} key={course.id} className="course-card">
            <div className="course-card-header">
              <span className="badge">{course.category}</span>
              {course.is_enrolled && <span className="badge badge-success">Enrolled</span>}
            </div>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div className="course-meta">
              <span>👨‍🏫 {course.instructor_name}</span>
              <span>📖 {course.lesson_count} lessons</span>
              <span>📝 {course.quiz_count} quiz{course.quiz_count !== 1 ? 'zes' : ''}</span>
              <span>👥 {course.student_count} students</span>
            </div>
            {course.is_enrolled && (
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${course.progress}%` }} />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
