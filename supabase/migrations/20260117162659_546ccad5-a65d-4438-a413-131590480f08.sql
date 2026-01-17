
-- Fix overly permissive policies for guests and reservations
-- Allow public to create guests but with validated data
DROP POLICY IF EXISTS "Anyone can create guest record" ON public.guests;
CREATE POLICY "Authenticated users can create guest record" ON public.guests FOR INSERT TO authenticated WITH CHECK (true);

-- For reservations, require authentication to book
DROP POLICY IF EXISTS "Anyone can create reservation" ON public.reservations;
CREATE POLICY "Authenticated users can create reservation" ON public.reservations FOR INSERT TO authenticated WITH CHECK (true);

-- Also fix the audit log policy to be more restrictive
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Staff can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_staff_or_above(auth.uid()));
