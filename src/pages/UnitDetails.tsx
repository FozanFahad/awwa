import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { 
  Bed, Bath, Users, Maximize, MapPin, Wifi, Car, 
  Dumbbell, Waves, UtensilsCrossed, Tv, Wind, CalendarIcon,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Mock unit data
const unitData = {
  id: '1',
  nameEn: 'Luxury Penthouse Suite',
  nameAr: 'جناح بنتهاوس فاخر',
  propertyNameEn: 'Al Faisaliah Residences',
  propertyNameAr: 'فيصلية ريزيدنس',
  city: 'riyadh',
  district: 'Olaya',
  districtAr: 'العليا',
  images: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
  ],
  bedrooms: 3,
  bathrooms: 2,
  capacity: 6,
  sizeM2: 180,
  baseRate: 1500,
  cleaningFee: 150,
  unitType: 'Penthouse',
  descriptionEn: 'Experience luxury living in this stunning penthouse suite with panoramic city views. This beautifully designed space features modern furnishings, a fully equipped kitchen, and premium amenities. Perfect for families or business travelers seeking comfort and style.',
  descriptionAr: 'استمتع بالعيش الفاخر في هذا الجناح البنتهاوس المذهل مع إطلالات بانورامية على المدينة. يتميز هذا المكان المصمم بشكل جميل بأثاث عصري ومطبخ مجهز بالكامل ووسائل راحة متميزة. مثالي للعائلات أو المسافرين من رجال الأعمال الباحثين عن الراحة والأناقة.',
  rulesEn: 'No smoking • No pets • Quiet hours 10PM-8AM • Maximum 6 guests',
  rulesAr: 'ممنوع التدخين • ممنوع الحيوانات الأليفة • ساعات الهدوء من 10 مساءً إلى 8 صباحاً • الحد الأقصى 6 ضيوف',
  amenities: [
    { icon: Wifi, labelEn: 'High-Speed WiFi', labelAr: 'واي فاي سريع' },
    { icon: Car, labelEn: 'Free Parking', labelAr: 'موقف مجاني' },
    { icon: Dumbbell, labelEn: 'Fitness Center', labelAr: 'مركز لياقة' },
    { icon: Waves, labelEn: 'Swimming Pool', labelAr: 'مسبح' },
    { icon: UtensilsCrossed, labelEn: 'Full Kitchen', labelAr: 'مطبخ كامل' },
    { icon: Tv, labelEn: 'Smart TV', labelAr: 'تلفزيون ذكي' },
    { icon: Wind, labelEn: 'Air Conditioning', labelAr: 'تكييف' },
  ],
};

export default function UnitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  
  const unit = unitData; // In real app, fetch by id
  const name = language === 'ar' ? unit.nameAr : unit.nameEn;
  const propertyName = language === 'ar' ? unit.propertyNameAr : unit.propertyNameEn;
  const district = language === 'ar' ? unit.districtAr : unit.district;
  const description = language === 'ar' ? unit.descriptionAr : unit.descriptionEn;
  const rules = language === 'ar' ? unit.rulesAr : unit.rulesEn;
  const cityName = t(`city.${unit.city.toLowerCase()}`);
  
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * unit.baseRate;
  const total = subtotal + unit.cleaningFee;

  const handleBooking = () => {
    if (!user) {
      toast.error(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please sign in first');
      navigate('/auth');
      return;
    }
    
    if (!checkIn || !checkOut) {
      toast.error(language === 'ar' ? 'يرجى اختيار التواريخ' : 'Please select dates');
      return;
    }
    
    // Navigate to checkout with booking details
    navigate(`/checkout/${id}?checkIn=${format(checkIn, 'yyyy-MM-dd')}&checkOut=${format(checkOut, 'yyyy-MM-dd')}`);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % unit.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + unit.images.length) % unit.images.length);
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Image Gallery */}
      <div className="relative h-[50vh] md:h-[60vh] bg-muted overflow-hidden">
        <img
          src={unit.images[currentImageIndex]}
          alt={name}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-lg transition-colors"
        >
          {isRTL ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-lg transition-colors"
        >
          {isRTL ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
        </button>
        
        {/* Image indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {unit.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentImageIndex ? "bg-accent" : "bg-background/60"
              )}
            />
          ))}
        </div>
        
        <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">
          {unit.unitType}
        </Badge>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>{propertyName} • {district}, {cityName}</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{name}</h1>
              
              {/* Quick stats */}
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  {unit.bedrooms} {t('unit.bedrooms')}
                </span>
                <span className="flex items-center gap-2">
                  <Bath className="h-5 w-5" />
                  {unit.bathrooms} {t('unit.bathrooms')}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {unit.capacity} {t('unit.guests')}
                </span>
                <span className="flex items-center gap-2">
                  <Maximize className="h-5 w-5" />
                  {unit.sizeM2}m²
                </span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {language === 'ar' ? 'عن الوحدة' : 'About this space'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{description}</p>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold mb-4">{t('unit.amenities')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {unit.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <amenity.icon className="h-5 w-5 text-accent" />
                    <span className="text-sm">
                      {language === 'ar' ? amenity.labelAr : amenity.labelEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* House Rules */}
            <div>
              <h2 className="text-xl font-semibold mb-4">{t('unit.rules')}</h2>
              <p className="text-muted-foreground">{rules}</p>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{unit.baseRate}</span>
                  <span className="text-muted-foreground">{t('common.sar')} / {t('common.night')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? format(checkIn, "MMM d") : t('search.checkin')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={setCheckIn}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? format(checkOut, "MMM d") : t('search.checkout')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date) => date < (checkIn || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Price Breakdown */}
                {nights > 0 && (
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{unit.baseRate} {t('common.sar')} × {nights} {nights === 1 ? t('common.night') : t('common.nights')}</span>
                      <span>{subtotal} {t('common.sar')}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{language === 'ar' ? 'رسوم التنظيف' : 'Cleaning fee'}</span>
                      <span>{unit.cleaningFee} {t('common.sar')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{t('unit.total')}</span>
                      <span>{total} {t('common.sar')}</span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleBooking}
                  className="w-full btn-gold h-12 text-base font-semibold"
                  disabled={nights === 0}
                >
                  {t('unit.bookNow')}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'لن يتم خصم أي مبلغ الآن' : 'You won\'t be charged yet'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
