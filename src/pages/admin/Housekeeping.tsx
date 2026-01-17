import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Sparkles,
  AlertCircle,
  Check,
  Clock,
  User,
  MoreHorizontal,
  Filter,
  Search,
  Building2,
  RefreshCcw,
  Wrench,
  BedDouble,
} from 'lucide-react';

type RoomStatus = 'vacant_clean' | 'vacant_dirty' | 'occupied_clean' | 'occupied_dirty' | 'out_of_order' | 'out_of_service';
type FOStatus = 'vacant' | 'occupied' | 'due_out' | 'checked_out';

interface Room {
  id: string;
  number: string;
  floor: number;
  type: string;
  roomStatus: RoomStatus;
  foStatus: FOStatus;
  assignedTo: string | null;
  priority: 'normal' | 'rush' | 'vip';
  notes: string | null;
  guestName: string | null;
  checkOut: string | null;
}

const rooms: Room[] = [
  { id: '1', number: '101', floor: 1, type: 'Standard', roomStatus: 'vacant_clean', foStatus: 'vacant', assignedTo: null, priority: 'normal', notes: null, guestName: null, checkOut: null },
  { id: '2', number: '102', floor: 1, type: 'Standard', roomStatus: 'vacant_dirty', foStatus: 'checked_out', assignedTo: 'Fatima A.', priority: 'rush', notes: 'Guest complained about AC', guestName: null, checkOut: null },
  { id: '3', number: '103', floor: 1, type: 'Deluxe', roomStatus: 'occupied_clean', foStatus: 'occupied', assignedTo: null, priority: 'normal', notes: null, guestName: 'Mohammed H.', checkOut: '2026-01-20' },
  { id: '4', number: '201', floor: 2, type: 'Standard', roomStatus: 'occupied_dirty', foStatus: 'occupied', assignedTo: 'Sara M.', priority: 'normal', notes: 'Service request', guestName: 'Ahmed K.', checkOut: '2026-01-18' },
  { id: '5', number: '202', floor: 2, type: 'Deluxe', roomStatus: 'vacant_dirty', foStatus: 'due_out', assignedTo: null, priority: 'vip', notes: 'VIP arrival at 14:00', guestName: null, checkOut: null },
  { id: '6', number: '203', floor: 2, type: 'Suite', roomStatus: 'out_of_order', foStatus: 'vacant', assignedTo: null, priority: 'normal', notes: 'Plumbing repair', guestName: null, checkOut: null },
  { id: '7', number: '301', floor: 3, type: 'Standard', roomStatus: 'vacant_clean', foStatus: 'vacant', assignedTo: null, priority: 'normal', notes: null, guestName: null, checkOut: null },
  { id: '8', number: '302', floor: 3, type: 'Deluxe', roomStatus: 'occupied_clean', foStatus: 'occupied', assignedTo: null, priority: 'normal', notes: null, guestName: 'Layla S.', checkOut: '2026-01-19' },
  { id: '9', number: '303', floor: 3, type: 'Suite', roomStatus: 'vacant_dirty', foStatus: 'checked_out', assignedTo: 'Aisha K.', priority: 'normal', notes: null, guestName: null, checkOut: null },
  { id: '10', number: '401', floor: 4, type: 'Executive', roomStatus: 'out_of_service', foStatus: 'vacant', assignedTo: null, priority: 'normal', notes: 'Renovation', guestName: null, checkOut: null },
  { id: '11', number: '402', floor: 4, type: 'Executive', roomStatus: 'occupied_dirty', foStatus: 'due_out', assignedTo: null, priority: 'rush', notes: 'Early check-out', guestName: 'Khalid M.', checkOut: '2026-01-17' },
  { id: '12', number: '501', floor: 5, type: 'Royal Suite', roomStatus: 'vacant_clean', foStatus: 'vacant', assignedTo: null, priority: 'normal', notes: null, guestName: null, checkOut: null },
];

const housekeepers = [
  { id: '1', name: 'Fatima Ahmed', rooms: 4, status: 'active' },
  { id: '2', name: 'Sara Mohammed', rooms: 3, status: 'active' },
  { id: '3', name: 'Aisha Khalid', rooms: 2, status: 'active' },
  { id: '4', name: 'Noura Hassan', rooms: 0, status: 'available' },
];

