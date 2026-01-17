import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Undo2,
} from 'lucide-react';

interface FolioPosting {
  id: string;
  date: string;
  time: string;
  code: string;
  description: string;
  reference: string | null;
  debit: number;
  credit: number;
  balance: number;
  postedBy: string;
  isReversed: boolean;
}

interface Folio {
  id: string;
  folioNumber: string;
  roomNumber: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  balance: number;
  status: 'open' | 'closed' | 'settled';
}

const folios: Folio[] = [
  { id: '1', folioNumber: 'F-2026-0001', roomNumber: '302', guestName: 'Mohammed Al-Rashid', checkIn: '2026-01-15', checkOut: '2026-01-18', balance: 1250.00, status: 'open' },
  { id: '2', folioNumber: 'F-2026-0002', roomNumber: '405', guestName: 'Sara Abdullah', checkIn: '2026-01-16', checkOut: '2026-01-20', balance: 0, status: 'open' },
  { id: '3', folioNumber: 'F-2026-0003', roomNumber: '201', guestName: 'Khalid Hassan', checkIn: '2026-01-17', checkOut: '2026-01-19', balance: 875.50, status: 'open' },
];

const currentFolioPostings: FolioPosting[] = [
  { id: '1', date: '2026-01-15', time: '14:30', code: 'ROOM', description: 'Room Charge - Deluxe Suite', reference: null, debit: 850.00, credit: 0, balance: 850.00, postedBy: 'System', isReversed: false },
  { id: '2', date: '2026-01-15', time: '14:30', code: 'TAX', description: 'VAT 15%', reference: null, debit: 127.50, credit: 0, balance: 977.50, postedBy: 'System', isReversed: false },
  { id: '3', date: '2026-01-15', time: '19:45', code: 'DNIR', description: 'Dinner - Room Service', reference: 'RS-0042', debit: 185.00, credit: 0, balance: 1162.50, postedBy: 'Ahmed K.', isReversed: false },
  { id: '4', date: '2026-01-16', time: '08:15', code: 'BKFT', description: 'Breakfast - 2 PAX', reference: null, debit: 150.00, credit: 0, balance: 1312.50, postedBy: 'System', isReversed: false },
  { id: '5', date: '2026-01-16', time: '10:30', code: 'LNDY', description: 'Laundry Service', reference: 'LD-0018', debit: 75.00, credit: 0, balance: 1387.50, postedBy: 'Fatima M.', isReversed: false },
  { id: '6', date: '2026-01-16', time: '15:00', code: 'CASH', description: 'Cash Payment', reference: 'REC-0456', debit: 0, credit: 500.00, balance: 887.50, postedBy: 'Sara A.', isReversed: false },
  { id: '7', date: '2026-01-17', time: '14:30', code: 'ROOM', description: 'Room Charge - Deluxe Suite', reference: null, debit: 850.00, credit: 0, balance: 1737.50, postedBy: 'System', isReversed: false },
  { id: '8', date: '2026-01-17', time: '14:30', code: 'TAX', description: 'VAT 15%', reference: null, debit: 127.50, credit: 0, balance: 1865.00, postedBy: 'System', isReversed: false },
  { id: '9', date: '2026-01-17', time: '16:00', code: 'ADJ', description: 'Complimentary Discount', reference: 'MGR-AUTH', debit: 0, credit: 100.00, balance: 1765.00, postedBy: 'Manager', isReversed: false },
  { id: '10', date: '2026-01-17', time: '18:00', code: 'CARD', description: 'Credit Card Payment - Visa', reference: 'TXN-789456', debit: 0, credit: 515.00, balance: 1250.00, postedBy: 'Ahmed K.', isReversed: false },
];

