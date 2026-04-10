import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, BookOpen, LayoutDashboard, BarChart3, Shield, Menu, X, LogOut, Activity, ChevronRight, Library, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const isActive = (path) => path === '/' ? location.pathname === '/' : (location.pathname === path || location.pathname.startsWith(path + '/'));

  const navLinks = user ? (
    user.role === 'admin' ? [
      { to: '/', label: 'Home', icon: Home },
      { to: '/admin', label: 'Dashboard', icon: Shield },
      { to: '/courses', label: 'Courses', icon: BookOpen },
      { to: '/admin/activity', label: 'Activity', icon: Activity },
    ] : user.role === 'teacher' ? [
      { to: '/', label: 'Home', icon: Home },
      { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/courses', label: 'Courses', icon: BookOpen },
    ] : [
      { to: '/', label: 'Home', icon: Home },
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/courses', label: 'Courses', icon: BookOpen },
      { to: '/my-courses', label: 'My Courses', icon: Library },
      { to: '/performance', label: 'Performance', icon: BarChart3 },
    ]
  ) : [{ to: '/', label: 'Home', icon: Home }, { to: '/courses', label: 'Courses', icon: BookOpen }];

  const homeLink = user ? (user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/dashboard') : '/courses';

  // ── Desktop Sidebar ──
  const sidebar = (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[220px] z-50 rounded-r-2xl"
      style={{ background: '#1e293b' }}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 px-6 pt-7 pb-6">
        <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <span className="text-[1.1rem] font-bold text-white tracking-tight">LearnHub</span>
      </Link>

      {/* Nav Links */}
      <nav className="flex-1 px-3 mt-2" style={{ marginTop: '2rem' }}>
        <div className="space-y-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[0.95rem] font-medium transition-all cursor-pointer
                ${isActive(to)
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}`} style={{ marginTop: '0.5rem' }}>
                <Icon className="w-[18px] h-[18px]" />
                <span>{label}</span>
                {isActive(to) && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom: User + Logout */}
      <div className="px-4 pb-6">
        {user ? (
          <>
            <Separator className="mb-4 bg-slate-700/50" />
            <div className="flex items-center gap-3 px-2 mb-4">
              <Avatar className="h-9 w-9 border-2 border-slate-600">
                <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                  {user.full_name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white leading-tight truncate">{user.full_name}</span>
                <span className="text-[11px] text-slate-400 capitalize">{user.role}</span>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[0.85rem] font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full cursor-pointer">
              <LogOut className="w-[18px] h-[18px]" />
              <span>Log Out</span>
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <Link to="/login">
              <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5">Log in</Button>
            </Link>
            <Link to="/register">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Sign up</Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );

  // ── Mobile Top Bar ──
  const mobileBar = (
    <div className="md:hidden sticky top-0 z-50 border-b" style={{ background: '#1e293b' }}>
      <div className="flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">LearnHub</span>
        </Link>
        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="border-t border-slate-700 overflow-hidden" style={{ background: '#1e293b' }}>
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive(to) ? 'bg-blue-500/15 text-blue-400' : 'text-slate-400 hover:text-white'}`}>
                    <Icon className="w-4 h-4" /> {label}
                  </div>
                </Link>
              ))}
              {user ? (
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 w-full">
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <div className="px-4 py-2.5 text-sm text-slate-300">Log in</div>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <div className="px-4 py-2.5 text-sm text-blue-400 font-medium">Sign up</div>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {sidebar}
      {mobileBar}
    </>
  );
}
