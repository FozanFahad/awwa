import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Loader2,
} from 'lucide-react';
import type { Tables, Enums } from '@/integrations/supabase/types';

type RoomStatus = Enums<'room_status'>;
type Room = Tables<'rooms'> & { room_type?: Tables<'room_types'> };

export default function Rooms() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [formData, setFormData] = useState({
    room_number: '',
    room_type_id: '',
    floor: 1,
    building: 'Main',
    wing: 'A',
    room_status: 'vacant_clean' as RoomStatus,
  });

  // Fetch rooms with room type info
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*, room_type:room_types(*)')
        .order('room_number');
      if (error) throw error;
      return data as Room[];
    },
  });

  // Fetch room types for dropdown
  const { data: roomTypes } = useQuery({
    queryKey: ['room-types-dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_types')
        .select('id, code, name_en, name_ar')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  // Update room status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RoomStatus }) => {
      const { error } = await supabase
        .from('rooms')
        .update({ room_status: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث حالة الغرفة' : 'Room status updated',
      });
    },
  });

  // Save room mutation
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
          .from('rooms')
          .update({
            room_number: data.room_number,
            room_type_id: data.room_type_id,
            floor: data.floor,
            building: data.building,
            wing: data.wing,
            room_status: data.room_status,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('rooms').insert({
          property_id: properties.id,
          room_number: data.room_number,
          room_type_id: data.room_type_id,
          floor: data.floor,
          building: data.building,
          wing: data.wing,
          room_status: data.room_status,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsDialogOpen(false);
      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Saved',
        description: language === 'ar' ? 'تم حفظ الغرفة بنجاح' : 'Room saved successfully',
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
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
      });
    },
  });

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

  const filteredRooms = rooms?.filter(room => {
    if (searchQuery && !room.room_number.includes(searchQuery)) return false;
    if (selectedFloor !== 'all' && room.floor?.toString() !== selectedFloor) return false;
    if (selectedType !== 'all' && room.room_type_id !== selectedType) return false;
    return true;
  }) || [];

  const floors = [...new Set(rooms?.map(r => r.floor).filter(Boolean))].sort() as number[];

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type_id: room.room_type_id,
      floor: room.floor || 1,
      building: room.building || 'Main',
      wing: room.wing || 'A',
      room_status: room.room_status,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingRoom(null);
    setFormData({
      room_number: '',
      room_type_id: roomTypes?.[0]?.id || '',
      floor: 1,
      building: 'Main',
      wing: 'A',
      room_status: 'vacant_clean',
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      ...formData,
      id: editingRoom?.id,
    });
  };

  if (roomsLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
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
            <p className="text-3xl font-bold">{rooms?.length || 0}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'إجمالي الغرف' : 'Total Rooms'}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-success">{rooms?.filter(r => r.room_status === 'vacant_clean').length || 0}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'شاغرة نظيفة' : 'Vacant Clean'}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-warning">{rooms?.filter(r => r.room_status === 'vacant_dirty').length || 0}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'شاغرة وسخة' : 'Vacant Dirty'}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-info">{rooms?.filter(r => r.room_status.startsWith('occupied')).length || 0}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'مشغولة' : 'Occupied'}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-muted-foreground">{rooms?.filter(r => r.room_status === 'out_of_order' || r.room_status === 'out_of_service').length || 0}</p>
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
            {roomTypes?.map(type => (
              <SelectItem key={type.id} value={type.id}>
                {type.code} - {language === 'ar' ? type.name_ar : type.name_en}
              </SelectItem>
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
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => {
                  const statusConfig = getStatusConfig(room.room_status);
                  return (
                    <TableRow key={room.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-lg">
                        {room.room_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="font-mono me-2">{room.room_type?.code}</Badge>
                          <span className="text-muted-foreground">
                            {language === 'ar' ? room.room_type?.name_ar : room.room_type?.name_en}
                          </span>
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
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: room.id, status: 'vacant_clean' })}>
                              <Check className="h-4 w-4 me-2" />
                              {language === 'ar' ? 'تغيير إلى نظيفة' : 'Set Clean'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: room.id, status: 'vacant_dirty' })}>
                              <AlertCircle className="h-4 w-4 me-2" />
                              {language === 'ar' ? 'تغيير إلى وسخة' : 'Set Dirty'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: room.id, status: 'out_of_order' })}>
                              <Wrench className="h-4 w-4 me-2" />
                              {language === 'ar' ? 'خارج الخدمة' : 'Set Out of Order'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteMutation.mutate(room.id)} className="text-destructive">
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
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'نوع الغرفة' : 'Room Type'}</Label>
              <Select value={formData.room_type_id} onValueChange={(v) => setFormData({ ...formData, room_type_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر...' : 'Select...'} />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes?.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.code} - {language === 'ar' ? type.name_ar : type.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الطابق' : 'Floor'}</Label>
              <Input 
                type="number" 
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'المبنى' : 'Building'}</Label>
              <Input 
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الجناح' : 'Wing'}</Label>
              <Input 
                value={formData.wing}
                onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الحالة' : 'Status'}</Label>
              <Select value={formData.room_status} onValueChange={(v: RoomStatus) => setFormData({ ...formData, room_status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant_clean">{language === 'ar' ? 'شاغرة نظيفة' : 'Vacant Clean'}</SelectItem>
                  <SelectItem value="vacant_dirty">{language === 'ar' ? 'شاغرة وسخة' : 'Vacant Dirty'}</SelectItem>
                  <SelectItem value="occupied_clean">{language === 'ar' ? 'مشغولة نظيفة' : 'Occupied Clean'}</SelectItem>
                  <SelectItem value="occupied_dirty">{language === 'ar' ? 'مشغولة وسخة' : 'Occupied Dirty'}</SelectItem>
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
            <Button onClick={handleSave} className="btn-gold" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
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
