import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function AdminLayout() {
  const { user, loading, isStaff, userRole } = useAuth();
  const { language } = useLanguage();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === 'ar' ? 'جاري التحقق...' : 'Verifying access...'}
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Authenticated but not staff - show access denied
  if (!isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {language === 'ar' ? 'غير مصرح بالوصول' : 'Access Denied'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'ar' 
              ? 'ليس لديك صلاحية للوصول إلى لوحة الإدارة. يرجى التواصل مع المسؤول.'
              : 'You do not have permission to access the admin panel. Please contact the administrator.'}
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/">
              <Button variant="outline">
                {language === 'ar' ? 'العودة للرئيسية' : 'Go Home'}
              </Button>
            </Link>
            <Link to="/provider">
              <Button className="btn-gold">
                {language === 'ar' ? 'بوابة مقدمي الخدمة' : 'Provider Portal'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check for specific admin roles if needed
  const allowedRoles = ['admin', 'operations_manager', 'staff', 'housekeeping', 'maintenance'];
  if (userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {language === 'ar' ? 'صلاحيات غير كافية' : 'Insufficient Permissions'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'ar' 
              ? 'دورك الحالي لا يسمح بالوصول لهذه الصفحة.'
              : 'Your current role does not allow access to this page.'}
          </p>
          <Link to="/">
            <Button variant="outline">
              {language === 'ar' ? 'العودة للرئيسية' : 'Go Home'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
