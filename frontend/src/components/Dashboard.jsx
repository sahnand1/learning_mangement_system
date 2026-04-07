import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, getStudentFeedbacks } from '../api';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, FileText, Trophy, MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getStudentFeedbacks()])
      .then(([dashRes, fbRes]) => { setData(dashRes.data); setFeedbacks(fbRes.data.feedbacks); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;
  if (!data) return <div className="max-w-7xl mx-auto px-4 py-10 text-center text-destructive">Failed to load dashboard</div>;

  const { stats, enrolled_courses } = data;
  const statCards = [
    { label: 'Enrolled Courses', value: stats.enrolled_courses, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
    { label: 'Lessons Done', value: stats.lessons_completed, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Quizzes Taken', value: stats.quizzes_taken, icon: FileText, color: 'text-amber-600 bg-amber-50' },
    { label: 'Avg Score', value: `${stats.avg_score}%`, icon: Trophy, color: 'text-violet-600 bg-violet-50' },
  ];

  return (
    <div className="px-6 lg:px-10 py-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back, {user?.full_name}</h1>
        <p className="text-sm text-muted-foreground mt-1">Here's your learning overview</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-5">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${s.color} mb-3`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>My Courses</CardTitle>
              <Link to="/courses">
                <Button variant="ghost" size="sm" className="gap-1 text-primary">Browse all <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {enrolled_courses.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                  <Link to="/courses"><Button className="gap-2">Browse Courses <ArrowRight className="w-4 h-4" /></Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrolled_courses.map((c) => (
                    <Link key={c.id} to={`/courses/${c.id}`}
                      className="flex flex-col gap-2.5 p-4 rounded-lg border hover:bg-accent/50 transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{c.title}</span>
                          <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                        </div>
                        <span className="text-sm font-bold text-primary">{c.progress}%</span>
                      </div>
                      <Progress value={c.progress} className="h-2" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="w-4 h-4 text-muted-foreground" /> Teacher Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedbacks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No feedback received yet.</p>
              ) : (
                <div className="space-y-3">
                  {feedbacks.slice(0, 5).map((f) => (
                    <div key={f.id} className="p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{f.teacher_name}</span>
                        {f.course_title && <Badge variant="secondary" className="text-[10px]">{f.course_title}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
                      {f.created_at && <p className="text-xs text-muted-foreground/70 mt-2">{new Date(f.created_at).toLocaleDateString()}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
