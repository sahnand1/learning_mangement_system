import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getTeacherDashboard, getTeacherStudents, getScheduledExams, cancelScheduledExam, scheduleExam, getTeacherCourses } from '../api';
import { motion } from 'framer-motion';
import { BookOpen, Users, FileText, MessageSquare, Calendar, Plus, Trash2, Eye, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examModal, setExamModal] = useState(false);
  const [examForm, setExamForm] = useState({ course_id: '', title: '', date: '', duration: '' });

  const load = () => {
    Promise.all([getTeacherDashboard(), getTeacherStudents(), getScheduledExams(), getTeacherCourses()])
      .then(([d, s, e, c]) => { setData(d.data); setStudents(s.data.students); setExams(e.data.exams); setCourses(c.data.courses); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    await scheduleExam({ ...examForm, duration: parseInt(examForm.duration) });
    setExamModal(false); setExamForm({ course_id: '', title: '', date: '', duration: '' }); load();
  };
  const handleCancel = async (id) => { await cancelScheduledExam(id); load(); };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;

  const stats = [
    { label: 'My Courses', value: data?.stats?.courses || 0, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
    { label: 'Students', value: data?.stats?.students || 0, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Lessons', value: data?.stats?.lessons || 0, icon: FileText, color: 'text-amber-600 bg-amber-50' },
    { label: 'Feedbacks', value: data?.stats?.feedbacks || 0, icon: MessageSquare, color: 'text-violet-600 bg-violet-50' },
    { label: 'Active Exams', value: exams.length, icon: Calendar, color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="px-6 lg:px-10 py-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Teacher Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your courses, students, and exams</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
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

      <Tabs defaultValue="courses">
        <div className="flex items-center justify-between mb-1">
          <TabsList>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
            <TabsTrigger value="exams">Schedule Exams</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="courses">
          <div className="flex justify-end mb-4">
            <Link to="/teacher/add-course"><Button className="gap-2"><Plus className="w-4 h-4" /> Add Course</Button></Link>
          </div>
          {(!data?.courses || data.courses.length === 0) ? (
            <Card><CardContent className="text-center py-10"><p className="text-sm text-muted-foreground">No courses yet.</p></CardContent></Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.courses.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link to={`/courses/${c.id}`}>
                    <Card className="group hover:shadow-md transition-all h-full">
                      <div className="h-1.5 bg-primary" />
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="mb-3 text-xs">{c.category}</Badge>
                        <h3 className="font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">{c.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{c.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {c.lesson_count}</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {c.quiz_count}</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {c.student_count}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardContent className="pt-6">
              {students.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No students enrolled yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Lessons</TableHead>
                      <TableHead>Quizzes</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.full_name}</TableCell>
                        <TableCell>{s.enrolled_courses}</TableCell>
                        <TableCell>{s.lessons_completed}</TableCell>
                        <TableCell>{s.quizzes_taken}</TableCell>
                        <TableCell><Badge variant="secondary">{s.avg_score}%</Badge></TableCell>
                        <TableCell className="text-right">
                          <Link to={`/teacher/students/${s.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1"><Eye className="w-4 h-4" /> View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <div className="flex justify-end mb-4">
            <Button className="gap-2" onClick={() => setExamModal(true)}><Plus className="w-4 h-4" /> Schedule Exam</Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              {exams.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No exams scheduled.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map(e => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.title}</TableCell>
                        <TableCell className="text-muted-foreground">{e.course_title}</TableCell>
                        <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                        <TableCell>{e.duration} min</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleCancel(e.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Exam Dialog */}
      <Dialog open={examModal} onOpenChange={setExamModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Exam</DialogTitle></DialogHeader>
          <form onSubmit={handleSchedule} className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <select value={examForm.course_id} onChange={e => setExamForm({ ...examForm, course_id: e.target.value })} required
                className="w-full h-9 px-3 rounded-md border bg-background text-sm">
                <option value="">Select course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Exam Title</Label>
              <Input placeholder="e.g., Midterm Exam" value={examForm.title} onChange={e => setExamForm({ ...examForm, title: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={examForm.date} onChange={e => setExamForm({ ...examForm, date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input type="number" placeholder="60" value={examForm.duration} onChange={e => setExamForm({ ...examForm, duration: e.target.value })} required />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setExamModal(false)}>Cancel</Button>
              <Button type="submit">Schedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
