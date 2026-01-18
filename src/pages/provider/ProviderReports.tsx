import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Users, 
  Home,
  Download,
  FileText
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))'];

type TimeRange = '3months' | '6months' | '12months';

export default function ProviderReports() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('6months');

  const getDateRange = () => {
    const endDate = new Date();
    const months = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
    const startDate = subMonths(endDate, months);
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch owner's units
  const { data: ownerUnits } = useQuery({
    queryKey: ['provider-units-ids', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('units')
        .select('id, name_en, name_ar')
        .eq('owner_user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const unitIds = ownerUnits?.map(u => u.id) || [];

  // Fetch reservations for owner's units
  const { data: reservations, isLoading } = useQuery({
    queryKey: ['provider-reservations', unitIds, timeRange],
    queryFn: async () => {
      if (unitIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          unit_id,
          start_date,
          end_date,
          nights,
          total_amount,
          status,
          adults,
          children,
          created_at,
          guest:guests(full_name),
          unit:units(name_en, name_ar)
        `)
        .in('unit_id', unitIds)
        .gte('start_date', startDate.toISOString().split('T')[0])
        .lte('start_date', endDate.toISOString().split('T')[0])
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: unitIds.length > 0,
  });

  // Calculate statistics
  const stats = {
    totalReservations: reservations?.length || 0,
    confirmedReservations: reservations?.filter(r => r.status === 'confirmed' || r.status === 'checked_in' || r.status === 'checked_out').length || 0,
    totalRevenue: reservations?.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + Number(r.total_amount || 0), 0) || 0,
    totalNights: reservations?.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + (r.nights || 0), 0) || 0,
    totalGuests: reservations?.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + (r.adults || 0) + (r.children || 0), 0) || 0,
    averageStay: 0,
    occupancyRate: 0,
  };

  if (stats.confirmedReservations > 0) {
    stats.averageStay = stats.totalNights / stats.confirmedReservations;
  }

  // Monthly revenue data
  const monthlyData = eachMonthOfInterval({ start: startDate, end: endDate }).map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthReservations = reservations?.filter(r => {
      const resDate = new Date(r.start_date);
      return resDate >= monthStart && resDate <= monthEnd && r.status !== 'cancelled';
    }) || [];

    return {
      month: format(month, 'MMM yyyy', { locale: language === 'ar' ? ar : enUS }),
      revenue: monthReservations.reduce((sum, r) => sum + Number(r.total_amount || 0), 0),
      reservations: monthReservations.length,
    };
  });

  // Status distribution
  const statusData = [
    { name: language === 'ar' ? 'مؤكد' : 'Confirmed', value: reservations?.filter(r => r.status === 'confirmed').length || 0 },
    { name: language === 'ar' ? 'وصل' : 'Checked In', value: reservations?.filter(r => r.status === 'checked_in').length || 0 },
    { name: language === 'ar' ? 'غادر' : 'Checked Out', value: reservations?.filter(r => r.status === 'checked_out').length || 0 },
    { name: language === 'ar' ? 'ملغي' : 'Cancelled', value: reservations?.filter(r => r.status === 'cancelled').length || 0 },
  ].filter(s => s.value > 0);

  // Unit performance
  const unitPerformance = ownerUnits?.map(unit => {
    const unitReservations = reservations?.filter(r => r.unit_id === unit.id && r.status !== 'cancelled') || [];
    return {
      name: language === 'ar' ? unit.name_ar : unit.name_en,
      reservations: unitReservations.length,
      revenue: unitReservations.reduce((sum, r) => sum + Number(r.total_amount || 0), 0),
    };
  }).sort((a, b) => b.revenue - a.revenue) || [];

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'قيد الانتظار' },
      confirmed: { en: 'Confirmed', ar: 'مؤكد' },
      checked_in: { en: 'Checked In', ar: 'وصل' },
      checked_out: { en: 'Checked Out', ar: 'غادر' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' },
    };
    return language === 'ar' ? labels[status]?.ar || status : labels[status]?.en || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      confirmed: 'bg-info/10 text-info border-info/20',
      checked_in: 'bg-success/10 text-success border-success/20',
      checked_out: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return colors[status] || '';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'التقارير' : 'Reports'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'تقارير الحجوزات والإيرادات' : 'Reservations and revenue reports'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">
                {language === 'ar' ? '3 أشهر' : '3 Months'}
              </SelectItem>
              <SelectItem value="6months">
                {language === 'ar' ? '6 أشهر' : '6 Months'}
              </SelectItem>
              <SelectItem value="12months">
                {language === 'ar' ? '12 شهر' : '12 Months'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {stats.totalRevenue.toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'ar' ? 'من الحجوزات المؤكدة' : 'From confirmed reservations'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === 'ar' ? 'الحجوزات' : 'Reservations'}
            </CardTitle>
            <Calendar className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.confirmedReservations} {language === 'ar' ? 'مؤكد' : 'confirmed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === 'ar' ? 'الليالي المحجوزة' : 'Nights Booked'}
            </CardTitle>
            <Home className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNights}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.averageStay.toFixed(1)} {language === 'ar' ? 'متوسط الإقامة' : 'avg stay'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === 'ar' ? 'الضيوف' : 'Guests'}
            </CardTitle>
            <Users className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'ar' ? 'إجمالي الضيوف' : 'Total guests'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {language === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} SAR`, language === 'ar' ? 'الإيرادات' : 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {language === 'ar' ? 'لا توجد بيانات' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reservations Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {language === 'ar' ? 'عدد الحجوزات' : 'Reservations Count'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [value, language === 'ar' ? 'الحجوزات' : 'Reservations']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reservations" 
                    stroke="hsl(var(--info))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--info))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {language === 'ar' ? 'لا توجد بيانات' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ar' ? 'توزيع الحالات' : 'Status Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {language === 'ar' ? 'لا توجد بيانات' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unit Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              {language === 'ar' ? 'أداء الوحدات' : 'Unit Performance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unitPerformance.length > 0 ? (
              <div className="space-y-4">
                {unitPerformance.map((unit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{unit.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {unit.reservations} {language === 'ar' ? 'حجز' : 'reservations'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">
                        {unit.revenue.toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                {language === 'ar' ? 'لا توجد وحدات' : 'No units available'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {language === 'ar' ? 'آخر الحجوزات' : 'Recent Reservations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reservations && reservations.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>{language === 'ar' ? 'الوحدة' : 'Unit'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الضيف' : 'Guest'}</TableHead>
                    <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الليالي' : 'Nights'}</TableHead>
                    <TableHead>{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.slice(0, 10).map((res) => (
                    <TableRow key={res.id}>
                      <TableCell className="font-medium">
                        {language === 'ar' ? res.unit?.name_ar : res.unit?.name_en}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {res.guest?.full_name || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(res.start_date), 'dd MMM yyyy', { 
                          locale: language === 'ar' ? ar : enUS 
                        })}
                      </TableCell>
                      <TableCell>{res.nights || '-'}</TableCell>
                      <TableCell className="font-medium">
                        {Number(res.total_amount).toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(res.status)}>
                          {getStatusLabel(res.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا توجد حجوزات في هذه الفترة' : 'No reservations in this period'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
