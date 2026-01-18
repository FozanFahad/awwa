import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Reservation {
  id: string;
  unitId: string;
  unitName: string;
  start: string;
  end: string;
  guest: string;
}

interface Unit {
  id: string;
  name: string;
  nameAr: string;
}

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
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const fetchData = async () => {
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      // Fetch units
      const { data: unitsData } = await supabase
        .from('units')
        .select('id, name_en, name_ar')
        .order('name_en');

      // Fetch reservations for the current month
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select(`
          id,
          unit_id,
          start_date,
          end_date,
          units (name_en, name_ar),
          guests (full_name)
        `)
        .gte('end_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('start_date', format(monthEnd, 'yyyy-MM-dd'))
        .not('status', 'eq', 'cancelled');

      const formattedUnits: Unit[] = (unitsData || []).map((u: any) => ({
        id: u.id,
        name: u.name_en,
        nameAr: u.name_ar,
      }));

      const formattedReservations: Reservation[] = (reservationsData || []).map((r: any) => ({
        id: r.id,
        unitId: r.unit_id,
        unitName: language === 'ar' ? r.units?.name_ar : r.units?.name_en || '-',
        start: r.start_date,
        end: r.end_date,
        guest: r.guests?.full_name || '-',
      }));

      setUnits(formattedUnits);
      setReservations(formattedReservations);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStartDate = startOfMonth(currentMonth);
  const monthEndDate = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStartDate, end: monthEndDate });

  const getReservationsForUnitAndDay = (unitId: string, day: Date) => {
    return reservations.filter(res => {
      if (res.unitId !== unitId) return false;
      const start = new Date(res.start);
      const end = new Date(res.end);
      return day >= start && day < end;
    });
  };

  const isStartDate = (res: Reservation, day: Date) => {
    return isSameDay(new Date(res.start), day);
  };

  const isEndDate = (res: Reservation, day: Date) => {
    const end = new Date(res.end);
    end.setDate(end.getDate() - 1);
    return isSameDay(end, day);
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayArrivals = reservations.filter(r => r.start === todayStr);
  const todayDepartures = reservations.filter(r => r.end === todayStr);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
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
        
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'ar' ? 'لا توجد وحدات' : 'No Units Found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === 'ar' 
                  ? 'أضف وحدات لعرض التقويم'
                  : 'Add units to view the calendar'}
              </p>
              <Link to="/admin/units">
                <Button className="btn-gold">
                  {language === 'ar' ? 'إضافة وحدة' : 'Add Unit'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {language === 'ar' ? 'الوحدات:' : 'Units:'}
            </span>
            {units.slice(0, 5).map((unit, index) => (
              <div key={unit.id} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded", colors[index % colors.length])} />
                <span className="text-sm">
                  {(language === 'ar' ? unit.nameAr : unit.name).slice(0, 15)}...
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
              {todayArrivals.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {language === 'ar' ? 'لا يوجد وصول اليوم' : 'No arrivals today'}
                </p>
              ) : (
                todayArrivals.map(res => (
                  <div key={res.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{res.guest}</p>
                      <p className="text-sm text-muted-foreground">{res.unitName}</p>
                    </div>
                    <Badge className="bg-success/10 text-success">
                      {language === 'ar' ? 'وصول' : 'Arriving'}
                    </Badge>
                  </div>
                ))
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
              {todayDepartures.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {language === 'ar' ? 'لا يوجد مغادرة اليوم' : 'No departures today'}
                </p>
              ) : (
                todayDepartures.map(res => (
                  <div key={res.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{res.guest}</p>
                      <p className="text-sm text-muted-foreground">{res.unitName}</p>
                    </div>
                    <Badge className="bg-info/10 text-info">
                      {language === 'ar' ? 'مغادرة' : 'Departing'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
