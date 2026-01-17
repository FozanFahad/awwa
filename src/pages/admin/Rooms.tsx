import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  DoorOpen,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Building2,
  Filter,
  Search,
  Wrench,
  Check,
  AlertCircle,
} from 'lucide-react';

type RoomStatus = 'vacant_clean' | 'vacant_dirty' | 'occupied_clean' | 'occupied_dirty' | 'out_of_order' | 'out_of_service';

interface Room {
  id: string;
  number: string;
  floor: number;
  building: string;
  wing: string;
  roomTypeCode: string;
  roomTypeName: string;
  status: RoomStatus;
  isActive: boolean;
  features: string[];
  notes: string | null;
}

const rooms: Room[] = [
  { id: '1', number: '101', floor: 1, building: 'Main', wing: 'A', roomTypeCode: 'STD', roomTypeName: 'Standard Room', status: 'vacant_clean', isActive: true, features: ['City View'], notes: null },
  { id: '2', number: '102', floor: 1, building: 'Main', wing: 'A', roomTypeCode: 'STD', roomTypeName: 'Standard Room', status: 'occupied_clean', isActive: true, features: ['City View'], notes: null },
  { id: '3', number: '103', floor: 1, building: 'Main', wing: 'A', roomTypeCode: 'STD', roomTypeName: 'Standard Room', status: 'vacant_dirty', isActive: true, features: ['Garden View'], notes: null },
  { id: '4', number: '201', floor: 2, building: 'Main', wing: 'A', roomTypeCode: 'DLX', roomTypeName: 'Deluxe Room', status: 'vacant_clean', isActive: true, features: ['Sea View', 'Balcony'], notes: null },
  { id: '5', number: '202', floor: 2, building: 'Main', wing: 'A', roomTypeCode: 'DLX', roomTypeName: 'Deluxe Room', status: 'occupied_dirty', isActive: true, features: ['Sea View', 'Balcony'], notes: null },
  { id: '6', number: '203', floor: 2, building: 'Main', wing: 'B', roomTypeCode: 'DLX', roomTypeName: 'Deluxe Room', status: 'out_of_order', isActive: true, features: ['Pool View'], notes: 'AC repair needed' },
  { id: '7', number: '301', floor: 3, building: 'Main', wing: 'A', roomTypeCode: 'SUI', roomTypeName: 'Suite', status: 'vacant_clean', isActive: true, features: ['Sea View', 'Jacuzzi', 'Kitchenette'], notes: null },
  { id: '8', number: '302', floor: 3, building: 'Main', wing: 'A', roomTypeCode: 'SUI', roomTypeName: 'Suite', status: 'occupied_clean', isActive: true, features: ['Sea View', 'Jacuzzi'], notes: null },
  { id: '9', number: '401', floor: 4, building: 'Main', wing: 'A', roomTypeCode: 'EXC', roomTypeName: 'Executive Suite', status: 'vacant_clean', isActive: true, features: ['Panoramic View', 'Kitchen', 'Lounge'], notes: null },
  { id: '10', number: '501', floor: 5, building: 'Main', wing: 'A', roomTypeCode: 'ROY', roomTypeName: 'Royal Suite', status: 'out_of_service', isActive: false, features: ['Full Floor', 'Private Pool', 'Butler Service'], notes: 'Renovation in progress' },
];

const roomTypes = [
  { code: 'STD', name: 'Standard Room' },
  { code: 'DLX', name: 'Deluxe Room' },
  { code: 'SUI', name: 'Suite' },
  { code: 'EXC', name: 'Executive Suite' },
  { code: 'ROY', name: 'Royal Suite' },
];

