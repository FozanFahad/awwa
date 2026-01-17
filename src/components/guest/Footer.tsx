import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

export function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-accent-foreground font-bold text-lg">
                {language === 'ar' ? 'أ' : 'A'}
              </div>
              <span className="text-xl font-bold">
                {t('brand.name')}
              </span>
            </div>
            <p className="text-primary-foreground/70 max-w-sm">
              {t('brand.tagline')}
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>
                <Link to="/" className="hover:text-primary-foreground transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-primary-foreground transition-colors">
                  {t('nav.search')}
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-primary-foreground transition-colors">
                  {t('nav.bookings')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>support@awa.sa</li>
              <li>+966 11 XXX XXXX</li>
              <li>{language === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/50 text-sm">
          © {new Date().getFullYear()} AWA | أوى. {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
        </div>
      </div>
    </footer>
  );
}
