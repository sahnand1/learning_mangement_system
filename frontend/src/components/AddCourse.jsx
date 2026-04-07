import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCourse } from '../api';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function AddCourse() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', thumbnail_url: '' });
  const [lessons, setLessons] = useState([{ title: '', description: '', video_url: '', duration: '' }]);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quiz, setQuiz] = useState({ title: '', pass_percentage: 50, questions: [{ text: '', options: ['', '', '', ''], correct: 0 }] });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const updateLesson = (i, k, v) => {
    const l = [...lessons]; l[i] = { ...l[i], [k]: v }; setLessons(l);
  };
  const addLesson = () => setLessons([...lessons, { title: '', description: '', video_url: '', duration: '' }]);
  const removeLesson = (i) => lessons.length > 1 && setLessons(lessons.filter((_, j) => j !== i));

  const updateQuestion = (i, k, v) => {
    const q = { ...quiz, questions: [...quiz.questions] }; q.questions[i] = { ...q.questions[i], [k]: v }; setQuiz(q);
  };
  const updateOption = (qi, oi, v) => {
    const q = { ...quiz, questions: [...quiz.questions] };
    q.questions[qi] = { ...q.questions[qi], options: q.questions[qi].options.map((o, j) => j === oi ? v : o) };
    setQuiz(q);
  };
  const addQuestion = () => setQuiz({ ...quiz, questions: [...quiz.questions, { text: '', options: ['', '', '', ''], correct: 0 }] });
  const removeQuestion = (i) => quiz.questions.length > 1 && setQuiz({ ...quiz, questions: quiz.questions.filter((_, j) => j !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        ...form,
        lessons: lessons.map((l, i) => ({ ...l, order: i + 1, duration: parseInt(l.duration) || 0 })),
      };
      if (hasQuiz) payload.quiz = quiz;
      await createCourse(payload);
      navigate('/teacher');
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="px-6 lg:px-10 py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/teacher">
          <Button variant="ghost" size="sm" className="gap-1 mb-4 text-muted-foreground"><ChevronLeft className="w-4 h-4" /> Back to Dashboard</Button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Create New Course</h1>
        <p className="text-sm text-muted-foreground mb-6">Add a course with lessons and an optional quiz</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Course Title *</Label>
              <Input placeholder="e.g., Advanced React Development" value={form.title} onChange={set('title')} required />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea placeholder="Describe what students will learn..." value={form.description} onChange={set('description')} rows={4} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input placeholder="e.g., Programming" value={form.category} onChange={set('category')} />
              </div>
              <div className="space-y-2">
                <Label>Thumbnail URL</Label>
                <Input placeholder="https://..." value={form.thumbnail_url} onChange={set('thumbnail_url')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Lessons</CardTitle>
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addLesson}><Plus className="w-4 h-4" /> Add Lesson</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessons.map((l, i) => (
              <div key={i} className="p-4 rounded-lg border bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lesson {i + 1}</span>
                  {lessons.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => removeLesson(i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="Lesson title" value={l.title} onChange={e => updateLesson(i, 'title', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Brief description" value={l.description} onChange={e => updateLesson(i, 'description', e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label>Video URL</Label>
                    <Input placeholder="https://www.youtube.com/embed/..." value={l.video_url} onChange={e => updateLesson(i, 'video_url', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input type="number" value={l.duration} onChange={e => updateLesson(i, 'duration', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Quiz (Optional)</CardTitle>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={hasQuiz} onChange={e => setHasQuiz(e.target.checked)} className="rounded border-border" />
              Include Quiz
            </label>
          </CardHeader>
          {hasQuiz && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quiz Title</Label>
                  <Input placeholder="Quiz title" value={quiz.title} onChange={e => setQuiz({ ...quiz, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Pass Percentage</Label>
                  <Input type="number" min={0} max={100} value={quiz.pass_percentage} onChange={e => setQuiz({ ...quiz, pass_percentage: parseInt(e.target.value) })} />
                </div>
              </div>

              <Separator />

              {quiz.questions.map((q, qi) => (
                <div key={qi} className="p-4 rounded-lg border bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Question {qi + 1}</span>
                    {quiz.questions.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => removeQuestion(qi)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Input placeholder="Question text" value={q.text} onChange={e => updateQuestion(qi, 'text', e.target.value)} required />
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((o, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${qi}`} checked={q.correct === oi}
                          onChange={() => updateQuestion(qi, 'correct', oi)} className="accent-primary" />
                        <Input placeholder={`Option ${oi + 1}`} value={o} onChange={e => updateOption(qi, oi, e.target.value)} required />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addQuestion}><Plus className="w-4 h-4" /> Add Question</Button>
            </CardContent>
          )}
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? 'Creating...' : 'Create Course'}
          </Button>
          <Link to="/teacher"><Button type="button" variant="outline">Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}
