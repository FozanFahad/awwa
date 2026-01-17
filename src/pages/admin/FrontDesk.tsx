import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogIn,
  LogOut,
  Search,
  Plus,
  MoreHorizontal,
  User,
  Building2,
  Key,
  CreditCard,
  Phone,
  Mail,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { CreateReservationDialog } from '@/components/admin/reservations/CreateReservationDialog';

// Mock data for Front Desk operations
const arrivals = [
  {
    id: '1',
    confirmationCode: 'AWA-A1B2C3',
    guestName: 'Mohammed Al-Rashid',
    guestPhone: '+966 50 123 4567',
    roomType: 'Deluxe Suite',
    roomNumber: null,
    eta: '14:00',
    nights: 3,
    pax: 2,
    vip: 'VIP',
    company: 'Saudi Aramco',
    status: 'confirmed',
    balance: 0,
    notes: 'Late arrival requested',
  },
  {
    id: '2',
    confirmationCode: 'AWA-D4E5F6',
    guestName: 'Sara Abdullah',
    guestPhone: '+966 55 987 6543',
    roomType: 'Standard Room',
    roomNumber: '205',
    eta: '15:00',
    nights: 2,
    pax: 1,
    vip: null,
    company: null,
    status: 'confirmed',
    balance: 525,
    notes: null,
  },
  {
    id: '3',
    confirmationCode: 'AWA-G7H8I9',
    guestName: 'Ahmed Hassan',
    guestPhone: '+966 54 111 2222',
    roomType: 'Executive Suite',
    roomNumber: '501',
    eta: '12:00',
    nights: 5,
    pax: 3,
    vip: 'VVIP',
    company: 'Royal Commission',
    status: 'confirmed',
    balance: 0,
    notes: 'Airport pickup arranged',
  },
];

const inHouse = [
  {
    id: '1',
    roomNumber: '302',
    guestName: 'Khalid Omar',
    checkIn: '2026-01-15',
    checkOut: '2026-01-18',
    roomType: 'Deluxe Room',
    pax: 2,
    balance: 1250,
    status: 'occupied',
    vip: null,
    company: null,
  },
  {
    id: '2',
    roomNumber: '405',
    guestName: 'Noura Al-Saud',
    checkIn: '2026-01-16',
    checkOut: '2026-01-20',
    roomType: 'Royal Suite',
    pax: 4,
    balance: 0,
    status: 'occupied',
    vip: 'VIP',
    company: 'Private',
  },
  {
    id: '3',
    roomNumber: '201',
    guestName: 'Faisal Ibrahim',
    checkIn: '2026-01-17',
    checkOut: '2026-01-19',
    roomType: 'Standard Room',
    pax: 1,
    balance: 375,
    status: 'occupied',
    vip: null,
    company: 'Mobily',
  },
];

const departures = [
  {
    id: '1',
    roomNumber: '301',
    guestName: 'Layla Ahmed',
    checkOut: '2026-01-17',
    roomType: 'Deluxe Room',
    balance: 0,
    status: 'due_out',
    departureTime: '12:00',
    folioStatus: 'settled',
  },
  {
    id: '2',
    roomNumber: '102',
    guestName: 'Yusuf Khan',
    checkOut: '2026-01-17',
    roomType: 'Standard Room',
    balance: 150,
    status: 'due_out',
    departureTime: '14:00',
    folioStatus: 'open',
  },
];

const availableRooms = [
  { number: '101', type: 'Standard Room', floor: 1, status: 'vacant_clean', features: ['City View'] },
  { number: '202', type: 'Deluxe Room', floor: 2, status: 'vacant_clean', features: ['Sea View', 'Balcony'] },
  { number: '303', type: 'Deluxe Suite', floor: 3, status: 'vacant_dirty', features: ['Sea View', 'Jacuzzi'] },
  { number: '501', type: 'Executive Suite', floor: 5, status: 'vacant_clean', features: ['Panoramic View', 'Kitchen'] },
];

