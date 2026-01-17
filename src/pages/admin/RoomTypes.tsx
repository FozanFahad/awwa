import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BedDouble,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Users,
  Bath,
  Maximize,
  DollarSign,
} from 'lucide-react';

interface RoomType {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  baseOccupancy: number;
  maxOccupancy: number;
  bedrooms: number;
  bathrooms: number;
  sizeM2: number;
  extraAdultRate: number;
  extraChildRate: number;
  roomCount: number;
  isActive: boolean;
}

const roomTypes: RoomType[] = [
  {
    id: '1',
    code: 'STD',
    nameEn: 'Standard Room',
    nameAr: 'غرفة قياسية',
    baseOccupancy: 2,
    maxOccupancy: 3,
    bedrooms: 1,
    bathrooms: 1,
    sizeM2: 28,
    extraAdultRate: 150,
    extraChildRate: 75,
    roomCount: 20,
    isActive: true,
  },
  {
    id: '2',
    code: 'DLX',
    nameEn: 'Deluxe Room',
    nameAr: 'غرفة ديلوكس',
    baseOccupancy: 2,
    maxOccupancy: 3,
    bedrooms: 1,
    bathrooms: 1,
    sizeM2: 35,
    extraAdultRate: 175,
    extraChildRate: 85,
    roomCount: 15,
    isActive: true,
  },
  {
    id: '3',
    code: 'SUI',
    nameEn: 'Suite',
    nameAr: 'جناح',
    baseOccupancy: 2,
    maxOccupancy: 4,
    bedrooms: 1,
    bathrooms: 2,
    sizeM2: 55,
    extraAdultRate: 200,
    extraChildRate: 100,
    roomCount: 8,
    isActive: true,
  },
  {
    id: '4',
    code: 'EXC',
    nameEn: 'Executive Suite',
    nameAr: 'جناح تنفيذي',
    baseOccupancy: 2,
    maxOccupancy: 4,
    bedrooms: 2,
    bathrooms: 2,
    sizeM2: 75,
    extraAdultRate: 250,
    extraChildRate: 125,
    roomCount: 4,
    isActive: true,
  },
  {
    id: '5',
    code: 'ROY',
    nameEn: 'Royal Suite',
    nameAr: 'جناح ملكي',
    baseOccupancy: 4,
    maxOccupancy: 6,
    bedrooms: 3,
    bathrooms: 3,
    sizeM2: 120,
    extraAdultRate: 350,
    extraChildRate: 175,
    roomCount: 2,
    isActive: true,
  },
];

