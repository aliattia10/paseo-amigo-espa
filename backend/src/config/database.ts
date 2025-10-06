import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase client configuration
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  }
);

// Supabase admin client (with service role key for server-side operations)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database types (matching our schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          city: string;
          postal_code: string;
          user_type: 'owner' | 'walker';
          profile_image?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          city: string;
          postal_code: string;
          user_type: 'owner' | 'walker';
          profile_image?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          city?: string;
          postal_code?: string;
          user_type?: 'owner' | 'walker';
          profile_image?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      dogs: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          age: string;
          breed?: string;
          notes: string;
          image_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          age: string;
          breed?: string;
          notes: string;
          image_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          age?: string;
          breed?: string;
          notes?: string;
          image_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      walker_profiles: {
        Row: {
          id: string;
          user_id: string;
          bio: string;
          experience: string;
          hourly_rate: number;
          availability: string[];
          rating: number;
          total_walks: number;
          verified: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio: string;
          experience: string;
          hourly_rate: number;
          availability: string[];
          rating?: number;
          total_walks?: number;
          verified?: boolean;
          tags: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string;
          experience?: string;
          hourly_rate?: number;
          availability?: string[];
          rating?: number;
          total_walks?: number;
          verified?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      walk_requests: {
        Row: {
          id: string;
          owner_id: string;
          walker_id: string;
          dog_id: string;
          service_type: 'walk' | 'care';
          duration: number;
          walk_date: string;
          walk_time: string;
          location: string;
          notes?: string;
          status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
          price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          walker_id: string;
          dog_id: string;
          service_type: 'walk' | 'care';
          duration: number;
          walk_date: string;
          walk_time: string;
          location: string;
          notes?: string;
          status?: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
          price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          walker_id?: string;
          dog_id?: string;
          service_type?: 'walk' | 'care';
          duration?: number;
          date?: string;
          time?: string;
          location?: string;
          notes?: string;
          status?: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
          price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          request_id: string;
          sender_id: string;
          message: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          sender_id: string;
          message: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          sender_id?: string;
          message?: string;
          timestamp?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          walk_request_id: string;
          reviewer_id: string;
          reviewed_id: string;
          rating: number;
          tags: string[];
          comment?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          walk_request_id: string;
          reviewer_id: string;
          reviewed_id: string;
          rating: number;
          tags: string[];
          comment?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          walk_request_id?: string;
          reviewer_id?: string;
          reviewed_id?: string;
          rating?: number;
          tags?: string[];
          comment?: string;
          created_at?: string;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          price: number;
          interval: string;
          features: string[];
          stripe_price_id: string;
          popular: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          interval: string;
          features: string[];
          stripe_price_id: string;
          popular?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          interval?: string;
          features?: string[];
          stripe_price_id?: string;
          popular?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          stripe_subscription_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          stripe_subscription_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          stripe_subscription_id?: string;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          stripe_payment_method_id: string;
          type: string;
          card_brand: string;
          card_last4: string;
          card_exp_month: number;
          card_exp_year: number;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_payment_method_id: string;
          type: string;
          card_brand: string;
          card_last4: string;
          card_exp_month: number;
          card_exp_year: number;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_payment_method_id?: string;
          type?: string;
          card_brand?: string;
          card_last4?: string;
          card_exp_month?: number;
          card_exp_year?: number;
          is_default?: boolean;
          created_at?: string;
        };
      };
      walk_sessions: {
        Row: {
          id: string;
          walk_request_id: string;
          start_time: string;
          end_time?: string;
          duration?: number;
          distance?: number;
          status: 'active' | 'completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          walk_request_id: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          distance?: number;
          status?: 'active' | 'completed';
          created_at?: string;
        };
        Update: {
          id?: string;
          walk_request_id?: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          distance?: number;
          status?: 'active' | 'completed';
          created_at?: string;
        };
      };
      geo_points: {
        Row: {
          id: string;
          session_id: string;
          latitude: number;
          longitude: number;
          timestamp: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          latitude: number;
          longitude: number;
          timestamp?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          latitude?: number;
          longitude?: number;
          timestamp?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          read?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
