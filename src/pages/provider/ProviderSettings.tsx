import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Phone } from 'lucide-react';

export default function ProviderSettings() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['provider-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      toast({
        title: language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'الإعدادات' : 'Settings'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إدارة معلومات حسابك' : 'Manage your account information'}
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
          </CardTitle>
          <CardDescription>
            {language === 'ar' ? 'تحديث معلوماتك الشخصية' : 'Update your personal information'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-muted"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                {language === 'ar' 
                  ? 'لا يمكن تغيير البريد الإلكتروني' 
                  : 'Email cannot be changed'}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              </Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966xxxxxxxxx"
                dir="ltr"
              />
            </div>

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ar' ? 'معلومات الحساب' : 'Account Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">
              {language === 'ar' ? 'نوع الحساب' : 'Account Type'}
            </span>
            <span className="font-medium">
              {language === 'ar' ? 'مقدم خدمة' : 'Service Provider'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">
              {language === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}
            </span>
            <span className="font-medium">
              {profile?.created_at 
                ? new Date(profile.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')
                : '-'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
