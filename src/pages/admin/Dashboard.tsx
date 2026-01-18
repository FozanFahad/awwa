import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KPICard } from '@/components/admin/KPICard';
import { ReservationsTable } from '@/components/admin/ReservationsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  CalendarCheck, 
  CalendarX, 
  ClipboardList, 
  DollarSign,
  Building2,
  Users,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface ReservationWithDetails {
  id: string;
  confirmationCode: string;
  guestName: string;
  unitName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
}

interface TaskWithDetails {
  id: string;
  title: string;
  unit: string;
  type: 'housekeeping' | 'maintenance';
  priority: string;
  dueAt: string;
}

export default function AdminDashboard() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [stats, setStats] = useState({
    totalUnits: 0,
    availableUnits: 0,
    occupiedUnits: 0,
    maintenanceUnits: 0,
    todayArrivals: 0,
    todayDepartures: 0,
    pendingTasks: 0,
    urgentTasks: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Fetch reservations
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select(`
          id,
          confirmation_code,
          start_date,
          end_date,
          nights,
          status,
          total_amount,
          payment_status,
          guests (full_name),
          units (name_en, name_ar)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch units stats
      const { data: unitsData } = await supabase
        .from('units')
        .select('id, status');

      // Fetch today's arrivals
      const { count: arrivalsCount } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('start_date', today)
        .in('status', ['confirmed', 'pending']);

      // Fetch today's departures
      const { count: departuresCount } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('end_date', today)
        .eq('status', 'checked_in');

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          task_type,
          priority,
          due_at,
          units (name_en, name_ar)
        `)
        .in('status', ['pending', 'in_progress'])
        .order('due_at', { ascending: true })
        .limit(5);

      // Fetch pending tasks count
      const { count: pendingTasksCount } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch urgent tasks count
      const { count: urgentTasksCount } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('priority', 'urgent')
        .in('status', ['pending', 'in_progress']);

      // Format reservations
      const formattedReservations: ReservationWithDetails[] = (reservationsData || []).map((r: any) => ({
        id: r.id,
        confirmationCode: r.confirmation_code,
        guestName: r.guests?.full_name || '-',
        unitName: language === 'ar' ? r.units?.name_ar : r.units?.name_en || '-',
        checkIn: r.start_date,
        checkOut: r.end_date,
        nights: r.nights || 1,
        status: r.status,
        totalAmount: r.total_amount || 0,
        paymentStatus: r.payment_status,
      }));

      // Format tasks
      const formattedTasks: TaskWithDetails[] = (tasksData || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        unit: language === 'ar' ? t.units?.name_ar : t.units?.name_en || '-',
        type: t.task_type,
        priority: t.priority,
        dueAt: t.due_at ? format(new Date(t.due_at), 'yyyy-MM-dd HH:mm') : '-',
      }));

      // Calculate unit stats
      const totalUnits = unitsData?.length || 0;
      const availableUnits = unitsData?.filter(u => u.status === 'available').length || 0;
      const occupiedUnits = unitsData?.filter(u => u.status === 'occupied').length || 0;
      const maintenanceUnits = unitsData?.filter(u => u.status === 'maintenance').length || 0;

      setReservations(formattedReservations);
      setTasks(formattedTasks);
      setStats({
        totalUnits,
        availableUnits,
        occupiedUnits,
        maintenanceUnits,
        todayArrivals: arrivalsCount || 0,
        todayDepartures: departuresCount || 0,
        pendingTasks: pendingTasksCount || 0,
        urgentTasks: urgentTasksCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const occupancyRate = stats.totalUnits > 0 
    ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'نظرة عامة على عمليات اليوم'
            : 'Here\'s an overview of today\'s operations'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title={t('kpi.occupancy')}
          value={`${occupancyRate}%`}
          subtitle={language === 'ar' 
            ? `${stats.occupiedUnits} من ${stats.totalUnits} وحدة` 
            : `${stats.occupiedUnits} of ${stats.totalUnits} units`}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KPICard
          title={t('kpi.checkIns')}
          value={stats.todayArrivals.toString()}
          subtitle={language === 'ar' ? 'ضيوف متوقعين' : 'guests arriving'}
          icon={<CalendarCheck className="h-6 w-6" />}
        />
        <KPICard
          title={t('kpi.checkOuts')}
          value={stats.todayDepartures.toString()}
          subtitle={language === 'ar' ? 'ضيوف مغادرين' : 'guests departing'}
          icon={<CalendarX className="h-6 w-6" />}
        />
        <KPICard
          title={t('kpi.pendingTasks')}
          value={stats.pendingTasks.toString()}
          subtitle={stats.urgentTasks > 0 
            ? (language === 'ar' ? `${stats.urgentTasks} عاجلة` : `${stats.urgentTasks} urgent`)
            : (language === 'ar' ? 'مهام معلقة' : 'pending tasks')}
          icon={<ClipboardList className="h-6 w-6" />}
        />
      </div>

      {/* Unit Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" />
              {language === 'ar' ? 'ملخص سريع' : 'Quick Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.totalUnits === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {language === 'ar' ? 'لا توجد وحدات مضافة بعد' : 'No units added yet'}
                </p>
                <Link to="/admin/units">
                  <Button size="sm" className="btn-gold">
                    <Plus className="h-4 w-4 me-2" />
                    {language === 'ar' ? 'إضافة وحدة' : 'Add Unit'}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'ar' ? 'إجمالي الوحدات' : 'Total Units'}
                  </p>
                  <p className="text-2xl font-bold">{stats.totalUnits}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'ar' ? 'متاحة' : 'Available'}
                  </p>
                  <p className="text-2xl font-bold text-success">{stats.availableUnits}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'ar' ? 'مشغولة' : 'Occupied'}
                  </p>
                  <p className="text-2xl font-bold text-info">{stats.occupiedUnits}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-accent" />
              {language === 'ar' ? 'حالة الوحدات' : 'Unit Status'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {language === 'ar' ? 'متاحة' : 'Available'}
              </span>
              <span className="font-semibold text-success">{stats.availableUnits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {language === 'ar' ? 'مشغولة' : 'Occupied'}
              </span>
              <span className="font-semibold text-info">{stats.occupiedUnits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {language === 'ar' ? 'صيانة' : 'Maintenance'}
              </span>
              <span className="font-semibold text-warning">{stats.maintenanceUnits}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reservations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            {language === 'ar' ? 'الحجوزات الأخيرة' : 'Recent Reservations'}
          </CardTitle>
          <Link to="/admin/reservations">
            <Button variant="outline" size="sm">
              {language === 'ar' ? 'عرض الكل' : 'View All'}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {reservations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {language === 'ar' ? 'لا توجد حجوزات بعد' : 'No reservations yet'}
              </p>
              <Link to="/admin/front-desk">
                <Button size="sm" className="btn-gold">
                  <Plus className="h-4 w-4 me-2" />
                  {language === 'ar' ? 'إنشاء حجز' : 'Create Reservation'}
                </Button>
              </Link>
            </div>
          ) : (
            <ReservationsTable reservations={reservations} />
          )}
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            {language === 'ar' ? 'المهام القادمة' : 'Upcoming Tasks'}
          </CardTitle>
          <Link to="/admin/tasks">
            <Button variant="outline" size="sm">
              {language === 'ar' ? 'عرض الكل' : 'View All'}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا توجد مهام معلقة' : 'No pending tasks'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'urgent' ? 'bg-destructive' :
                      task.priority === 'high' ? 'bg-warning' : 'bg-success'
                    }`} />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.type === 'housekeeping' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
                    }`}>
                      {task.type === 'housekeeping' ? t('task.housekeeping') : t('task.maintenance')}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">{task.dueAt}</p>
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
