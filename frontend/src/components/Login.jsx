import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setPendingApproval(false); setLoading(true);
    try {
      const data = await login(username, password);
      const role = data.user?.role;
      navigate(role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.pending_approval) { setPendingApproval(true); setError(data.error); }
      else setError(data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const demoAccounts = [
    { role: 'Admin', user: 'admin', pass: 'admin123', color: 'bg-red-500' },
    { role: 'Teacher', user: 'teacher', pass: 'teacher123', color: 'bg-blue-500' },
    { role: 'Student', user: 'student', pass: 'student123', color: 'bg-emerald-500' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #e8f4fc 0%, #dbeafe 30%, #e0f2fe 60%, #f0f9ff 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-visible"
        style={{ width: 'calc(100vw - 2rem)', height: 'calc(100vh - 2rem)', background: 'linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(219,234,254,0.5) 45%, rgba(186,230,253,0.4) 100%)' }}>

        <div className="grid md:grid-cols-[1fr_1fr] items-center h-full">

          {/* ── Left: Branding Only ── */}
          <div className="flex flex-col justify-center px-20 py-16">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-14">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-md shadow-blue-200">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-[1.65rem] font-bold text-blue-600 tracking-tight">LearnHub</span>
            </div>

            {/* Headline */}
            <h2 className="text-[2rem] md:text-[2.3rem] font-bold text-gray-900 leading-[1.18] tracking-tight mb-5">
              The Only Platform You Need for Online Learning
            </h2>
            <p className="text-[0.95rem] text-gray-500 leading-relaxed max-w-[400px]">
              Learn from expert instructors. Track your progress, take quizzes, and earn certificates — all from one unified dashboard.
            </p>
          </div>

          {/* ── Right: Floating Sign-In Card ── */}
          <div className="flex items-center justify-center px-6 py-10 md:py-0">
            <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-[0_4px_40px_-8px_rgba(59,130,246,0.12)] border border-gray-100"
              style={{ padding: '2.5rem 3rem' }}>

              <h1 className="text-[1.75rem] font-bold text-gray-900 tracking-tight leading-tight">Welcome back</h1>
              <p className="text-[0.9rem] text-gray-500 mt-2">Sign in to access your dashboard</p>

              {pendingApproval && (
                <div className="mt-10 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
                </div>
              )}
              {error && !pendingApproval && (
                <div className="mt-10 flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                {/* Email */}
                <div>
                  <Label htmlFor="username" className="text-[13px] font-semibold text-gray-700">Email Address</Label>
                  <div className="relative" style={{ marginTop: '0.5rem' }}>
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <Input id="username" type="text" placeholder="you@example.com" value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{ paddingLeft: '3rem' }}
                      className="h-[44px] rounded-xl border-gray-200 bg-gray-50/60 text-[0.9rem] placeholder:text-gray-400 focus-visible:ring-blue-500 focus-visible:border-blue-500" required />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginTop: '0.9rem' }}>
                  <Label htmlFor="password" className="text-[13px] font-semibold text-gray-700">Password</Label>
                  <div className="relative"style={{ marginTop: '0.5rem' }}>
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <Input id="password" type="password" placeholder="••••••••" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: '3rem' }}
                      className="h-[44px] rounded-xl border-gray-200 bg-gray-50/60 text-[0.9rem] placeholder:text-gray-400 focus-visible:ring-blue-500 focus-visible:border-blue-500" required />
                  </div>
                </div>

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between mt-7" style={{ marginTop: '0.9rem' }}>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="w-[18px] h-[18px] rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                    <span className="text-gray-600 text-[13.5px]">Remember me</span>
                  </label>
                  <span className="text-blue-500 text-[13.5px] font-medium cursor-pointer hover:underline">Forgot password?</span>
                </div>

                {/* Sign In */}
                <Button type="submit"
                  className="w-full h-[44px] rounded-xl text-[0.9rem] font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-200/50 mt-7"
                  disabled={loading} style={{ marginTop: '1rem' }}>
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                  ) : 'Sign In'}
                </Button>
              </form>

              <p className="text-center text-[0.8rem] text-gray-500 mt-7" style={{ marginTop: '0.7rem' }}>
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-500 font-semibold hover:underline">Sign Up</Link>
              </p>

              {/* Demo accounts */}
              <div className="mt-6 pt-5 border-t border-gray-100" style={{ marginTop: '1.3rem' }}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em] mb-3 text-center">Quick Demo Access</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {demoAccounts.map((d) => (
                    <button key={d.role} type="button"
                      onClick={() => { setUsername(d.user); setPassword(d.pass); }}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50/80 hover:bg-white hover:shadow-sm transition-all cursor-pointer text-[12.5px]">
                      <span className={`w-2 h-2 rounded-full ${d.color}`} />
                      <span className="font-semibold text-gray-600">{d.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