export default function Rooms() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const getStatusConfig = (status: RoomStatus) => {
    const config: Record<RoomStatus, { bg: string; label: { en: string; ar: string } }> = {
      vacant_clean: { bg: 'bg-success/10 text-success', label: { en: 'Vacant Clean', ar: 'شاغرة نظيفة' } },
      vacant_dirty: { bg: 'bg-warning/10 text-warning', label: { en: 'Vacant Dirty', ar: 'شاغرة وسخة' } },
      occupied_clean: { bg: 'bg-info/10 text-info', label: { en: 'Occupied Clean', ar: 'مشغولة نظيفة' } },
      occupied_dirty: { bg: 'bg-destructive/10 text-destructive', label: { en: 'Occupied Dirty', ar: 'مشغولة وسخة' } },
      out_of_order: { bg: 'bg-muted text-muted-foreground', label: { en: 'Out of Order', ar: 'خارج الخدمة' } },
      out_of_service: { bg: 'bg-primary/10 text-primary', label: { en: 'Out of Service', ar: 'تحت الصيانة' } },
    };
    return config[status];
  };

  const filteredRooms = rooms.filter(room => {
    if (searchQuery && !room.number.includes(searchQuery)) return false;
    if (selectedFloor !== 'all' && room.floor.toString() !== selectedFloor) return false;
    if (selectedType !== 'all' && room.roomTypeCode !== selectedType) return false;
    return true;
  });

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingRoom(null);
    setIsDialogOpen(true);
  };

  const floors = [...new Set(rooms.map(r => r.floor))].sort();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'الغرف' : 'Rooms'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة جميع الغرف في الفندق'
              : 'Manage all rooms in the property'}
          </p>
        </div>
        <Button onClick={handleCreate} className="btn-gold">
          <Plus className="h-4 w-4 me-2" />
          {language === 'ar' ? 'إضافة غرفة' : 'Add Room'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="dashboard-card">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{rooms.length}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'إجمالي الغرف' : 'Total Rooms'}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-success">{rooms.filter(r => r.status === 'vacant_clean').length}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'شاغرة نظيفة' : 'Vacant Clean'}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-warning">{rooms.filter(r => r.status === 'vacant_dirty').length}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'شاغرة وسخة' : 'Vacant Dirty'}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-info">{rooms.filter(r => r.status.startsWith('occupied')).length}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'مشغولة' : 'Occupied'}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-muted-foreground">{rooms.filter(r => r.status === 'out_of_order' || r.status === 'out_of_service').length}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'خارج الخدمة' : 'OOO/OOS'}
            </p>
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
            {floors.map(floor => (
              <SelectItem key={floor} value={floor.toString()}>
                {language === 'ar' ? `الطابق ${floor}` : `Floor ${floor}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-44">
            <Filter className="h-4 w-4 me-2" />
            <SelectValue placeholder={language === 'ar' ? 'النوع' : 'Type'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'ar' ? 'كل الأنواع' : 'All Types'}</SelectItem>
            {roomTypes.map(type => (
              <SelectItem key={type.code} value={type.code}>{type.code} - {type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rooms Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-accent" />
              {language === 'ar' ? 'قائمة الغرف' : 'Rooms List'}
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {filteredRooms.length} {language === 'ar' ? 'غرفة' : 'rooms'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold w-24">{language === 'ar' ? 'رقم الغرفة' : 'Room #'}</TableHead>
                  <TableHead className="font-semibold">{language === 'ar' ? 'النوع' : 'Room Type'}</TableHead>
                  <TableHead className="font-semibold text-center">{language === 'ar' ? 'الطابق' : 'Floor'}</TableHead>
                  <TableHead className="font-semibold text-center">{language === 'ar' ? 'المبنى' : 'Building'}</TableHead>
                  <TableHead className="font-semibold text-center">{language === 'ar' ? 'الجناح' : 'Wing'}</TableHead>
                  <TableHead className="font-semibold">{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className="font-semibold">{language === 'ar' ? 'المميزات' : 'Features'}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => {
                  const statusConfig = getStatusConfig(room.status);
                  return (
                    <TableRow key={room.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-lg">
                        {room.number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="font-mono me-2">{room.roomTypeCode}</Badge>
                          <span className="text-muted-foreground">{room.roomTypeName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{room.floor}</TableCell>
                      <TableCell className="text-center">{room.building}</TableCell>
                      <TableCell className="text-center">{room.wing}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.bg}>
                          {statusConfig.label[language]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {room.features.slice(0, 2).map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {room.features.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{room.features.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(room)}>
                              <Edit className="h-4 w-4 me-2" />
                              {language === 'ar' ? 'تعديل' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Check className="h-4 w-4 me-2" />
                              {language === 'ar' ? 'تغيير إلى نظيفة' : 'Set Clean'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <AlertCircle className="h-4 w-4 me-2" />
                              {language === 'ar' ? 'تغيير إلى وسخة' : 'Set Dirty'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Wrench className="h-4 w-4 me-2" />
                              {language === 'ar' ? 'خارج الخدمة' : 'Set Out of Order'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 me-2" />
                              {language === 'ar' ? 'حذف' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRoom 
                ? (language === 'ar' ? 'تعديل الغرفة' : 'Edit Room')
                : (language === 'ar' ? 'إضافة غرفة جديدة' : 'Add New Room')}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'أدخل تفاصيل الغرفة'
                : 'Enter room details'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'رقم الغرفة' : 'Room Number'}</Label>
              <Input 
                placeholder="101" 
                defaultValue={editingRoom?.number}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'نوع الغرفة' : 'Room Type'}</Label>
              <Select defaultValue={editingRoom?.roomTypeCode}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر...' : 'Select...'} />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map(type => (
                    <SelectItem key={type.code} value={type.code}>
                      {type.code} - {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الطابق' : 'Floor'}</Label>
              <Input 
                type="number" 
                placeholder="1" 
                defaultValue={editingRoom?.floor}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'المبنى' : 'Building'}</Label>
              <Input 
                placeholder="Main" 
                defaultValue={editingRoom?.building}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الجناح' : 'Wing'}</Label>
              <Input 
                placeholder="A" 
                defaultValue={editingRoom?.wing}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الحالة' : 'Status'}</Label>
              <Select defaultValue={editingRoom?.status || 'vacant_clean'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant_clean">{language === 'ar' ? 'شاغرة نظيفة' : 'Vacant Clean'}</SelectItem>
                  <SelectItem value="vacant_dirty">{language === 'ar' ? 'شاغرة وسخة' : 'Vacant Dirty'}</SelectItem>
                  <SelectItem value="out_of_order">{language === 'ar' ? 'خارج الخدمة' : 'Out of Order'}</SelectItem>
                  <SelectItem value="out_of_service">{language === 'ar' ? 'تحت الصيانة' : 'Out of Service'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button className="btn-gold">
              {editingRoom 
                ? (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                : (language === 'ar' ? 'إضافة' : 'Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
