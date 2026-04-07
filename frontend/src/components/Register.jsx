import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, User, Mail, Lock, BookOpen, Award, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', username: '', email: '', password: '', role: 'student', subject: '', qualification: '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await register(form);
      if (data.pending) { setPending(true); return; }
      navigate(form.role === 'teacher' ? '/teacher' : '/dashboard');
    } catch (err) { setError(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  if (pending) return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #e8f4fc 0%, #dbeafe 30%, #e0f2fe 60%, #f0f9ff 100%)' }}>
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_4px_40px_-8px_rgba(59,130,246,0.12)] border border-gray-100 text-center"
        style={{ padding: '3.5rem' }}>
        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-5">
          <Clock className="w-7 h-7 text-amber-600" />
        </div>
        <h2 className="text-[1.5rem] font-bold text-gray-900 mb-2">Pending Approval</h2>
        <p className="text-[0.9rem] text-gray-500 leading-relaxed mb-8">Your teacher account is pending admin approval. You'll be able to sign in once approved.</p>
        <Link to="/login">
          <Button className="h-[42px] rounded-xl text-[0.9rem] font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-200/50 px-8">
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #e8f4fc 0%, #dbeafe 30%, #e0f2fe 60%, #f0f9ff 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-visible"
        style={{ width: 'calc(100vw - 2rem)', height: 'calc(100vh - 2rem)', background: 'linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(219,234,254,0.5) 45%, rgba(186,230,253,0.4) 100%)' }}>

        <div className="grid md:grid-cols-[1fr_1fr] items-center h-full">

          {/* ── Left: Branding ── */}
          <div className="flex flex-col justify-center px-20 py-16">
            <div className="flex items-center gap-3 mb-14">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-md shadow-blue-200">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-[1.65rem] font-bold text-blue-600 tracking-tight">LearnHub</span>
            </div>

            <h2 className="text-[2rem] md:text-[2.3rem] font-bold text-gray-900 leading-[1.18] tracking-tight mb-5">
              Start Your Learning Journey Today
            </h2>
            <p className="text-[0.95rem] text-gray-500 leading-relaxed max-w-[400px]">
              Join thousands of learners and instructors. Create your account and get access to courses, quizzes, and certificates.
            </p>
          </div>

          {/* ── Right: Sign-Up Card ── */}
          <div className="flex items-center justify-center px-6 py-10 md:py-0">
            <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-[0_4px_40px_-8px_rgba(59,130,246,0.12)] border border-gray-100"
              style={{ padding: '2.5rem 3rem' }}>

              <h1 className="text-[1.75rem] font-bold text-gray-900 tracking-tight leading-tight">Create account</h1>
              <p className="text-[0.9rem] text-gray-500 mt-2">Fill in your details to get started</p>

              {error && (
                <div style={{ marginTop: '1rem' }} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                {/* Role selector */}
                <div>
                  <Label className="text-[13px] font-semibold text-gray-700">I want to register as</Label>
                  <div className="grid grid-cols-2 gap-3" style={{ marginTop: '0.5rem' }}>
                    {['student', 'teacher'].map(r => (
                      <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                        className={`py-3 rounded-xl border text-[0.85rem] font-semibold transition-all cursor-pointer capitalize
                          ${form.role === r ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name */}
                <div style={{ marginTop: '0.9rem' }}>
                  <Label htmlFor="full_name" className="text-[13px] font-semibold text-gray-700">Full Name</Label>
                  <div className="relative" style={{ marginTop: '0.5rem' }}>
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <Input id="full_name" placeholder="John Doe" value={form.full_name} onChange={set('full_name')}
                      style={{ paddingLeft: '3rem' }}
                      className="h-[42px] rounded-xl border-gray-200 bg-gray-50/60 text-[0.9rem] placeholder:text-gray-400 focus-visible:ring-blue-500 focus-visible:border-blue-500" required />
                  </div>
                </div>

                {/* Username & Email row */}
                <div className="grid grid-cols-2 gap-3" style={{ marginTop: '0.9rem' }}>
                  <div>
                    <Label htmlFor="username" className="text-[13px] font-semibold text-gray-700">Username</Label>
                    <div className="relative" style={{ marginTop: '0.5rem' }}>
                      <Input id="username" placeholder="johndoe" value={form.username} onChange={set('username')}
                        style={{ paddingLeft: '1rem' }}
                        className="h-[42px] rounded-xl border-gray-200 bg-gray-50/60 text-[0.9rem] placeholder:text-gray-400 focus-visible:ring-blue-500 focus-visible:border-blue-500" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-[13px] font-semibold text-gray-700">Email</Label>
                    <div className="relative" style={{ marginTop: '0.5rem' }}>
                      <Input id="email" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')}
                        style={{ paddingLeft: '1rem' }}
                        className="h-[42px] rounded-xl border-gray-200 bg-gray-50/60 text-[0.9rem] placeholder:text-gray-400 focus-visible:ring-blue-500 focus-visible:border-blue-500" required />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginTop: '0.9rem' }}>
                  <Label htmlFor="password" className="text-[13px] font-semibold text-gray-700">Password</Label>
                  <div className="relative" style={{ marginTop: '0.5rem' }}>
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <Input id="password" type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')}
                      style={{ paddingLeft: '3rem' }}
                      className="h-[42px] rounded-xl border-gray-200 bg-gray-50/60 text-[0.9rem] placeholder:text-gray-400 focus-visible:ring-blue-500 focus-visible:border-blue-500" required minLength={8} />
                  </div>
                </div>

                {/* Teacher-only fields */}
                <AnimatePresence>
                  {form.role === 'teacher' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div style={{ marginTop: '0.9rem' }}>
                        <Label htmlFor="subject" className="text-[13px] font-semibold text-gray-700">Subject / Area</Label>
                        <div className="relative" style={{ marginTop: '0.5rem' }}>
                          <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          <Input id="subject" placeholder="e.g., Mathematics" value={form.subject} onChange={set('subject')}
                            style={{ paddingLeft: '3rem' }}
                            className="h-[42px] rounded-xl border-gray-200 bg-gray-50/60 text-[0.9rem] placeholder:text-gray-400 focus-visible:ring-blue-500 focus-visible:border-blue-500" />
                        </div>
                      </div>
                      <div style={{ marginTop: '0.9rem' }}>
                        <Label htmlFor="qualification" className="text-[13px] font-semibold text-gray-700">Qualification</Label>
                        <div className="relative" style={{ marginTop: '0.5rem' }}>
                          <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          <Input id="qualification" placeholder="e.g., M.Sc. in Computer Science" value={form.qualification} onChange={set('qualification')}
                            style={{ paddingLeft: '3rem' }}
                            className="h-[42px] rounded-xl border-gray-200 bg-gray-50/60 text-[0.9rem] placeholder:text-gray-400 focus-visible:ring-blue-500 focus-visible:border-blue-500" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <Button type="submit"
                  className="w-full h-[44px] rounded-xl text-[0.9rem] font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-200/50"
                  disabled={loading} style={{ marginTop: '1.2rem' }}>
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                  ) : `Register as ${form.role}`}
                </Button>
              </form>

              <p className="text-center text-[0.8rem] text-gray-500" style={{ marginTop: '0.7rem' }}>
                Already have an account?{' '}
                <Link to="/login" className="text-blue-500 font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
