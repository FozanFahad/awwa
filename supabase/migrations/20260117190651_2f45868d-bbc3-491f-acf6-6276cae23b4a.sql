-- =====================================================
-- AWA PMS - ENTERPRISE SCHEMA PHASE 1
-- =====================================================

-- Add property feature flags
CREATE TABLE public.property_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(property_id, feature_key)
);

-- Room Types (replaces unit_type text field with proper table)
CREATE TABLE public.room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    base_occupancy INTEGER NOT NULL DEFAULT 2,
    max_occupancy INTEGER NOT NULL DEFAULT 4,
    extra_adult_rate NUMERIC DEFAULT 0,
    extra_child_rate NUMERIC DEFAULT 0,
    bedrooms INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER NOT NULL DEFAULT 1,
    size_m2 NUMERIC,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(property_id, code)
);

-- Rooms (individual room instances)
CREATE TYPE public.room_status AS ENUM ('vacant_clean', 'vacant_dirty', 'occupied_clean', 'occupied_dirty', 'out_of_order', 'out_of_service');
CREATE TYPE public.fo_status AS ENUM ('vacant', 'occupied', 'due_out', 'checked_out');

CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE RESTRICT,
    room_number TEXT NOT NULL,
    floor INTEGER,
    building TEXT,
    wing TEXT,
    room_status public.room_status NOT NULL DEFAULT 'vacant_clean',
    fo_status public.fo_status NOT NULL DEFAULT 'vacant',
    is_active BOOLEAN NOT NULL DEFAULT true,
    features JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(property_id, room_number)
);

-- Company profiles (corporate accounts)
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code TEXT,
    name_en TEXT NOT NULL,
    name_ar TEXT,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'SA',
    vat_number TEXT,
    credit_limit NUMERIC DEFAULT 0,
    payment_terms INTEGER DEFAULT 30,
    ar_balance NUMERIC DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Travel Agent profiles
CREATE TABLE public.travel_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_code TEXT,
    name_en TEXT NOT NULL,
    name_ar TEXT,
    iata_number TEXT,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'SA',
    commission_rate NUMERIC DEFAULT 10,
    credit_limit NUMERIC DEFAULT 0,
    payment_terms INTEGER DEFAULT 30,
    ar_balance NUMERIC DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add company/TA links to reservations
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS travel_agent_id UUID REFERENCES public.travel_agents(id),
ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES public.rooms(id),
ADD COLUMN IF NOT EXISTS room_type_id UUID REFERENCES public.room_types(id),
ADD COLUMN IF NOT EXISTS market_segment TEXT DEFAULT 'FIT',
ADD COLUMN IF NOT EXISTS source_code TEXT DEFAULT 'DIRECT',
ADD COLUMN IF NOT EXISTS rate_code TEXT,
ADD COLUMN IF NOT EXISTS arrival_time TIME,
ADD COLUMN IF NOT EXISTS departure_time TIME,
ADD COLUMN IF NOT EXISTS eta TEXT,
ADD COLUMN IF NOT EXISTS vip_code TEXT,
ADD COLUMN IF NOT EXISTS is_walk_in BOOLEAN DEFAULT false;

-- Folios (guest bills/accounts)
CREATE TYPE public.folio_status AS ENUM ('open', 'closed', 'transferred', 'settled');

CREATE TABLE public.folios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE RESTRICT,
    folio_number TEXT NOT NULL,
    folio_type TEXT NOT NULL DEFAULT 'GUEST',
    guest_id UUID REFERENCES public.guests(id),
    company_id UUID REFERENCES public.companies(id),
    status public.folio_status NOT NULL DEFAULT 'open',
    balance NUMERIC NOT NULL DEFAULT 0,
    credit_limit NUMERIC DEFAULT 0,
    notes TEXT,
    closed_at TIMESTAMPTZ,
    closed_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transaction codes (for postings)
CREATE TABLE public.transaction_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name_en TEXT NOT NULL,
    name_ar TEXT,
    category TEXT NOT NULL,
    is_revenue BOOLEAN NOT NULL DEFAULT true,
    is_tax_exempt BOOLEAN NOT NULL DEFAULT false,
    default_amount NUMERIC,
    gl_account TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Folio postings/transactions
CREATE TYPE public.posting_type AS ENUM ('charge', 'payment', 'adjustment', 'transfer');

CREATE TABLE public.folio_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio_id UUID NOT NULL REFERENCES public.folios(id) ON DELETE RESTRICT,
    posting_type public.posting_type NOT NULL,
    transaction_code_id UUID REFERENCES public.transaction_codes(id),
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    tax_amount NUMERIC DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    reference TEXT,
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    posted_by UUID,
    reversed_by UUID,
    reversed_at TIMESTAMPTZ,
    is_reversed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Housekeeping assignments
CREATE TABLE public.housekeeping_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    assigned_to UUID,
    assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    priority TEXT DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(room_id, assignment_date)
);

-- Room status change log
CREATE TABLE public.room_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    old_status public.room_status,
    new_status public.room_status NOT NULL,
    changed_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ZATCA invoice fields (placeholder)
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS zatca_uuid UUID,
ADD COLUMN IF NOT EXISTS zatca_hash TEXT,
ADD COLUMN IF NOT EXISTS zatca_qr_code TEXT,
ADD COLUMN IF NOT EXISTS seller_vat_number TEXT,
ADD COLUMN IF NOT EXISTS buyer_vat_number TEXT,
ADD COLUMN IF NOT EXISTS invoice_type TEXT DEFAULT 'standard';

-- Webhook configurations
CREATE TABLE public.webhook_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    url TEXT NOT NULL,
    secret_key TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    headers JSONB DEFAULT '{}',
    retry_count INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook delivery logs
