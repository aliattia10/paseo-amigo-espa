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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      availability: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          sitter_id: string
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          sitter_id: string
          start_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          sitter_id?: string
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          cancellation_reason: string | null
          commission_fee: number
          created_at: string | null
          dog_id: string
          end_time: string
          id: string
          location: string | null
          notes: string | null
          owner_id: string
          payment_amount: number | null
          payment_status: string | null
          pet_id: string | null
          refund_reason: string | null
          refunded_at: string | null
          service_type: string
          sitter_id: string
          start_time: string
          status: string
          stripe_payment_intent_id: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          commission_fee: number
          created_at?: string | null
          dog_id: string
          end_time: string
          id?: string
          location?: string | null
          notes?: string | null
          owner_id: string
          payment_amount?: number | null
          payment_status?: string | null
          pet_id?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          service_type?: string
          sitter_id: string
          start_time: string
          status?: string
          stripe_payment_intent_id?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          commission_fee?: number
          created_at?: string | null
          dog_id?: string
          end_time?: string
          id?: string
          location?: string | null
          notes?: string | null
          owner_id?: string
          payment_amount?: number | null
          payment_status?: string | null
          pet_id?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          service_type?: string
          sitter_id?: string
          start_time?: string
          status?: string
          stripe_payment_intent_id?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          id: string
          media_thumbnail_url: string | null
          media_type: string | null
          media_url: string | null
          message: string
          request_id: string
          sender_id: string
          timestamp: string | null
        }
        Insert: {
          id?: string
          media_thumbnail_url?: string | null
          media_type?: string | null
          media_url?: string | null
          message: string
          request_id: string
          sender_id: string
          timestamp?: string | null
        }
        Update: {
          id?: string
          media_thumbnail_url?: string | null
          media_type?: string | null
          media_url?: string | null
          message?: string
          request_id?: string
          sender_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "walk_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          percentage: number
          sitter_id: string
          updated_at: string | null
          usage_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          percentage: number
          sitter_id: string
          updated_at?: string | null
          usage_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          percentage?: number
          sitter_id?: string
          updated_at?: string | null
          usage_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_usage: {
        Row: {
          booking_id: string | null
          discount_amount: number | null
          discount_code_id: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          discount_amount?: number | null
          discount_code_id: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          discount_amount?: number | null
          discount_code_id?: string
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_usage_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dogs: {
        Row: {
          age: string | null
          breed: string | null
          created_at: string | null
          energy_level: string | null
          id: string
          image_url: string | null
          name: string
          notes: string
          owner_id: string
          pet_type: string | null
          special_needs: string | null
          temperament: string[] | null
          updated_at: string | null
        }
        Insert: {
          age?: string | null
          breed?: string | null
          created_at?: string | null
          energy_level?: string | null
          id?: string
          image_url?: string | null
          name: string
          notes: string
          owner_id: string
          pet_type?: string | null
          special_needs?: string | null
          temperament?: string[] | null
          updated_at?: string | null
        }
        Update: {
          age?: string | null
          breed?: string | null
          created_at?: string | null
          energy_level?: string | null
          id?: string
          image_url?: string | null
          name?: string
          notes?: string
          owner_id?: string
          pet_type?: string | null
          special_needs?: string | null
          temperament?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dogs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_points: {
        Row: {
          id: string
          latitude: number
          longitude: number
          session_id: string
          timestamp: string | null
        }
        Insert: {
          id?: string
          latitude: number
          longitude: number
          session_id: string
          timestamp?: string | null
        }
        Update: {
          id?: string
          latitude?: number
          longitude?: number
          session_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geo_points_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "walk_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          liked_id: string
          liker_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          liked_id: string
          liker_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          liked_id?: string
          liker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_liked_id_fkey"
            columns: ["liked_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_liker_id_fkey"
            columns: ["liker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          id: string
          matched_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          matched_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          matched_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          card_brand: string
          card_exp_month: number
          card_exp_year: number
          card_last4: string
          created_at: string | null
          id: string
          is_default: boolean | null
          stripe_payment_method_id: string
          type: string
          user_id: string
        }
        Insert: {
          card_brand: string
          card_exp_month: number
          card_exp_year: number
          card_last4: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id: string
          type: string
          user_id: string
        }
        Update: {
          card_brand?: string
          card_exp_month?: number
          card_exp_year?: number
          card_last4?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          age: string
          breed: string | null
          created_at: string | null
          energy_level: string | null
          id: string
          image_url: string | null
          name: string
          notes: string | null
          owner_id: string
          pet_type: string
          special_needs: string | null
          temperament: string[] | null
          updated_at: string | null
        }
        Insert: {
          age: string
          breed?: string | null
          created_at?: string | null
          energy_level?: string | null
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          owner_id: string
          pet_type?: string
          special_needs?: string | null
          temperament?: string[] | null
          updated_at?: string | null
        }
        Update: {
          age?: string
          breed?: string | null
          created_at?: string | null
          energy_level?: string | null
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          owner_id?: string
          pet_type?: string
          special_needs?: string | null
          temperament?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          city: string
          created_at: string
          id: string
          name: string
          phone: string
          postal_code: string
          rating: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          user_type: string
          verified: boolean | null
        }
        Insert: {
          bio?: string | null
          city: string
          created_at?: string
          id?: string
          name: string
          phone: string
          postal_code: string
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          user_type: string
          verified?: boolean | null
        }
        Update: {
          bio?: string | null
          city?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string
          postal_code?: string
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          user_type?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
          tags: string[] | null
          walk_request_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          reviewed_id: string
          reviewer_id: string
          tags?: string[] | null
          walk_request_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
          tags?: string[] | null
          walk_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_walk_request_id_fkey"
            columns: ["walk_request_id"]
            isOneToOne: false
            referencedRelation: "walk_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          features: string[]
          id: string
          interval: string
          name: string
          popular: boolean | null
          price: number
          stripe_price_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          features: string[]
          id?: string
          interval: string
          name: string
          popular?: boolean | null
          price: number
          stripe_price_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          features?: string[]
          id?: string
          interval?: string
          name?: string
          popular?: boolean | null
          price?: number
          stripe_price_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          status: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string
          created_at: string | null
          email: string
          filter_preferences: Json | null
          hourly_rate: number | null
          id: string
          latitude: number | null
          location_enabled: boolean | null
          location_updated_at: string | null
          longitude: number | null
          max_distance_km: number | null
          max_hourly_rate: number | null
          min_rating: number | null
          name: string
          pet_preferences: Json | null
          phone: string
          postal_code: string
          profile_image: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city: string
          created_at?: string | null
          email: string
          filter_preferences?: Json | null
          hourly_rate?: number | null
          id?: string
          latitude?: number | null
          location_enabled?: boolean | null
          location_updated_at?: string | null
          longitude?: number | null
          max_distance_km?: number | null
          max_hourly_rate?: number | null
          min_rating?: number | null
          name: string
          pet_preferences?: Json | null
          phone: string
          postal_code: string
          profile_image?: string | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string
          created_at?: string | null
          email?: string
          filter_preferences?: Json | null
          hourly_rate?: number | null
          id?: string
          latitude?: number | null
          location_enabled?: boolean | null
          location_updated_at?: string | null
          longitude?: number | null
          max_distance_km?: number | null
          max_hourly_rate?: number | null
          min_rating?: number | null
          name?: string
          pet_preferences?: Json | null
          phone?: string
          postal_code?: string
          profile_image?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      walk_requests: {
        Row: {
          created_at: string | null
          dog_id: string
          duration: number
          id: string
          location: string
          notes: string | null
          owner_id: string
          price: number
          service_type: string
          status: string | null
          updated_at: string | null
          walk_date: string
          walk_time: string
          walker_id: string
        }
        Insert: {
          created_at?: string | null
          dog_id: string
          duration: number
          id?: string
          location: string
          notes?: string | null
          owner_id: string
          price: number
          service_type: string
          status?: string | null
          updated_at?: string | null
          walk_date: string
          walk_time: string
          walker_id: string
        }
        Update: {
          created_at?: string | null
          dog_id?: string
          duration?: number
          id?: string
          location?: string
          notes?: string | null
          owner_id?: string
          price?: number
          service_type?: string
          status?: string | null
          updated_at?: string | null
          walk_date?: string
          walk_time?: string
          walker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "walk_requests_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "walk_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "walk_requests_walker_id_fkey"
            columns: ["walker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      walk_sessions: {
        Row: {
          created_at: string | null
          distance: number | null
          duration: number | null
          end_time: string | null
          id: string
          start_time: string | null
          status: string | null
          walk_request_id: string
        }
        Insert: {
          created_at?: string | null
          distance?: number | null
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          status?: string | null
          walk_request_id: string
        }
        Update: {
          created_at?: string | null
          distance?: number | null
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          status?: string | null
          walk_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "walk_sessions_walk_request_id_fkey"
            columns: ["walk_request_id"]
            isOneToOne: false
            referencedRelation: "walk_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      walker_profiles: {
        Row: {
          availability: string[]
          bio: string
          created_at: string | null
          discount_code: string | null
          discount_percentage: number | null
          experience: string
          hourly_rate: number
          id: string
          rating: number | null
          tags: string[] | null
          total_walks: number | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          availability?: string[]
          bio: string
          created_at?: string | null
          discount_code?: string | null
          discount_percentage?: number | null
          experience: string
          hourly_rate: number
          id?: string
          rating?: number | null
          tags?: string[] | null
          total_walks?: number | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          availability?: string[]
          bio?: string
          created_at?: string | null
          discount_code?: string | null
          discount_percentage?: number | null
          experience?: string
          hourly_rate?: number
          id?: string
          rating?: number | null
          tags?: string[] | null
          total_walks?: number | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "walker_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_availability_slot: {
        Args: { p_end_time: string; p_sitter_id: string; p_start_time: string }
        Returns: string
      }
      apply_discount_code: {
        Args: {
          p_booking_id?: string
          p_code: string
          p_discount_amount?: number
          p_user_id: string
        }
        Returns: boolean
      }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      check_and_create_match: {
        Args: { liked_user_id: string; liker_user_id: string }
        Returns: boolean
      }
      create_booking: {
        Args: {
          p_dog_id: string
          p_end_time: string
          p_location: string
          p_notes: string
          p_owner_id: string
          p_service_type: string
          p_sitter_id: string
          p_start_time: string
          p_total_price: number
        }
        Returns: string
      }
      create_sitter_discount: {
        Args: {
          p_description?: string
          p_max_uses?: number
          p_percentage: number
          p_sitter_id: string
          p_sitter_name: string
          p_valid_until?: string
        }
        Returns: {
          code: string
          message: string
          percentage: number
          success: boolean
        }[]
      }
      generate_discount_code: { Args: { sitter_name: string }; Returns: string }
      get_filtered_profiles: {
        Args: {
          p_global_mode?: boolean
          p_max_distance_km?: number
          p_max_hourly_rate?: number
          p_min_rating?: number
          p_pet_type?: string
          p_sort_by?: string
          p_user_id: string
          p_user_lat?: number
          p_user_lon?: number
          p_user_type: string
        }
        Returns: {
          bio: string
          discount_code: string
          discount_percentage: number
          distance_km: number
          hourly_rate: number
          id: string
          name: string
          pet_types: string[]
          profile_image: string
          rating: number
          user_type: string
        }[]
      }
      get_nearby_users: {
        Args: {
          max_distance_km?: number
          user_lat: number
          user_lon: number
          user_type_filter?: string
        }
        Returns: {
          distance_km: number
          id: string
          latitude: number
          longitude: number
          name: string
          user_type: string
        }[]
      }
      release_payment_to_sitter: {
        Args: { p_booking_id: string }
        Returns: boolean
      }
      update_booking_status: {
        Args: { p_booking_id: string; p_new_status: string }
        Returns: undefined
      }
      update_user_location: {
        Args: { lat: number; lon: number; user_id: string }
        Returns: undefined
      }
      validate_discount_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: {
          message: string
          percentage: number
          sitter_id: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
