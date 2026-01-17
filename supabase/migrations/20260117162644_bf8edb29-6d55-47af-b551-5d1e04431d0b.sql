
-- Create enums for various statuses
CREATE TYPE public.app_role AS ENUM ('admin', 'operations_manager', 'staff', 'housekeeping', 'maintenance');
CREATE TYPE public.unit_status AS ENUM ('available', 'occupied', 'maintenance', 'blocked');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show');
CREATE TYPE public.payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded', 'failed');
CREATE TYPE public.task_type AS ENUM ('housekeeping', 'maintenance');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.message_channel AS ENUM ('email', 'sms', 'whatsapp');
CREATE TYPE public.message_status AS ENUM ('pending', 'sent', 'delivered', 'failed');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'staff',
    UNIQUE (user_id, role)
);

-- Profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    full_name_ar TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Properties (buildings/complexes)
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT,
    address TEXT,
    address_ar TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description_en TEXT,
    description_ar TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Units (individual apartments)
CREATE TABLE public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    unit_type TEXT NOT NULL DEFAULT 'apartment',
    capacity INT NOT NULL DEFAULT 2,
    bedrooms INT NOT NULL DEFAULT 1,
    bathrooms INT NOT NULL DEFAULT 1,
    size_m2 DECIMAL(10, 2),
    floor INT,
    status unit_status NOT NULL DEFAULT 'available',
    description_en TEXT,
    description_ar TEXT,
    house_rules_en TEXT,
    house_rules_ar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unit photos
CREATE TABLE public.unit_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Amenities
CREATE TABLE public.amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    icon TEXT,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unit amenities (junction table)
CREATE TABLE public.unit_amenities (
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
    amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (unit_id, amenity_id)
);

-- Rate plans
CREATE TABLE public.rate_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT,
    currency TEXT NOT NULL DEFAULT 'SAR',
    base_rate DECIMAL(10, 2) NOT NULL,
    cleaning_fee DECIMAL(10, 2) DEFAULT 0,
    weekend_rate DECIMAL(10, 2),
    min_nights INT DEFAULT 1,
    max_nights INT,
    cancellation_policy TEXT DEFAULT 'flexible',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unit rate plans (junction table)
CREATE TABLE public.unit_rate_plans (
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
    rate_plan_id UUID REFERENCES public.rate_plans(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (unit_id, rate_plan_id)
);

-- Availability blocks
CREATE TABLE public.availability_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Guests
CREATE TABLE public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    nationality TEXT,
    id_number TEXT,
    id_type TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reservations
CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confirmation_code TEXT UNIQUE NOT NULL DEFAULT 'AWA-' || substr(gen_random_uuid()::text, 1, 8),
    unit_id UUID REFERENCES public.units(id) ON DELETE RESTRICT NOT NULL,
    guest_id UUID REFERENCES public.guests(id) ON DELETE RESTRICT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    nights INT GENERATED ALWAYS AS (end_date - start_date) STORED,
    adults INT NOT NULL DEFAULT 1,
    children INT NOT NULL DEFAULT 0,
    status reservation_status NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    taxes_amount DECIMAL(10, 2) DEFAULT 0,
    fees_amount DECIMAL(10, 2) DEFAULT 0,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    special_requests TEXT,
    internal_notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method TEXT NOT NULL,
    provider_ref TEXT,
    status payment_status NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoices
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE NOT NULL,
    invoice_no TEXT UNIQUE NOT NULL DEFAULT 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 4),
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks (housekeeping & maintenance)
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
    task_type task_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority task_priority NOT NULL DEFAULT 'medium',
    status task_status NOT NULL DEFAULT 'pending',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Task attachments
CREATE TABLE public.task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    filename TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE NOT NULL,
    channel message_channel NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    status message_status NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_rate_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is staff or above
