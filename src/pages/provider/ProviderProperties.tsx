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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Plus, MoreHorizontal, Edit, Trash2, Building2, MapPin } from 'lucide-react';

interface PropertyFormData {
  name_en: string;
  name_ar: string;
  city: string;
  district: string;
  address: string;
  address_ar: string;
  description_en: string;
  description_ar: string;
}

const initialFormData: PropertyFormData = {
  name_en: '',
  name_ar: '',
  city: '',
  district: '',
  address: '',
  address_ar: '',
  description_en: '',
  description_ar: '',
};

export default function ProviderProperties() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<string | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);

  const { data: properties, isLoading } = useQuery({
    queryKey: ['provider-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      if (!user) throw new Error('Not authenticated');

      if (editingProperty) {
        const { error } = await supabase
          .from('properties')
          .update(data)
          .eq('id', editingProperty)
          .eq('owner_user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('properties')
          .insert({ ...data, owner_user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-properties'] });
      setIsDialogOpen(false);
      setEditingProperty(null);
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
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('owner_user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-properties'] });
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

  const handleEdit = (property: any) => {
    setEditingProperty(property.id);
    setFormData({
      name_en: property.name_en,
      name_ar: property.name_ar,
      city: property.city,
      district: property.district || '',
      address: property.address || '',
      address_ar: property.address_ar || '',
      description_en: property.description_en || '',
      description_ar: property.description_ar || '',
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProperty(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'العقارات' : 'Properties'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'إدارة عقاراتك' : 'Manage your properties'}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'إضافة عقار' : 'Add Property'}
        </Button>
      </div>

      {/* Properties List */}
      {properties && properties.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {properties.length} {language === 'ar' ? 'عقار' : 'properties'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                    <TableHead>{language === 'ar' ? 'المدينة' : 'City'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الحي' : 'District'}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {language === 'ar' ? property.name_ar : property.name_en}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {language === 'ar' ? property.name_en : property.name_ar}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {property.city}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {property.district || '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(property)}>
                              <Edit className="h-4 w-4 mr-2" />
                              {language === 'ar' ? 'تعديل' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(property.id)}
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
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {language === 'ar' ? 'لا توجد عقارات بعد' : 'No properties yet'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {language === 'ar'
                ? 'ابدأ بإضافة أول عقار لك'
                : 'Start by adding your first property'}
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'إضافة عقار' : 'Add Property'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProperty
                ? (language === 'ar' ? 'تعديل العقار' : 'Edit Property')
                : (language === 'ar' ? 'إضافة عقار جديد' : 'Add New Property')}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar'
                ? 'أدخل بيانات العقار'
                : 'Enter property details'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label>{language === 'ar' ? 'المدينة' : 'City'}</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الحي' : 'District'}</Label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Address (English)'}</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Address (Arabic)'}</Label>
                <Input
                  value={formData.address_ar}
                  onChange={(e) => setFormData({ ...formData, address_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
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
