import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Link, Navigate } from 'react-router-dom';

interface Reservation {
  id: string;
  confirmation_code: string;
  start_date: string;
  end_date: string;
  nights: number;
  adults: number;
  children: number;
  status: string;
  total_amount: number;
  payment_status: string;
  unit: {
    id: string;
    name_en: string;
    name_ar: string;
    property: {
      name_en: string;
      name_ar: string;
      city: string;
    };
  } | null;
}

export default function Bookings() {
  const { t, language, isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const fetchReservations = async () => {
    try {
      // First get guest record for current user
      const { data: guest } = await supabase
        .from('guests')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!guest) {
        setReservations([]);
        setLoading(false);
        return;
      }

      // Then get reservations for this guest
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          confirmation_code,
          start_date,
          end_date,
          nights,
          adults,
          children,
          status,
          total_amount,
          payment_status,
          unit:units(
            id,
            name_en,
            name_ar,
            property:properties(
              name_en,
              name_ar,
              city
            )
          )
        `)
        .eq('guest_id', guest.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: language === 'ar' ? 'قيد الانتظار' : 'Pending' },
      confirmed: { variant: 'default', label: language === 'ar' ? 'مؤكد' : 'Confirmed' },
      checked_in: { variant: 'default', label: language === 'ar' ? 'مسجل دخول' : 'Checked In' },
      checked_out: { variant: 'outline', label: language === 'ar' ? 'مغادر' : 'Checked Out' },
      cancelled: { variant: 'destructive', label: language === 'ar' ? 'ملغي' : 'Cancelled' },
      no_show: { variant: 'destructive', label: language === 'ar' ? 'لم يحضر' : 'No Show' },
    };

    const config = statusConfig[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMM yyyy', { 
      locale: language === 'ar' ? ar : enUS 
    });
  };

  if (authLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">
        {language === 'ar' ? 'حجوزاتي' : 'My Bookings'}
      </h1>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {language === 'ar' ? 'لا توجد حجوزات' : 'No bookings yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'ar' 
                ? 'ابدأ بالبحث عن وحدتك المثالية'
                : 'Start by searching for your perfect unit'}
            </p>
            <Link to="/search">
              <Button>
                {language === 'ar' ? 'ابحث الآن' : 'Search Now'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {reservation.confirmation_code}
                    </CardTitle>
                    {getStatusBadge(reservation.status)}
                  </div>
                  <Badge variant="outline">
                    {reservation.payment_status === 'paid' 
                      ? (language === 'ar' ? 'مدفوع' : 'Paid')
                      : reservation.payment_status === 'partial'
                      ? (language === 'ar' ? 'مدفوع جزئياً' : 'Partial')
                      : (language === 'ar' ? 'غير مدفوع' : 'Unpaid')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {reservation.unit && (
                      <>
                        <div className="flex items-center gap-2 text-foreground">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {language === 'ar' 
                              ? reservation.unit.name_ar 
                              : reservation.unit.name_en}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground ps-6">
                          {language === 'ar'
                            ? reservation.unit.property?.name_ar
                            : reservation.unit.property?.name_en}
                          {reservation.unit.property?.city && ` - ${reservation.unit.property.city}`}
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2 text-foreground">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatDate(reservation.start_date)} → {formatDate(reservation.end_date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {reservation.nights} {language === 'ar' ? 'ليالي' : 'nights'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-foreground">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {reservation.adults} {language === 'ar' ? 'بالغين' : 'adults'}
                        {reservation.children > 0 && (
                          <>, {reservation.children} {language === 'ar' ? 'أطفال' : 'children'}</>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    <div className="text-end">
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}
                      </p>
                      <p className="text-2xl font-bold">
                        {reservation.total_amount.toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}
                      </p>
                    </div>

                    {reservation.unit && (
                      <Link to={`/unit/${reservation.unit.id}`}>
                        <Button variant="outline" size="sm">
                          {language === 'ar' ? 'عرض الوحدة' : 'View Unit'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
