-- Fix overly permissive RLS policies

-- Drop the permissive webhook_logs INSERT policy
DROP POLICY IF EXISTS "System can insert webhook logs" ON public.webhook_logs;

-- Create a more restrictive policy - only staff can insert webhook logs
CREATE POLICY "Staff can insert webhook logs" ON public.webhook_logs FOR INSERT WITH CHECK (is_staff_or_above(auth.uid()));

-- The other warnings are about existing policies from prior migrations (guests and reservations)
-- These are intentional for authenticated users to create their own records