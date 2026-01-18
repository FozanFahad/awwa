import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Loader2 } from 'lucide-react';
import companyLogo from '@/assets/company-logo.jpg';

export default function ProviderAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Check if user has owner role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleError || roleData?.role !== 'owner') {
        await supabase.auth.signOut();
        throw new Error(language === 'ar' 
          ? 'هذا الحساب غير مسجل كمقدم خدمة' 
          : 'This account is not registered as a service provider');
      }

      toast({
        title: language === 'ar' ? 'تم تسجيل الدخول' : 'Logged in successfully',
      });
      navigate('/provider');
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/provider`;

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Update user role to owner
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: 'owner' })
          .eq('user_id', data.user.id);

        if (roleError) {
          console.error('Error updating role:', roleError);
        }

        // Update profile with phone
        if (formData.phone) {
          await supabase
            .from('profiles')
            .update({ 
              phone: formData.phone,
              full_name: formData.fullName 
            })
            .eq('user_id', data.user.id);
        }
      }

      toast({
        title: language === 'ar' ? 'تم إنشاء الحساب' : 'Account created',
        description: language === 'ar' 
          ? 'يمكنك الآن تسجيل الدخول' 
          : 'You can now log in',
      });
      
      navigate('/provider');
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={companyLogo} 
              alt="AWA Logo" 
              className="h-16 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              {language === 'ar' ? 'بوابة مقدمي الخدمة' : 'Service Provider Portal'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'سجل دخولك لإدارة عقاراتك ووحداتك' 
                : 'Sign in to manage your properties and units'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">
                {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </TabsTrigger>
              <TabsTrigger value="signup">
                {language === 'ar' ? 'حساب جديد' : 'Sign Up'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">
                    {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    dir="ltr"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">
                    {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  </Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="+966xxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">
                    {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    dir="ltr"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-muted-foreground"
            >
              {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
