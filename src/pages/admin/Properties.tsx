import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Building2,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Home,
  User,
  Loader2,
  Search,
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Property = Tables<'properties'> & { 
  unitCount?: number;
  ownerEmail?: string;
};

interface FormData {
  name_en: string;
  name_ar: string;
  city: string;
  district: string;
  address: string;
  address_ar: string;
  description_en: string;
  description_ar: string;
  cover_image_url: string;
}

export default function Properties() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name_en: '',
    name_ar: '',
    city: '',
    district: '',
    address: '',
    address_ar: '',
    description_en: '',
    description_ar: '',
    cover_image_url: '',
  });

  // Fetch properties with unit count and owner info
  const { data: properties, isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data: props, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unit counts for each property
      const { data: units } = await supabase
        .from('units')
        .select('property_id');

      const unitCounts: Record<string, number> = {};
      units?.forEach(unit => {
        if (unit.property_id) {
          unitCounts[unit.property_id] = (unitCounts[unit.property_id] || 0) + 1;
        }
      });

      // Get owner emails
      const ownerIds = props?.map(p => p.owner_user_id).filter(Boolean) as string[];
      let ownerEmails: Record<string, string> = {};
      
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', ownerIds);
        
        profiles?.forEach(profile => {
          if (profile.email) {
            ownerEmails[profile.id] = profile.email;
          }
        });
      }

      return props?.map(prop => ({
        ...prop,
        unitCount: unitCounts[prop.id] || 0,
        ownerEmail: prop.owner_user_id ? ownerEmails[prop.owner_user_id] : undefined,
      })) || [];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: FormData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('properties')
          .update({
            name_en: data.name_en,
            name_ar: data.name_ar,
            city: data.city,
            district: data.district,
            address: data.address,
            address_ar: data.address_ar,
            description_en: data.description_en,
            description_ar: data.description_ar,
            cover_image_url: data.cover_image_url,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('properties').insert({
          name_en: data.name_en,
          name_ar: data.name_ar,
          city: data.city,
          district: data.district || null,
          address: data.address || null,
          address_ar: data.address_ar || null,
          description_en: data.description_en || null,
          description_ar: data.description_ar || null,
          cover_image_url: data.cover_image_url || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      setIsDialogOpen(false);
      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Saved',
        description: language === 'ar' ? 'تم حفظ العقار بنجاح' : 'Property saved successfully',
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
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف العقار' : 'Property deleted',
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

  const filteredProperties = properties?.filter(prop => {
    const query = searchQuery.toLowerCase();
    return (
      prop.name_en.toLowerCase().includes(query) ||
      prop.name_ar.toLowerCase().includes(query) ||
      prop.city.toLowerCase().includes(query) ||
      (prop.district && prop.district.toLowerCase().includes(query))
    );
  });

  const totalUnits = properties?.reduce((sum, p) => sum + (p.unitCount || 0), 0) || 0;

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      name_en: property.name_en,
      name_ar: property.name_ar,
      city: property.city,
      district: property.district || '',
      address: property.address || '',
      address_ar: property.address_ar || '',
      description_en: property.description_en || '',
      description_ar: property.description_ar || '',
      cover_image_url: property.cover_image_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProperty(null);
    setFormData({
      name_en: '',
      name_ar: '',
      city: '',
      district: '',
      address: '',
      address_ar: '',
      description_en: '',
      description_ar: '',
      cover_image_url: '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name_en || !formData.name_ar || !formData.city) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields',
        variant: 'destructive',
      });
      return;
    }
    saveMutation.mutate({
      ...formData,
      id: editingProperty?.id,
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
            {language === 'ar' ? 'العقارات' : 'Properties'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة جميع العقارات في النظام'
              : 'Manage all properties in the system'}
          </p>
        </div>
        <Button onClick={handleCreate} className="btn-gold">
          <Plus className="h-4 w-4 me-2" />
          {language === 'ar' ? 'إضافة عقار' : 'Add Property'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Building2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{properties?.length || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'إجمالي العقارات' : 'Total Properties'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Home className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUnits}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'إجمالي الوحدات' : 'Total Units'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <MapPin className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(properties?.map(p => p.city)).size}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'المدن' : 'Cities'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(properties?.map(p => p.owner_user_id).filter(Boolean)).size}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'مقدمو الخدمة' : 'Providers'}
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
          placeholder={language === 'ar' ? 'البحث عن عقار...' : 'Search properties...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-10"
        />
      </div>

      {/* Properties Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-accent" />
            {language === 'ar' ? 'قائمة العقارات' : 'Properties List'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead className="font-semibold">{language === 'ar' ? 'المدينة' : 'City'}</TableHead>
                  <TableHead className="font-semibold">{language === 'ar' ? 'الحي' : 'District'}</TableHead>
                  <TableHead className="font-semibold text-center">{language === 'ar' ? 'الوحدات' : 'Units'}</TableHead>
                  <TableHead className="font-semibold">{language === 'ar' ? 'المالك' : 'Owner'}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {language === 'ar' ? 'لا توجد عقارات' : 'No properties found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties?.map((property) => (
                    <TableRow key={property.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {property.cover_image_url ? (
                            <img 
                              src={property.cover_image_url} 
                              alt={property.name_en}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{language === 'ar' ? property.name_ar : property.name_en}</p>
                            <p className="text-xs text-muted-foreground">{language === 'ar' ? property.name_en : property.name_ar}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{property.city}</span>
                        </div>
                      </TableCell>
                      <TableCell>{property.district || '-'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{property.unitCount}</Badge>
                      </TableCell>
                      <TableCell>
                        {property.ownerEmail ? (
                          <span className="text-sm">{property.ownerEmail}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
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
                            <DropdownMenuItem onClick={() => handleEdit(property)}>
                              <Edit className="h-4 w-4 me-2" />
                              {language === 'ar' ? 'تعديل' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteMutation.mutate(property.id)} 
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 me-2" />
                              {language === 'ar' ? 'حذف' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
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
                ? 'أدخل تفاصيل العقار'
                : 'Enter the property details'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الاسم (إنجليزي) *' : 'Name (English) *'}</Label>
              <Input 
                placeholder="Property Name" 
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الاسم (عربي) *' : 'Name (Arabic) *'}</Label>
              <Input 
                placeholder="اسم العقار" 
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'المدينة *' : 'City *'}</Label>
              <Input 
                placeholder={language === 'ar' ? 'المدينة' : 'City'} 
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الحي' : 'District'}</Label>
              <Input 
                placeholder={language === 'ar' ? 'الحي' : 'District'} 
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Address (English)'}</Label>
              <Input 
                placeholder="Full address" 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Address (Arabic)'}</Label>
              <Input 
                placeholder="العنوان الكامل" 
                value={formData.address_ar}
                onChange={(e) => setFormData({ ...formData, address_ar: e.target.value })}
                dir="rtl"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
              <Textarea 
                placeholder="Property description" 
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
              <Textarea 
                placeholder="وصف العقار" 
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                dir="rtl"
                rows={3}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>{language === 'ar' ? 'رابط صورة الغلاف' : 'Cover Image URL'}</Label>
              <Input 
                placeholder="https://example.com/image.jpg" 
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {language === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
