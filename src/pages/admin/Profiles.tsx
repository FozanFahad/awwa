import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  User,
  Building2,
  Plane,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  Star,
  DollarSign,
} from 'lucide-react';

interface Guest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  vipCode: string | null;
  totalStays: number;
  totalRevenue: number;
  lastStay: string;
}

interface Company {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  vatNumber: string;
  creditLimit: number;
  arBalance: number;
  isActive: boolean;
}

interface TravelAgent {
  id: string;
  code: string;
  name: string;
  iataNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  commissionRate: number;
  arBalance: number;
  isActive: boolean;
}

const guests: Guest[] = [
  { id: '1', fullName: 'Mohammed Al-Rashid', email: 'mohammed@email.com', phone: '+966 50 123 4567', nationality: 'SA', vipCode: 'VIP', totalStays: 12, totalRevenue: 45000, lastStay: '2026-01-15' },
  { id: '2', fullName: 'Sara Abdullah', email: 'sara@email.com', phone: '+966 55 987 6543', nationality: 'SA', vipCode: null, totalStays: 3, totalRevenue: 8500, lastStay: '2026-01-10' },
  { id: '3', fullName: 'Ahmed Hassan', email: 'ahmed@company.com', phone: '+966 54 111 2222', nationality: 'EG', vipCode: 'VVIP', totalStays: 25, totalRevenue: 125000, lastStay: '2026-01-17' },
  { id: '4', fullName: 'Fatima Al-Saud', email: 'fatima@royal.sa', phone: '+966 50 999 8888', nationality: 'SA', vipCode: 'ROYAL', totalStays: 8, totalRevenue: 95000, lastStay: '2026-01-12' },
  { id: '5', fullName: 'Khalid Omar', email: 'khalid@business.com', phone: '+966 55 444 3333', nationality: 'AE', vipCode: 'VIP', totalStays: 15, totalRevenue: 62000, lastStay: '2026-01-08' },
];

const companies: Company[] = [
  { id: '1', code: 'ARAMCO', name: 'Saudi Aramco', contactPerson: 'Abdullah M.', email: 'travel@aramco.com', phone: '+966 13 123 4567', city: 'Dhahran', vatNumber: '300012345600003', creditLimit: 500000, arBalance: 45000, isActive: true },
  { id: '2', code: 'STC', name: 'STC', contactPerson: 'Noura A.', email: 'corporate@stc.com.sa', phone: '+966 11 555 1234', city: 'Riyadh', vatNumber: '300098765400001', creditLimit: 250000, arBalance: 12500, isActive: true },
  { id: '3', code: 'SABIC', name: 'SABIC', contactPerson: 'Faisal K.', email: 'booking@sabic.com', phone: '+966 11 225 8000', city: 'Riyadh', vatNumber: '300011112200004', creditLimit: 350000, arBalance: 0, isActive: true },
  { id: '4', code: 'NEOM', name: 'NEOM Company', contactPerson: 'Sarah L.', email: 'travel@neom.com', phone: '+966 14 123 0000', city: 'NEOM', vatNumber: '300055556600002', creditLimit: 1000000, arBalance: 125000, isActive: true },
];

const travelAgents: TravelAgent[] = [
  { id: '1', code: 'ALT', name: 'Al Tayyar Travel', iataNumber: '78-2 1234 5', contactPerson: 'Mohammed S.', email: 'hotels@altayyar.com', phone: '+966 11 461 8888', commissionRate: 12, arBalance: 8500, isActive: true },
  { id: '2', code: 'SAU', name: 'Saudia Holidays', iataNumber: '78-2 5678 9', contactPerson: 'Layla A.', email: 'bookings@saudiaholidays.com', phone: '+966 11 477 7777', commissionRate: 10, arBalance: 0, isActive: true },
  { id: '3', code: 'ELM', name: 'Elma Travel', iataNumber: '78-2 9999 1', contactPerson: 'Ahmed K.', email: 'hotels@elma.sa', phone: '+966 12 666 5555', commissionRate: 15, arBalance: 3200, isActive: true },
];

