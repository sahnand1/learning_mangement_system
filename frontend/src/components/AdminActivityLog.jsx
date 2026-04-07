import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminActivityLog } from '../api';
import { motion } from 'framer-motion';
import { ChevronLeft, LogIn, UserPlus, BookOpen, CheckCircle, FileText, MessageSquare, Calendar, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const actionIcons = {
  login: LogIn, registered: UserPlus, enrolled: BookOpen, lesson_completed: CheckCircle,
  quiz_completed: FileText, course_created: BookOpen, feedback_given: MessageSquare, exam_scheduled: Calendar,
};

export default function AdminActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminActivityLog().then(res => setActivities(res.data.activities)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const studentActs = activities.filter(a => a.role === 'student');
  const teacherActs = activities.filter(a => a.role === 'teacher');

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;

  const ActivityTable = ({ data }) => (
    data.length === 0 ? (
      <div className="text-center py-10">
        <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
      </div>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date & Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(a => {
            const Icon = actionIcons[a.action] || Activity;
            return (
              <TableRow key={a.id}>
                <TableCell>
                  <Link to={`/admin/users/${a.user_id}`} className="font-medium text-primary hover:underline">{a.full_name}</Link>
                  <p className="text-xs text-muted-foreground">@{a.username}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">{a.role}</Badge>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5 text-sm">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {a.action.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">{a.description}</TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">{a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )
  );

  return (
    <div className="px-6 lg:px-10 py-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="gap-1 mb-4 text-muted-foreground"><ChevronLeft className="w-4 h-4" /> Back to Admin</Button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Login and activity history of all users</p>
      </motion.div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({activities.length})</TabsTrigger>
          <TabsTrigger value="students">Students ({studentActs.length})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers ({teacherActs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all"><Card><CardContent className="pt-6"><ActivityTable data={activities} /></CardContent></Card></TabsContent>
        <TabsContent value="students"><Card><CardContent className="pt-6"><ActivityTable data={studentActs} /></CardContent></Card></TabsContent>
        <TabsContent value="teachers"><Card><CardContent className="pt-6"><ActivityTable data={teacherActs} /></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
