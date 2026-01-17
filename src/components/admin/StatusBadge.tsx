import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';

interface StatusBadgeProps {
  status: ReservationStatus | TaskStatus | PaymentStatus;
  type?: 'reservation' | 'task' | 'payment';
}

export function StatusBadge({ status, type = 'reservation' }: StatusBadgeProps) {
  const { t, language } = useLanguage();

  const getStatusConfig = () => {
    const configs: Record<string, { label: string; labelAr: string; className: string }> = {
      // Reservation statuses
      pending: { 
        label: 'Pending', 
        labelAr: 'معلق', 
        className: 'bg-warning/10 text-warning border-warning/20' 
      },
      confirmed: { 
        label: 'Confirmed', 
        labelAr: 'مؤكد', 
        className: 'bg-success/10 text-success border-success/20' 
      },
      checked_in: { 
        label: 'Checked In', 
        labelAr: 'وصل', 
        className: 'bg-info/10 text-info border-info/20' 
      },
      checked_out: { 
        label: 'Checked Out', 
        labelAr: 'غادر', 
        className: 'bg-muted text-muted-foreground border-border' 
      },
      cancelled: { 
        label: 'Cancelled', 
        labelAr: 'ملغي', 
        className: 'bg-destructive/10 text-destructive border-destructive/20' 
      },
      no_show: { 
        label: 'No Show', 
        labelAr: 'لم يحضر', 
        className: 'bg-destructive/10 text-destructive border-destructive/20' 
      },
      // Task statuses
      in_progress: { 
        label: 'In Progress', 
        labelAr: 'قيد التنفيذ', 
        className: 'bg-info/10 text-info border-info/20' 
      },
      completed: { 
        label: 'Completed', 
        labelAr: 'مكتمل', 
        className: 'bg-success/10 text-success border-success/20' 
      },
      // Payment statuses
      partial: { 
        label: 'Partial', 
        labelAr: 'جزئي', 
        className: 'bg-warning/10 text-warning border-warning/20' 
      },
      paid: { 
        label: 'Paid', 
        labelAr: 'مدفوع', 
        className: 'bg-success/10 text-success border-success/20' 
      },
      refunded: { 
        label: 'Refunded', 
        labelAr: 'مسترد', 
        className: 'bg-muted text-muted-foreground border-border' 
      },
      failed: { 
        label: 'Failed', 
        labelAr: 'فشل', 
        className: 'bg-destructive/10 text-destructive border-destructive/20' 
      },
    };

    return configs[status] || configs.pending;
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {language === 'ar' ? config.labelAr : config.label}
    </Badge>
  );
}
