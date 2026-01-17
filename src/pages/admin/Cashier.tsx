import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { TaxInvoiceDialog } from '@/components/admin/TaxInvoiceDialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  CreditCard,
  Plus,
  Printer,
  Search,
  Receipt,
  Banknote,
  Building2,
  ArrowRightLeft,
  FileText,
  DollarSign,
  RefreshCw,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { toast } from 'sonner';

interface Folio {
  id: string;
  folio_number: string;
  folio_type: string;
  status: string;
  balance: number;
  reservation: {
    id: string;
    confirmation_code: string;
    start_date: string;
    end_date: string;
    guest: {
      full_name: string;
    } | null;
    unit: {
      name_en: string;
      name_ar: string;
    } | null;
    room: {
      room_number: string;
    } | null;
  } | null;
}

interface Invoice {
  id: string;
  invoice_no: string;
  issued_at: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_at: string | null;
  reservation: {
    confirmation_code: string;
    guest: {
      full_name: string;
    } | null;
  } | null;
}

interface FolioPosting {
  id: string;
  posting_date: string;
  created_at: string;
  description: string;
  amount: number;
  tax_amount: number;
  posting_type: string;
  reference: string | null;
  is_reversed: boolean;
}

interface Reservation {
  id: string;
  confirmation_code: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  guest: {
    full_name: string;
  } | null;
  unit: {
    name_en: string;
    name_ar: string;
  } | null;
}

