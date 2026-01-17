import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bed, Bath, Users, Maximize } from 'lucide-react';

interface UnitCardProps {
  id: string;
  nameEn: string;
  nameAr: string;
  propertyNameEn: string;
  propertyNameAr: string;
  city: string;
  imageUrl?: string;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  sizeM2?: number;
  baseRate: number;
  unitType: string;
}

export function UnitCard({
  id,
  nameEn,
  nameAr,
  propertyNameEn,
  propertyNameAr,
  city,
  imageUrl,
  bedrooms,
  bathrooms,
  capacity,
  sizeM2,
  baseRate,
  unitType,
}: UnitCardProps) {
  const { t, language } = useLanguage();
  
  const name = language === 'ar' ? nameAr : nameEn;
  const propertyName = language === 'ar' ? propertyNameAr : propertyNameEn;
  const cityName = t(`city.${city.toLowerCase()}`) || city;

  return (
    <Link to={`/unit/${id}`}>
      <Card className="overflow-hidden dashboard-card border-border/50 h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
              <span className="text-4xl font-bold text-muted-foreground/30">AWA</span>
            </div>
          )}
          <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
            {unitType}
          </Badge>
        </div>
        
        <CardContent className="p-4">
          {/* Location */}
          <p className="text-sm text-muted-foreground mb-1">
            {propertyName} • {cityName}
          </p>
          
          {/* Name */}
          <h3 className="font-semibold text-lg text-foreground mb-3 line-clamp-1">
            {name}
          </h3>
          
          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {bedrooms}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {bathrooms}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {capacity}
            </span>
            {sizeM2 && (
              <span className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                {sizeM2}m²
              </span>
            )}
          </div>
          
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="price-display">{baseRate}</span>
            <span className="price-currency">{t('common.sar')}</span>
            <span className="text-sm text-muted-foreground">/ {t('common.night')}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
