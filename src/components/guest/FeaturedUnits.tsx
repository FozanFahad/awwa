import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UnitCard } from './UnitCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeaturedUnit {
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

export function FeaturedUnits() {
  const { t, isRTL, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<FeaturedUnit[]>([]);

  useEffect(() => {
    fetchFeaturedUnits();
  }, [language]);

  const fetchFeaturedUnits = async () => {
    try {
      // Fetch units with their properties and photos
      const { data: unitsData } = await supabase
        .from('units')
        .select(`
          id,
          name_en,
          name_ar,
          bedrooms,
          bathrooms,
          capacity,
          size_m2,
          unit_type,
          properties (name_en, name_ar, city),
          unit_photos (url, sort_order)
        `)
        .eq('status', 'available')
        .limit(4);

      if (!unitsData || unitsData.length === 0) {
        setUnits([]);
        setLoading(false);
        return;
      }

      // Fetch rate plans for these units
      const unitIds = unitsData.map(u => u.id);
      const { data: ratePlansData } = await supabase
        .from('unit_rate_plans')
        .select(`
          unit_id,
          rate_plans (base_rate)
        `)
        .in('unit_id', unitIds);

      // Create a map of unit_id to base_rate
      const rateMap: Record<string, number> = {};
      (ratePlansData || []).forEach((rp: any) => {
        if (!rateMap[rp.unit_id] && rp.rate_plans?.base_rate) {
          rateMap[rp.unit_id] = rp.rate_plans.base_rate;
        }
      });

      const formattedUnits: FeaturedUnit[] = unitsData.map((u: any) => {
        const photos = u.unit_photos?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
        return {
          id: u.id,
          nameEn: u.name_en,
          nameAr: u.name_ar,
          propertyNameEn: u.properties?.name_en || '',
          propertyNameAr: u.properties?.name_ar || '',
          city: u.properties?.city || '',
          imageUrl: photos[0]?.url,
          bedrooms: u.bedrooms,
          bathrooms: u.bathrooms,
          capacity: u.capacity,
          sizeM2: u.size_m2,
          baseRate: rateMap[u.id] || 0,
          unitType: u.unit_type,
        };
      });

      setUnits(formattedUnits);
    } catch (error) {
      console.error('Error fetching featured units:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-72" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (units.length === 0) {
    return null; // Don't show the section if no units
  }

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
          {units.map((unit) => (
            <UnitCard key={unit.id} {...unit} />
          ))}
        </div>
      </div>
    </section>
  );
}
