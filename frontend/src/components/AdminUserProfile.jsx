import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAdminUserProfile } from '../api';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, CheckCircle, FileText, Award, Trophy, Users, MessageSquare, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export default function AdminUserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminUserProfile(id).then(res => setUser(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;
  if (!user) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <AlertCircle className="w-8 h-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">User not found.</p>
    </div>
  );

  const isStudent = user.role === 'student';
  const isTeacher = user.role === 'teacher';

  const stats = isStudent ? [
    { label: 'Courses', value: user.courses?.length || 0, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
    { label: 'Completed', value: user.courses?.filter(c => c.progress === 100).length || 0, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Quizzes', value: user.quiz_history?.length || 0, icon: FileText, color: 'text-violet-600 bg-violet-50' },
    { label: 'Avg Score', value: user.quiz_history?.length ? Math.round(user.quiz_history.reduce((a, q) => a + q.score, 0) / user.quiz_history.length) + '%' : 'N/A', icon: Trophy, color: 'text-amber-600 bg-amber-50' },
  ] : [
    { label: 'Courses', value: user.courses?.length || 0, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
    { label: 'Students', value: user.student_count || 0, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Feedbacks', value: user.feedback_count || 0, icon: MessageSquare, color: 'text-violet-600 bg-violet-50' },
  ];

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="gap-1 mb-4 text-muted-foreground"><ChevronLeft className="w-4 h-4" /> Back to Admin</Button>
        </Link>

        <Card className="mb-6">
          <CardContent className="p-6 flex items-center gap-5">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {user.full_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-foreground">{user.full_name}</h1>
              <p className="text-sm text-muted-foreground">@{user.username} · {user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="capitalize">{user.role}</Badge>
                <Badge variant={user.is_approved ? 'secondary' : 'destructive'}>{user.is_approved ? 'Active' : 'Pending'}</Badge>
              </div>
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

      {/* Course Progress (Student) */}
      {isStudent && user.courses && user.courses.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Course Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.courses.map(c => (
                <div key={c.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{c.title}</p>
                    <span className="text-sm font-bold text-primary">{c.progress}%</span>
                  </div>
                  <Progress value={c.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz History (Student) */}
      {isStudent && user.quiz_history && user.quiz_history.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Quiz History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.quiz_history.map((q, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{q.quiz_title}</TableCell>
                    <TableCell className="text-muted-foreground">{q.course_title}</TableCell>
                    <TableCell>{q.score}%</TableCell>
                    <TableCell>
                      <Badge variant={q.passed ? 'default' : 'destructive'} className={q.passed ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}>
                        {q.passed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{q.date ? new Date(q.date).toLocaleDateString() : ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Teacher Info */}
      {isTeacher && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Teacher Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {user.subject && <div><span className="text-muted-foreground">Subject:</span> <span className="font-medium ml-1">{user.subject}</span></div>}
              {user.qualification && <div><span className="text-muted-foreground">Qualification:</span> <span className="font-medium ml-1">{user.qualification}</span></div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedbacks */}
      {user.feedbacks && user.feedbacks.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Feedbacks</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.feedbacks.map((f, i) => (
                <div key={i} className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="secondary" className="text-xs">{f.course_title || 'Course'}</Badge>
                    <span className="text-xs text-muted-foreground">{f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{f.text}</p>
                  {f.teacher_name && <p className="text-xs text-muted-foreground/70 mt-1">by {f.teacher_name}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
