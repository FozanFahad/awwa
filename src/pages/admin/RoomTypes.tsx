import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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
  Loader2,
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type RoomType = Tables<'room_types'> & { roomCount?: number };

export default function RoomTypes() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name_en: '',
    name_ar: '',
    base_occupancy: 2,
    max_occupancy: 4,
    bedrooms: 1,
    bathrooms: 1,
    size_m2: 35,
    extra_adult_rate: 150,
    extra_child_rate: 75,
    is_active: true,
  });

  // Fetch room types with room count
  const { data: roomTypes, isLoading } = useQuery({
    queryKey: ['room-types'],
    queryFn: async () => {
      const { data: types, error } = await supabase
        .from('room_types')
        .select('*')
        .order('sort_order');

      if (error) throw error;

      // Get room counts for each type
      const { data: rooms } = await supabase
        .from('rooms')
        .select('room_type_id');

      const roomCounts: Record<string, number> = {};
      rooms?.forEach(room => {
        roomCounts[room.room_type_id] = (roomCounts[room.room_type_id] || 0) + 1;
      });

      return types.map(type => ({
        ...type,
        roomCount: roomCounts[type.id] || 0,
      }));
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .limit(1)
        .single();

      if (!properties) throw new Error('No property found');

      if (data.id) {
        const { error } = await supabase
          .from('room_types')
          .update({
            code: data.code,
            name_en: data.name_en,
            name_ar: data.name_ar,
            base_occupancy: data.base_occupancy,
            max_occupancy: data.max_occupancy,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            size_m2: data.size_m2,
            extra_adult_rate: data.extra_adult_rate,
            extra_child_rate: data.extra_child_rate,
            is_active: data.is_active,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('room_types').insert({
          property_id: properties.id,
          code: data.code,
          name_en: data.name_en,
          name_ar: data.name_ar,
          base_occupancy: data.base_occupancy,
          max_occupancy: data.max_occupancy,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          size_m2: data.size_m2,
          extra_adult_rate: data.extra_adult_rate,
          extra_child_rate: data.extra_child_rate,
          is_active: data.is_active,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
      setIsDialogOpen(false);
      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Saved',
        description: language === 'ar' ? 'تم حفظ نوع الغرفة بنجاح' : 'Room type saved successfully',
      });
    },
    onError: (error) => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('room_types').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف نوع الغرفة' : 'Room type deleted',
      });
    },
  });

  const totalRooms = roomTypes?.reduce((sum, rt) => sum + (rt.roomCount || 0), 0) || 0;

  const handleEdit = (roomType: RoomType) => {
    setEditingType(roomType);
    setFormData({
      code: roomType.code,
      name_en: roomType.name_en,
      name_ar: roomType.name_ar,
      base_occupancy: roomType.base_occupancy,
      max_occupancy: roomType.max_occupancy,
      bedrooms: roomType.bedrooms,
      bathrooms: roomType.bathrooms,
      size_m2: roomType.size_m2 || 35,
      extra_adult_rate: roomType.extra_adult_rate || 0,
      extra_child_rate: roomType.extra_child_rate || 0,
      is_active: roomType.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingType(null);
    setFormData({
      code: '',
      name_en: '',
      name_ar: '',
      base_occupancy: 2,
      max_occupancy: 4,
      bedrooms: 1,
      bathrooms: 1,
      size_m2: 35,
      extra_adult_rate: 150,
      extra_child_rate: 75,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      ...formData,
      id: editingType?.id,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

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
                <p className="text-2xl font-bold">{roomTypes?.length || 0}</p>
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
                <p className="text-2xl font-bold">
                  {roomTypes?.reduce((sum, rt) => sum + rt.max_occupancy * (rt.roomCount || 0), 0) || 0}
                </p>
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
                <p className="text-2xl font-bold">{roomTypes?.filter(rt => rt.is_active).length || 0}</p>
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
                {roomTypes?.map((roomType) => (
                  <TableRow key={roomType.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Badge variant="outline" className="font-mono font-semibold">
                        {roomType.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{language === 'ar' ? roomType.name_ar : roomType.name_en}</p>
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? roomType.name_en : roomType.name_ar}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{roomType.base_occupancy}</span>
                        <span className="text-muted-foreground">-</span>
                        <span>{roomType.max_occupancy}</span>
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
                      <span>{roomType.size_m2 || '-'} m²</span>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {roomType.roomCount || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={roomType.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                        {roomType.is_active 
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
                          <DropdownMenuItem onClick={() => deleteMutation.mutate(roomType.id)} className="text-destructive">
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
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="font-mono uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الحالة' : 'Status'}</Label>
              <div className="flex items-center gap-2 h-10">
                <Switch 
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'نشط' : 'Active'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
              <Input 
                placeholder="Deluxe Room" 
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
              <Input 
                placeholder="غرفة ديلوكس" 
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'السعة الأساسية' : 'Base Occupancy'}</Label>
              <Input 
                type="number" 
                value={formData.base_occupancy}
                onChange={(e) => setFormData({ ...formData, base_occupancy: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'أقصى سعة' : 'Max Occupancy'}</Label>
              <Input 
                type="number" 
                value={formData.max_occupancy}
                onChange={(e) => setFormData({ ...formData, max_occupancy: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'غرف النوم' : 'Bedrooms'}</Label>
              <Input 
                type="number" 
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الحمامات' : 'Bathrooms'}</Label>
              <Input 
                type="number" 
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'المساحة (م²)' : 'Size (m²)'}</Label>
              <Input 
                type="number" 
                value={formData.size_m2}
                onChange={(e) => setFormData({ ...formData, size_m2: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'رسم الشخص الإضافي' : 'Extra Adult Rate'}</Label>
              <Input 
                type="number" 
                value={formData.extra_adult_rate}
                onChange={(e) => setFormData({ ...formData, extra_adult_rate: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSave} className="btn-gold" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
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
