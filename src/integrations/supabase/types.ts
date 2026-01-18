export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      amenities: {
        Row: {
          category: string | null
          created_at: string
          icon: string | null
          id: string
          name_ar: string
          name_en: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name_ar: string
          name_en: string
        }
        Update: {
          category?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name_ar?: string
          name_en?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      availability_blocks: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          reason: string | null
          start_date: string
          unit_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          unit_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          ar_balance: number | null
          city: string | null
          company_code: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          credit_limit: number | null
          email: string | null
          id: string
          is_active: boolean
          name_ar: string | null
          name_en: string
          notes: string | null
          payment_terms: number | null
          phone: string | null
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          ar_balance?: number | null
          city?: string | null
          company_code?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string | null
          name_en: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          ar_balance?: number | null
          city?: string | null
          company_code?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string | null
          name_en?: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      folio_postings: {
        Row: {
          amount: number
          created_at: string
          description: string
          folio_id: string
          id: string
          is_reversed: boolean
          posted_by: string | null
          posting_date: string
          posting_type: Database["public"]["Enums"]["posting_type"]
          quantity: number | null
          reference: string | null
          reversed_at: string | null
          reversed_by: string | null
          tax_amount: number | null
          transaction_code_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          folio_id: string
          id?: string
          is_reversed?: boolean
          posted_by?: string | null
          posting_date?: string
          posting_type: Database["public"]["Enums"]["posting_type"]
          quantity?: number | null
          reference?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          tax_amount?: number | null
          transaction_code_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          folio_id?: string
          id?: string
          is_reversed?: boolean
          posted_by?: string | null
          posting_date?: string
          posting_type?: Database["public"]["Enums"]["posting_type"]
          quantity?: number | null
          reference?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          tax_amount?: number | null
          transaction_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folio_postings_folio_id_fkey"
            columns: ["folio_id"]
            isOneToOne: false
            referencedRelation: "folios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folio_postings_transaction_code_id_fkey"
            columns: ["transaction_code_id"]
            isOneToOne: false
            referencedRelation: "transaction_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      folios: {
        Row: {
          balance: number
          closed_at: string | null
          closed_by: string | null
          company_id: string | null
          created_at: string
          credit_limit: number | null
          folio_number: string
          folio_type: string
          guest_id: string | null
          id: string
          notes: string | null
          reservation_id: string
          status: Database["public"]["Enums"]["folio_status"]
          updated_at: string
        }
        Insert: {
          balance?: number
          closed_at?: string | null
          closed_by?: string | null
          company_id?: string | null
          created_at?: string
          credit_limit?: number | null
          folio_number: string
          folio_type?: string
          guest_id?: string | null
          id?: string
          notes?: string | null
          reservation_id: string
          status?: Database["public"]["Enums"]["folio_status"]
          updated_at?: string
        }
        Update: {
          balance?: number
          closed_at?: string | null
          closed_by?: string | null
          company_id?: string | null
          created_at?: string
          credit_limit?: number | null
          folio_number?: string
          folio_type?: string
          guest_id?: string | null
          id?: string
          notes?: string | null
          reservation_id?: string
          status?: Database["public"]["Enums"]["folio_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "folios_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folios_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folios_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          id_number: string | null
          id_type: string | null
          nationality: string | null
          notes: string | null
          phone: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          nationality?: string | null
          notes?: string | null
          phone: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      housekeeping_assignments: {
        Row: {
          assigned_to: string | null
          assignment_date: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          priority: string | null
          room_id: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          assignment_date?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          priority?: string | null
          room_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          assignment_date?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          priority?: string | null
          room_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_assignments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          buyer_vat_number: string | null
          created_at: string
          due_at: string | null
          id: string
          invoice_no: string
          invoice_type: string | null
          issued_at: string
          notes: string | null
          paid_at: string | null
          reservation_id: string
          seller_vat_number: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          zatca_hash: string | null
          zatca_qr_code: string | null
          zatca_uuid: string | null
        }
        Insert: {
          buyer_vat_number?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          invoice_no?: string
          invoice_type?: string | null
          issued_at?: string
          notes?: string | null
          paid_at?: string | null
          reservation_id: string
          seller_vat_number?: string | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          zatca_hash?: string | null
          zatca_qr_code?: string | null
          zatca_uuid?: string | null
        }
        Update: {
          buyer_vat_number?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          invoice_no?: string
          invoice_type?: string | null
          issued_at?: string
          notes?: string | null
          paid_at?: string | null
          reservation_id?: string
          seller_vat_number?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          zatca_hash?: string | null
          zatca_qr_code?: string | null
          zatca_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          channel: Database["public"]["Enums"]["message_channel"]
          content: string
          created_at: string
          error_message: string | null
          id: string
          recipient: string
          reservation_id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["message_status"]
          subject: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["message_channel"]
          content: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient: string
          reservation_id: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["message_channel"]
          content?: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient?: string
          reservation_id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          notes: string | null
          paid_at: string | null
          provider_ref: string | null
          reservation_id: string
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: string
          notes?: string | null
          paid_at?: string | null
          provider_ref?: string | null
          reservation_id: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          notes?: string | null
          paid_at?: string | null
          provider_ref?: string | null
          reservation_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          full_name_ar: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          full_name_ar?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          full_name_ar?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          address_ar: string | null
          city: string
          cover_image_url: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          district: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name_ar: string
          name_en: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          city: string
          cover_image_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          district?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name_ar: string
          name_en: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          city?: string
          cover_image_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          district?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name_ar?: string
          name_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      property_features: {
        Row: {
          config: Json | null
          created_at: string
          feature_key: string
          id: string
          is_enabled: boolean
          property_id: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          feature_key: string
          id?: string
          is_enabled?: boolean
          property_id: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          feature_key?: string
          id?: string
          is_enabled?: boolean
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_features_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_plans: {
        Row: {
          base_rate: number
          cancellation_policy: string | null
          cleaning_fee: number | null
          created_at: string
          currency: string
          id: string
          is_active: boolean | null
          max_nights: number | null
          min_nights: number | null
          name_ar: string | null
          name_en: string
          property_id: string
          updated_at: string
          weekend_rate: number | null
        }
        Insert: {
          base_rate: number
          cancellation_policy?: string | null
          cleaning_fee?: number | null
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean | null
          max_nights?: number | null
          min_nights?: number | null
          name_ar?: string | null
          name_en: string
          property_id: string
          updated_at?: string
          weekend_rate?: number | null
        }
        Update: {
          base_rate?: number
          cancellation_policy?: string | null
          cleaning_fee?: number | null
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean | null
          max_nights?: number | null
          min_nights?: number | null
          name_ar?: string | null
          name_en?: string
          property_id?: string
          updated_at?: string
          weekend_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_plans_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          adults: number
          arrival_time: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          checked_in_at: string | null
          checked_out_at: string | null
          children: number
          company_id: string | null
          confirmation_code: string
          created_at: string
          created_by: string | null
          departure_time: string | null
          end_date: string
          eta: string | null
          fees_amount: number | null
          guest_id: string
          id: string
          internal_notes: string | null
          is_walk_in: boolean | null
          market_segment: string | null
          nights: number | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          rate_code: string | null
          room_id: string | null
          room_type_id: string | null
          source_code: string | null
          special_requests: string | null
          start_date: string
          status: Database["public"]["Enums"]["reservation_status"]
          taxes_amount: number | null
          total_amount: number
          travel_agent_id: string | null
          unit_id: string
          updated_at: string
          vip_code: string | null
        }
        Insert: {
          adults?: number
          arrival_time?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          children?: number
          company_id?: string | null
          confirmation_code?: string
          created_at?: string
          created_by?: string | null
          departure_time?: string | null
          end_date: string
          eta?: string | null
          fees_amount?: number | null
          guest_id: string
          id?: string
          internal_notes?: string | null
          is_walk_in?: boolean | null
          market_segment?: string | null
          nights?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          rate_code?: string | null
          room_id?: string | null
          room_type_id?: string | null
          source_code?: string | null
          special_requests?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["reservation_status"]
          taxes_amount?: number | null
          total_amount: number
          travel_agent_id?: string | null
          unit_id: string
          updated_at?: string
          vip_code?: string | null
        }
        Update: {
          adults?: number
          arrival_time?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          children?: number
          company_id?: string | null
          confirmation_code?: string
          created_at?: string
          created_by?: string | null
          departure_time?: string | null
          end_date?: string
          eta?: string | null
          fees_amount?: number | null
          guest_id?: string
          id?: string
          internal_notes?: string | null
          is_walk_in?: boolean | null
          market_segment?: string | null
          nights?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          rate_code?: string | null
          room_id?: string | null
          room_type_id?: string | null
          source_code?: string | null
          special_requests?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          taxes_amount?: number | null
          total_amount?: number
          travel_agent_id?: string | null
          unit_id?: string
          updated_at?: string
          vip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_travel_agent_id_fkey"
            columns: ["travel_agent_id"]
            isOneToOne: false
            referencedRelation: "travel_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      room_status_logs: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["room_status"]
          notes: string | null
          old_status: Database["public"]["Enums"]["room_status"] | null
          room_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["room_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["room_status"] | null
          room_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["room_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["room_status"] | null
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_status_logs_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          base_occupancy: number
          bathrooms: number
          bedrooms: number
          code: string
          created_at: string
          description_ar: string | null
          description_en: string | null
          extra_adult_rate: number | null
          extra_child_rate: number | null
          id: string
          is_active: boolean
          max_occupancy: number
          name_ar: string
          name_en: string
          property_id: string
          size_m2: number | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          base_occupancy?: number
          bathrooms?: number
          bedrooms?: number
          code: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          extra_adult_rate?: number | null
          extra_child_rate?: number | null
          id?: string
          is_active?: boolean
          max_occupancy?: number
          name_ar: string
          name_en: string
          property_id: string
          size_m2?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          base_occupancy?: number
          bathrooms?: number
          bedrooms?: number
          code?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          extra_adult_rate?: number | null
          extra_child_rate?: number | null
          id?: string
          is_active?: boolean
          max_occupancy?: number
          name_ar?: string
          name_en?: string
          property_id?: string
          size_m2?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_types_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          building: string | null
          created_at: string
          features: Json | null
          floor: number | null
          fo_status: Database["public"]["Enums"]["fo_status"]
          id: string
          is_active: boolean
          notes: string | null
          property_id: string
          room_number: string
          room_status: Database["public"]["Enums"]["room_status"]
          room_type_id: string
          updated_at: string
          wing: string | null
        }
        Insert: {
          building?: string | null
          created_at?: string
          features?: Json | null
          floor?: number | null
          fo_status?: Database["public"]["Enums"]["fo_status"]
          id?: string
          is_active?: boolean
          notes?: string | null
          property_id: string
          room_number: string
          room_status?: Database["public"]["Enums"]["room_status"]
          room_type_id: string
          updated_at?: string
          wing?: string | null
        }
        Update: {
          building?: string | null
          created_at?: string
          features?: Json | null
          floor?: number | null
          fo_status?: Database["public"]["Enums"]["fo_status"]
          id?: string
          is_active?: boolean
          notes?: string | null
          property_id?: string
          room_number?: string
          room_status?: Database["public"]["Enums"]["room_status"]
          room_type_id?: string
          updated_at?: string
          wing?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          created_at: string
          filename: string | null
          id: string
          task_id: string
          url: string
        }
        Insert: {
          created_at?: string
          filename?: string | null
          id?: string
          task_id: string
          url: string
        }
        Update: {
          created_at?: string
          filename?: string | null
          id?: string
          task_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          reservation_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          reservation_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          reservation_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_codes: {
        Row: {
          category: string
          code: string
          created_at: string
          default_amount: number | null
          gl_account: string | null
          id: string
          is_active: boolean
          is_revenue: boolean
          is_tax_exempt: boolean
          name_ar: string | null
          name_en: string
          sort_order: number | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          default_amount?: number | null
          gl_account?: string | null
          id?: string
          is_active?: boolean
          is_revenue?: boolean
          is_tax_exempt?: boolean
          name_ar?: string | null
          name_en: string
          sort_order?: number | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          default_amount?: number | null
          gl_account?: string | null
          id?: string
          is_active?: boolean
          is_revenue?: boolean
          is_tax_exempt?: boolean
          name_ar?: string | null
          name_en?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      travel_agents: {
        Row: {
          address: string | null
          agent_code: string | null
          ar_balance: number | null
          city: string | null
          commission_rate: number | null
          contact_person: string | null
          country: string | null
          created_at: string
          credit_limit: number | null
          email: string | null
          iata_number: string | null
          id: string
          is_active: boolean
          name_ar: string | null
          name_en: string
          notes: string | null
          payment_terms: number | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          agent_code?: string | null
          ar_balance?: number | null
          city?: string | null
          commission_rate?: number | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          iata_number?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string | null
          name_en: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          agent_code?: string | null
          ar_balance?: number | null
          city?: string | null
          commission_rate?: number | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          iata_number?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string | null
          name_en?: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      unit_amenities: {
        Row: {
          amenity_id: string
          unit_id: string
        }
        Insert: {
          amenity_id: string
          unit_id: string
        }
        Update: {
          amenity_id?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_amenities_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_photos: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          sort_order: number
          unit_id: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          unit_id: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          unit_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_photos_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_rate_plans: {
        Row: {
          rate_plan_id: string
          unit_id: string
        }
        Insert: {
          rate_plan_id: string
          unit_id: string
        }
        Update: {
          rate_plan_id?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_rate_plans_rate_plan_id_fkey"
            columns: ["rate_plan_id"]
            isOneToOne: false
            referencedRelation: "rate_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_rate_plans_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          bathrooms: number
          bedrooms: number
          capacity: number
          created_at: string
          description_ar: string | null
          description_en: string | null
          floor: number | null
          house_rules_ar: string | null
          house_rules_en: string | null
          id: string
          name_ar: string
          name_en: string
          property_id: string
          size_m2: number | null
          status: Database["public"]["Enums"]["unit_status"]
          unit_type: string
          updated_at: string
        }
        Insert: {
          bathrooms?: number
          bedrooms?: number
          capacity?: number
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          floor?: number | null
          house_rules_ar?: string | null
          house_rules_en?: string | null
          id?: string
          name_ar: string
          name_en: string
          property_id: string
          size_m2?: number | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_type?: string
          updated_at?: string
        }
        Update: {
          bathrooms?: number
          bedrooms?: number
          capacity?: number
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          floor?: number | null
          house_rules_ar?: string | null
          house_rules_en?: string | null
          id?: string
          name_ar?: string
          name_en?: string
          property_id?: string
          size_m2?: number | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_configs: {
        Row: {
          created_at: string
          event_type: string
          headers: Json | null
          id: string
          is_active: boolean
          property_id: string | null
          retry_count: number | null
          secret_key: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          event_type: string
          headers?: Json | null
          id?: string
          is_active?: boolean
          property_id?: string | null
          retry_count?: number | null
          secret_key?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          event_type?: string
          headers?: Json | null
          id?: string
          is_active?: boolean
          property_id?: string | null
          retry_count?: number | null
          secret_key?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_configs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          attempts: number | null
          created_at: string
          delivered_at: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_config_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          delivered_at?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_config_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          delivered_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_config_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_config_id_fkey"
            columns: ["webhook_config_id"]
            isOneToOne: false
            referencedRelation: "webhook_configs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff_or_above: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "operations_manager"
        | "staff"
        | "housekeeping"
        | "maintenance"
        | "owner"
      fo_status: "vacant" | "occupied" | "due_out" | "checked_out"
      folio_status: "open" | "closed" | "transferred" | "settled"
      message_channel: "email" | "sms" | "whatsapp"
      message_status: "pending" | "sent" | "delivered" | "failed"
      payment_status: "pending" | "partial" | "paid" | "refunded" | "failed"
      posting_type: "charge" | "payment" | "adjustment" | "transfer"
      reservation_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "checked_out"
        | "cancelled"
        | "no_show"
      room_status:
        | "vacant_clean"
        | "vacant_dirty"
        | "occupied_clean"
        | "occupied_dirty"
        | "out_of_order"
        | "out_of_service"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      task_type: "housekeeping" | "maintenance"
      unit_status: "available" | "occupied" | "maintenance" | "blocked"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "operations_manager",
        "staff",
        "housekeeping",
        "maintenance",
        "owner",
      ],
      fo_status: ["vacant", "occupied", "due_out", "checked_out"],
      folio_status: ["open", "closed", "transferred", "settled"],
      message_channel: ["email", "sms", "whatsapp"],
      message_status: ["pending", "sent", "delivered", "failed"],
      payment_status: ["pending", "partial", "paid", "refunded", "failed"],
      posting_type: ["charge", "payment", "adjustment", "transfer"],
      reservation_status: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
        "no_show",
      ],
      room_status: [
        "vacant_clean",
        "vacant_dirty",
        "occupied_clean",
        "occupied_dirty",
        "out_of_order",
        "out_of_service",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      task_type: ["housekeeping", "maintenance"],
      unit_status: ["available", "occupied", "maintenance", "blocked"],
    },
  },
} as const
