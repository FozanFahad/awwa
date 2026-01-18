import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn, LogOut, Building2, Key } from 'lucide-react';

export default function FrontDesk() {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'ar' ? 'مكتب الاستقبال' : 'Front Desk'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'إدارة الوصول والمغادرة والضيوف المقيمين'
            : 'Manage arrivals, departures, and in-house guests'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <LogIn className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'وصول اليوم' : 'Arrivals Today'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Building2 className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'ضيوف مقيمين' : 'In House'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <LogOut className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'مغادرة اليوم' : 'Departures Today'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Key className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'غرف جاهزة' : 'Ready Rooms'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {language === 'ar' ? 'لا توجد بيانات' : 'No Data Available'}
          </h3>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'سيتم عرض بيانات الحجوزات والضيوف هنا'
              : 'Reservation and guest data will be displayed here'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
