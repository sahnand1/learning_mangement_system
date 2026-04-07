import { useState, useEffect } from 'react';
import { getPerformance } from '../api';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, Award, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Performance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPerformance().then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;
  if (!data) return <div className="text-center py-16 text-destructive">Failed to load performance data.</div>;

  const stats = [
    { label: 'Lessons Done', value: data.lessons_completed, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Quizzes Taken', value: data.quizzes_taken, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'Quizzes Passed', value: data.quizzes_passed, icon: Award, color: 'text-amber-600 bg-amber-50' },
    { label: 'Avg Score', value: `${data.avg_score}%`, icon: Trophy, color: 'text-violet-600 bg-violet-50' },
  ];

  return (
    <div className="px-6 lg:px-10 py-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">My Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your learning progress and quiz scores</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
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

      {/* Course Progress */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="mb-6">
          <CardHeader><CardTitle>Course Progress</CardTitle></CardHeader>
          <CardContent>
            {(!data.course_progress || data.course_progress.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-6">No courses enrolled yet.</p>
            ) : (
              <div className="space-y-4">
                {data.course_progress.map(c => (
                  <div key={c.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.quizzes_taken} quiz taken · Avg: {c.avg_quiz_score}%</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quiz Score Bar Chart */}
      {data.quiz_history && data.quiz_history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="mb-6">
            <CardHeader><CardTitle>Recent Quiz Scores</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-48 pt-4">
                {data.quiz_history.slice(0, 8).map((q, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{q.score}%</span>
                    <div className="w-full bg-muted rounded-t-md overflow-hidden" style={{ height: '100%', position: 'relative' }}>
                      <div className={`absolute bottom-0 w-full rounded-t-md transition-all ${q.passed ? 'bg-emerald-500' : 'bg-destructive'}`}
                        style={{ height: `${q.score}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight truncate w-full">{q.quiz_title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quiz History Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardHeader><CardTitle>Quiz History</CardTitle></CardHeader>
          <CardContent>
            {(!data.quiz_history || data.quiz_history.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-6">No quizzes taken yet.</p>
            ) : (
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
                  {data.quiz_history.map((q, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{q.quiz_title}</TableCell>
                      <TableCell className="text-muted-foreground">{q.course_title}</TableCell>
                      <TableCell>{q.score}% ({q.correct}/{q.total})</TableCell>
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
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
