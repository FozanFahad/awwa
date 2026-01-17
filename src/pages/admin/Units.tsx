import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Bed, Bath, Users } from 'lucide-react';

// Mock data
const units = [
  {
    id: '1',
    nameEn: 'Luxury Penthouse Suite',
    nameAr: 'جناح بنتهاوس فاخر',
    property: 'Al Faisaliah Residences',
    type: 'Penthouse',
    bedrooms: 3,
    bathrooms: 2,
    capacity: 6,
    status: 'available',
    baseRate: 1500,
  },
  {
    id: '2',
    nameEn: 'Modern Studio Apartment',
    nameAr: 'شقة استوديو عصرية',
    property: 'Kingdom Tower Residences',
    type: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    capacity: 2,
    status: 'occupied',
    baseRate: 450,
  },
  {
    id: '3',
    nameEn: 'Family Executive Suite',
    nameAr: 'جناح عائلي تنفيذي',
    property: 'Corniche Towers',
    type: 'Suite',
    bedrooms: 2,
    bathrooms: 2,
    capacity: 4,
    status: 'occupied',
    baseRate: 850,
  },
  {
    id: '4',
    nameEn: 'Seaside Luxury Villa',
    nameAr: 'فيلا فاخرة على البحر',
    property: 'Red Sea Villas',
    type: 'Villa',
    bedrooms: 4,
    bathrooms: 3,
    capacity: 8,
    status: 'maintenance',
    baseRate: 2200,
  },
  {
    id: '5',
    nameEn: 'Downtown Business Apartment',
    nameAr: 'شقة أعمال وسط المدينة',
    property: 'Olaya Business District',
    type: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    capacity: 2,
    status: 'available',
    baseRate: 550,
  },
];

const statusColors: Record<string, string> = {
  available: 'bg-success/10 text-success border-success/20',
  occupied: 'bg-info/10 text-info border-info/20',
  maintenance: 'bg-warning/10 text-warning border-warning/20',
  blocked: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function Units() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUnits = units.filter((unit) => {
    const name = language === 'ar' ? unit.nameAr : unit.nameEn;
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.property.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      available: { en: 'Available', ar: 'متاحة' },
      occupied: { en: 'Occupied', ar: 'مشغولة' },
      maintenance: { en: 'Maintenance', ar: 'صيانة' },
      blocked: { en: 'Blocked', ar: 'محجوبة' },
    };
    return language === 'ar' ? labels[status].ar : labels[status].en;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('dashboard.units')}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة الوحدات السكنية'
              : 'Manage your property units'}
          </p>
        </div>
        <Button size="sm" className="gap-2 btn-gold">
          <Plus className="h-4 w-4" />
          {language === 'ar' ? 'إضافة وحدة' : 'Add Unit'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'الإجمالي' : 'Total Units'}
          </p>
          <p className="text-2xl font-bold">{units.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'متاحة' : 'Available'}
          </p>
          <p className="text-2xl font-bold text-success">
            {units.filter(u => u.status === 'available').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'مشغولة' : 'Occupied'}
          </p>
          <p className="text-2xl font-bold text-info">
            {units.filter(u => u.status === 'occupied').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'صيانة' : 'Maintenance'}
          </p>
          <p className="text-2xl font-bold text-warning">
            {units.filter(u => u.status === 'maintenance').length}
          </p>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'ar' ? 'بحث عن وحدة...' : 'Search units...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredUnits.length} {language === 'ar' ? 'وحدة' : 'units'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">
                    {language === 'ar' ? 'الوحدة' : 'Unit'}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {language === 'ar' ? 'العقار' : 'Property'}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {language === 'ar' ? 'النوع' : 'Type'}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {language === 'ar' ? 'التفاصيل' : 'Details'}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {language === 'ar' ? 'السعر/ليلة' : 'Rate/Night'}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {language === 'ar' ? unit.nameAr : unit.nameEn}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {unit.property}
                    </TableCell>
                    <TableCell>{unit.type}</TableCell>
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
                    <TableCell className="font-medium">
                      {unit.baseRate} {t('common.sar')}
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('common.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common.delete')}
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
    </div>
  );
}
