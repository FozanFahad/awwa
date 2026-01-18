import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  ClipboardList, 
  Wrench, 
  SprayCan,
  Clock,
  User,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  type: 'housekeeping' | 'maintenance';
  unit: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string | null;
  dueAt: string | null;
  reservation: string | null;
}

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
};

export default function Tasks() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    housekeeping: 0,
    maintenance: 0,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: tasksData } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          task_type,
          priority,
          status,
          due_at,
          units (name_en, name_ar),
          profiles:assigned_to (full_name),
          reservations (confirmation_code)
        `)
        .order('created_at', { ascending: false });

      const formattedTasks: Task[] = (tasksData || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        type: t.task_type,
        unit: language === 'ar' ? t.units?.name_ar : t.units?.name_en || '-',
        priority: t.priority,
        status: t.status,
        assignedTo: t.profiles?.full_name || null,
        dueAt: t.due_at ? format(new Date(t.due_at), 'yyyy-MM-dd HH:mm') : null,
        reservation: t.reservations?.confirmation_code || null,
      }));

      setTasks(formattedTasks);

      // Calculate stats
      setStats({
        pending: formattedTasks.filter(t => t.status === 'pending').length,
        inProgress: formattedTasks.filter(t => t.status === 'in_progress').length,
        housekeeping: formattedTasks.filter(t => t.type === 'housekeeping').length,
        maintenance: formattedTasks.filter(t => t.type === 'maintenance').length,
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'housekeeping') return task.type === 'housekeeping';
    if (activeTab === 'maintenance') return task.type === 'maintenance';
    if (activeTab === 'pending') return task.status === 'pending';
    if (activeTab === 'in_progress') return task.status === 'in_progress';
    return true;
  });

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      low: { en: 'Low', ar: 'منخفض' },
      medium: { en: 'Medium', ar: 'متوسط' },
      high: { en: 'High', ar: 'عالي' },
      urgent: { en: 'Urgent', ar: 'عاجل' },
    };
    return labels[priority]?.[language] || priority;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('dashboard.tasks')}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة مهام التدبير المنزلي والصيانة'
              : 'Manage housekeeping and maintenance tasks'}
          </p>
        </div>
        <Button size="sm" className="gap-2 btn-gold">
          <Plus className="h-4 w-4" />
          {language === 'ar' ? 'مهمة جديدة' : 'New Task'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'معلقة' : 'Pending'}
              </p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <ClipboardList className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
              </p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <SprayCan className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t('task.housekeeping')}
              </p>
              <p className="text-2xl font-bold">{stats.housekeeping}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Wrench className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t('task.maintenance')}
              </p>
              <p className="text-2xl font-bold">{stats.maintenance}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs & Task List */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                {language === 'ar' ? 'الكل' : 'All'}
              </TabsTrigger>
              <TabsTrigger value="housekeeping">
                {t('task.housekeeping')}
              </TabsTrigger>
              <TabsTrigger value="maintenance">
                {t('task.maintenance')}
              </TabsTrigger>
              <TabsTrigger value="pending">
                {t('status.pending')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا توجد مهام' : 'No tasks found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg border border-border hover:border-accent/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          task.type === 'housekeeping' ? 'bg-accent/10' : 'bg-secondary'
                        )}>
                          {task.type === 'housekeeping' 
                            ? <SprayCan className="h-4 w-4 text-accent" />
                            : <Wrench className="h-4 w-4 text-secondary-foreground" />
                          }
                        </div>
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5" />
                            {task.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className={priorityColors[task.priority]}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                      <StatusBadge status={task.status} type="task" />
                      
                      {task.assignedTo ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          {task.assignedTo}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-warning border-warning/20">
                          {language === 'ar' ? 'غير مُسند' : 'Unassigned'}
                        </Badge>
                      )}
                      
                      {task.dueAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {task.dueAt}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
