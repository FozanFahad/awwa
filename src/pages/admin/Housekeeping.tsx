import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Check, Sparkles, AlertCircle, Wrench, Building2 } from 'lucide-react';

export default function Housekeeping() {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'ar' ? 'حالة الغرف' : 'Room Status'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'إدارة حالة الغرف والتدبير المنزلي'
            : 'Manage room status and housekeeping'}
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-success mx-auto mb-2 flex items-center justify-center">
              <Check className="h-4 w-4 text-success-foreground" />
            </div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">{language === 'ar' ? 'شاغرة نظيفة' : 'Vacant Clean'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-warning mx-auto mb-2 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-warning-foreground" />
            </div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">{language === 'ar' ? 'شاغرة وسخة' : 'Vacant Dirty'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-info mx-auto mb-2 flex items-center justify-center">
              <Home className="h-4 w-4 text-info-foreground" />
            </div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">{language === 'ar' ? 'مشغولة نظيفة' : 'Occupied Clean'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-destructive mx-auto mb-2 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-destructive-foreground" />
            </div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">{language === 'ar' ? 'مشغولة وسخة' : 'Occupied Dirty'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">{language === 'ar' ? 'خارج الخدمة' : 'Out of Order'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-primary mx-auto mb-2 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">{language === 'ar' ? 'تحت الصيانة' : 'Out of Service'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="py-16 text-center">
          <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {language === 'ar' ? 'لا توجد غرف' : 'No Rooms Available'}
          </h3>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'أضف غرفًا لعرض حالة التدبير المنزلي'
              : 'Add rooms to display housekeeping status'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