export default function RoomTypes() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);

  const totalRooms = roomTypes.reduce((sum, rt) => sum + rt.roomCount, 0);

  const handleEdit = (roomType: RoomType) => {
    setEditingType(roomType);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingType(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'أنواع الغرف' : 'Room Types'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة أنواع الغرف والفئات'
              : 'Manage room types and categories'}
          </p>
        </div>
        <Button onClick={handleCreate} className="btn-gold">
          <Plus className="h-4 w-4 me-2" />
          {language === 'ar' ? 'إضافة نوع جديد' : 'Add Room Type'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <BedDouble className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roomTypes.length}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'أنواع الغرف' : 'Room Types'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Maximize className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRooms}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'إجمالي الغرف' : 'Total Rooms'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roomTypes.reduce((sum, rt) => sum + rt.maxOccupancy * rt.roomCount, 0)}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'أقصى سعة' : 'Max Capacity'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roomTypes.filter(rt => rt.isActive).length}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'أنواع نشطة' : 'Active Types'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Types Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-accent" />
            {language === 'ar' ? 'قائمة أنواع الغرف' : 'Room Types List'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold w-20">{language === 'ar' ? 'الكود' : 'Code'}</TableHead>
                  <TableHead className="font-semibold">{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead className="font-semibold text-center">{language === 'ar' ? 'السعة' : 'Occupancy'}</TableHead>
                  <TableHead className="font-semibold text-center">{language === 'ar' ? 'غرف النوم' : 'Bedrooms'}</TableHead>
                  <TableHead className="font-semibold text-center">{language === 'ar' ? 'الحمامات' : 'Bathrooms'}</TableHead>
                  <TableHead className="font-semibold text-center">{language === 'ar' ? 'المساحة' : 'Size'}</TableHead>
                  <TableHead className="font-semibold text-center">{language === 'ar' ? 'عدد الغرف' : 'Rooms'}</TableHead>
                  <TableHead className="font-semibold text-center">{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((roomType) => (
                  <TableRow key={roomType.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Badge variant="outline" className="font-mono font-semibold">
                        {roomType.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{language === 'ar' ? roomType.nameAr : roomType.nameEn}</p>
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? roomType.nameEn : roomType.nameAr}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{roomType.baseOccupancy}</span>
                        <span className="text-muted-foreground">-</span>
                        <span>{roomType.maxOccupancy}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <BedDouble className="h-3 w-3 text-muted-foreground" />
                        <span>{roomType.bedrooms}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Bath className="h-3 w-3 text-muted-foreground" />
                        <span>{roomType.bathrooms}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span>{roomType.sizeM2} m²</span>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {roomType.roomCount}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={roomType.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                        {roomType.isActive 
                          ? (language === 'ar' ? 'نشط' : 'Active') 
                          : (language === 'ar' ? 'غير نشط' : 'Inactive')}
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
                          <DropdownMenuItem onClick={() => handleEdit(roomType)}>
                            <Edit className="h-4 w-4 me-2" />
                            {language === 'ar' ? 'تعديل' : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 me-2" />
                            {language === 'ar' ? 'نسخ' : 'Duplicate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 me-2" />
                            {language === 'ar' ? 'حذف' : 'Delete'}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingType 
                ? (language === 'ar' ? 'تعديل نوع الغرفة' : 'Edit Room Type')
                : (language === 'ar' ? 'إضافة نوع غرفة جديد' : 'Add New Room Type')}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'أدخل تفاصيل نوع الغرفة'
                : 'Enter the room type details'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الكود' : 'Code'}</Label>
              <Input 
                placeholder="e.g., DLX" 
                defaultValue={editingType?.code}
                className="font-mono uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الحالة' : 'Status'}</Label>
              <div className="flex items-center gap-2 h-10">
                <Switch defaultChecked={editingType?.isActive ?? true} />
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'نشط' : 'Active'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
              <Input 
                placeholder="Deluxe Room" 
                defaultValue={editingType?.nameEn}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
              <Input 
                placeholder="غرفة ديلوكس" 
                defaultValue={editingType?.nameAr}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'السعة الأساسية' : 'Base Occupancy'}</Label>
              <Input 
                type="number" 
                placeholder="2" 
                defaultValue={editingType?.baseOccupancy}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'أقصى سعة' : 'Max Occupancy'}</Label>
              <Input 
                type="number" 
                placeholder="4" 
                defaultValue={editingType?.maxOccupancy}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'غرف النوم' : 'Bedrooms'}</Label>
              <Input 
                type="number" 
                placeholder="1" 
                defaultValue={editingType?.bedrooms}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الحمامات' : 'Bathrooms'}</Label>
              <Input 
                type="number" 
                placeholder="1" 
                defaultValue={editingType?.bathrooms}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'المساحة (م²)' : 'Size (m²)'}</Label>
              <Input 
                type="number" 
                placeholder="35" 
                defaultValue={editingType?.sizeM2}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'رسم الشخص الإضافي' : 'Extra Adult Rate'}</Label>
              <Input 
                type="number" 
                placeholder="150" 
                defaultValue={editingType?.extraAdultRate}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button className="btn-gold">
              {editingType 
                ? (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                : (language === 'ar' ? 'إضافة' : 'Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