export default function Profiles() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('guests');
  const [searchQuery, setSearchQuery] = useState('');

  const getVIPBadge = (vipCode: string | null) => {
    if (!vipCode) return null;
    const styles: Record<string, string> = {
      VIP: 'bg-accent/10 text-accent border-accent/20',
      VVIP: 'bg-primary/10 text-primary border-primary/20',
      ROYAL: 'bg-gradient-to-r from-accent to-primary text-white border-0',
    };
    return (
      <Badge variant="outline" className={styles[vipCode] || 'bg-muted'}>
        {vipCode}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'الملفات الشخصية' : 'Profiles'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة ملفات الضيوف والشركات ووكلاء السفر'
              : 'Manage guest, company, and travel agent profiles'}
          </p>
        </div>
        <Button className="btn-gold">
          <Plus className="h-4 w-4 me-2" />
          {language === 'ar' ? 'إضافة ملف جديد' : 'New Profile'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="dashboard-card cursor-pointer" onClick={() => setActiveTab('guests')}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <User className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{guests.length}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'ضيوف' : 'Guests'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card cursor-pointer" onClick={() => setActiveTab('companies')}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Building2 className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{companies.length}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'شركات' : 'Companies'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card cursor-pointer" onClick={() => setActiveTab('agents')}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Plane className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{travelAgents.length}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'وكلاء سفر' : 'Travel Agents'}
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
          placeholder={language === 'ar' ? 'بحث بالاسم أو البريد أو الهاتف...' : 'Search by name, email, or phone...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="guests" className="gap-2">
            <User className="h-4 w-4" />
            {language === 'ar' ? 'الضيوف' : 'Guests'}
          </TabsTrigger>
          <TabsTrigger value="companies" className="gap-2">
            <Building2 className="h-4 w-4" />
            {language === 'ar' ? 'الشركات' : 'Companies'}
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2">
            <Plane className="h-4 w-4" />
            {language === 'ar' ? 'وكلاء السفر' : 'Travel Agents'}
          </TabsTrigger>
        </TabsList>

        {/* Guests Tab */}
        <TabsContent value="guests" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {language === 'ar' ? 'ملفات الضيوف' : 'Guest Profiles'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'التواصل' : 'Contact'}</TableHead>
                      <TableHead className="font-semibold text-center">{language === 'ar' ? 'الجنسية' : 'Nationality'}</TableHead>
                      <TableHead className="font-semibold text-center">{language === 'ar' ? 'VIP' : 'VIP'}</TableHead>
                      <TableHead className="font-semibold text-center">{language === 'ar' ? 'الإقامات' : 'Stays'}</TableHead>
                      <TableHead className="font-semibold text-end">{language === 'ar' ? 'الإيرادات' : 'Revenue'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'آخر إقامة' : 'Last Stay'}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.map((guest) => (
                      <TableRow key={guest.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">{guest.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{guest.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{guest.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{guest.nationality}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {getVIPBadge(guest.vipCode)}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {guest.totalStays}
                        </TableCell>
                        <TableCell className="text-end font-semibold">
                          {guest.totalRevenue.toLocaleString()} SAR
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {guest.lastStay}
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
                                <Eye className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'عرض' : 'View'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'تعديل' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'تعيين VIP' : 'Set VIP'}
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

        {/* Companies Tab */}
        <TabsContent value="companies" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {language === 'ar' ? 'ملفات الشركات' : 'Company Profiles'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold w-20">{language === 'ar' ? 'الكود' : 'Code'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'التواصل' : 'Contact'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'المدينة' : 'City'}</TableHead>
                      <TableHead className="font-semibold text-end">{language === 'ar' ? 'حد الائتمان' : 'Credit Limit'}</TableHead>
                      <TableHead className="font-semibold text-end">{language === 'ar' ? 'الرصيد' : 'AR Balance'}</TableHead>
                      <TableHead className="font-semibold text-center">{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id} className="hover:bg-muted/30">
                        <TableCell>
                          <Badge variant="outline" className="font-mono">{company.code}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{company.contactPerson}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{company.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {company.city}
                          </div>
                        </TableCell>
                        <TableCell className="text-end font-semibold">
                          {company.creditLimit.toLocaleString()} SAR
                        </TableCell>
                        <TableCell className={`text-end font-semibold ${company.arBalance > 0 ? 'text-destructive' : 'text-success'}`}>
                          {company.arBalance.toLocaleString()} SAR
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={company.isActive ? 'bg-success/10 text-success' : 'bg-muted'}>
                            {company.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
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
                                <Eye className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'عرض' : 'View'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'تعديل' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DollarSign className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'كشف الحساب' : 'Statement'}
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

        {/* Travel Agents Tab */}
        <TabsContent value="agents" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {language === 'ar' ? 'ملفات وكلاء السفر' : 'Travel Agent Profiles'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold w-20">{language === 'ar' ? 'الكود' : 'Code'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'رقم IATA' : 'IATA #'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'التواصل' : 'Contact'}</TableHead>
                      <TableHead className="font-semibold text-center">{language === 'ar' ? 'العمولة' : 'Commission'}</TableHead>
                      <TableHead className="font-semibold text-end">{language === 'ar' ? 'الرصيد' : 'AR Balance'}</TableHead>
                      <TableHead className="font-semibold text-center">{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {travelAgents.map((agent) => (
                      <TableRow key={agent.id} className="hover:bg-muted/30">
                        <TableCell>
                          <Badge variant="outline" className="font-mono">{agent.code}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {agent.iataNumber}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{agent.contactPerson}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{agent.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {agent.commissionRate}%
                        </TableCell>
                        <TableCell className={`text-end font-semibold ${agent.arBalance > 0 ? 'text-destructive' : 'text-success'}`}>
                          {agent.arBalance.toLocaleString()} SAR
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={agent.isActive ? 'bg-success/10 text-success' : 'bg-muted'}>
                            {agent.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
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
                                <Eye className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'عرض' : 'View'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'تعديل' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DollarSign className="h-4 w-4 me-2" />
                                {language === 'ar' ? 'كشف الحساب' : 'Statement'}
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
    </div>
  );
}
