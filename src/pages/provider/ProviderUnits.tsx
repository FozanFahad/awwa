import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Plus, MoreHorizontal, Edit, Trash2, Home, Bed, Bath, Users } from 'lucide-react';
import type { Tables, Enums } from '@/integrations/supabase/types';

type UnitStatus = Enums<'unit_status'>;

interface UnitFormData {
  property_id: string;
  name_en: string;
  name_ar: string;
  unit_type: string;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  size_m2: number | null;
  floor: number | null;
  description_en: string;
  description_ar: string;
  status: UnitStatus;
}

const initialFormData: UnitFormData = {
  property_id: '',
  name_en: '',
  name_ar: '',
  unit_type: 'apartment',
  bedrooms: 1,
  bathrooms: 1,
  capacity: 2,
  size_m2: null,
  floor: null,
  description_en: '',
  description_ar: '',
  status: 'available',
};

const statusColors: Record<UnitStatus, string> = {
  available: 'bg-success/10 text-success border-success/20',
  occupied: 'bg-info/10 text-info border-info/20',
  maintenance: 'bg-warning/10 text-warning border-warning/20',
  blocked: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function ProviderUnits() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [formData, setFormData] = useState<UnitFormData>(initialFormData);

  const { data: properties } = useQuery({
    queryKey: ['provider-properties-list', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('properties')
        .select('id, name_en, name_ar')
        .eq('owner_user_id', user.id)
        .order('name_en');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: units, isLoading } = useQuery({
    queryKey: ['provider-units', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('units')
        .select('*, property:properties(name_en, name_ar)')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: UnitFormData) => {
      if (!user) throw new Error('Not authenticated');

      const unitData = {
        ...data,
        owner_user_id: user.id,
        size_m2: data.size_m2 || null,
        floor: data.floor || null,
      };

      if (editingUnit) {
        const { error } = await supabase
          .from('units')
          .update(unitData)
          .eq('id', editingUnit)
          .eq('owner_user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('units')
          .insert(unitData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-units'] });
      setIsDialogOpen(false);
      setEditingUnit(null);
      setFormData(initialFormData);
      toast({
        title: language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id)
        .eq('owner_user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-units'] });
      toast({
        title: language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (unit: any) => {
    setEditingUnit(unit.id);
    setFormData({
      property_id: unit.property_id,
      name_en: unit.name_en,
      name_ar: unit.name_ar,
      unit_type: unit.unit_type,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      capacity: unit.capacity,
      size_m2: unit.size_m2,
      floor: unit.floor,
      description_en: unit.description_en || '',
      description_ar: unit.description_ar || '',
      status: unit.status,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingUnit(null);
    setFormData({
      ...initialFormData,
      property_id: properties?.[0]?.id || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.property_id) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يرجى اختيار العقار' : 'Please select a property',
        variant: 'destructive',
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const getStatusLabel = (status: UnitStatus) => {
    const labels: Record<UnitStatus, { en: string; ar: string }> = {
      available: { en: 'Available', ar: 'متاحة' },
      occupied: { en: 'Occupied', ar: 'مشغولة' },
      maintenance: { en: 'Maintenance', ar: 'صيانة' },
      blocked: { en: 'Blocked', ar: 'محجوبة' },
    };
    return language === 'ar' ? labels[status].ar : labels[status].en;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const hasProperties = properties && properties.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'الوحدات' : 'Units'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'إدارة وحداتك السكنية' : 'Manage your units'}
          </p>
        </div>
        <Button onClick={handleCreate} disabled={!hasProperties}>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'إضافة وحدة' : 'Add Unit'}
        </Button>
      </div>

      {!hasProperties && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="py-4">
            <p className="text-warning text-sm">
              {language === 'ar'
                ? 'يجب إضافة عقار أولاً قبل إضافة الوحدات'
                : 'You need to add a property first before adding units'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Units List */}
      {units && units.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {units.length} {language === 'ar' ? 'وحدة' : 'units'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>{language === 'ar' ? 'الوحدة' : 'Unit'}</TableHead>
                    <TableHead>{language === 'ar' ? 'العقار' : 'Property'}</TableHead>
                    <TableHead>{language === 'ar' ? 'التفاصيل' : 'Details'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Home className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {language === 'ar' ? unit.name_ar : unit.name_en}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {unit.unit_type}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {language === 'ar' ? unit.property?.name_ar : unit.property?.name_en}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Bed className="h-3.5 w-3.5" />
                            {unit.bedrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="h-3.5 w-3.5" />
                            {unit.bathrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {unit.capacity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[unit.status]}>
                          {getStatusLabel(unit.status)}
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
                            <DropdownMenuItem onClick={() => handleEdit(unit)}>
                              <Edit className="h-4 w-4 mr-2" />
                              {language === 'ar' ? 'تعديل' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(unit.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
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
      ) : hasProperties ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Home className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {language === 'ar' ? 'لا توجد وحدات بعد' : 'No units yet'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {language === 'ar'
                ? 'ابدأ بإضافة أول وحدة لعقارك'
                : 'Start by adding your first unit'}
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'إضافة وحدة' : 'Add Unit'}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUnit
                ? (language === 'ar' ? 'تعديل الوحدة' : 'Edit Unit')
                : (language === 'ar' ? 'إضافة وحدة جديدة' : 'Add New Unit')}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' ? 'أدخل بيانات الوحدة' : 'Enter unit details'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'العقار' : 'Property'}</Label>
              <Select
                value={formData.property_id}
                onValueChange={(value) => setFormData({ ...formData, property_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر العقار' : 'Select property'} />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {language === 'ar' ? property.name_ar : property.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  required
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  required
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نوع الوحدة' : 'Unit Type'}</Label>
                <Select
                  value={formData.unit_type}
                  onValueChange={(value) => setFormData({ ...formData, unit_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">{language === 'ar' ? 'شقة' : 'Apartment'}</SelectItem>
                    <SelectItem value="studio">{language === 'ar' ? 'استوديو' : 'Studio'}</SelectItem>
                    <SelectItem value="villa">{language === 'ar' ? 'فيلا' : 'Villa'}</SelectItem>
                    <SelectItem value="duplex">{language === 'ar' ? 'دوبلكس' : 'Duplex'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الحالة' : 'Status'}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as UnitStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">{language === 'ar' ? 'متاحة' : 'Available'}</SelectItem>
                    <SelectItem value="occupied">{language === 'ar' ? 'مشغولة' : 'Occupied'}</SelectItem>
                    <SelectItem value="maintenance">{language === 'ar' ? 'صيانة' : 'Maintenance'}</SelectItem>
                    <SelectItem value="blocked">{language === 'ar' ? 'محجوبة' : 'Blocked'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'غرف النوم' : 'Bedrooms'}</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الحمامات' : 'Bathrooms'}</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'السعة' : 'Capacity'}</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الطابق' : 'Floor'}</Label>
                <Input
                  type="number"
                  value={formData.floor || ''}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'المساحة (م²)' : 'Size (m²)'}</Label>
              <Input
                type="number"
                min="0"
                value={formData.size_m2 || ''}
                onChange={(e) => setFormData({ ...formData, size_m2: e.target.value ? parseFloat(e.target.value) : null })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={3}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={3}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                  : (language === 'ar' ? 'حفظ' : 'Save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
