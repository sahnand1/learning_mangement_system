import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../api';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Users, ArrowRight, CheckCircle, GraduationCap, Search, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 6;

const courseBgs = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
];

export default function Courses({ myCoursesOnly = false }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    getCourses().then((res) => {
      const all = res.data.courses;
      setCourses(myCoursesOnly ? all.filter(c => c.is_enrolled) : all);
    })
      .catch(console.error).finally(() => setLoading(false));
  }, [myCoursesOnly]);

  const categories = useMemo(() => {
    const cats = [...new Set(courses.map(c => c.category).filter(Boolean))];
    return ['all', ...cats];
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'all' || c.category === category;
      return matchSearch && matchCat;
    });
  }, [courses, search, category]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => setPage(1), [search, category]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;

  return (
    <div className="px-6 lg:px-10 py-8">
      {/* Header + Search */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{myCoursesOnly ? 'My Courses' : 'Courses'}</h1>
            <p className="text-sm text-muted-foreground mt-1">{myCoursesOnly ? `You are enrolled in ${courses.length} courses` : `Browse ${courses.length} courses from our expert instructors`}</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/70 border-gray-200" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-3 flex-wrap">
          {categories.map(c => (
            <button key={c}
              onClick={() => setCategory(c)}
              className={`capitalize text-sm font-medium px-5 py-2 rounded-xl transition-all cursor-pointer
                ${category === c
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-200/50'
                  : 'bg-white/70 text-gray-600 hover:bg-white hover:shadow-sm border border-gray-200/60'}`}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Course List */}
      {paginated.length === 0 ? (
        <Card className="py-16 bg-white/60">
          <CardContent className="text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No courses found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginated.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}>
              <Link to={`/courses/${course.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden bg-white/70 border-gray-100 hover:bg-white">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Course Image/Gradient */}
                      <div className="sm:w-64 h-44 sm:h-auto rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none flex items-center justify-center relative overflow-hidden shrink-0"
                        style={{ background: courseBgs[i % courseBgs.length], minHeight: '180px' }}>
                        <BookOpen className="w-16 h-16 text-white/25" />
                        {course.is_enrolled && (
                          <div className="absolute top-3 left-3">
                            <Badge className="gap-1 text-[10px] bg-emerald-500 text-white border-0 shadow-sm">
                              <CheckCircle className="w-3 h-3" /> Enrolled
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Course Details */}
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-1 text-amber-500 shrink-0 ml-3">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm font-semibold">{((course.student_count % 20) / 4 + 3.5).toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-[0.9rem] text-muted-foreground line-clamp-2 leading-relaxed mb-3">{course.description}</p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary" className="text-xs rounded-lg font-normal">{course.category}</Badge>
                            <Badge variant="outline" className="text-xs rounded-lg font-normal text-muted-foreground">
                              {course.lesson_count} lessons
                            </Badge>
                            <Badge variant="outline" className="text-xs rounded-lg font-normal text-muted-foreground">
                              {course.quiz_count} quiz
                            </Badge>
                          </div>
                        </div>

                        {/* Bottom row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {course.instructor_name}</span>
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.student_count}</span>
                          </div>

                          {course.is_enrolled ? (
                            <div className="flex items-center gap-3">
                              <Progress value={course.progress} className="h-1.5 w-20" />
                              <span className="text-xs font-semibold text-blue-600">{course.progress}%</span>
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-sm">
                              <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <PaginationItem key={p}>
                  <PaginationLink isActive={page === p} onClick={() => setPage(p)} className="cursor-pointer">{p}</PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