const transactionCodes = [
  { code: 'ROOM', name: 'Room Charge', nameAr: 'رسوم الغرفة', category: 'accommodation' },
  { code: 'BKFT', name: 'Breakfast', nameAr: 'إفطار', category: 'food_beverage' },
  { code: 'LNCH', name: 'Lunch', nameAr: 'غداء', category: 'food_beverage' },
  { code: 'DNIR', name: 'Dinner', nameAr: 'عشاء', category: 'food_beverage' },
  { code: 'MINI', name: 'Minibar', nameAr: 'ميني بار', category: 'food_beverage' },
  { code: 'LNDY', name: 'Laundry', nameAr: 'غسيل', category: 'services' },
  { code: 'PARK', name: 'Parking', nameAr: 'موقف سيارات', category: 'services' },
  { code: 'TEL', name: 'Telephone', nameAr: 'هاتف', category: 'telecom' },
  { code: 'CASH', name: 'Cash Payment', nameAr: 'دفع نقدي', category: 'payment' },
  { code: 'CARD', name: 'Credit Card', nameAr: 'بطاقة ائتمان', category: 'payment' },
  { code: 'CITY', name: 'City Ledger', nameAr: 'تحويل حساب', category: 'payment' },
  { code: 'ADJ', name: 'Adjustment', nameAr: 'تعديل', category: 'adjustment' },
];

