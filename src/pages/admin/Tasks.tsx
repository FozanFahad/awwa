import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Mock data
const tasks = [
  {
    id: '1',
    title: 'Prepare unit for guest arrival',
    titleAr: 'تجهيز الوحدة لوصول الضيف',
    type: 'housekeeping' as const,
    unit: 'Luxury Penthouse Suite',
    priority: 'high' as const,
    status: 'pending' as const,
    assignedTo: 'Aisha Mohammed',
    dueAt: '2026-01-18 14:00',
    reservation: 'AWA-A1B2C3',
  },
  {
    id: '2',
    title: 'Fix AC unit - not cooling properly',
    titleAr: 'إصلاح وحدة التكييف - لا تبرد بشكل صحيح',
    type: 'maintenance' as const,
    unit: 'Modern Studio Apartment',
    priority: 'urgent' as const,
    status: 'in_progress' as const,
    assignedTo: 'Omar Khalid',
    dueAt: '2026-01-17 10:00',
    reservation: null,
  },
  {
    id: '3',
    title: 'Checkout cleaning',
    titleAr: 'تنظيف بعد المغادرة',
    type: 'housekeeping' as const,
    unit: 'Family Executive Suite',
    priority: 'medium' as const,
    status: 'pending' as const,
    assignedTo: 'Fatima Ali',
    dueAt: '2026-01-19 12:00',
    reservation: 'AWA-G7H8I9',
  },
  {
    id: '4',
    title: 'Replace shower head',
    titleAr: 'استبدال رأس الدش',
    type: 'maintenance' as const,
    unit: 'Seaside Luxury Villa',
    priority: 'low' as const,
    status: 'completed' as const,
    assignedTo: 'Ahmed Salem',
    dueAt: '2026-01-16 15:00',
    reservation: null,
  },
  {
    id: '5',
    title: 'Deep cleaning after long stay',
    titleAr: 'تنظيف عميق بعد إقامة طويلة',
    type: 'housekeeping' as const,
    unit: 'Downtown Business Apartment',
    priority: 'high' as const,
    status: 'pending' as const,
    assignedTo: null,
    dueAt: '2026-01-20 09:00',
    reservation: 'AWA-M4N5O6',
  },
];

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
};

export default function Tasks() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'housekeeping') return task.type === 'housekeeping';
    if (activeTab === 'maintenance') return task.type === 'maintenance';
    if (activeTab === 'pending') return task.status === 'pending';
    if (activeTab === 'in_progress') return task.status === 'in_progress';
    return true;
  });

  const getPriorityLabel = (priority: string) => {
    const key = `task.priority.${priority}` as const;
    return t(key);
  };

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
              <p className="text-2xl font-bold">
                {tasks.filter(t => t.status === 'pending').length}
              </p>
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
              <p className="text-2xl font-bold">
                {tasks.filter(t => t.status === 'in_progress').length}
              </p>
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
              <p className="text-2xl font-bold">
                {tasks.filter(t => t.type === 'housekeeping').length}
              </p>
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
              <p className="text-2xl font-bold">
                {tasks.filter(t => t.type === 'maintenance').length}
              </p>
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
                        <h3 className="font-medium">
                          {language === 'ar' ? task.titleAr : task.title}
                        </h3>
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
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {task.dueAt}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