export default function Housekeeping() {
  const { language } = useLanguage();
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getRoomStatusConfig = (status: RoomStatus) => {
    const config: Record<RoomStatus, { bg: string; text: string; label: { en: string; ar: string }; code: string }> = {
      vacant_clean: { bg: 'bg-success', text: 'text-success-foreground', label: { en: 'Vacant Clean', ar: 'شاغرة نظيفة' }, code: 'VC' },
      vacant_dirty: { bg: 'bg-warning', text: 'text-warning-foreground', label: { en: 'Vacant Dirty', ar: 'شاغرة وسخة' }, code: 'VD' },
      occupied_clean: { bg: 'bg-info', text: 'text-info-foreground', label: { en: 'Occupied Clean', ar: 'مشغولة نظيفة' }, code: 'OC' },
      occupied_dirty: { bg: 'bg-destructive', text: 'text-destructive-foreground', label: { en: 'Occupied Dirty', ar: 'مشغولة وسخة' }, code: 'OD' },
      out_of_order: { bg: 'bg-muted', text: 'text-muted-foreground', label: { en: 'Out of Order', ar: 'خارج الخدمة' }, code: 'OOO' },
      out_of_service: { bg: 'bg-primary', text: 'text-primary-foreground', label: { en: 'Out of Service', ar: 'تحت الصيانة' }, code: 'OOS' },
    };
    return config[status];
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      normal: 'bg-muted text-muted-foreground',
      rush: 'bg-warning/10 text-warning border-warning/20',
      vip: 'bg-accent/10 text-accent border-accent/20',
    };
    return styles[priority] || styles.normal;
  };

  const filteredRooms = rooms.filter(room => {
    if (selectedFloor !== 'all' && room.floor.toString() !== selectedFloor) return false;
    if (selectedStatus !== 'all' && room.roomStatus !== selectedStatus) return false;
    if (searchQuery && !room.number.includes(searchQuery)) return false;
    return true;
  });

  const stats = {
    vacantClean: rooms.filter(r => r.roomStatus === 'vacant_clean').length,
    vacantDirty: rooms.filter(r => r.roomStatus === 'vacant_dirty').length,
    occupiedClean: rooms.filter(r => r.roomStatus === 'occupied_clean').length,
    occupiedDirty: rooms.filter(r => r.roomStatus === 'occupied_dirty').length,
    ooo: rooms.filter(r => r.roomStatus === 'out_of_order').length,
    oos: rooms.filter(r => r.roomStatus === 'out_of_service').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'حالة الغرف' : 'Room Status'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة حالة الغرف والتدبير المنزلي'
              : 'Manage room status and housekeeping'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 me-2" />
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('vacant_clean')}>
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-success mx-auto mb-2 flex items-center justify-center">
              <Check className="h-4 w-4 text-success-foreground" />
            </div>
            <p className="text-2xl font-bold">{stats.vacantClean}</p>
            <p className="text-xs text-muted-foreground">{language === 'ar' ? 'شاغرة نظيفة' : 'Vacant Clean'}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('vacant_dirty')}>
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-warning mx-auto mb-2 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-warning-foreground" />
            </div>
            <p className="text-2xl font-bold">{stats.vacantDirty}</p>
            <p className="text-xs text-muted-foreground">{language === 'ar' ? 'شاغرة وسخة' : 'Vacant Dirty'}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('occupied_clean')}>
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-info mx-auto mb-2 flex items-center justify-center">
              <BedDouble className="h-4 w-4 text-info-foreground" />
            </div>
            <p className="text-2xl font-bold">{stats.occupiedClean}</p>
            <p className="text-xs text-muted-foreground">{language === 'ar' ? 'مشغولة نظيفة' : 'Occupied Clean'}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('occupied_dirty')}>
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-destructive mx-auto mb-2 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-destructive-foreground" />
            </div>
            <p className="text-2xl font-bold">{stats.occupiedDirty}</p>
            <p className="text-xs text-muted-foreground">{language === 'ar' ? 'مشغولة وسخة' : 'Occupied Dirty'}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('out_of_order')}>
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{stats.ooo}</p>
            <p className="text-xs text-muted-foreground">{language === 'ar' ? 'خارج الخدمة' : 'Out of Order'}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('out_of_service')}>
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-primary mx-auto mb-2 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <p className="text-2xl font-bold">{stats.oos}</p>
            <p className="text-xs text-muted-foreground">{language === 'ar' ? 'تحت الصيانة' : 'Out of Service'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'ar' ? 'بحث برقم الغرفة...' : 'Search room number...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10"
          />
        </div>
        <Select value={selectedFloor} onValueChange={setSelectedFloor}>
          <SelectTrigger className="w-36">
            <Building2 className="h-4 w-4 me-2" />
            <SelectValue placeholder={language === 'ar' ? 'الطابق' : 'Floor'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'ar' ? 'كل الطوابق' : 'All Floors'}</SelectItem>
            <SelectItem value="1">{language === 'ar' ? 'الطابق 1' : 'Floor 1'}</SelectItem>
            <SelectItem value="2">{language === 'ar' ? 'الطابق 2' : 'Floor 2'}</SelectItem>
            <SelectItem value="3">{language === 'ar' ? 'الطابق 3' : 'Floor 3'}</SelectItem>
            <SelectItem value="4">{language === 'ar' ? 'الطابق 4' : 'Floor 4'}</SelectItem>
            <SelectItem value="5">{language === 'ar' ? 'الطابق 5' : 'Floor 5'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-44">
            <Filter className="h-4 w-4 me-2" />
            <SelectValue placeholder={language === 'ar' ? 'الحالة' : 'Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'ar' ? 'كل الحالات' : 'All Status'}</SelectItem>
            <SelectItem value="vacant_clean">{language === 'ar' ? 'شاغرة نظيفة' : 'Vacant Clean'}</SelectItem>
            <SelectItem value="vacant_dirty">{language === 'ar' ? 'شاغرة وسخة' : 'Vacant Dirty'}</SelectItem>
            <SelectItem value="occupied_clean">{language === 'ar' ? 'مشغولة نظيفة' : 'Occupied Clean'}</SelectItem>
            <SelectItem value="occupied_dirty">{language === 'ar' ? 'مشغولة وسخة' : 'Occupied Dirty'}</SelectItem>
            <SelectItem value="out_of_order">{language === 'ar' ? 'خارج الخدمة' : 'Out of Order'}</SelectItem>
            <SelectItem value="out_of_service">{language === 'ar' ? 'تحت الصيانة' : 'Out of Service'}</SelectItem>
          </SelectContent>
        </Select>
        {selectedStatus !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedStatus('all')}>
            {language === 'ar' ? 'مسح الفلتر' : 'Clear Filter'}
          </Button>
        )}
      </div>

      {/* Room Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Home className="h-5 w-5 text-accent" />
              {language === 'ar' ? 'خريطة الغرف' : 'Room Map'}
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {filteredRooms.length} {language === 'ar' ? 'غرفة' : 'rooms'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredRooms.map((room) => {
              const statusConfig = getRoomStatusConfig(room.roomStatus);
              return (
                <DropdownMenu key={room.id}>
                  <DropdownMenuTrigger asChild>
                    <div
                      className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${statusConfig.bg}/10 border-${statusConfig.bg.replace('bg-', '')}/30`}
                    >
                      {/* Priority indicator */}
                      {room.priority !== 'normal' && (
                        <div className={`absolute -top-1 -end-1 w-3 h-3 rounded-full ${room.priority === 'vip' ? 'bg-accent' : 'bg-warning'}`} />
                      )}
                      
                      {/* Room number */}
                      <div className="text-center">
                        <span className="font-mono font-bold text-lg">{room.number}</span>
                        <div className={`mt-1 text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} rounded px-1.5 py-0.5 inline-block`}>
                          {statusConfig.code}
                        </div>
                      </div>
                      
                      {/* Room type */}
                      <p className="text-[10px] text-muted-foreground text-center mt-1 truncate">{room.type}</p>
                      
                      {/* Assigned to */}
                      {room.assignedTo && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <User className="h-2.5 w-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground truncate">{room.assignedTo}</span>
                        </div>
                      )}
                      
                      {/* Guest name for occupied rooms */}
                      {room.guestName && (
                        <p className="text-[10px] text-center text-muted-foreground mt-1 truncate">{room.guestName}</p>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-semibold border-b">
                      {language === 'ar' ? 'غرفة' : 'Room'} {room.number}
                    </div>
                    <DropdownMenuItem>
                      <Check className="h-4 w-4 me-2" />
                      {language === 'ar' ? 'تغيير إلى نظيفة' : 'Mark as Clean'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Sparkles className="h-4 w-4 me-2" />
                      {language === 'ar' ? 'تغيير إلى وسخة' : 'Mark as Dirty'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="h-4 w-4 me-2" />
                      {language === 'ar' ? 'تعيين عامل' : 'Assign Attendant'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Clock className="h-4 w-4 me-2" />
                      {language === 'ar' ? 'تحديد الأولوية' : 'Set Priority'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Wrench className="h-4 w-4 me-2" />
                      {language === 'ar' ? 'خارج الخدمة' : 'Set Out of Order'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Housekeeping Staff */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            {language === 'ar' ? 'فريق التدبير المنزلي' : 'Housekeeping Staff'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {housekeepers.map((hk) => (
              <div key={hk.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{hk.name}</p>
                    <Badge variant="outline" className={hk.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                      {hk.status === 'active' 
                        ? (language === 'ar' ? 'نشط' : 'Active') 
                        : (language === 'ar' ? 'متاح' : 'Available')}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {language === 'ar' ? 'الغرف المعينة' : 'Assigned Rooms'}
                  </span>
                  <span className="font-semibold">{hk.rooms}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success" />
              <span>VC - {language === 'ar' ? 'شاغرة نظيفة' : 'Vacant Clean'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-warning" />
              <span>VD - {language === 'ar' ? 'شاغرة وسخة' : 'Vacant Dirty'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-info" />
              <span>OC - {language === 'ar' ? 'مشغولة نظيفة' : 'Occupied Clean'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive" />
              <span>OD - {language === 'ar' ? 'مشغولة وسخة' : 'Occupied Dirty'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted border" />
              <span>OOO - {language === 'ar' ? 'خارج الخدمة' : 'Out of Order'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span>OOS - {language === 'ar' ? 'تحت الصيانة' : 'Out of Service'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
