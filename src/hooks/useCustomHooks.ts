/**
 * Custom Hooks Collection
 * مجموعة من الـ hooks المفيدة للاستخدام في التطبيق
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Database } from '@/integrations/supabase/types';

type ReservationStatus = Database['public']['Enums']['reservation_status'];
type TaskStatus = Database['public']['Enums']['task_status'];
type TaskType = Database['public']['Enums']['task_type'];

// ============================================
// useReservations - إدارة الحجوزات
// ============================================
export function useReservations(filters?: {
  status?: ReservationStatus;
  unitId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['reservations', filters],
    queryFn: async () => {
      let q = supabase
        .from('reservations')
        .select(`
          *,
          guests (full_name, phone, email),
          units (name_en, name_ar)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        q = q.eq('status', filters.status);
      }
      if (filters?.unitId) {
        q = q.eq('unit_id', filters.unitId);
      }
      if (filters?.startDate) {
        q = q.gte('start_date', filters.startDate);
      }
      if (filters?.endDate) {
        q = q.lte('end_date', filters.endDate);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReservationStatus }) => {
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث الحالة بنجاح' : 'Status updated successfully',
      });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل تحديث الحالة' : 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  return {
    ...query,
    updateStatus: updateStatus.mutate,
    isUpdating: updateStatus.isPending,
  };
}

// ============================================
// useUnits - إدارة الوحدات
// ============================================
export function useUnits(propertyId?: string) {
  return useQuery({
    queryKey: ['units', propertyId],
    queryFn: async () => {
      let q = supabase
        .from('units')
        .select(`
          *,
          properties (name_en, name_ar, city)
        `)
        .order('created_at', { ascending: false });

      if (propertyId) {
        q = q.eq('property_id', propertyId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// ============================================
// useProperties - إدارة العقارات
// ============================================
export function useProperties(ownerId?: string) {
  return useQuery({
    queryKey: ['properties', ownerId],
    queryFn: async () => {
      let q = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (ownerId) {
        q = q.eq('owner_user_id', ownerId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// ============================================
// useTasks - إدارة المهام
// ============================================
export function useTasks(filters?: {
  status?: TaskStatus;
  assignedTo?: string;
  type?: TaskType;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { language } = useLanguage();

  const query = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let q = supabase
        .from('tasks')
        .select(`
          *,
          units (name_en, name_ar)
        `)
        .order('due_at', { ascending: true });

      if (filters?.status) {
        q = q.eq('status', filters.status);
      }
      if (filters?.assignedTo) {
        q = q.eq('assigned_to', filters.assignedTo);
      }
      if (filters?.type) {
        q = q.eq('task_type', filters.type);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, status, ...updates }: { id: string; status?: TaskStatus; [key: string]: unknown }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status, ...updates })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
      });
    },
  });

  return {
    ...query,
    updateTask: updateTask.mutate,
    isUpdating: updateTask.isPending,
  };
}

// ============================================
// useDashboardStats - إحصائيات لوحة التحكم
// ============================================
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const [
        unitsResult,
        arrivalsResult,
        departuresResult,
        pendingTasksResult,
      ] = await Promise.all([
        supabase.from('units').select('id, status'),
        supabase
          .from('reservations')
          .select('id', { count: 'exact', head: true })
          .eq('start_date', today)
          .in('status', ['confirmed', 'pending'] as ReservationStatus[]),
        supabase
          .from('reservations')
          .select('id', { count: 'exact', head: true })
          .eq('end_date', today)
          .eq('status', 'checked_in' as ReservationStatus),
        supabase
          .from('tasks')
          .select('id, priority', { count: 'exact' })
          .eq('status', 'pending' as TaskStatus),
      ]);

      const units = unitsResult.data || [];
      const pendingTasks = pendingTasksResult.data || [];

      return {
        totalUnits: units.length,
        availableUnits: units.filter(u => u.status === 'available').length,
        occupiedUnits: units.filter(u => u.status === 'occupied').length,
        maintenanceUnits: units.filter(u => u.status === 'maintenance').length,
        todayArrivals: arrivalsResult.count || 0,
        todayDepartures: departuresResult.count || 0,
        pendingTasks: pendingTasksResult.count || 0,
        urgentTasks: pendingTasks.filter(t => t.priority === 'urgent').length,
        occupancyRate: units.length > 0
          ? Math.round((units.filter(u => u.status === 'occupied').length / units.length) * 100)
          : 0,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================
// useLocalStorage - تخزين محلي
// ============================================
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// ============================================
// useDebounce - تأخير القيمة
// ============================================
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// useOnline - حالة الاتصال
// ============================================
export function useOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// ============================================
// useMediaQuery - استعلام الوسائط
// ============================================
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
