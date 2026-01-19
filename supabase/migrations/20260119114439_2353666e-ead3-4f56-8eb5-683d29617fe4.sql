-- Fix 1: Drop the overly permissive guest insert policy and restrict to staff only
DROP POLICY IF EXISTS "Authenticated users can create guest record" ON public.guests;

-- Guests should only be created by staff or by the user creating their own record
CREATE POLICY "Staff can create guests" ON public.guests
FOR INSERT
WITH CHECK (is_staff_or_above(auth.uid()));

-- Allow users to create their own guest profile (linking their user_id)
CREATE POLICY "Users can create own guest record" ON public.guests
FOR INSERT
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

-- Fix 2: Drop the overly permissive reservation insert policy and restrict to staff only
DROP POLICY IF EXISTS "Authenticated users can create reservation" ON public.reservations;

-- Only staff can create reservations (guests book through staff or booking flow)
CREATE POLICY "Staff can create reservations" ON public.reservations
FOR INSERT
WITH CHECK (is_staff_or_above(auth.uid()));