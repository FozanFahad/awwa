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
import { Eye, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Reservation {
  id: string;
  confirmationCode: string;
  guestName: string;
  unitName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
}

interface ReservationsTableProps {
  reservations: Reservation[];
  onViewDetails?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

export function ReservationsTable({ reservations, onViewDetails, onStatusChange }: ReservationsTableProps) {
  const { t, language } = useLanguage();

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">{language === 'ar' ? 'رمز الحجز' : 'Confirmation'}</TableHead>
            <TableHead className="font-semibold">{language === 'ar' ? 'الضيف' : 'Guest'}</TableHead>
            <TableHead className="font-semibold">{language === 'ar' ? 'الوحدة' : 'Unit'}</TableHead>
            <TableHead className="font-semibold">{language === 'ar' ? 'الوصول' : 'Check-in'}</TableHead>
            <TableHead className="font-semibold">{language === 'ar' ? 'المغادرة' : 'Check-out'}</TableHead>
            <TableHead className="font-semibold">{language === 'ar' ? 'الليالي' : 'Nights'}</TableHead>
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
              <TableCell className="text-muted-foreground">{reservation.unitName}</TableCell>
              <TableCell className="text-muted-foreground">{reservation.checkIn}</TableCell>
              <TableCell className="text-muted-foreground">{reservation.checkOut}</TableCell>
              <TableCell className="text-center">{reservation.nights}</TableCell>
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
                    {reservation.status === 'confirmed' && (
                      <DropdownMenuItem onClick={() => onStatusChange?.(reservation.id, 'checked_in')}>
                        {language === 'ar' ? 'تسجيل الوصول' : 'Check In'}
                      </DropdownMenuItem>
                    )}
                    {reservation.status === 'checked_in' && (
                      <DropdownMenuItem onClick={() => onStatusChange?.(reservation.id, 'checked_out')}>
                        {language === 'ar' ? 'تسجيل المغادرة' : 'Check Out'}
                      </DropdownMenuItem>
                    )}
                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                      <DropdownMenuItem 
                        onClick={() => onStatusChange?.(reservation.id, 'cancelled')}
                        className="text-destructive"
                      >
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
