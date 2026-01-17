import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  FileText, 
  Globe, 
  Save,
  Settings as SettingsIcon,
  CreditCard,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { companySettings } from '@/config/companySettings';

export default function Settings() {
  const { language } = useLanguage();
  const [saving, setSaving] = useState(false);

  // Company settings state (read from config)
  const [company, setCompany] = useState({
    name_en: companySettings.name_en,
    name_ar: companySettings.name_ar,
    establishment_name_en: companySettings.establishment_name_en,
    establishment_name_ar: companySettings.establishment_name_ar,
    street_en: companySettings.street_en,
    street_ar: companySettings.street_ar,
    city_en: companySettings.city_en,
    city_ar: companySettings.city_ar,
    country_en: companySettings.country_en,
    country_ar: companySettings.country_ar,
    vat_number: companySettings.vat_number,
    cr_number: companySettings.cr_number,
  });

  const handleSave = async () => {
    setSaving(true);
    // In a real app, this would save to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(language === 'ar' ? 'تم حفظ الإعدادات' : 'Settings saved');
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'الإعدادات' : 'Settings'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة إعدادات النظام والشركة'
              : 'Manage system and company settings'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            {language === 'ar' ? 'الشركة' : 'Company'}
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4" />
            {language === 'ar' ? 'الفواتير' : 'Invoices'}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            {language === 'ar' ? 'الإشعارات' : 'Notifications'}
          </TabsTrigger>
        </TabsList>

        {/* Company Settings Tab */}
        <TabsContent value="company">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {language === 'ar' ? 'معلومات الشركة' : 'Company Information'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'المعلومات الأساسية للشركة التي تظهر في الفواتير والمستندات'
                    : 'Basic company information that appears on invoices and documents'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}</Label>
                    <Input 
                      value={company.name_ar}
                      onChange={(e) => setCompany({...company, name_ar: e.target.value})}
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'اسم الشركة (إنجليزي)' : 'Company Name (English)'}</Label>
                    <Input 
                      value={company.name_en}
                      onChange={(e) => setCompany({...company, name_en: e.target.value})}
                    />
                  </div>
                </div>

                {/* Establishment Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'اسم المنشأة (عربي)' : 'Establishment Name (Arabic)'}</Label>
                    <Input 
                      value={company.establishment_name_ar}
                      onChange={(e) => setCompany({...company, establishment_name_ar: e.target.value})}
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'اسم المنشأة (إنجليزي)' : 'Establishment Name (English)'}</Label>
                    <Input 
                      value={company.establishment_name_en}
                      onChange={(e) => setCompany({...company, establishment_name_en: e.target.value})}
                    />
                  </div>
                </div>

                <Separator />

                {/* Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الشارع (عربي)' : 'Street (Arabic)'}</Label>
                    <Input 
                      value={company.street_ar}
                      onChange={(e) => setCompany({...company, street_ar: e.target.value})}
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الشارع (إنجليزي)' : 'Street (English)'}</Label>
                    <Input 
                      value={company.street_en}
                      onChange={(e) => setCompany({...company, street_en: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'المدينة (عربي)' : 'City (Arabic)'}</Label>
                    <Input 
                      value={company.city_ar}
                      onChange={(e) => setCompany({...company, city_ar: e.target.value})}
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'المدينة (إنجليزي)' : 'City (English)'}</Label>
                    <Input 
                      value={company.city_en}
                      onChange={(e) => setCompany({...company, city_en: e.target.value})}
                    />
                  </div>
                </div>

                <Separator />

                {/* VAT & CR */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الرقم الضريبي (VAT)' : 'VAT Number'}</Label>
                    <Input 
                      value={company.vat_number}
                      onChange={(e) => setCompany({...company, vat_number: e.target.value})}
                      placeholder="310XXXXXXXXX003"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'السجل التجاري' : 'Commercial Registration'}</Label>
                    <Input 
                      value={company.cr_number}
                      onChange={(e) => setCompany({...company, cr_number: e.target.value})}
                      placeholder="1010XXXXXX"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 me-2" />
                    {saving 
                      ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                      : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Settings Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {language === 'ar' ? 'إعدادات الفواتير' : 'Invoice Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تخصيص شكل ومحتوى الفواتير الضريبية'
                  : 'Customize the appearance and content of tax invoices'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{language === 'ar' ? 'إعدادات الفواتير متاحة في ملف الإعدادات' : 'Invoice settings are configured in the settings file'}</p>
                <p className="text-sm mt-2">src/config/companySettings.ts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                {language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'إدارة إشعارات البريد الإلكتروني والرسائل النصية'
                  : 'Manage email and SMS notification settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{language === 'ar' ? 'قريباً...' : 'Coming soon...'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
