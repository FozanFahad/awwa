import { useLanguage } from '@/contexts/LanguageContext';
import { UnitCard } from './UnitCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Sample data for featured units
const featuredUnits = [
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
];

export function FeaturedUnits() {
  const { t, isRTL } = useLanguage();

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {isRTL ? 'وحدات مميزة' : 'Featured Units'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL ? 'اكتشف أفضل الشقق المفروشة لدينا' : 'Discover our best furnished apartments'}
            </p>
          </div>
          <Link to="/search">
            <Button variant="ghost" className="gap-2">
              {isRTL ? 'عرض الكل' : 'View All'}
              {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredUnits.map((unit) => (
            <UnitCard key={unit.id} {...unit} />
          ))}
        </div>
      </div>
    </section>
  );
}
