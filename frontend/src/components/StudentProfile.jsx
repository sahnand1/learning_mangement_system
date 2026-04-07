import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTeacherStudentProfile, giveFeedback } from '../api';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, CheckCircle, FileText, Award, MessageSquare, AlertCircle, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    getTeacherStudentProfile(id).then(res => setStudent(res.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!courseId || !text.trim()) return;
    setSending(true);
    try { await giveFeedback({ student_id: id, course_id: courseId, text: text.trim() }); setText(''); setCourseId(''); load(); }
    catch (err) { console.error(err); } finally { setSending(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;
  if (!student) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <AlertCircle className="w-8 h-8 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">Student not found.</p>
    </div>
  );

  const stats = [
    { label: 'Courses', value: student.courses?.length || 0, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
    { label: 'Completed', value: student.courses?.filter(c => c.progress === 100).length || 0, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Quizzes', value: student.quiz_history?.length || 0, icon: FileText, color: 'text-violet-600 bg-violet-50' },
    { label: 'Avg Score', value: student.quiz_history?.length ? Math.round(student.quiz_history.reduce((a, q) => a + q.score, 0) / student.quiz_history.length) + '%' : 'N/A', icon: Award, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/teacher">
          <Button variant="ghost" size="sm" className="gap-1 mb-4 text-muted-foreground"><ChevronLeft className="w-4 h-4" /> Back to Dashboard</Button>
        </Link>

        <Card className="mb-6">
          <CardContent className="p-6 flex items-center gap-5">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {student.full_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-foreground">{student.full_name}</h1>
              <p className="text-sm text-muted-foreground">@{student.username}</p>
              {student.created_at && <p className="text-xs text-muted-foreground/70 mt-1">Joined {new Date(student.created_at).toLocaleDateString()}</p>}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-5">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${s.color} mb-3`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Course Progress */}
      {student.courses && student.courses.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Course Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {student.courses.map(c => (
                <div key={c.id} className="p-4 rounded-lg border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium truncate pr-2">{c.title}</h3>
                    <Badge variant={c.progress === 100 ? 'default' : 'secondary'}
                      className={c.progress === 100 ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}>
                      {c.progress || 0}%
                    </Badge>
                  </div>
                  <Progress value={c.progress || 0} className="h-2" />
                  <p className="text-xs text-muted-foreground">{c.completed_lessons || 0}/{c.total_lessons || 0} lessons</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Give Feedback */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Give Feedback</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleFeedback} className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <select value={courseId} onChange={e => setCourseId(e.target.value)}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm">
                <option value="">Select a course</option>
                {student.courses?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea placeholder="Write feedback for this student..." value={text} onChange={e => setText(e.target.value)} rows={3} />
            </div>
            <Button type="submit" disabled={sending || !courseId || !text.trim()} className="gap-2">
              <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Feedback'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Feedback History */}
      {student.feedbacks && student.feedbacks.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Feedback History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {student.feedbacks.map((f, i) => (
                <div key={i} className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="secondary" className="text-xs">{f.course_title || 'Course'}</Badge>
                    <span className="text-xs text-muted-foreground">{f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
