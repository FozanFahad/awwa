import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Home, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  Settings,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import companyLogo from '@/assets/company-logo.jpg';
import { LanguageToggle } from '@/components/LanguageToggle';

const menuItems = [
  { icon: LayoutDashboard, labelEn: 'Dashboard', labelAr: 'لوحة التحكم', path: '/provider' },
  { icon: Building2, labelEn: 'Properties', labelAr: 'العقارات', path: '/provider/properties' },
  { icon: Home, labelEn: 'Units', labelAr: 'الوحدات', path: '/provider/units' },
  { icon: BarChart3, labelEn: 'Reports', labelAr: 'التقارير', path: '/provider/reports' },
  { icon: Settings, labelEn: 'Settings', labelAr: 'الإعدادات', path: '/provider/settings' },
];

export function ProviderLayout() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const checkOwnerRole = async () => {
      if (!user) {
        navigate('/provider/auth');
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error || data?.role !== 'owner') {
        navigate('/provider/auth');
        return;
      }

      setIsOwner(true);
    };

    checkOwnerRole();
  }, [user, navigate]);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, [window.location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/provider/auth');
  };

  if (isOwner === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <img src={companyLogo} alt="AWA" className="h-10 w-auto" />
              <div>
                <h1 className="font-bold text-lg">AWA | أوى</h1>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'بوابة مقدمي الخدمة' : 'Provider Portal'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-primary/10 text-primary"
                  )}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  {language === 'ar' ? item.labelAr : item.labelEn}
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-3">
            <LanguageToggle />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
