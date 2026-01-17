import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ReservationsTable } from '@/components/admin/ReservationsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus, Download } from 'lucide-react';

// Mock data
const allReservations = [
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
  {
    id: '5',
    confirmationCode: 'AWA-M4N5O6',
    guestName: 'Ahmed Salem',
    unitName: 'Downtown Business Apartment',
    checkIn: '2026-01-22',
    checkOut: '2026-01-24',
    nights: 2,
    status: 'confirmed' as const,
    totalAmount: 1250,
    paymentStatus: 'partial' as const,
  },
  {
    id: '6',
    confirmationCode: 'AWA-P7Q8R9',
    guestName: 'Nora Al-Turki',
    unitName: 'Coastal Resort Suite',
    checkIn: '2026-01-10',
    checkOut: '2026-01-12',
    nights: 2,
    status: 'cancelled' as const,
    totalAmount: 1650,
    paymentStatus: 'refunded' as const,
  },
];

export default function Reservations() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredReservations = allReservations.filter((res) => {
    const matchesSearch = 
      res.confirmationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.unitName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            {language === 'ar' ? 'تصدير' : 'Export'}
          </Button>
          <Button size="sm" className="gap-2 btn-gold">
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
          <p className="text-2xl font-bold text-warning">
            {allReservations.filter(r => r.status === 'pending').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('status.confirmed')}</p>
          <p className="text-2xl font-bold text-success">
            {allReservations.filter(r => r.status === 'confirmed').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('status.checkedIn')}</p>
          <p className="text-2xl font-bold text-info">
            {allReservations.filter(r => r.status === 'checked_in').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الإجمالي' : 'Total'}</p>
          <p className="text-2xl font-bold">{allReservations.length}</p>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredReservations.length} {language === 'ar' ? 'حجز' : 'reservations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReservationsTable 
            reservations={filteredReservations}
            onViewDetails={(id) => console.log('View', id)}
            onStatusChange={(id, status) => console.log('Change status', id, status)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
