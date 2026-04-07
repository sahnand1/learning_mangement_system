import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getPendingUsers, getAllUsers, getAdminStudentsPerformance, approveUser, rejectUser } from '../api';
import { motion } from 'framer-motion';
import { Clock, Users, GraduationCap, BookOpen, BarChart3, Check, X, AlertCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    Promise.all([getAdminStats(), getPendingUsers(), getAllUsers(), getAdminStudentsPerformance()])
      .then(([s, p, u, perf]) => { setStats(s.data); setPending(p.data.users); setUsers(u.data.users); setPerformance(perf.data.students); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleApprove = async (id) => { await approveUser(id); load(); };
  const handleReject = async () => { await rejectUser(rejectModal, rejectReason); setRejectModal(null); setRejectReason(''); load(); };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;

  const statCards = [
    { label: 'Pending', value: stats?.pending_registrations || 0, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Students', value: stats?.students || 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Teachers', value: stats?.teachers || 0, icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Courses', value: stats?.courses || 0, icon: BookOpen, color: 'text-violet-600 bg-violet-50' },
    { label: 'Enrollments', value: stats?.enrollments || 0, icon: BarChart3, color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="px-6 lg:px-10 py-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage students, approve registrations, and monitor platform</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((s, i) => (
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

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="users">All Users ({users.length})</TabsTrigger>
          <TabsTrigger value="performance">Student Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              {pending.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl mb-3">
                    <Check className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">No pending registrations</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{u.username}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{u.role}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{u.subject || '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" className="gap-1 text-emerald-600 hover:bg-emerald-50" onClick={() => handleApprove(u.id)}>
                              <Check className="w-4 h-4" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1 text-destructive hover:bg-destructive/10" onClick={() => setRejectModal(u.id)}>
                              <X className="w-4 h-4" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.username}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{u.role}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={u.is_approved ? 'default' : 'destructive'}
                          className={u.is_approved ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}>
                          {u.is_approved ? 'Active' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/admin/users/${u.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1"><Eye className="w-4 h-4" /> View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardContent className="pt-6">
              {performance.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No student data available.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Lessons</TableHead>
                      <TableHead>Quizzes</TableHead>
                      <TableHead>Avg Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performance.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Link to={`/admin/users/${s.id}`} className="font-medium text-primary hover:underline">{s.full_name}</Link>
                        </TableCell>
                        <TableCell>{s.enrolled_courses}</TableCell>
                        <TableCell>{s.lessons_completed}</TableCell>
                        <TableCell>{s.quizzes_taken}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{s.avg_score}%</Badge>
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

      {/* Reject Dialog */}
      <Dialog open={!!rejectModal} onOpenChange={() => { setRejectModal(null); setRejectReason(''); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Registration</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea placeholder="Provide a reason for rejection..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
