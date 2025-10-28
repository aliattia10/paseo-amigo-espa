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
      chat_messages: {
        Row: {
          id: string
          message: string
          request_id: string
          sender_id: string
          timestamp: string | null
        }
        Insert: {
          id?: string
          message: string
          request_id: string
          sender_id: string
          timestamp?: string | null
        }
        Update: {
          id?: string
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
      dogs: {
        Row: {
          age: string | null
          breed: string | null
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          notes: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          age?: string | null
          breed?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          notes: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          age?: string | null
          breed?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          notes?: string
          owner_id?: string
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
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
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
          city: string
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string
          postal_code: string
          profile_image: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          city: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone: string
          postal_code: string
          profile_image?: string | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          city?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
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
      [_ in never]: never
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
