import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { UnitCard } from '@/components/guest/UnitCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, Search as SearchIcon } from 'lucide-react';

// Mock data for search results
const allUnits = [
  {
    id: '1',
    nameEn: 'Luxury Penthouse Suite',
    nameAr: 'جناح بنتهاوس فاخر',
    propertyNameEn: 'Al Faisaliah Residences',
    propertyNameAr: 'فيصلية ريزيدنس',
    city: 'riyadh',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60',
    bedrooms: 3,
    bathrooms: 2,
    capacity: 6,
    sizeM2: 180,
    baseRate: 1500,
    unitType: 'Penthouse',
  },
  {
    id: '2',
    nameEn: 'Modern Studio Apartment',
    nameAr: 'شقة استوديو عصرية',
    propertyNameEn: 'Kingdom Tower Residences',
    propertyNameAr: 'برج المملكة ريزيدنس',
    city: 'riyadh',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60',
    bedrooms: 1,
    bathrooms: 1,
    capacity: 2,
    sizeM2: 55,
    baseRate: 450,
    unitType: 'Studio',
  },
  {
    id: '3',
    nameEn: 'Family Executive Suite',
    nameAr: 'جناح عائلي تنفيذي',
    propertyNameEn: 'Corniche Towers',
    propertyNameAr: 'أبراج الكورنيش',
    city: 'jeddah',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=60',
    bedrooms: 2,
    bathrooms: 2,
    capacity: 4,
    sizeM2: 120,
    baseRate: 850,
    unitType: 'Suite',
  },
  {
    id: '4',
    nameEn: 'Seaside Luxury Villa',
    nameAr: 'فيلا فاخرة على البحر',
    propertyNameEn: 'Red Sea Villas',
    propertyNameAr: 'فلل البحر الأحمر',
    city: 'jeddah',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60',
    bedrooms: 4,
    bathrooms: 3,
    capacity: 8,
    sizeM2: 280,
    baseRate: 2200,
    unitType: 'Villa',
  },
  {
    id: '5',
    nameEn: 'Downtown Business Apartment',
    nameAr: 'شقة أعمال وسط المدينة',
    propertyNameEn: 'Olaya Business District',
    propertyNameAr: 'حي العليا للأعمال',
    city: 'riyadh',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60',
    bedrooms: 1,
    bathrooms: 1,
    capacity: 2,
    sizeM2: 65,
    baseRate: 550,
    unitType: 'Apartment',
  },
  {
    id: '6',
    nameEn: 'Coastal Resort Suite',
    nameAr: 'جناح منتجع ساحلي',
    propertyNameEn: 'Dammam Waterfront',
    propertyNameAr: 'واجهة الدمام البحرية',
    city: 'dammam',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60',
    bedrooms: 2,
    bathrooms: 2,
    capacity: 4,
    sizeM2: 100,
    baseRate: 750,
    unitType: 'Suite',
  },
];

const unitTypes = ['Studio', 'Apartment', 'Suite', 'Penthouse', 'Villa'];
const amenities = [
  { id: 'wifi', labelEn: 'WiFi', labelAr: 'واي فاي' },
  { id: 'pool', labelEn: 'Pool', labelAr: 'مسبح' },
  { id: 'gym', labelEn: 'Gym', labelAr: 'صالة رياضية' },
  { id: 'parking', labelEn: 'Parking', labelAr: 'موقف سيارات' },
  { id: 'kitchen', labelEn: 'Kitchen', labelAr: 'مطبخ' },
];

export default function Search() {
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const cityFilter = searchParams.get('city');
  
  const filteredUnits = allUnits.filter((unit) => {
    if (cityFilter && unit.city !== cityFilter) return false;
    if (unit.baseRate < priceRange[0] || unit.baseRate > priceRange[1]) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(unit.unitType)) return false;
    return true;
  });

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          {language === 'ar' ? 'نطاق السعر' : 'Price Range'}
        </Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={3000}
          step={50}
          className="w-full"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{priceRange[0]} {t('common.sar')}</span>
          <span>{priceRange[1]} {t('common.sar')}</span>
        </div>
      </div>
      
      {/* Unit Type */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          {language === 'ar' ? 'نوع الوحدة' : 'Unit Type'}
        </Label>
        <div className="space-y-2">
          {unitTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox
                id={type}
                checked={selectedTypes.includes(type)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTypes([...selectedTypes, type]);
                  } else {
                    setSelectedTypes(selectedTypes.filter((t) => t !== type));
                  }
                }}
              />
              <label htmlFor={type} className="text-sm">{type}</label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Amenities */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          {language === 'ar' ? 'المرافق' : 'Amenities'}
        </Label>
        <div className="space-y-2">
          {amenities.map((amenity) => (
            <div key={amenity.id} className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox
                id={amenity.id}
                checked={selectedAmenities.includes(amenity.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedAmenities([...selectedAmenities, amenity.id]);
                  } else {
                    setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity.id));
                  }
                }}
              />
              <label htmlFor={amenity.id} className="text-sm">
                {language === 'ar' ? amenity.labelAr : amenity.labelEn}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {language === 'ar' ? 'نتائج البحث' : 'Search Results'}
          </h1>
          <p className="text-muted-foreground">
            {filteredUnits.length} {language === 'ar' ? 'وحدة متاحة' : 'units available'}
            {cityFilter && ` ${language === 'ar' ? 'في' : 'in'} ${t(`city.${cityFilter}`)}`}
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-6">
                {language === 'ar' ? 'تصفية النتائج' : 'Filters'}
              </h2>
              <FilterContent />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    {language === 'ar' ? 'تصفية' : 'Filters'}
                  </Button>
                </SheetTrigger>
                <SheetContent side={language === 'ar' ? 'right' : 'left'}>
                  <SheetHeader>
                    <SheetTitle>
                      {language === 'ar' ? 'تصفية النتائج' : 'Filters'}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Results Grid */}
            {filteredUnits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredUnits.map((unit) => (
                  <UnitCard key={unit.id} {...unit} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('common.noResults')}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'ar' 
                    ? 'جرب تغيير معايير البحث'
                    : 'Try adjusting your search criteria'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
