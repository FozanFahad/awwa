import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import {
  CalendarIcon,
  User,
  Building2,
  CreditCard,
  Check,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Users,
  BedDouble,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  isWalkIn?: boolean;
}

interface Guest {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  nationality: string | null;
  id_type: string | null;
  id_number: string | null;
}

interface RoomType {
  id: string;
  code: string;
  name_en: string;
  name_ar: string;
  base_occupancy: number;
  max_occupancy: number;
  bedrooms: number;
  bathrooms: number;
  size_m2: number | null;
}

interface Room {
  id: string;
  room_number: string;
  floor: number | null;
  room_status: string;
  fo_status: string;
  room_type_id: string;
  room_type?: RoomType;
}

interface Unit {
  id: string;
  name_en: string;
  name_ar: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
}

interface RatePlan {
  id: string;
  name_en: string;
  name_ar: string;
  base_rate: number;
  currency: string;
}

type Step = 'dates' | 'room' | 'guest' | 'summary';

export function CreateReservationDialog({
  open,
  onOpenChange,
  onSuccess,
  isWalkIn = false,
}: CreateReservationDialogProps) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>('dates');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data states
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [properties, setProperties] = useState<{ id: string; name_en: string; name_ar: string }[]>([]);

  // Form states
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<string>('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isNewGuest, setIsNewGuest] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [eta, setEta] = useState('');
  const [vipCode, setVipCode] = useState('');

  // New guest form
  const [newGuest, setNewGuest] = useState({
    full_name: '',
    email: '',
    phone: '',
    nationality: 'SA',
    id_type: 'national_id',
    id_number: '',
  });

  const nights = checkInDate && checkOutDate ? differenceInDays(checkOutDate, checkInDate) : 0;

  const steps: { key: Step; label: { en: string; ar: string } }[] = [
    { key: 'dates', label: { en: 'Dates', ar: 'التواريخ' } },
    { key: 'room', label: { en: 'Room', ar: 'الغرفة' } },
    { key: 'guest', label: { en: 'Guest', ar: 'الضيف' } },
    { key: 'summary', label: { en: 'Summary', ar: 'الملخص' } },
  ];

  // Fetch initial data
  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);

  // Fetch rooms when room type changes
  useEffect(() => {
    if (selectedRoomTypeId && selectedPropertyId) {
      fetchAvailableRooms();
    }
  }, [selectedRoomTypeId, selectedPropertyId]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [propertiesRes, roomTypesRes, unitsRes, ratePlansRes] = await Promise.all([
        supabase.from('properties').select('id, name_en, name_ar'),
        supabase.from('room_types').select('*').eq('is_active', true),
        supabase.from('units').select('*').eq('status', 'available'),
        supabase.from('rate_plans').select('*').eq('is_active', true),
      ]);

      if (propertiesRes.data) {
        setProperties(propertiesRes.data);
        if (propertiesRes.data.length === 1) {
          setSelectedPropertyId(propertiesRes.data[0].id);
        }
      }
      if (roomTypesRes.data) setRoomTypes(roomTypesRes.data);
      if (unitsRes.data) setUnits(unitsRes.data);
      if (ratePlansRes.data) setRatePlans(ratePlansRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*, room_types(*)')
        .eq('room_type_id', selectedRoomTypeId)
        .eq('property_id', selectedPropertyId)
        .eq('is_active', true)
        .in('fo_status', ['vacant']);

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const searchGuests = async (query: string) => {
    if (query.length < 2) {
      setGuests([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error('Error searching guests:', error);
    }
  };

  const handleGuestSearch = (query: string) => {
    setGuestSearchQuery(query);
    searchGuests(query);
  };

  const calculateTotal = () => {
    const selectedRatePlan = ratePlans.find((r) => r.id === selectedRatePlanId);
    if (!selectedRatePlan || !nights) return 0;
    return selectedRatePlan.base_rate * nights;
  };

  const handleSubmit = async () => {
    if (!checkInDate || !checkOutDate || !selectedUnitId) {
      toast.error(language === 'ar' ? 'الرجاء إكمال جميع الحقول المطلوبة' : 'Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      let guestId = selectedGuest?.id;

      // Create new guest if needed
      if (isNewGuest) {
        const { data: newGuestData, error: guestError } = await supabase
          .from('guests')
          .insert({
            full_name: newGuest.full_name,
            email: newGuest.email || null,
            phone: newGuest.phone,
            nationality: newGuest.nationality,
            id_type: newGuest.id_type,
            id_number: newGuest.id_number || null,
          })
          .select()
          .single();

        if (guestError) throw guestError;
        guestId = newGuestData.id;
      }

      if (!guestId) {
        toast.error(language === 'ar' ? 'الرجاء اختيار أو إنشاء ضيف' : 'Please select or create a guest');
        return;
      }

      const totalAmount = calculateTotal();

      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          guest_id: guestId,
          unit_id: selectedUnitId,
          room_id: selectedRoomId || null,
          room_type_id: selectedRoomTypeId || null,
          start_date: format(checkInDate, 'yyyy-MM-dd'),
          end_date: format(checkOutDate, 'yyyy-MM-dd'),
          nights,
          adults,
          children,
          total_amount: totalAmount,
          status: isWalkIn ? 'checked_in' : 'confirmed',
          is_walk_in: isWalkIn,
          special_requests: specialRequests || null,
          internal_notes: internalNotes || null,
          eta: eta || null,
          vip_code: vipCode || null,
          checked_in_at: isWalkIn ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Create folio for the reservation
      await supabase.from('folios').insert({
        reservation_id: reservation.id,
        guest_id: guestId,
        folio_number: `F-${reservation.confirmation_code}`,
        status: 'open',
      });

      // Update room status if walk-in
      if (isWalkIn && selectedRoomId) {
        await supabase
          .from('rooms')
          .update({ fo_status: 'occupied', room_status: 'occupied_dirty' })
          .eq('id', selectedRoomId);
      }

      toast.success(
        language === 'ar'
          ? `تم إنشاء الحجز بنجاح: ${reservation.confirmation_code}`
          : `Reservation created: ${reservation.confirmation_code}`
      );

      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في إنشاء الحجز' : 'Error creating reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('dates');
    setCheckInDate(undefined);
    setCheckOutDate(undefined);
    setSelectedRoomTypeId('');
    setSelectedRoomId('');
    setSelectedUnitId('');
    setSelectedRatePlanId('');
    setAdults(1);
    setChildren(0);
    setSelectedGuest(null);
    setIsNewGuest(false);
    setSpecialRequests('');
    setInternalNotes('');
    setEta('');
    setVipCode('');
    setNewGuest({
      full_name: '',
      email: '',
      phone: '',
      nationality: 'SA',
      id_type: 'national_id',
      id_number: '',
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'dates':
        return checkInDate && checkOutDate && nights > 0;
      case 'room':
        return selectedUnitId;
      case 'guest':
        return selectedGuest || (isNewGuest && newGuest.full_name && newGuest.phone);
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    const stepOrder: Step[] = ['dates', 'room', 'guest', 'summary'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const goToPrevStep = () => {
    const stepOrder: Step[] = ['dates', 'room', 'guest', 'summary'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const selectedRoomType = roomTypes.find((rt) => rt.id === selectedRoomTypeId);
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const selectedRatePlan = ratePlans.find((rp) => rp.id === selectedRatePlanId);
  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isWalkIn
              ? language === 'ar'
                ? 'تسجيل وصول زائر'
                : 'Walk-In Check-In'
              : language === 'ar'
              ? 'حجز جديد'
              : 'New Reservation'}
          </DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center flex-1">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                  currentStep === step.key
                    ? 'bg-primary text-primary-foreground'
                    : steps.findIndex((s) => s.key === currentStep) > index
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {steps.findIndex((s) => s.key === currentStep) > index ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="ms-2 text-sm font-medium hidden sm:block">
                {step.label[language]}
              </span>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-muted mx-4" />
              )}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Step: Dates */}
            {currentStep === 'dates' && (
              <div className="space-y-6">
                {/* Property selection */}
                {properties.length > 1 && (
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'العقار' : 'Property'}</Label>
                    <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر العقار' : 'Select property'} />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {language === 'ar' ? property.name_ar : property.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Date selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'تاريخ الوصول' : 'Check-in Date'}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-start font-normal',
                            !checkInDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="me-2 h-4 w-4" />
                          {checkInDate ? format(checkInDate, 'PPP') : language === 'ar' ? 'اختر التاريخ' : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkInDate}
                          onSelect={setCheckInDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'تاريخ المغادرة' : 'Check-out Date'}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-start font-normal',
                            !checkOutDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="me-2 h-4 w-4" />
                          {checkOutDate ? format(checkOutDate, 'PPP') : language === 'ar' ? 'اختر التاريخ' : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkOutDate}
                          onSelect={setCheckOutDate}
                          disabled={(date) => !checkInDate || date <= checkInDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {nights > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'مدة الإقامة:' : 'Length of stay:'}{' '}
                      <span className="font-semibold text-foreground">
                        {nights} {nights === 1 ? (language === 'ar' ? 'ليلة' : 'night') : language === 'ar' ? 'ليالي' : 'nights'}
                      </span>
                    </p>
                  </div>
                )}

                {/* Guests */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'بالغين' : 'Adults'}</Label>
                    <Select value={adults.toString()} onValueChange={(v) => setAdults(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'أطفال' : 'Children'}</Label>
                    <Select value={children.toString()} onValueChange={(v) => setChildren(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* ETA */}
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'وقت الوصول المتوقع' : 'Expected Arrival Time'}</Label>
                  <Input
                    type="time"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    placeholder="14:00"
                  />
                </div>
              </div>
            )}

            {/* Step: Room */}
            {currentStep === 'room' && (
              <div className="space-y-6">
                {/* Unit selection (for apartment model) */}
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوحدة' : 'Unit'}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {units.map((unit) => (
                      <Card
                        key={unit.id}
                        className={cn(
                          'cursor-pointer transition-all hover:border-primary',
                          selectedUnitId === unit.id && 'border-primary bg-primary/5'
                        )}
                        onClick={() => setSelectedUnitId(unit.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">
                              {language === 'ar' ? unit.name_ar : unit.name_en}
                            </span>
                            {selectedUnitId === unit.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BedDouble className="h-3 w-3" />
                              {unit.bedrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {unit.capacity}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Room type selection (for hotel model) */}
                {roomTypes.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'نوع الغرفة' : 'Room Type'}</Label>
                      <Select value={selectedRoomTypeId} onValueChange={setSelectedRoomTypeId}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر نوع الغرفة' : 'Select room type'} />
                        </SelectTrigger>
                        <SelectContent>
                          {roomTypes.map((rt) => (
                            <SelectItem key={rt.id} value={rt.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground">{rt.code}</span>
                                <span>{language === 'ar' ? rt.name_ar : rt.name_en}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Available rooms */}
                    {selectedRoomTypeId && rooms.length > 0 && (
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الغرفة المتاحة' : 'Available Room'}</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {rooms.map((room) => (
                            <Card
                              key={room.id}
                              className={cn(
                                'cursor-pointer transition-all hover:border-primary',
                                selectedRoomId === room.id && 'border-primary bg-primary/5',
                                room.room_status !== 'vacant_clean' && 'opacity-60'
                              )}
                              onClick={() => setSelectedRoomId(room.id)}
                            >
                              <CardContent className="p-3 text-center">
                                <div className="font-mono text-lg font-bold mb-1">
                                  {room.room_number}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs',
                                    room.room_status === 'vacant_clean' && 'bg-success/10 text-success',
                                    room.room_status === 'vacant_dirty' && 'bg-warning/10 text-warning'
                                  )}
                                >
                                  {room.room_status === 'vacant_clean'
                                    ? language === 'ar'
                                      ? 'نظيفة'
                                      : 'Clean'
                                    : language === 'ar'
                                    ? 'تحتاج تنظيف'
                                    : 'Dirty'}
                                </Badge>
                                {room.floor && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {language === 'ar' ? `طابق ${room.floor}` : `Floor ${room.floor}`}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Rate plan */}
                {ratePlans.length > 0 && (
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'خطة الأسعار' : 'Rate Plan'}</Label>
                    <Select value={selectedRatePlanId} onValueChange={setSelectedRatePlanId}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر خطة الأسعار' : 'Select rate plan'} />
                      </SelectTrigger>
                      <SelectContent>
                        {ratePlans.map((rp) => (
                          <SelectItem key={rp.id} value={rp.id}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <span>{language === 'ar' ? rp.name_ar : rp.name_en}</span>
                              <span className="text-muted-foreground">
                                {rp.base_rate} {rp.currency}/{language === 'ar' ? 'ليلة' : 'night'}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Step: Guest */}
            {currentStep === 'guest' && (
              <div className="space-y-6">
                <Tabs value={isNewGuest ? 'new' : 'existing'} onValueChange={(v) => setIsNewGuest(v === 'new')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="existing" className="gap-2">
                      <Search className="h-4 w-4" />
                      {language === 'ar' ? 'بحث عن ضيف' : 'Search Guest'}
                    </TabsTrigger>
                    <TabsTrigger value="new" className="gap-2">
                      <Plus className="h-4 w-4" />
                      {language === 'ar' ? 'ضيف جديد' : 'New Guest'}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="mt-4 space-y-4">
                    <div className="relative">
                      <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={language === 'ar' ? 'بحث بالاسم أو الهاتف أو البريد...' : 'Search by name, phone, or email...'}
                        value={guestSearchQuery}
                        onChange={(e) => handleGuestSearch(e.target.value)}
                        className="ps-10"
                      />
                    </div>

                    {guests.length > 0 && (
                      <div className="space-y-2">
                        {guests.map((guest) => (
                          <Card
                            key={guest.id}
                            className={cn(
                              'cursor-pointer transition-all hover:border-primary',
                              selectedGuest?.id === guest.id && 'border-primary bg-primary/5'
                            )}
                            onClick={() => setSelectedGuest(guest)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold">{guest.full_name}</p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {guest.phone}
                                    </span>
                                    {guest.email && (
                                      <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {guest.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {selectedGuest?.id === guest.id && (
                                  <Check className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {selectedGuest && (
                      <Card className="border-success bg-success/5">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-success/10">
                              <User className="h-5 w-5 text-success" />
                            </div>
                            <div>
                              <p className="font-semibold">{selectedGuest.full_name}</p>
                              <p className="text-sm text-muted-foreground">{selectedGuest.phone}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="new" className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *</Label>
                        <Input
                          value={newGuest.full_name}
                          onChange={(e) => setNewGuest({ ...newGuest, full_name: e.target.value })}
                          placeholder={language === 'ar' ? 'أدخل الاسم الكامل' : 'Enter full name'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *</Label>
                        <Input
                          value={newGuest.phone}
                          onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                          placeholder="+966 5X XXX XXXX"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                        <Input
                          type="email"
                          value={newGuest.email}
                          onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                          placeholder="email@example.com"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الجنسية' : 'Nationality'}</Label>
                        <Select
                          value={newGuest.nationality}
                          onValueChange={(v) => setNewGuest({ ...newGuest, nationality: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SA">{language === 'ar' ? 'السعودية' : 'Saudi Arabia'}</SelectItem>
                            <SelectItem value="AE">{language === 'ar' ? 'الإمارات' : 'UAE'}</SelectItem>
                            <SelectItem value="KW">{language === 'ar' ? 'الكويت' : 'Kuwait'}</SelectItem>
                            <SelectItem value="BH">{language === 'ar' ? 'البحرين' : 'Bahrain'}</SelectItem>
                            <SelectItem value="QA">{language === 'ar' ? 'قطر' : 'Qatar'}</SelectItem>
                            <SelectItem value="OM">{language === 'ar' ? 'عُمان' : 'Oman'}</SelectItem>
                            <SelectItem value="EG">{language === 'ar' ? 'مصر' : 'Egypt'}</SelectItem>
                            <SelectItem value="JO">{language === 'ar' ? 'الأردن' : 'Jordan'}</SelectItem>
                            <SelectItem value="OTHER">{language === 'ar' ? 'أخرى' : 'Other'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'نوع الهوية' : 'ID Type'}</Label>
                        <Select
                          value={newGuest.id_type}
                          onValueChange={(v) => setNewGuest({ ...newGuest, id_type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="national_id">{language === 'ar' ? 'هوية وطنية' : 'National ID'}</SelectItem>
                            <SelectItem value="passport">{language === 'ar' ? 'جواز سفر' : 'Passport'}</SelectItem>
                            <SelectItem value="iqama">{language === 'ar' ? 'إقامة' : 'Iqama'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'رقم الهوية' : 'ID Number'}</Label>
                        <Input
                          value={newGuest.id_number}
                          onChange={(e) => setNewGuest({ ...newGuest, id_number: e.target.value })}
                          placeholder={language === 'ar' ? 'أدخل رقم الهوية' : 'Enter ID number'}
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* VIP and notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'كود VIP' : 'VIP Code'}</Label>
                    <Select value={vipCode} onValueChange={setVipCode}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختياري' : 'Optional'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="VVIP">VVIP</SelectItem>
                        <SelectItem value="ROYAL">Royal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'طلبات خاصة' : 'Special Requests'}</Label>
                  <Textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder={language === 'ar' ? 'أي طلبات خاصة للضيف...' : 'Any special requests from the guest...'}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'ملاحظات داخلية' : 'Internal Notes'}</Label>
                  <Textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder={language === 'ar' ? 'ملاحظات للموظفين فقط...' : 'Notes for staff only...'}
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Step: Summary */}
            {currentStep === 'summary' && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">
                      {language === 'ar' ? 'ملخص الحجز' : 'Reservation Summary'}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">{language === 'ar' ? 'تاريخ الوصول' : 'Check-in'}</p>
                        <p className="font-semibold">{checkInDate ? format(checkInDate, 'PPP') : '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === 'ar' ? 'تاريخ المغادرة' : 'Check-out'}</p>
                        <p className="font-semibold">{checkOutDate ? format(checkOutDate, 'PPP') : '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === 'ar' ? 'عدد الليالي' : 'Nights'}</p>
                        <p className="font-semibold">{nights}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === 'ar' ? 'الضيوف' : 'Guests'}</p>
                        <p className="font-semibold">
                          {adults} {language === 'ar' ? 'بالغ' : 'Adult(s)'}{children > 0 && `, ${children} ${language === 'ar' ? 'طفل' : 'Child(ren)'}`}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground text-sm">{language === 'ar' ? 'الوحدة/الغرفة' : 'Unit/Room'}</p>
                          <p className="font-semibold">
                            {selectedUnit && (language === 'ar' ? selectedUnit.name_ar : selectedUnit.name_en)}
                            {selectedRoom && ` - ${selectedRoom.room_number}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground text-sm">{language === 'ar' ? 'الضيف' : 'Guest'}</p>
                          <p className="font-semibold">
                            {selectedGuest?.full_name || newGuest.full_name}
                            {vipCode && (
                              <Badge className="ms-2 bg-accent/10 text-accent">{vipCode}</Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedGuest?.phone || newGuest.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedRatePlan && (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-muted-foreground">
                            {language === 'ar' ? selectedRatePlan.name_ar : selectedRatePlan.name_en} × {nights} {language === 'ar' ? 'ليالي' : 'nights'}
                          </span>
                          <span>{(selectedRatePlan.base_rate * nights).toLocaleString()} SAR</span>
                        </div>
                        <div className="flex items-center justify-between font-semibold text-lg border-t pt-2">
                          <span>{language === 'ar' ? 'المجموع' : 'Total'}</span>
                          <span className="text-primary">{calculateTotal().toLocaleString()} SAR</span>
                        </div>
                      </div>
                    )}

                    {(specialRequests || eta) && (
                      <div className="border-t pt-4 text-sm">
                        {eta && (
                          <p className="mb-2">
                            <span className="text-muted-foreground">{language === 'ar' ? 'وقت الوصول المتوقع:' : 'ETA:'}</span> {eta}
                          </p>
                        )}
                        {specialRequests && (
                          <p>
                            <span className="text-muted-foreground">{language === 'ar' ? 'طلبات خاصة:' : 'Special Requests:'}</span> {specialRequests}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={goToPrevStep}
                disabled={currentStep === 'dates'}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {language === 'ar' ? 'السابق' : 'Previous'}
              </Button>

              {currentStep === 'summary' ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2 btn-gold"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {isWalkIn
                    ? language === 'ar'
                      ? 'تسجيل الوصول'
                      : 'Check In'
                    : language === 'ar'
                    ? 'تأكيد الحجز'
                    : 'Confirm Reservation'}
                </Button>
              ) : (
                <Button
                  onClick={goToNextStep}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