export default function FrontDesk() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('arrivals');
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-success/10 text-success border-success/20',
      checked_in: 'bg-info/10 text-info border-info/20',
      due_out: 'bg-warning/10 text-warning border-warning/20',
      occupied: 'bg-primary/10 text-primary border-primary/20',
    };
    const labels: Record<string, { en: string; ar: string }> = {
      confirmed: { en: 'Confirmed', ar: 'مؤكد' },
      checked_in: { en: 'Checked In', ar: 'مسجل' },
      due_out: { en: 'Due Out', ar: 'مغادر' },
      occupied: { en: 'In House', ar: 'مقيم' },
    };
    return (
      <Badge variant="outline" className={styles[status] || 'bg-muted'}>
        {labels[status]?.[language] || status}
      </Badge>
    );
  };

  const getRoomStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      vacant_clean: 'bg-success/10 text-success',
      vacant_dirty: 'bg-warning/10 text-warning',
      occupied_clean: 'bg-info/10 text-info',
      occupied_dirty: 'bg-destructive/10 text-destructive',
    };
    const labels: Record<string, { en: string; ar: string }> = {
      vacant_clean: { en: 'VC', ar: 'ن-ن' },
      vacant_dirty: { en: 'VD', ar: 'ف-و' },
      occupied_clean: { en: 'OC', ar: 'م-ن' },
      occupied_dirty: { en: 'OD', ar: 'م-و' },
    };
    return (
      <Badge variant="outline" className={`${styles[status]} text-xs font-mono`}>
        {labels[status]?.[language] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'مكتب الاستقبال' : 'Front Desk'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة الوصول والمغادرة والضيوف المقيمين'
              : 'Manage arrivals, departures, and in-house guests'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowNewReservation(true)}>
            <Plus className="h-4 w-4 me-2" />
            {language === 'ar' ? 'حجز جديد' : 'New Reservation'}
          </Button>
          <Button size="sm" className="btn-gold" onClick={() => setShowWalkIn(true)}>
            <User className="h-4 w-4 me-2" />
            {language === 'ar' ? 'زائر بدون حجز' : 'Walk-In'}
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <CreateReservationDialog
        open={showNewReservation}
        onOpenChange={setShowNewReservation}
        onSuccess={() => console.log('Reservation created')}
      />
      <CreateReservationDialog
        open={showWalkIn}
        onOpenChange={setShowWalkIn}
        isWalkIn
        onSuccess={() => console.log('Walk-in checked in')}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <LogIn className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{arrivals.length}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'وصول اليوم' : 'Arrivals Today'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Building2 className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inHouse.length}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'ضيوف مقيمين' : 'In House'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <LogOut className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{departures.length}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'مغادرة اليوم' : 'Departures Today'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Key className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableRooms.filter(r => r.status === 'vacant_clean').length}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'غرف جاهزة' : 'Ready Rooms'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={language === 'ar' ? 'بحث بالاسم أو رقم الحجز أو الغرفة...' : 'Search by name, confirmation, or room...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="arrivals" className="gap-2">
            <LogIn className="h-4 w-4" />
            {language === 'ar' ? 'الوصول' : 'Arrivals'}
            <Badge variant="secondary" className="ms-1">{arrivals.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inhouse" className="gap-2">
            <Building2 className="h-4 w-4" />
            {language === 'ar' ? 'المقيمين' : 'In House'}
            <Badge variant="secondary" className="ms-1">{inHouse.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="departures" className="gap-2">
            <LogOut className="h-4 w-4" />
            {language === 'ar' ? 'المغادرة' : 'Departures'}
            <Badge variant="secondary" className="ms-1">{departures.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Arrivals Tab */}
        <TabsContent value="arrivals" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {language === 'ar' ? 'قائمة الوصول - اليوم' : "Today's Arrivals"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">{language === 'ar' ? 'رمز الحجز' : 'Conf#'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الضيف' : 'Guest'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الغرفة' : 'Room'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'ETA' : 'ETA'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'ليالي' : 'Nights'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الرصيد' : 'Balance'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arrivals.map((arrival) => (
                      <TableRow key={arrival.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-sm text-accent">{arrival.confirmationCode}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{arrival.guestName}</span>
                                {arrival.vip && (
                                  <Badge variant="outline" className="bg-accent/10 text-accent text-xs">
                                    {arrival.vip}
                                  </Badge>
                                )}
                              </div>
                              {arrival.company && (
                                <span className="text-xs text-muted-foreground">{arrival.company}</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {arrival.roomNumber ? (
                            <span className="font-mono font-semibold">{arrival.roomNumber}</span>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning">
                              {language === 'ar' ? 'غير محدد' : 'Unassigned'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{arrival.roomType}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {arrival.eta}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{arrival.nights}</TableCell>
                        <TableCell>
                          {arrival.balance > 0 ? (
                            <span className="text-destructive font-medium">{arrival.balance.toLocaleString()} SAR</span>
                          ) : (
                            <span className="text-success">Prepaid</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(arrival.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <LogIn className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'تسجيل الوصول' : 'Check In'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Key className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'تعيين غرفة' : 'Assign Room'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CreditCard className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'فتح الفاتورة' : 'Open Folio'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <User className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'ملف الضيف' : 'Guest Profile'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* In House Tab */}
        <TabsContent value="inhouse" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {language === 'ar' ? 'الضيوف المقيمين' : 'In-House Guests'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">{language === 'ar' ? 'الغرفة' : 'Room'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الضيف' : 'Guest'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'النوع' : 'Room Type'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الوصول' : 'Check In'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'المغادرة' : 'Check Out'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الرصيد' : 'Balance'}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inHouse.map((guest) => (
                      <TableRow key={guest.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono font-semibold text-lg">{guest.roomNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{guest.guestName}</span>
                            {guest.vip && (
                              <Badge variant="outline" className="bg-accent/10 text-accent text-xs">
                                {guest.vip}
                              </Badge>
                            )}
                          </div>
                          {guest.company && (
                            <span className="text-xs text-muted-foreground">{guest.company}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{guest.roomType}</TableCell>
                        <TableCell>{guest.checkIn}</TableCell>
                        <TableCell>{guest.checkOut}</TableCell>
                        <TableCell>
                          {guest.balance > 0 ? (
                            <span className="text-destructive font-medium">{guest.balance.toLocaleString()} SAR</span>
                          ) : (
                            <span className="text-success">0.00</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <CreditCard className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'فتح الفاتورة' : 'Open Folio'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Key className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'تغيير الغرفة' : 'Room Move'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <User className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'ملف الضيف' : 'Guest Profile'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <LogOut className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'مغادرة مبكرة' : 'Early Check Out'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departures Tab */}
        <TabsContent value="departures" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {language === 'ar' ? 'قائمة المغادرة - اليوم' : "Today's Departures"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">{language === 'ar' ? 'الغرفة' : 'Room'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الضيف' : 'Guest'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'النوع' : 'Room Type'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'وقت المغادرة' : 'Dep. Time'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الرصيد' : 'Balance'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الفاتورة' : 'Folio'}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departures.map((departure) => (
                      <TableRow key={departure.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono font-semibold text-lg">{departure.roomNumber}</TableCell>
                        <TableCell className="font-medium">{departure.guestName}</TableCell>
                        <TableCell className="text-muted-foreground">{departure.roomType}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {departure.departureTime}
                          </div>
                        </TableCell>
                        <TableCell>
                          {departure.balance > 0 ? (
                            <div className="flex items-center gap-1 text-destructive font-medium">
                              <AlertCircle className="h-3 w-3" />
                              {departure.balance.toLocaleString()} SAR
                            </div>
                          ) : (
                            <span className="text-success">0.00</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={departure.folioStatus === 'settled' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                            {departure.folioStatus === 'settled' 
                              ? (language === 'ar' ? 'مسددة' : 'Settled') 
                              : (language === 'ar' ? 'مفتوحة' : 'Open')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <LogOut className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'تسجيل المغادرة' : 'Check Out'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CreditCard className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'تسوية الفاتورة' : 'Settle Folio'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Clock className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'تمديد الإقامة' : 'Extend Stay'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Available Rooms Quick View */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5 text-accent" />
            {language === 'ar' ? 'الغرف المتاحة للتسكين' : 'Rooms Available for Assignment'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableRooms.map((room) => (
              <div
                key={room.number}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  room.status === 'vacant_clean' 
                    ? 'bg-success/5 border-success/30 hover:border-success' 
                    : 'bg-warning/5 border-warning/30 hover:border-warning'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-lg">{room.number}</span>
                  {getRoomStatusBadge(room.status)}
                </div>
                <p className="text-xs text-muted-foreground">{room.type}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'ar' ? `الطابق ${room.floor}` : `Floor ${room.floor}`}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