export default function Cashier() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolio, setSelectedFolio] = useState<Folio | null>(folios[0]);
  const [isPostingDialogOpen, setIsPostingDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const totalDebits = currentFolioPostings.reduce((sum, p) => sum + p.debit, 0);
  const totalCredits = currentFolioPostings.reduce((sum, p) => sum + p.credit, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'الصندوق' : 'Cashier'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة الفواتير والمدفوعات'
              : 'Manage folios and payments'}
          </p>
        </div>
      </div>

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
                    <span className="font-mono font-semibold text-lg">{folio.roomNumber}</span>
                    <Badge variant="outline" className={folio.balance > 0 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}>
                      {folio.balance.toLocaleString()} SAR
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{folio.guestName}</p>
                  <p className="text-xs text-muted-foreground">{folio.checkIn} - {folio.checkOut}</p>
                </div>
              ))}
            </div>
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
                        <span className="font-mono font-bold text-2xl text-primary">{selectedFolio.roomNumber}</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedFolio.guestName}</h2>
                        <p className="text-sm text-muted-foreground">{selectedFolio.folioNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedFolio.checkIn} → {selectedFolio.checkOut}
                        </p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-sm text-muted-foreground mb-1">
                        {language === 'ar' ? 'الرصيد المستحق' : 'Balance Due'}
                      </p>
                      <p className={`text-3xl font-bold ${selectedFolio.balance > 0 ? 'text-destructive' : 'text-success'}`}>
                        {selectedFolio.balance.toLocaleString()} SAR
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Dialog open={isPostingDialogOpen} onOpenChange={setIsPostingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 me-2" />
                      {language === 'ar' ? 'إضافة رسوم' : 'Post Charge'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{language === 'ar' ? 'إضافة رسوم جديدة' : 'Post New Charge'}</DialogTitle>
                      <DialogDescription>
                        {language === 'ar' ? 'إضافة رسوم إلى فاتورة الضيف' : 'Add a charge to the guest folio'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{language === 'ar' ? 'نوع المعاملة' : 'Transaction Code'}</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'ar' ? 'اختر...' : 'Select...'} />
                          </SelectTrigger>
                          <SelectContent>
                            {transactionCodes.filter(t => t.category !== 'payment').map((tc) => (
                              <SelectItem key={tc.code} value={tc.code}>
                                {tc.code} - {language === 'ar' ? tc.nameAr : tc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{language === 'ar' ? 'المبلغ' : 'Amount'}</label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{language === 'ar' ? 'الوصف' : 'Description'}</label>
                        <Input placeholder={language === 'ar' ? 'تفاصيل إضافية...' : 'Additional details...'} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPostingDialogOpen(false)}>
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </Button>
                      <Button className="btn-gold">
                        {language === 'ar' ? 'إضافة' : 'Post'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-gold">
                      <CreditCard className="h-4 w-4 me-2" />
                      {language === 'ar' ? 'استلام دفعة' : 'Receive Payment'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{language === 'ar' ? 'استلام دفعة' : 'Receive Payment'}</DialogTitle>
                      <DialogDescription>
                        {language === 'ar' ? `الرصيد المستحق: ${selectedFolio.balance.toLocaleString()} ريال` : `Balance Due: ${selectedFolio.balance.toLocaleString()} SAR`}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'ar' ? 'اختر...' : 'Select...'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">
                              <div className="flex items-center gap-2">
                                <Banknote className="h-4 w-4" />
                                {language === 'ar' ? 'نقدي' : 'Cash'}
                              </div>
                            </SelectItem>
                            <SelectItem value="card">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                {language === 'ar' ? 'بطاقة ائتمان' : 'Credit Card'}
                              </div>
                            </SelectItem>
                            <SelectItem value="city">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {language === 'ar' ? 'تحويل على الحساب' : 'City Ledger'}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{language === 'ar' ? 'المبلغ' : 'Amount'}</label>
                        <Input type="number" placeholder={selectedFolio.balance.toString()} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{language === 'ar' ? 'رقم المرجع' : 'Reference'}</label>
                        <Input placeholder={language === 'ar' ? 'رقم الإيصال أو المعاملة...' : 'Receipt or transaction number...'} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </Button>
                      <Button className="btn-gold">
                        {language === 'ar' ? 'استلام' : 'Receive'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline">
                  <ArrowRightLeft className="h-4 w-4 me-2" />
                  {language === 'ar' ? 'تحويل' : 'Transfer'}
                </Button>
                <Button variant="outline">
                  <Printer className="h-4 w-4 me-2" />
                  {language === 'ar' ? 'طباعة' : 'Print'}
                </Button>
                <Button variant="outline">
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
                    <span className="text-sm font-normal text-muted-foreground">
                      {currentFolioPostings.length} {language === 'ar' ? 'حركة' : 'entries'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold w-24">{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                          <TableHead className="font-semibold w-16">{language === 'ar' ? 'الوقت' : 'Time'}</TableHead>
                          <TableHead className="font-semibold w-20">{language === 'ar' ? 'الكود' : 'Code'}</TableHead>
                          <TableHead className="font-semibold">{language === 'ar' ? 'الوصف' : 'Description'}</TableHead>
                          <TableHead className="font-semibold text-end w-28">{language === 'ar' ? 'مدين' : 'Debit'}</TableHead>
                          <TableHead className="font-semibold text-end w-28">{language === 'ar' ? 'دائن' : 'Credit'}</TableHead>
                          <TableHead className="font-semibold text-end w-28">{language === 'ar' ? 'الرصيد' : 'Balance'}</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentFolioPostings.map((posting) => (
                          <TableRow key={posting.id} className={`hover:bg-muted/30 ${posting.isReversed ? 'opacity-50 line-through' : ''}`}>
                            <TableCell className="text-muted-foreground">{posting.date}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{posting.time}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-xs">
                                {posting.code}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <span>{posting.description}</span>
                                {posting.reference && (
                                  <span className="text-xs text-muted-foreground ms-2">({posting.reference})</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-end font-mono">
                              {posting.debit > 0 ? posting.debit.toFixed(2) : '-'}
                            </TableCell>
                            <TableCell className="text-end font-mono text-success">
                              {posting.credit > 0 ? `(${posting.credit.toFixed(2)})` : '-'}
                            </TableCell>
                            <TableCell className="text-end font-mono font-semibold">
                              {posting.balance.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {!posting.isReversed && posting.code !== 'ROOM' && posting.code !== 'TAX' && (
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Undo2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Totals */}
                  <div className="mt-4 flex justify-end">
                    <div className="w-80 space-y-2">
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{language === 'ar' ? 'إجمالي المدين' : 'Total Debits'}</span>
                        <span className="font-mono">{totalDebits.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{language === 'ar' ? 'إجمالي الدائن' : 'Total Credits'}</span>
                        <span className="font-mono text-success">({totalCredits.toFixed(2)})</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>{language === 'ar' ? 'الرصيد' : 'Balance'}</span>
                        <span className={`font-mono ${selectedFolio.balance > 0 ? 'text-destructive' : 'text-success'}`}>
                          {selectedFolio.balance.toFixed(2)} SAR
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>{language === 'ar' ? 'اختر فاتورة للعرض' : 'Select a folio to view'}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
