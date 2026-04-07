import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLesson, completeLesson, getCourse } from '../api';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Clock, BookOpen, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLesson(id).then(async (res) => {
      setLesson(res.data);
      if (res.data.course_id) {
        const cRes = await getCourse(res.data.course_id);
        setCourse(cRes.data);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleComplete = async () => {
    setCompleting(true);
    try { await completeLesson(id); setLesson(prev => ({ ...prev, is_completed: true })); }
    catch (err) { console.error(err); } finally { setCompleting(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;
  if (!lesson) return <div className="text-center py-16 text-muted-foreground">Lesson not found.</div>;

  const lessons = course?.lessons || [];
  const currentIdx = lessons.findIndex(l => l.id === parseInt(id));
  const prev = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const next = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  return (
    <div className="px-6 lg:px-10 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <Button variant="ghost" size="sm" className="gap-1 mb-4 text-muted-foreground" onClick={() => navigate(`/courses/${lesson.course_id}`)}>
              <ChevronLeft className="w-4 h-4" /> Back to Course
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-xl font-bold text-foreground tracking-tight">{lesson.title}</h1>
              {lesson.is_completed && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1"><Check className="w-3 h-3" /> Completed</Badge>}
            </div>

            {lesson.video_url && (
              <Card className="mb-6 overflow-hidden">
                <div className="aspect-video">
                  <iframe src={lesson.video_url} title={lesson.title} className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              </Card>
            )}

            {lesson.description && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">{lesson.description}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between gap-4">
              {prev ? (
                <Button variant="outline" className="gap-2" onClick={() => navigate(`/lessons/${prev.id}`)}>
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
              ) : <div />}

              {!lesson.is_completed && (
                <Button className="gap-2" variant="default" onClick={handleComplete} disabled={completing}>
                  <Check className="w-4 h-4" /> {completing ? 'Completing...' : 'Mark Complete'}
                </Button>
              )}

              {next ? (
                <Button variant="outline" className="gap-2" onClick={() => navigate(`/lessons/${next.id}`)}>
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : <div />}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        {lessons.length > 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="lg:w-72">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Lessons</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {lessons.map((l, i) => (
                    <button key={l.id} onClick={() => navigate(`/lessons/${l.id}`)}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-colors cursor-pointer text-sm
                        ${l.id === parseInt(id) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent text-muted-foreground'}`}>
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0
                        ${l.is_completed ? 'bg-emerald-100 text-emerald-700' : l.id === parseInt(id) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {l.is_completed ? <Check className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span className="truncate">{l.title}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