CREATE OR REPLACE FUNCTION public.is_staff_or_above(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS Policies

-- Profiles: users can read their own, staff can read all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- User roles: only admins can manage, users can view their own
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Properties: public read, staff can manage
CREATE POLICY "Anyone can view properties" ON public.properties FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff can manage properties" ON public.properties FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Units: public read, staff can manage
CREATE POLICY "Anyone can view units" ON public.units FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff can manage units" ON public.units FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Unit photos: public read, staff can manage
CREATE POLICY "Anyone can view unit photos" ON public.unit_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff can manage unit photos" ON public.unit_photos FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Amenities: public read, staff can manage
CREATE POLICY "Anyone can view amenities" ON public.amenities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff can manage amenities" ON public.amenities FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Unit amenities: public read, staff can manage
CREATE POLICY "Anyone can view unit amenities" ON public.unit_amenities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff can manage unit amenities" ON public.unit_amenities FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Rate plans: public read, staff can manage
CREATE POLICY "Anyone can view rate plans" ON public.rate_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff can manage rate plans" ON public.rate_plans FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Unit rate plans: public read, staff can manage
CREATE POLICY "Anyone can view unit rate plans" ON public.unit_rate_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff can manage unit rate plans" ON public.unit_rate_plans FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Availability blocks: public read, staff can manage
CREATE POLICY "Anyone can view availability blocks" ON public.availability_blocks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff can manage availability blocks" ON public.availability_blocks FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Guests: guests can view own, staff can view all
CREATE POLICY "Guests can view own record" ON public.guests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Guests can update own record" ON public.guests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create guest record" ON public.guests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can view all guests" ON public.guests FOR SELECT TO authenticated USING (public.is_staff_or_above(auth.uid()));
CREATE POLICY "Staff can manage guests" ON public.guests FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Reservations: guests can view own, staff can manage all
CREATE POLICY "Guests can view own reservations" ON public.reservations FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.guests WHERE guests.id = reservations.guest_id AND guests.user_id = auth.uid()));
CREATE POLICY "Anyone can create reservation" ON public.reservations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can view all reservations" ON public.reservations FOR SELECT TO authenticated USING (public.is_staff_or_above(auth.uid()));
CREATE POLICY "Staff can manage reservations" ON public.reservations FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Payments: staff only
CREATE POLICY "Staff can manage payments" ON public.payments FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Invoices: guests can view own, staff can manage
CREATE POLICY "Guests can view own invoices" ON public.invoices FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.reservations r JOIN public.guests g ON r.guest_id = g.id WHERE r.id = invoices.reservation_id AND g.user_id = auth.uid()));
CREATE POLICY "Staff can manage invoices" ON public.invoices FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Tasks: assigned users can view/update, staff can manage
CREATE POLICY "Assigned users can view tasks" ON public.tasks FOR SELECT TO authenticated USING (assigned_to = auth.uid());
CREATE POLICY "Assigned users can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (assigned_to = auth.uid());
CREATE POLICY "Staff can manage tasks" ON public.tasks FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Task attachments: follows task access
CREATE POLICY "Users can view task attachments" ON public.task_attachments FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_attachments.task_id AND (tasks.assigned_to = auth.uid() OR public.is_staff_or_above(auth.uid()))));
CREATE POLICY "Staff can manage task attachments" ON public.task_attachments FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Messages: staff only
CREATE POLICY "Staff can manage messages" ON public.messages FOR ALL TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- Audit logs: staff can view, system inserts
CREATE POLICY "Staff can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_staff_or_above(auth.uid()));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rate_plans_updated_at BEFORE UPDATE ON public.rate_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create housekeeping task when reservation is confirmed
CREATE OR REPLACE FUNCTION public.create_housekeeping_task_on_confirm()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        INSERT INTO public.tasks (unit_id, reservation_id, task_type, title, priority, due_at)
        VALUES (NEW.unit_id, NEW.id, 'housekeeping', 'Prepare unit for guest', 'high', NEW.start_date::timestamptz);
        
        INSERT INTO public.tasks (unit_id, reservation_id, task_type, title, priority, due_at)
        VALUES (NEW.unit_id, NEW.id, 'housekeeping', 'Checkout cleaning', 'high', NEW.end_date::timestamptz);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER create_housekeeping_on_reservation_confirm
AFTER INSERT OR UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.create_housekeeping_task_on_confirm();

-- Audit log trigger for reservations
CREATE OR REPLACE FUNCTION public.log_reservation_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO public.audit_logs (entity_type, entity_id, action, old_value, new_value, actor_user_id)
        VALUES ('reservation', NEW.id, 'status_change', 
                jsonb_build_object('status', OLD.status), 
                jsonb_build_object('status', NEW.status),
                auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER audit_reservation_changes
AFTER UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.log_reservation_changes();

-- Create indexes for performance
CREATE INDEX idx_units_property_id ON public.units(property_id);
CREATE INDEX idx_units_status ON public.units(status);
CREATE INDEX idx_reservations_unit_id ON public.reservations(unit_id);
CREATE INDEX idx_reservations_guest_id ON public.reservations(guest_id);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_dates ON public.reservations(start_date, end_date);
CREATE INDEX idx_tasks_unit_id ON public.tasks(unit_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
