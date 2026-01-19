import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Building2,
  DollarSign,
  Users,
  Settings,
  LogOut,
  Home,
  CheckSquare,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: LayoutDashboard, labelKey: 'Dashboard', path: '/admin' },
  { icon: Users, labelKey: 'Front Desk', path: '/admin/front-desk' },
  { icon: Calendar, labelKey: 'Calendar', path: '/admin/calendar' },
  { icon: ClipboardList, labelKey: 'Reservations', path: '/admin/reservations' },
  { icon: CheckSquare, labelKey: 'Housekeeping', path: '/admin/housekeeping' },
  { icon: DollarSign, labelKey: 'Cashier', path: '/admin/cashier' },
  { icon: Building2, labelKey: 'Properties', path: '/admin/properties' },
  { icon: Building2, labelKey: 'Room Types', path: '/admin/room-types' },
  { icon: Home, labelKey: 'Rooms', path: '/admin/rooms' },
  { icon: Users, labelKey: 'Profiles', path: '/admin/profiles' },
  { icon: Settings, labelKey: 'Settings', path: '/admin/settings' },
];

export function AdminSidebar() {
  const { t, language } = useLanguage();
  const { signOut, user, userRole } = useAuth();
  const location = useLocation();

  const getRoleLabel = (role: string | null) => {
    const labels: Record<string, { en: string; ar: string }> = {
      admin: { en: 'Administrator', ar: 'مدير النظام' },
      operations_manager: { en: 'Operations Manager', ar: 'مدير العمليات' },
      staff: { en: 'Staff', ar: 'موظف' },
      housekeeping: { en: 'Housekeeping', ar: 'التدبير المنزلي' },
      maintenance: { en: 'Maintenance', ar: 'الصيانة' },
    };
    return role ? labels[role]?.[language] || role : '';
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-lg">
            {language === 'ar' ? 'أ' : 'A'}
          </div>
          <div>
            <span className="text-lg font-bold">
              {t('brand.name')}
            </span>
            <p className="text-xs text-sidebar-foreground/60">
              {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.labelKey.startsWith('dashboard.') ? t(item.labelKey) : item.labelKey}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border space-y-4">
        <div className="flex items-center justify-between">
          <LanguageToggle />
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-sidebar-foreground/70 hover:text-sidebar-foreground">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="px-4 py-3 rounded-lg bg-sidebar-accent/30">
          <p className="text-sm font-medium truncate">{user?.email}</p>
          <p className="text-xs text-sidebar-foreground/60">{getRoleLabel(userRole)}</p>
        </div>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
          {t('nav.logout')}
        </Button>
      </div>
    </aside>
  );
}