export default function Cashier() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('folios');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Folios state
  const [folios, setFolios] = useState<Folio[]>([]);
  const [selectedFolio, setSelectedFolio] = useState<Folio | null>(null);
  const [folioPostings, setFolioPostings] = useState<FolioPosting[]>([]);
  const [loadingPostings, setLoadingPostings] = useState(false);
  
  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  
  // Reservations state (for creating invoices)
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  
  // Dialogs
  const [isPostingDialogOpen, setIsPostingDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    fetchFolios();
    fetchInvoices();
    fetchReservations();
  }, []);

  useEffect(() => {
    if (selectedFolio) {
      fetchFolioPostings(selectedFolio.id);
    }
  }, [selectedFolio]);

  const fetchFolios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('folios')
        .select(`
          id,
          folio_number,
          folio_type,
          status,
          balance,
          reservation:reservations(
            id,
            confirmation_code,
            start_date,
            end_date,
            guest:guests(full_name),
            unit:units(name_en, name_ar),
            room:rooms(room_number)
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolios(data || []);
      if (data && data.length > 0 && !selectedFolio) {
        setSelectedFolio(data[0]);
      }
    } catch (error) {
      console.error('Error fetching folios:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolioPostings = async (folioId: string) => {
    try {
      setLoadingPostings(true);
      const { data, error } = await supabase
        .from('folio_postings')
        .select('*')
        .eq('folio_id', folioId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFolioPostings(data || []);
    } catch (error) {
      console.error('Error fetching folio postings:', error);
    } finally {
      setLoadingPostings(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_no,
          issued_at,
          subtotal,
          tax_amount,
          total_amount,
          paid_at,
          reservation:reservations(
            confirmation_code,
            guest:guests(full_name)
          )
        `)
        .order('issued_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoadingReservations(true);
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          confirmation_code,
          start_date,
          end_date,
          total_amount,
          status,
          guest:guests(full_name),
          unit:units(name_en, name_ar)
        `)
        .in('status', ['confirmed', 'checked_in', 'checked_out'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleGenerateInvoice = (reservationId: string) => {
    setSelectedReservationId(reservationId);
    setSelectedInvoiceId(null);
    setInvoiceDialogOpen(true);
  };

  const handleViewInvoice = (invoiceId: string, reservationId: string) => {
    setSelectedInvoiceId(invoiceId);
    setSelectedReservationId(reservationId);
    setInvoiceDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMM yyyy', { 
      locale: language === 'ar' ? ar : enUS 
    });
  };

  const totalDebits = folioPostings
    .filter(p => p.posting_type === 'charge' || p.posting_type === 'adjustment')
    .reduce((sum, p) => sum + Number(p.amount) + Number(p.tax_amount || 0), 0);
  
  const totalCredits = folioPostings
    .filter(p => p.posting_type === 'payment' || p.posting_type === 'refund')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'الصندوق والفوترة' : 'Cashier & Billing'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة الفواتير والمدفوعات والفواتير الضريبية'
              : 'Manage folios, payments and tax invoices'}
          </p>
        </div>
        <Button onClick={() => { fetchFolios(); fetchInvoices(); }} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 me-2" />
          {language === 'ar' ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="folios" className="gap-2">
            <Receipt className="h-4 w-4" />
            {language === 'ar' ? 'الفواتير المفتوحة' : 'Open Folios'}
          </TabsTrigger>
          <TabsTrigger value="reservations" className="gap-2">
            <Building2 className="h-4 w-4" />
            {language === 'ar' ? 'الحجوزات' : 'Reservations'}
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4" />
            {language === 'ar' ? 'الفواتير الضريبية' : 'Tax Invoices'}
          </TabsTrigger>
        </TabsList>

        {/* Folios Tab */}
        <TabsContent value="folios" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Folio List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-accent" />
                  {language === 'ar' ? 'الفواتير المفتوحة' : 'Open Folios'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-10"
                  />
                </div>
                
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : folios.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {language === 'ar' ? 'لا توجد فواتير مفتوحة' : 'No open folios'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {folios.map((folio) => (
                      <div
                        key={folio.id}
                        onClick={() => setSelectedFolio(folio)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedFolio?.id === folio.id 
                            ? 'border-accent bg-accent/5' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-semibold text-lg">
                            {folio.reservation?.room?.room_number || folio.folio_number.slice(-4)}
                          </span>
                          <Badge variant="outline" className={Number(folio.balance) > 0 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}>
                            {Number(folio.balance).toLocaleString()} SAR
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{folio.reservation?.guest?.full_name || '-'}</p>
                        <p className="text-xs text-muted-foreground">
                          {folio.reservation?.start_date} - {folio.reservation?.end_date}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Folio Details */}
            <div className="lg:col-span-3 space-y-6">
              {selectedFolio ? (
                <>
                  {/* Folio Header */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="font-mono font-bold text-2xl text-primary">
                              {selectedFolio.reservation?.room?.room_number || '#'}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">{selectedFolio.reservation?.guest?.full_name}</h2>
                            <p className="text-sm text-muted-foreground">{selectedFolio.folio_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedFolio.reservation?.start_date} → {selectedFolio.reservation?.end_date}
                            </p>
                          </div>
                        </div>
                        <div className="text-end">
                          <p className="text-sm text-muted-foreground mb-1">
                            {language === 'ar' ? 'الرصيد المستحق' : 'Balance Due'}
                          </p>
                          <p className={`text-3xl font-bold ${Number(selectedFolio.balance) > 0 ? 'text-destructive' : 'text-success'}`}>
                            {Number(selectedFolio.balance).toLocaleString()} SAR
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => setIsPostingDialogOpen(true)}>
                      <Plus className="h-4 w-4 me-2" />
                      {language === 'ar' ? 'إضافة رسوم' : 'Post Charge'}
                    </Button>
                    <Button className="btn-gold" onClick={() => setIsPaymentDialogOpen(true)}>
                      <CreditCard className="h-4 w-4 me-2" />
                      {language === 'ar' ? 'استلام دفعة' : 'Receive Payment'}
                    </Button>
                    <Button variant="outline">
                      <Printer className="h-4 w-4 me-2" />
                      {language === 'ar' ? 'طباعة' : 'Print'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => selectedFolio.reservation?.id && handleGenerateInvoice(selectedFolio.reservation.id)}
                      disabled={!selectedFolio.reservation?.id}
                    >
                      <FileText className="h-4 w-4 me-2" />
                      {language === 'ar' ? 'فاتورة ضريبية' : 'Tax Invoice'}
                    </Button>
                    <Button variant="outline" className="text-success border-success/50 hover:bg-success/10">
                      <CheckCircle className="h-4 w-4 me-2" />
                      {language === 'ar' ? 'تسوية وإغلاق' : 'Settle & Close'}
                    </Button>
                  </div>

                  {/* Transactions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-accent" />
                          {language === 'ar' ? 'حركات الفاتورة' : 'Folio Transactions'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingPostings ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-10 w-full" />
                          ))}
                        </div>
                      ) : folioPostings.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          {language === 'ar' ? 'لا توجد حركات' : 'No transactions'}
                        </p>
                      ) : (
                        <>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                                <TableHead>{language === 'ar' ? 'الوصف' : 'Description'}</TableHead>
                                <TableHead className="text-end">{language === 'ar' ? 'مدين' : 'Debit'}</TableHead>
                                <TableHead className="text-end">{language === 'ar' ? 'دائن' : 'Credit'}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {folioPostings.map((posting) => (
                                <TableRow key={posting.id} className={posting.is_reversed ? 'opacity-50 line-through' : ''}>
                                  <TableCell className="text-muted-foreground">
                                    {formatDate(posting.posting_date)}
                                  </TableCell>
                                  <TableCell>{posting.description}</TableCell>
                                  <TableCell className="text-end text-destructive">
                                    {(posting.posting_type === 'charge' || posting.posting_type === 'adjustment')
                                      ? (Number(posting.amount) + Number(posting.tax_amount || 0)).toLocaleString()
                                      : '-'}
                                  </TableCell>
                                  <TableCell className="text-end text-success">
                                    {(posting.posting_type === 'payment' || posting.posting_type === 'refund')
                                      ? Number(posting.amount).toLocaleString()
                                      : '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <Separator className="my-4" />
                          <div className="flex justify-end gap-8">
                            <div>
                              <span className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي المدين' : 'Total Debits'}: </span>
                              <span className="font-bold text-destructive">{totalDebits.toLocaleString()} SAR</span>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي الدائن' : 'Total Credits'}: </span>
                              <span className="font-bold text-success">{totalCredits.toLocaleString()} SAR</span>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'اختر فاتورة من القائمة' : 'Select a folio from the list'}
                  </p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Reservations Tab - For creating invoices */}
        <TabsContent value="reservations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-accent" />
                  {language === 'ar' ? 'إنشاء فاتورة ضريبية من حجز' : 'Create Tax Invoice from Reservation'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingReservations ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : reservations.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  {language === 'ar' ? 'لا توجد حجوزات' : 'No reservations found'}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ar' ? 'رقم الحجز' : 'Booking Ref'}</TableHead>
                      <TableHead>{language === 'ar' ? 'العميل' : 'Guest'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الوحدة' : 'Unit'}</TableHead>
                      <TableHead>{language === 'ar' ? 'التواريخ' : 'Dates'}</TableHead>
                      <TableHead className="text-end">{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                      <TableHead className="text-center">{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-mono font-medium">{reservation.confirmation_code}</TableCell>
                        <TableCell>{reservation.guest?.full_name || '-'}</TableCell>
                        <TableCell>
                          {language === 'ar' ? reservation.unit?.name_ar : reservation.unit?.name_en}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(reservation.start_date)} - {formatDate(reservation.end_date)}
                        </TableCell>
                        <TableCell className="text-end font-medium">
                          {Number(reservation.total_amount).toLocaleString()} SAR
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={reservation.status === 'checked_out' ? 'default' : 'secondary'}>
                            {reservation.status === 'confirmed' && (language === 'ar' ? 'مؤكد' : 'Confirmed')}
                            {reservation.status === 'checked_in' && (language === 'ar' ? 'مسجل' : 'Checked In')}
                            {reservation.status === 'checked_out' && (language === 'ar' ? 'مغادر' : 'Checked Out')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm"
                            onClick={() => handleGenerateInvoice(reservation.id)}
                          >
                            <FileText className="h-4 w-4 me-2" />
                            {language === 'ar' ? 'إنشاء فاتورة' : 'Create Invoice'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Invoices Tab */}
        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                {language === 'ar' ? 'الفواتير الضريبية' : 'Tax Invoices'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  {language === 'ar' ? 'لا توجد فواتير ضريبية' : 'No tax invoices yet'}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ar' ? 'رقم الفاتورة' : 'Invoice No.'}</TableHead>
                      <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                      <TableHead>{language === 'ar' ? 'العميل' : 'Customer'}</TableHead>
                      <TableHead>{language === 'ar' ? 'رقم الحجز' : 'Booking'}</TableHead>
                      <TableHead className="text-end">{language === 'ar' ? 'المجموع' : 'Subtotal'}</TableHead>
                      <TableHead className="text-end">{language === 'ar' ? 'الضريبة' : 'VAT'}</TableHead>
                      <TableHead className="text-end">{language === 'ar' ? 'الإجمالي' : 'Total'}</TableHead>
                      <TableHead className="text-center">{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono font-medium">{invoice.invoice_no}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(invoice.issued_at)}</TableCell>
                        <TableCell>{invoice.reservation?.guest?.full_name || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">{invoice.reservation?.confirmation_code}</TableCell>
                        <TableCell className="text-end">{Number(invoice.subtotal).toLocaleString()} SAR</TableCell>
                        <TableCell className="text-end">{Number(invoice.tax_amount).toLocaleString()} SAR</TableCell>
                        <TableCell className="text-end font-bold">{Number(invoice.total_amount).toLocaleString()} SAR</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={invoice.paid_at ? 'default' : 'secondary'}>
                            {invoice.paid_at 
                              ? (language === 'ar' ? 'مدفوعة' : 'Paid')
                              : (language === 'ar' ? 'غير مدفوعة' : 'Unpaid')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewInvoice(invoice.id, invoice.reservation?.confirmation_code || '')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tax Invoice Dialog */}
      <TaxInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={(open) => {
          setInvoiceDialogOpen(open);
          if (!open) {
            fetchInvoices();
          }
        }}
        reservationId={selectedReservationId}
        existingInvoiceId={selectedInvoiceId}
      />
    </div>
  );
}
