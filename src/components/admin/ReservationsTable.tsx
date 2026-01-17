import { useLanguage } from '@/contexts/LanguageContext';
import { StatusBadge } from './StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal, DoorOpen, DoorClosed, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';

interface Reservation {
  id: string;
  confirmationCode: string;
  guestName: string;
  unitName: string;
  roomName?: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  status: ReservationStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
}

interface ReservationsTableProps {
  reservations: Reservation[];
  onViewDetails?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

export function ReservationsTable({ reservations, onViewDetails, onStatusChange }: ReservationsTableProps) {
  const { t, language } = useLanguage();

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM', { 
        locale: language === 'ar' ? ar : enUS 
      });
    } catch {
      return dateStr;
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {language === 'ar' ? 'لا توجد حجوزات' : 'No reservations found'}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">{language === 'ar' ? 'رمز الحجز' : 'Confirmation'}</TableHead>
            <TableHead className="font-semibold">{language === 'ar' ? 'الضيف' : 'Guest'}</TableHead>
            <TableHead className="font-semibold">{language === 'ar' ? 'الوحدة/الغرفة' : 'Unit/Room'}</TableHead>
            <TableHead className="font-semibold">{language === 'ar' ? 'التواريخ' : 'Dates'}</TableHead>
            <TableHead className="font-semibold text-center">{language === 'ar' ? 'الليالي' : 'Nights'}</TableHead>
            <TableHead className="font-semibold">{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
            <TableHead className="font-semibold">{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
            <TableHead className="font-semibold">{language === 'ar' ? 'الدفع' : 'Payment'}</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id} className="hover:bg-muted/30">
              <TableCell className="font-mono text-sm font-medium text-accent">
                {reservation.confirmationCode}
              </TableCell>
              <TableCell className="font-medium">{reservation.guestName}</TableCell>
              <TableCell className="text-muted-foreground">
                <div>{reservation.unitName}</div>
                {reservation.roomName && (
                  <div className="text-xs text-muted-foreground/70">
                    {language === 'ar' ? 'غرفة' : 'Room'} {reservation.roomName}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                <div className="flex items-center gap-1 text-sm">
                  <span>{formatDate(reservation.checkIn)}</span>
                  <span className="text-muted-foreground/50">→</span>
                  <span>{formatDate(reservation.checkOut)}</span>
                </div>
              </TableCell>
              <TableCell className="text-center font-medium">{reservation.nights}</TableCell>
              <TableCell>
                <StatusBadge status={reservation.status} type="reservation" />
              </TableCell>
              <TableCell className="font-medium">
                {reservation.totalAmount.toLocaleString()} {t('common.sar')}
              </TableCell>
              <TableCell>
                <StatusBadge status={reservation.paymentStatus} type="payment" />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails?.(reservation.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      {t('common.view')}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {reservation.status === 'confirmed' && (
                      <DropdownMenuItem 
                        onClick={() => onStatusChange?.(reservation.id, 'checked_in')}
                        className="text-success"
                      >
                        <DoorOpen className="h-4 w-4 mr-2" />
                        {language === 'ar' ? 'تسجيل الوصول' : 'Check In'}
                      </DropdownMenuItem>
                    )}
                    
                    {reservation.status === 'checked_in' && (
                      <DropdownMenuItem 
                        onClick={() => onStatusChange?.(reservation.id, 'checked_out')}
                        className="text-info"
                      >
                        <DoorClosed className="h-4 w-4 mr-2" />
                        {language === 'ar' ? 'تسجيل المغادرة' : 'Check Out'}
                      </DropdownMenuItem>
                    )}
                    
                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                      <DropdownMenuItem 
                        onClick={() => onStatusChange?.(reservation.id, 'cancelled')}
                        className="text-destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t('common.cancel')}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
