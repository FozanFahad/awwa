import { useLanguage } from '@/contexts/LanguageContext';
import { KPICard } from '@/components/admin/KPICard';
import { ReservationsTable } from '@/components/admin/ReservationsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  CalendarCheck, 
  CalendarX, 
  ClipboardList, 
  DollarSign,
  Building2,
  Users,
  AlertTriangle
} from 'lucide-react';

// Mock data
const recentReservations = [
  {
    id: '1',
    confirmationCode: 'AWA-A1B2C3',
    guestName: 'Mohammed Al-Rashid',
    unitName: 'Luxury Penthouse Suite',
    checkIn: '2026-01-18',
    checkOut: '2026-01-21',
    nights: 3,
    status: 'confirmed' as const,
    totalAmount: 4650,
    paymentStatus: 'paid' as const,
  },
  {
    id: '2',
    confirmationCode: 'AWA-D4E5F6',
    guestName: 'Sara Abdullah',
    unitName: 'Modern Studio Apartment',
    checkIn: '2026-01-17',
    checkOut: '2026-01-19',
    nights: 2,
    status: 'checked_in' as const,
    totalAmount: 1050,
    paymentStatus: 'paid' as const,
  },
  {
    id: '3',
    confirmationCode: 'AWA-G7H8I9',
    guestName: 'Khalid Hassan',
    unitName: 'Family Executive Suite',
    checkIn: '2026-01-20',
    checkOut: '2026-01-25',
    nights: 5,
    status: 'pending' as const,
    totalAmount: 4400,
    paymentStatus: 'pending' as const,
  },
  {
    id: '4',
    confirmationCode: 'AWA-J1K2L3',
    guestName: 'Fatima Ahmed',
    unitName: 'Seaside Luxury Villa',
    checkIn: '2026-01-15',
    checkOut: '2026-01-17',
    nights: 2,
    status: 'checked_out' as const,
    totalAmount: 4550,
    paymentStatus: 'paid' as const,
  },
];

const upcomingTasks = [
  { id: '1', title: 'Prepare unit for guest', unit: 'Luxury Penthouse', type: 'housekeeping', priority: 'high', dueAt: '2026-01-18 14:00' },
  { id: '2', title: 'Fix AC unit', unit: 'Modern Studio', type: 'maintenance', priority: 'urgent', dueAt: '2026-01-17 10:00' },
  { id: '3', title: 'Checkout cleaning', unit: 'Family Suite', type: 'housekeeping', priority: 'medium', dueAt: '2026-01-19 12:00' },
];

export default function AdminDashboard() {
  const { t, language } = useLanguage();

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
          value="78%"
          subtitle={language === 'ar' ? '18 من 23 وحدة' : '18 of 23 units'}
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title={t('kpi.checkIns')}
          value="5"
          subtitle={language === 'ar' ? 'ضيوف متوقعين' : 'guests arriving'}
          icon={<CalendarCheck className="h-6 w-6" />}
        />
        <KPICard
          title={t('kpi.checkOuts')}
          value="3"
          subtitle={language === 'ar' ? 'ضيوف مغادرين' : 'guests departing'}
          icon={<CalendarX className="h-6 w-6" />}
        />
        <KPICard
          title={t('kpi.pendingTasks')}
          value="7"
          subtitle={language === 'ar' ? '2 عاجلة' : '2 urgent'}
          icon={<ClipboardList className="h-6 w-6" />}
        />
      </div>

      {/* Revenue & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" />
              {language === 'ar' ? 'ملخص الإيرادات' : 'Revenue Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {language === 'ar' ? 'اليوم' : 'Today'}
                </p>
                <p className="text-2xl font-bold">4,250 {t('common.sar')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {language === 'ar' ? 'هذا الأسبوع' : 'This Week'}
                </p>
                <p className="text-2xl font-bold">28,500 {t('common.sar')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {language === 'ar' ? 'هذا الشهر' : 'This Month'}
                </p>
                <p className="text-2xl font-bold">124,800 {t('common.sar')}</p>
              </div>
            </div>
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
              <span className="font-semibold text-success">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {language === 'ar' ? 'مشغولة' : 'Occupied'}
              </span>
              <span className="font-semibold text-info">18</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {language === 'ar' ? 'صيانة' : 'Maintenance'}
              </span>
              <span className="font-semibold text-warning">2</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reservations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            {language === 'ar' ? 'الحجوزات الأخيرة' : 'Recent Reservations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReservationsTable reservations={recentReservations} />
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            {language === 'ar' ? 'المهام القادمة' : 'Upcoming Tasks'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
