import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

// Mock reservation data for calendar
const reservations = [
  { id: '1', unitId: '1', unitName: 'Luxury Penthouse', start: '2026-01-18', end: '2026-01-21', guest: 'Mohammed' },
  { id: '2', unitId: '2', unitName: 'Modern Studio', start: '2026-01-17', end: '2026-01-19', guest: 'Sara' },
  { id: '3', unitId: '3', unitName: 'Family Suite', start: '2026-01-20', end: '2026-01-25', guest: 'Khalid' },
  { id: '4', unitId: '1', unitName: 'Luxury Penthouse', start: '2026-01-25', end: '2026-01-28', guest: 'Ahmed' },
];

const units = [
  { id: '1', name: 'Luxury Penthouse Suite', nameAr: 'جناح بنتهاوس فاخر' },
  { id: '2', name: 'Modern Studio Apartment', nameAr: 'شقة استوديو عصرية' },
  { id: '3', name: 'Family Executive Suite', nameAr: 'جناح عائلي تنفيذي' },
  { id: '4', name: 'Seaside Luxury Villa', nameAr: 'فيلا فاخرة على البحر' },
  { id: '5', name: 'Downtown Business Apt', nameAr: 'شقة أعمال وسط المدينة' },
];

const colors = [
  'bg-accent',
  'bg-info',
  'bg-success',
  'bg-warning',
  'bg-destructive',
];

export default function CalendarPage() {
  const { language, isRTL } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getReservationsForUnitAndDay = (unitId: string, day: Date) => {
    return reservations.filter(res => {
      if (res.unitId !== unitId) return false;
      const start = new Date(res.start);
      const end = new Date(res.end);
      return day >= start && day < end;
    });
  };

  const isStartDate = (res: typeof reservations[0], day: Date) => {
    return isSameDay(new Date(res.start), day);
  };

  const isEndDate = (res: typeof reservations[0], day: Date) => {
    const end = new Date(res.end);
    end.setDate(end.getDate() - 1);
    return isSameDay(end, day);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'التقويم' : 'Calendar'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'عرض الحجوزات والتوفر حسب الوحدة'
              : 'View reservations and availability by unit'}
          </p>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <h2 className="text-lg font-semibold min-w-[180px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {language === 'ar' ? 'الحجوزات:' : 'Reservations:'}
            </span>
            {units.slice(0, 5).map((unit, index) => (
              <div key={unit.id} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded", colors[index])} />
                <span className="text-sm">
                  {language === 'ar' ? unit.nameAr.slice(0, 15) : unit.name.slice(0, 15)}...
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Day Headers */}
            <div className="grid grid-cols-[200px_repeat(31,minmax(30px,1fr))] border-b border-border">
              <div className="p-3 font-semibold bg-muted/50 border-r border-border">
                {language === 'ar' ? 'الوحدة' : 'Unit'}
              </div>
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-2 text-center text-sm font-medium border-r border-border last:border-r-0",
                    isToday(day) && "bg-accent/20",
                    !isSameMonth(day, currentMonth) && "text-muted-foreground"
                  )}
                >
                  <div>{format(day, 'd')}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(day, 'EEE')}
                  </div>
                </div>
              ))}
            </div>

            {/* Unit Rows */}
            {units.map((unit, unitIndex) => (
              <div
                key={unit.id}
                className="grid grid-cols-[200px_repeat(31,minmax(30px,1fr))] border-b border-border last:border-b-0"
              >
                <div className="p-3 font-medium bg-muted/30 border-r border-border truncate">
                  {language === 'ar' ? unit.nameAr : unit.name}
                </div>
                {days.map((day) => {
                  const dayReservations = getReservationsForUnitAndDay(unit.id, day);
                  const hasReservation = dayReservations.length > 0;
                  const reservation = dayReservations[0];

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "relative h-12 border-r border-border last:border-r-0",
                        isToday(day) && "bg-accent/10"
                      )}
                    >
                      {hasReservation && reservation && (
                        <div
                          className={cn(
                            "absolute inset-y-1 flex items-center justify-center text-xs text-white font-medium",
                            colors[unitIndex % colors.length],
                            isStartDate(reservation, day) ? "left-0 rounded-l" : "left-0",
                            isEndDate(reservation, day) ? "right-0 rounded-r" : "right-0",
                            !isStartDate(reservation, day) && !isEndDate(reservation, day) && "inset-x-0"
                          )}
                        >
                          {isStartDate(reservation, day) && (
                            <span className="truncate px-1">{reservation.guest}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'ar' ? 'وصول اليوم' : 'Today\'s Arrivals'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservations
                .filter(r => r.start === format(new Date(), 'yyyy-MM-dd'))
                .map(res => (
                  <div key={res.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{res.guest}</p>
                      <p className="text-sm text-muted-foreground">{res.unitName}</p>
                    </div>
                    <Badge className="bg-success/10 text-success">
                      {language === 'ar' ? 'وصول' : 'Arriving'}
                    </Badge>
                  </div>
                ))}
              {reservations.filter(r => r.start === format(new Date(), 'yyyy-MM-dd')).length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  {language === 'ar' ? 'لا يوجد وصول اليوم' : 'No arrivals today'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'ar' ? 'مغادرة اليوم' : 'Today\'s Departures'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservations
                .filter(r => r.end === format(new Date(), 'yyyy-MM-dd'))
                .map(res => (
                  <div key={res.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{res.guest}</p>
                      <p className="text-sm text-muted-foreground">{res.unitName}</p>
                    </div>
                    <Badge className="bg-info/10 text-info">
                      {language === 'ar' ? 'مغادرة' : 'Departing'}
                    </Badge>
                  </div>
                ))}
              {reservations.filter(r => r.end === format(new Date(), 'yyyy-MM-dd')).length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  {language === 'ar' ? 'لا يوجد مغادرة اليوم' : 'No departures today'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
