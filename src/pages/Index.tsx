import { SearchHero } from '@/components/guest/SearchHero';
import { FeaturedUnits } from '@/components/guest/FeaturedUnits';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Shield, Clock, Headphones } from 'lucide-react';

const features = [
  {
    icon: Building2,
    titleEn: 'Premium Locations',
    titleAr: 'مواقع متميزة',
    descEn: 'Carefully selected properties in prime Saudi Arabian cities',
    descAr: 'عقارات مختارة بعناية في أفضل المدن السعودية',
  },
  {
    icon: Shield,
    titleEn: 'Verified Quality',
    titleAr: 'جودة موثقة',
    descEn: 'Every apartment meets our strict quality standards',
    descAr: 'كل شقة تلبي معايير الجودة الصارمة لدينا',
  },
  {
    icon: Clock,
    titleEn: 'Flexible Stays',
    titleAr: 'إقامات مرنة',
    descEn: 'From short getaways to extended business stays',
    descAr: 'من الإقامات القصيرة إلى رحلات العمل الممتدة',
  },
  {
    icon: Headphones,
    titleEn: '24/7 Support',
    titleAr: 'دعم على مدار الساعة',
    descEn: 'Our team is always ready to assist you',
    descAr: 'فريقنا جاهز دائماً لمساعدتك',
  },
];

export default function Index() {
  const { language } = useLanguage();

  return (
    <div className="page-transition">
      <SearchHero />
      
      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {language === 'ar' ? 'لماذا تختار أوى؟' : 'Why Choose AWA?'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'نقدم تجربة إقامة استثنائية في أفضل الشقق المفروشة'
                : 'We deliver an exceptional stay experience in the finest furnished apartments'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-xl bg-card border border-border/50 dashboard-card"
              >
                <div className="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {language === 'ar' ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? feature.descAr : feature.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <FeaturedUnits />
      
      {/* CTA Section */}
      <section className="py-20 bg-hero text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'ar' 
              ? 'ابدأ رحلتك معنا اليوم'
              : 'Start Your Journey With Us Today'}
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            {language === 'ar'
              ? 'اكتشف مجموعتنا الفاخرة من الشقق المفروشة واحجز إقامتك المثالية'
              : 'Explore our premium collection of furnished apartments and book your perfect stay'}
          </p>
          <div className="flex items-center justify-center gap-4">
            <a 
              href="/search"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition-colors shadow-gold"
            >
              {language === 'ar' ? 'استكشف الوحدات' : 'Explore Units'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
