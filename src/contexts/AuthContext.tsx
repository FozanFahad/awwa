import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isStaff: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  userRole: string | null;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role hierarchy for permission checks
const STAFF_ROLES = ['admin', 'operations_manager', 'staff', 'housekeeping', 'maintenance'];
const ADMIN_ROLES = ['admin', 'operations_manager'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  // Computed permissions
  const isStaff = userRole ? STAFF_ROLES.includes(userRole) : false;
  const isAdmin = userRole ? ADMIN_ROLES.includes(userRole) : false;
  const isOwner = userRole === 'owner';

  // Check user role from database
  const checkUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking user role:', error);
        setUserRole(null);
        return;
      }

      setUserRole(data?.role || null);
    } catch (err) {
      console.error('Error in checkUserRole:', err);
      setUserRole(null);
    }
  }, []);

  // Refresh role manually
  const refreshRole = useCallback(async () => {
    if (user) {
      await checkUserRole(user.id);
    }
  }, [user, checkUserRole]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential deadlocks
          setTimeout(() => {
            if (mounted) {
              checkUserRole(session.user.id);
            }
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRole(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkUserRole]);

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        toast({
          title: 'فشل تسجيل الدخول',
          description: getErrorMessage(error.message),
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'تم تسجيل الدخول',
          description: 'مرحباً بعودتك!',
        });
      }

      return { error: error as Error | null };
    } catch (err) {
      const error = err as Error;
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
      return { error };
    }
  };

  // Sign up
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          title: 'فشل إنشاء الحساب',
          description: getErrorMessage(error.message),
          variant: 'destructive',
        });
        return { error: error as Error };
      }

      // Create profile if user was created
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            email: email.trim().toLowerCase(),
            full_name: fullName,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      toast({
        title: 'تم إنشاء الحساب',
        description: 'يرجى تأكيد بريدك الإلكتروني',
      });

      return { error: null };
    } catch (err) {
      const error = err as Error;
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      toast({
        title: 'تم تسجيل الخروج',
        description: 'نراك قريباً!',
      });
    } catch (err) {
      console.error('Error signing out:', err);
      toast({
        title: 'خطأ',
        description: 'فشل تسجيل الخروج',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      isStaff,
      isOwner,
      isAdmin,
      userRole,
      refreshRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to translate error messages
function getErrorMessage(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'بيانات الدخول غير صحيحة',
    'Email not confirmed': 'يرجى تأكيد بريدك الإلكتروني',
    'User already registered': 'البريد الإلكتروني مسجل مسبقاً',
    'Password should be at least 6 characters': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'Email rate limit exceeded': 'تم تجاوز الحد المسموح، حاول لاحقاً',
    'Network request failed': 'فشل الاتصال بالخادم',
  };

  return errorMap[message] || message;
}
