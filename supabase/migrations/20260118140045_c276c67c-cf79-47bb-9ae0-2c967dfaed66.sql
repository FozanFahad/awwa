-- Add owner_user_id to properties table to link properties to owners
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_properties_owner_user_id ON public.properties(owner_user_id);

-- Create function to check if user is property owner
CREATE OR REPLACE FUNCTION public.is_property_owner(_user_id uuid, _property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.properties
    WHERE id = _property_id
      AND owner_user_id = _user_id
  )
$$;

-- Create function to check if user has owner role
CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'owner'
  )
$$;

-- RLS Policy: Owners can view their own properties
CREATE POLICY "Owners can view their own properties"
ON public.properties
FOR SELECT
USING (owner_user_id = auth.uid());

-- RLS Policy: Owners can insert their own properties
CREATE POLICY "Owners can insert their own properties"
ON public.properties
FOR INSERT
WITH CHECK (owner_user_id = auth.uid() AND is_owner(auth.uid()));

-- RLS Policy: Owners can update their own properties
CREATE POLICY "Owners can update their own properties"
ON public.properties
FOR UPDATE
USING (owner_user_id = auth.uid() AND is_owner(auth.uid()));

-- RLS Policy: Owners can delete their own properties
CREATE POLICY "Owners can delete their own properties"
ON public.properties
FOR DELETE
USING (owner_user_id = auth.uid() AND is_owner(auth.uid()));

-- Add owner_user_id to units table
ALTER TABLE public.units 
ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_units_owner_user_id ON public.units(owner_user_id);

-- RLS Policy: Owners can view their own units
CREATE POLICY "Owners can view their own units"
ON public.units
FOR SELECT
USING (owner_user_id = auth.uid());

-- RLS Policy: Owners can insert their own units
CREATE POLICY "Owners can insert their own units"
ON public.units
FOR INSERT
WITH CHECK (owner_user_id = auth.uid() AND is_owner(auth.uid()));

-- RLS Policy: Owners can update their own units
CREATE POLICY "Owners can update their own units"
ON public.units
FOR UPDATE
USING (owner_user_id = auth.uid() AND is_owner(auth.uid()));

-- RLS Policy: Owners can delete their own units
CREATE POLICY "Owners can delete their own units"
ON public.units
FOR DELETE
USING (owner_user_id = auth.uid() AND is_owner(auth.uid()));