import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, getQuizQuestions, submitQuiz } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Clock, Target, FileText, AlertCircle, Check, X, Lightbulb, ArrowRight, Trophy, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('info'); // info | taking | result
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getQuiz(id).then(res => setQuiz(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const startQuiz = async () => {
    const res = await getQuizQuestions(id);
    setQuestions(res.data.questions);
    setPhase('taking');
  };

  const selectAnswer = (qId, optIdx) => setAnswers({ ...answers, [qId]: optIdx });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitQuiz(id, answers);
      setResult(res.data);
      setPhase('result');
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;
  if (!quiz) return <div className="text-center py-16 text-muted-foreground">Quiz not found.</div>;

  // Info phase
  if (phase === 'info') return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" className="gap-1 mb-6 text-muted-foreground" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl mx-auto mb-3">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="text-xl">{quiz.title}</CardTitle>
            <CardDescription>{quiz.course_title}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> {quiz.question_count} questions</span>
              <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Pass: {quiz.pass_percentage}%</span>
            </div>
            <Button className="gap-2 mt-4" onClick={startQuiz}>Start Quiz <ArrowRight className="w-4 h-4" /></Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  // Result phase
  if (phase === 'result' && result) {
    const passed = result.passed;
    return (
      <div className="max-w-lg mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${passed ? 'bg-emerald-100' : 'bg-destructive/10'}`}>
                {passed ? <Trophy className="w-8 h-8 text-emerald-600" /> : <X className="w-8 h-8 text-destructive" />}
              </div>
              <h2 className="text-2xl font-bold mb-1">{passed ? 'Congratulations!' : 'Not Quite'}</h2>
              <p className="text-sm text-muted-foreground mb-6">{passed ? 'You passed the quiz!' : 'You did not meet the passing score.'}</p>

              <div className="text-5xl font-bold text-foreground mb-2">{result.score}%</div>
              <p className="text-sm text-muted-foreground mb-6">{result.correct}/{result.total} correct answers</p>

              <div className="flex justify-center gap-3">
                <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}><ChevronLeft className="w-4 h-4" /> Back</Button>
                <Button className="gap-2" onClick={() => { setPhase('info'); setAnswers({}); setCurrent(0); setResult(null); }}>
                  <RotateCcw className="w-4 h-4" /> Retake
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Review questions */}
          {result.review && (
            <div className="mt-6 space-y-3">
              {result.review.map((q, i) => (
                <Card key={i} className={q.is_correct ? 'border-emerald-200' : 'border-destructive/30'}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${q.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>
                        {q.is_correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">{q.text}</p>
                        <div className="space-y-1">
                          {q.options.map((o, oi) => (
                            <div key={oi} className={`text-xs px-2.5 py-1.5 rounded-md
                              ${oi === q.correct_answer ? 'bg-emerald-50 text-emerald-700 font-medium' :
                                oi === q.user_answer && !q.is_correct ? 'bg-destructive/10 text-destructive line-through' : 'text-muted-foreground'}`}>
                              {o}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <div className="flex items-start gap-1.5 mt-2 text-xs text-muted-foreground">
                            <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" /> {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Taking phase
  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Question {current + 1} of {questions.length}</span>
          <Badge variant="secondary" className="text-xs">{quiz.title}</Badge>
        </div>
        <Progress value={progress} className="h-1.5 mb-8" />

        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <CardContent className="p-6">
                <p className="text-base font-medium text-foreground mb-6">{q.text}</p>
                <div className="space-y-2.5">
                  {q.options.map((opt, oi) => (
                    <button key={oi} onClick={() => selectAnswer(q.id, oi)}
                      className={`w-full text-left p-3.5 rounded-lg border text-sm transition-all cursor-pointer
                        ${answers[q.id] === oi
                          ? 'border-primary bg-primary/5 text-primary font-medium ring-1 ring-primary/20'
                          : 'hover:bg-accent hover:border-border'}`}>
                      <span className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0
                          ${answers[q.id] === oi ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          {current < questions.length - 1 ? (
            <Button onClick={() => setCurrent(c => c + 1)} className="gap-1" disabled={answers[q.id] === undefined}>
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!allAnswered || submitting} className="gap-1">
              {submitting ? 'Submitting...' : 'Submit Quiz'} <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
