import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, enrollCourse } from '../api';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, FileText, Users, GraduationCap, CheckCircle, Play, Lock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    getCourse(id).then(res => setCourse(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setEnrolling(true);
    try { await enrollCourse(id); setCourse(prev => ({ ...prev, is_enrolled: true, progress: 0 })); }
    catch (err) { console.error(err); } finally { setEnrolling(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;
  if (!course) return <div className="text-center py-16 text-muted-foreground">Course not found.</div>;

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/courses">
          <Button variant="ghost" size="sm" className="gap-1 mb-4 text-muted-foreground"><ChevronLeft className="w-4 h-4" /> Back to Courses</Button>
        </Link>

        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{course.category}</Badge>
                  {course.is_enrolled && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1"><CheckCircle className="w-3 h-3" /> Enrolled</Badge>}
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">{course.title}</h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{course.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> {course.instructor_name}</span>
                  <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {course.lessons?.length || 0} lessons</span>
                  <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {course.quizzes?.length || 0} quizzes</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {course.student_count} students</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:items-end sm:min-w-[180px]">
                {course.is_enrolled ? (
                  <div className="w-full">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold text-primary">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2.5" />
                  </div>
                ) : (
                  <Button onClick={handleEnroll} disabled={enrolling} className="gap-2 w-full sm:w-auto">
                    {enrolling ? 'Enrolling...' : 'Enroll Now'} <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lessons */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="mb-6">
          <CardHeader><CardTitle>Lessons</CardTitle></CardHeader>
          <CardContent>
            {(!course.lessons || course.lessons.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-6">No lessons available yet.</p>
            ) : (
              <div className="space-y-1">
                {course.lessons.map((lesson, i) => {
                  const completed = lesson.is_completed;
                  const accessible = course.is_enrolled;
                  return (
                    <div key={lesson.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${accessible ? 'hover:bg-accent/50 cursor-pointer' : 'opacity-60'}`}
                      onClick={() => accessible && navigate(`/lessons/${lesson.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                          ${completed ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                          {completed ? <CheckCircle className="w-4 h-4" /> : i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{lesson.title}</p>
                          {lesson.duration && <p className="text-xs text-muted-foreground">{lesson.duration} min</p>}
                        </div>
                      </div>
                      {accessible ? <Play className="w-4 h-4 text-muted-foreground" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quizzes */}
      {course.quizzes && course.quizzes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader><CardTitle>Quizzes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {course.quizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{quiz.title}</p>
                        <p className="text-xs text-muted-foreground">{quiz.question_count} questions · Pass: {quiz.pass_percentage}%</p>
                      </div>
                    </div>
                    {course.is_enrolled && (
                      <Link to={`/quizzes/${quiz.id}`}>
                        <Button size="sm" variant="outline" className="gap-1">
                          {quiz.is_attempted ? 'Retake' : 'Start'} <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
