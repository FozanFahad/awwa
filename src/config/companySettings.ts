// Company Settings for Invoices and Documents
export const companySettings = {
  // Primary company name
  name_en: 'Jah Al-Amal Real Estate Services',
  name_ar: 'مكتب جاه الأعمال للخدمات العقارية',
  
  // Secondary/Establishment name
  establishment_name_en: 'Awwa Al-Makan Tourist Lodges',
  establishment_name_ar: 'مؤسسة أوي المكان للنزل السياحية',
  
  // Address
  street_en: 'Prince Mohammed bin Salman bin Abdulaziz Road',
  street_ar: 'طريق الأمير محمد بن سلمان بن عبدالعزيز',
  city_en: 'Riyadh',
  city_ar: 'الرياض',
  country_en: 'Kingdom of Saudi Arabia',
  country_ar: 'المملكة العربية السعودية',
  
  // Full address
  get address_en() {
    return `${this.street_en}, ${this.city_en}, ${this.country_en}`;
  },
  get address_ar() {
    return `${this.street_ar}، ${this.city_ar}، ${this.country_ar}`;
  },
  
  // VAT Number
  vat_number: '310231928400003',
  
  // Commercial Registration (optional - can be added later)
  cr_number: '',
};
