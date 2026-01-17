import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand
    'brand.name': 'AWA',
    'brand.tagline': 'Premium Furnished Apartments',
    
    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.bookings': 'My Bookings',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.dashboard': 'Dashboard',
    
    // Search
    'search.title': 'Find Your Perfect Stay',
    'search.subtitle': 'Discover premium furnished apartments across Saudi Arabia',
    'search.city': 'City',
    'search.city.placeholder': 'Where are you going?',
    'search.checkin': 'Check-in',
    'search.checkout': 'Check-out',
    'search.guests': 'Guests',
    'search.guests.placeholder': 'How many guests?',
    'search.button': 'Search',
    
    // Cities
    'city.riyadh': 'Riyadh',
    'city.jeddah': 'Jeddah',
    'city.dammam': 'Dammam',
    'city.mecca': 'Mecca',
    'city.medina': 'Medina',
    
    // Unit details
    'unit.bedrooms': 'Bedrooms',
    'unit.bathrooms': 'Bathrooms',
    'unit.guests': 'Guests',
    'unit.size': 'Size',
    'unit.perNight': 'per night',
    'unit.total': 'Total',
    'unit.bookNow': 'Book Now',
    'unit.amenities': 'Amenities',
    'unit.rules': 'House Rules',
    'unit.availability': 'Availability',
    
    // Booking
    'booking.checkout': 'Checkout',
    'booking.guestDetails': 'Guest Details',
    'booking.fullName': 'Full Name',
    'booking.email': 'Email',
    'booking.phone': 'Phone',
    'booking.nationality': 'Nationality',
    'booking.specialRequests': 'Special Requests',
    'booking.paymentMethod': 'Payment Method',
    'booking.confirm': 'Confirm Booking',
    'booking.confirmed': 'Booking Confirmed!',
    'booking.confirmationCode': 'Confirmation Code',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.reservations': 'Reservations',
    'dashboard.units': 'Units',
    'dashboard.calendar': 'Calendar',
    'dashboard.tasks': 'Tasks',
    'dashboard.finance': 'Finance',
    'dashboard.users': 'Users',
    'dashboard.settings': 'Settings',
    
    // KPIs
    'kpi.occupancy': 'Occupancy Rate',
    'kpi.revenue': 'Revenue',
    'kpi.checkIns': 'Today\'s Check-ins',
    'kpi.checkOuts': 'Today\'s Check-outs',
    'kpi.pendingTasks': 'Pending Tasks',
    
    // Statuses
    'status.pending': 'Pending',
    'status.confirmed': 'Confirmed',
    'status.checkedIn': 'Checked In',
    'status.checkedOut': 'Checked Out',
    'status.cancelled': 'Cancelled',
    'status.noShow': 'No Show',
    
    // Tasks
    'task.housekeeping': 'Housekeeping',
    'task.maintenance': 'Maintenance',
    'task.priority.low': 'Low',
    'task.priority.medium': 'Medium',
    'task.priority.high': 'High',
    'task.priority.urgent': 'Urgent',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.view': 'View',
    'common.filter': 'Filter',
    'common.search': 'Search',
    'common.noResults': 'No results found',
    'common.sar': 'SAR',
    'common.night': 'night',
    'common.nights': 'nights',
  },
  ar: {
    // Brand
    'brand.name': 'أوى',
    'brand.tagline': 'شقق مفروشة فاخرة',
    
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.search': 'البحث',
    'nav.bookings': 'حجوزاتي',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    'nav.dashboard': 'لوحة التحكم',
    
    // Search
    'search.title': 'ابحث عن إقامتك المثالية',
    'search.subtitle': 'اكتشف شققاً مفروشة فاخرة في جميع أنحاء المملكة العربية السعودية',
    'search.city': 'المدينة',
    'search.city.placeholder': 'إلى أين تذهب؟',
    'search.checkin': 'تاريخ الوصول',
    'search.checkout': 'تاريخ المغادرة',
    'search.guests': 'الضيوف',
    'search.guests.placeholder': 'كم عدد الضيوف؟',
    'search.button': 'بحث',
    
    // Cities
    'city.riyadh': 'الرياض',
    'city.jeddah': 'جدة',
    'city.dammam': 'الدمام',
    'city.mecca': 'مكة المكرمة',
    'city.medina': 'المدينة المنورة',
    
    // Unit details
    'unit.bedrooms': 'غرف النوم',
    'unit.bathrooms': 'الحمامات',
    'unit.guests': 'الضيوف',
    'unit.size': 'المساحة',
    'unit.perNight': 'لليلة',
    'unit.total': 'المجموع',
    'unit.bookNow': 'احجز الآن',
    'unit.amenities': 'المرافق',
    'unit.rules': 'قواعد المنزل',
    'unit.availability': 'التوفر',
    
    // Booking
    'booking.checkout': 'إتمام الحجز',
    'booking.guestDetails': 'بيانات الضيف',
    'booking.fullName': 'الاسم الكامل',
    'booking.email': 'البريد الإلكتروني',
    'booking.phone': 'رقم الهاتف',
    'booking.nationality': 'الجنسية',
    'booking.specialRequests': 'طلبات خاصة',
    'booking.paymentMethod': 'طريقة الدفع',
    'booking.confirm': 'تأكيد الحجز',
    'booking.confirmed': 'تم تأكيد الحجز!',
    'booking.confirmationCode': 'رمز التأكيد',
    
    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.overview': 'نظرة عامة',
    'dashboard.reservations': 'الحجوزات',
    'dashboard.units': 'الوحدات',
    'dashboard.calendar': 'التقويم',
    'dashboard.tasks': 'المهام',
    'dashboard.finance': 'المالية',
    'dashboard.users': 'المستخدمين',
    'dashboard.settings': 'الإعدادات',
    
    // KPIs
    'kpi.occupancy': 'نسبة الإشغال',
    'kpi.revenue': 'الإيرادات',
    'kpi.checkIns': 'تسجيلات الوصول اليوم',
    'kpi.checkOuts': 'تسجيلات المغادرة اليوم',
    'kpi.pendingTasks': 'المهام المعلقة',
    
    // Statuses
    'status.pending': 'معلق',
    'status.confirmed': 'مؤكد',
    'status.checkedIn': 'وصل',
    'status.checkedOut': 'غادر',
    'status.cancelled': 'ملغي',
    'status.noShow': 'لم يحضر',
    
    // Tasks
    'task.housekeeping': 'التدبير المنزلي',
    'task.maintenance': 'الصيانة',
    'task.priority.low': 'منخفض',
    'task.priority.medium': 'متوسط',
    'task.priority.high': 'عالي',
    'task.priority.urgent': 'عاجل',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.view': 'عرض',
    'common.filter': 'تصفية',
    'common.search': 'بحث',
    'common.noResults': 'لا توجد نتائج',
    'common.sar': 'ر.س',
    'common.night': 'ليلة',
    'common.nights': 'ليالي',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('awa-language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('awa-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