CREATE TABLE public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_config_id UUID REFERENCES public.webhook_configs(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    attempts INTEGER DEFAULT 1,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folio_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Property Features
CREATE POLICY "Anyone can view property features" ON public.property_features FOR SELECT USING (true);
CREATE POLICY "Staff can manage property features" ON public.property_features FOR ALL USING (is_staff_or_above(auth.uid()));

-- Room Types
CREATE POLICY "Anyone can view room types" ON public.room_types FOR SELECT USING (true);
CREATE POLICY "Staff can manage room types" ON public.room_types FOR ALL USING (is_staff_or_above(auth.uid()));

-- Rooms
CREATE POLICY "Anyone can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Staff can manage rooms" ON public.rooms FOR ALL USING (is_staff_or_above(auth.uid()));

-- Companies
CREATE POLICY "Staff can view companies" ON public.companies FOR SELECT USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Staff can manage companies" ON public.companies FOR ALL USING (is_staff_or_above(auth.uid()));

-- Travel Agents
CREATE POLICY "Staff can view travel agents" ON public.travel_agents FOR SELECT USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Staff can manage travel agents" ON public.travel_agents FOR ALL USING (is_staff_or_above(auth.uid()));

-- Folios
CREATE POLICY "Staff can view folios" ON public.folios FOR SELECT USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Staff can manage folios" ON public.folios FOR ALL USING (is_staff_or_above(auth.uid()));

-- Transaction Codes
CREATE POLICY "Anyone can view transaction codes" ON public.transaction_codes FOR SELECT USING (true);
CREATE POLICY "Admin can manage transaction codes" ON public.transaction_codes FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Folio Postings
CREATE POLICY "Staff can view postings" ON public.folio_postings FOR SELECT USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Staff can manage postings" ON public.folio_postings FOR ALL USING (is_staff_or_above(auth.uid()));

-- Housekeeping Assignments
CREATE POLICY "Staff can view hk assignments" ON public.housekeeping_assignments FOR SELECT USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Assigned user can view their assignments" ON public.housekeeping_assignments FOR SELECT USING (assigned_to = auth.uid());
CREATE POLICY "Assigned user can update their assignments" ON public.housekeeping_assignments FOR UPDATE USING (assigned_to = auth.uid());
CREATE POLICY "Staff can manage hk assignments" ON public.housekeeping_assignments FOR ALL USING (is_staff_or_above(auth.uid()));

-- Room Status Logs
CREATE POLICY "Staff can view room status logs" ON public.room_status_logs FOR SELECT USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Staff can insert room status logs" ON public.room_status_logs FOR INSERT WITH CHECK (is_staff_or_above(auth.uid()));

-- Webhook Configs
CREATE POLICY "Admin can manage webhook configs" ON public.webhook_configs FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Webhook Logs
CREATE POLICY "Admin can view webhook logs" ON public.webhook_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert webhook logs" ON public.webhook_logs FOR INSERT WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_property_features_updated_at BEFORE UPDATE ON public.property_features FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_room_types_updated_at BEFORE UPDATE ON public.room_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_travel_agents_updated_at BEFORE UPDATE ON public.travel_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_folios_updated_at BEFORE UPDATE ON public.folios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hk_assignments_updated_at BEFORE UPDATE ON public.housekeeping_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_webhook_configs_updated_at BEFORE UPDATE ON public.webhook_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log room status changes
CREATE OR REPLACE FUNCTION public.log_room_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF OLD.room_status IS DISTINCT FROM NEW.room_status THEN
        INSERT INTO public.room_status_logs (room_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.room_status, NEW.room_status, auth.uid());
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER log_room_status_change_trigger
AFTER UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.log_room_status_change();

-- Function to update folio balance on posting
CREATE OR REPLACE FUNCTION public.update_folio_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    amount_change NUMERIC;
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.posting_type = 'charge' OR NEW.posting_type = 'adjustment' THEN
            amount_change := NEW.amount + COALESCE(NEW.tax_amount, 0);
        ELSE
            amount_change := -(NEW.amount + COALESCE(NEW.tax_amount, 0));
        END IF;
        
        UPDATE public.folios SET balance = balance + amount_change WHERE id = NEW.folio_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_folio_balance_trigger
AFTER INSERT ON public.folio_postings
FOR EACH ROW
EXECUTE FUNCTION public.update_folio_balance();

-- Seed default transaction codes
INSERT INTO public.transaction_codes (code, name_en, name_ar, category, is_revenue, default_amount) VALUES
('ROOM', 'Room Charge', 'رسوم الغرفة', 'accommodation', true, NULL),
('XBED', 'Extra Bed', 'سرير إضافي', 'accommodation', true, 100),
('BKFT', 'Breakfast', 'إفطار', 'food_beverage', true, 75),
('LNCH', 'Lunch', 'غداء', 'food_beverage', true, 120),
('DNIR', 'Dinner', 'عشاء', 'food_beverage', true, 150),
('MINI', 'Minibar', 'ميني بار', 'food_beverage', true, NULL),
('LNDY', 'Laundry', 'غسيل', 'services', true, NULL),
('PARK', 'Parking', 'موقف سيارات', 'services', true, 50),
('WIFI', 'WiFi Premium', 'واي فاي مميز', 'services', true, 25),
('TEL', 'Telephone', 'هاتف', 'telecom', true, NULL),
('CASH', 'Cash Payment', 'دفع نقدي', 'payment', false, NULL),
('CARD', 'Credit Card', 'بطاقة ائتمان', 'payment', false, NULL),
('CITY', 'City Ledger Transfer', 'تحويل حساب مدين', 'payment', false, NULL),
('ADJ', 'Adjustment', 'تعديل', 'adjustment', true, NULL);