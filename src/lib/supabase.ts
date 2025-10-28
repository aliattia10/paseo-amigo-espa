import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zxbfygofxxmfivddwdqt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YmZ5Z29meHhtZml2ZGR3ZHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjkyNTAsImV4cCI6MjA3MzY0NTI1MH0.6V11hebajJyNKKEeI0MqcoG8n2Hc0Rli8SoUpstm-C4';

console.log('Supabase Config:', {
  url: supabaseUrl,
  hasEnvUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasEnvKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  keyLength: supabaseAnonKey.length
});

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Test Supabase connection
supabase.from('users').select('count').limit(1).then(
  (result) => console.log('Supabase connection test successful:', result),
  (error) => console.error('Supabase connection test failed:', error)
);

// Database types
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
          bio?: string;
          hourly_rate?: number;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone: string;
          city: string;
          postal_code: string;
          user_type: 'owner' | 'walker';
          profile_image?: string;
          bio?: string;
          hourly_rate?: number;
          avatar_url?: string;
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
          bio?: string;
          hourly_rate?: number;
          avatar_url?: string;
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
          temperament?: string[];
          special_needs?: string;
          energy_level?: 'low' | 'medium' | 'high';
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
          temperament?: string[];
          special_needs?: string;
          energy_level?: 'low' | 'medium' | 'high';
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
          temperament?: string[];
          special_needs?: string;
          energy_level?: 'low' | 'medium' | 'high';
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
          date: string;
          time: string;
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
          date: string;
          time: string;
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
      availability: {
        Row: {
          id: string;
          sitter_id: string;
          start_time: string;
          end_time: string;
          status: 'available' | 'booked' | 'unavailable';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sitter_id: string;
          start_time: string;
          end_time: string;
          status?: 'available' | 'booked' | 'unavailable';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sitter_id?: string;
          start_time?: string;
          end_time?: string;
          status?: 'available' | 'booked' | 'unavailable';
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          owner_id: string;
          sitter_id: string;
          dog_id: string;
          start_time: string;
          end_time: string;
          service_type: 'walk' | 'care' | 'boarding';
          location?: string;
          notes?: string;
          total_price: number;
          commission_fee: number;
          status: 'requested' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
          cancellation_reason?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          sitter_id: string;
          dog_id: string;
          start_time: string;
          end_time: string;
          service_type?: 'walk' | 'care' | 'boarding';
          location?: string;
          notes?: string;
          total_price: number;
          commission_fee: number;
          status?: 'requested' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
          cancellation_reason?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          sitter_id?: string;
          dog_id?: string;
          start_time?: string;
          end_time?: string;
          service_type?: 'walk' | 'care' | 'boarding';
          location?: string;
          notes?: string;
          total_price?: number;
          commission_fee?: number;
          status?: 'requested' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
          cancellation_reason?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          related_id?: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          related_id?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          related_id?: string;
          is_read?: boolean;
          created_at?: string;
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
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
