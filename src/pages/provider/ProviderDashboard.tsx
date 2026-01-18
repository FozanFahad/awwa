import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Home, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProviderDashboard() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['provider-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [propertiesRes, unitsRes] = await Promise.all([
        supabase
          .from('properties')
          .select('id', { count: 'exact' })
          .eq('owner_user_id', user.id),
        supabase
          .from('units')
          .select('id, status', { count: 'exact' })
          .eq('owner_user_id', user.id),
      ]);

      return {
        propertiesCount: propertiesRes.count || 0,
        unitsCount: unitsRes.count || 0,
        availableUnits: unitsRes.data?.filter(u => u.status === 'available').length || 0,
        occupiedUnits: unitsRes.data?.filter(u => u.status === 'occupied').length || 0,
      };
    },
    enabled: !!user,
  });

  const { data: recentProperties } = useQuery({
    queryKey: ['provider-recent-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'مرحباً بك' : 'Welcome'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'إدارة عقاراتك ووحداتك من هنا' 
            : 'Manage your properties and units from here'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === 'ar' ? 'العقارات' : 'Properties'}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.propertiesCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === 'ar' ? 'الوحدات' : 'Units'}
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.unitsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === 'ar' ? 'متاحة' : 'Available'}
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats?.availableUnits || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === 'ar' ? 'مشغولة' : 'Occupied'}
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">{stats?.occupiedUnits || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/provider/properties')}>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {language === 'ar' ? 'إضافة عقار جديد' : 'Add New Property'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'أضف عقارك للمنصة' : 'Add your property to the platform'}
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/provider/units')}>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {language === 'ar' ? 'إضافة وحدة جديدة' : 'Add New Unit'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'أضف وحدة سكنية لعقارك' : 'Add a unit to your property'}
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Properties */}
      {recentProperties && recentProperties.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {language === 'ar' ? 'آخر العقارات' : 'Recent Properties'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/provider/properties')}>
              {language === 'ar' ? 'عرض الكل' : 'View All'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProperties.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <h4 className="font-medium">
                      {language === 'ar' ? property.name_ar : property.name_en}
                    </h4>
                    <p className="text-sm text-muted-foreground">{property.city}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/provider/properties')}>
                    {language === 'ar' ? 'عرض' : 'View'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {stats?.propertiesCount === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {language === 'ar' ? 'لا توجد عقارات بعد' : 'No properties yet'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {language === 'ar' 
                ? 'ابدأ بإضافة أول عقار لك على المنصة' 
                : 'Start by adding your first property to the platform'}
            </p>
            <Button onClick={() => navigate('/provider/properties')}>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'إضافة عقار' : 'Add Property'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
