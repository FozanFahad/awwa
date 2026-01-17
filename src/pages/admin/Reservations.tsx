import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ReservationsTable } from '@/components/admin/ReservationsTable';
import { CreateReservationDialog } from '@/components/admin/reservations/CreateReservationDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Plus, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type ReservationStatus = Tables<'reservations'>['status'];
type PaymentStatus = Tables<'reservations'>['payment_status'];

interface ReservationWithDetails {
  id: string;
  confirmationCode: string;
  guestName: string;
  unitName: string;
  roomName: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  status: ReservationStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
}

export default function Reservations() {
  const { t, language } = useLanguage();
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
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
          guest:guests(full_name),
          unit:units(name_en, name_ar),
          room:rooms(room_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted: ReservationWithDetails[] = (data || []).map((r) => ({
        id: r.id,
        confirmationCode: r.confirmation_code,
        guestName: r.guest?.full_name || 'Unknown',
        unitName: language === 'ar' ? (r.unit?.name_ar || r.unit?.name_en || '-') : (r.unit?.name_en || '-'),
        roomName: r.room?.room_number || null,
        checkIn: r.start_date,
        checkOut: r.end_date,
        nights: r.nights || 1,
        status: r.status,
        totalAmount: Number(r.total_amount) || 0,
        paymentStatus: r.payment_status,
      }));

      setReservations(formatted);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error(language === 'ar' ? 'خطأ في جلب الحجوزات' : 'Error fetching reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'checked_in') {
        updateData.checked_in_at = new Date().toISOString();
      } else if (newStatus === 'checked_out') {
        updateData.checked_out_at = new Date().toISOString();
      } else if (newStatus === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success(language === 'ar' ? 'تم تحديث الحالة' : 'Status updated');
      fetchReservations();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(language === 'ar' ? 'خطأ في تحديث الحالة' : 'Error updating status');
    }
  };

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch = 
      res.confirmationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.unitName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    checkedIn: reservations.filter(r => r.status === 'checked_in').length,
    total: reservations.length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('dashboard.reservations')}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة جميع الحجوزات'
              : 'Manage all reservations'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={fetchReservations}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            {language === 'ar' ? 'تصدير' : 'Export'}
          </Button>
          <Button 
            size="sm" 
            className="gap-2 btn-gold"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'حجز جديد' : 'New Booking'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'بحث بالرمز أو اسم الضيف...' : 'Search by code or guest name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={language === 'ar' ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="pending">{t('status.pending')}</SelectItem>
                <SelectItem value="confirmed">{t('status.confirmed')}</SelectItem>
                <SelectItem value="checked_in">{t('status.checkedIn')}</SelectItem>
                <SelectItem value="checked_out">{t('status.checkedOut')}</SelectItem>
                <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('status.pending')}</p>
          {loading ? (
            <Skeleton className="h-8 w-12 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('status.confirmed')}</p>
          {loading ? (
            <Skeleton className="h-8 w-12 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('status.checkedIn')}</p>
          {loading ? (
            <Skeleton className="h-8 w-12 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-info">{stats.checkedIn}</p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الإجمالي' : 'Total'}</p>
          {loading ? (
            <Skeleton className="h-8 w-12 mt-1" />
          ) : (
            <p className="text-2xl font-bold">{stats.total}</p>
          )}
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              `${filteredReservations.length} ${language === 'ar' ? 'حجز' : 'reservations'}`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <ReservationsTable 
              reservations={filteredReservations}
              onViewDetails={(id) => console.log('View', id)}
              onStatusChange={handleStatusChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateReservationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchReservations}
      />
    </div>
  );
}
