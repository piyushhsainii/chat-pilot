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
      bot_settings: {
        Row: {
          active: boolean | null
          allowed_domains: string[] | null
          bot_id: string | null
          created_at: string | null
          id: string
          is_configured: boolean | null
          rate_limit: number | null
          rate_limit_hit_message: string | null
        }
        Insert: {
          active?: boolean | null
          allowed_domains?: string[] | null
          bot_id?: string | null
          created_at?: string | null
          id?: string
          is_configured?: boolean | null
          rate_limit?: number | null
          rate_limit_hit_message?: string | null
        }
        Update: {
          active?: boolean | null
          allowed_domains?: string[] | null
          bot_id?: string | null
          created_at?: string | null
          id?: string
          is_configured?: boolean | null
          rate_limit?: number | null
          rate_limit_hit_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_settings_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: true
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bots: {
        Row: {
          created_at: string | null
          fallback_behavior: string | null
          id: string
          name: string
          owner_id: string | null
          system_prompt: string | null
          tone: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          fallback_behavior?: string | null
          id?: string
          name: string
          owner_id?: string | null
          system_prompt?: string | null
          tone?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          fallback_behavior?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          system_prompt?: string | null
          tone?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bots_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_logs: {
        Row: {
          answer: string
          bot_id: string | null
          confidence_score: number | null
          created_at: string | null
          environment: string | null
          id: string
          metadata: Json | null
          question: string
          resolved: boolean | null
        }
        Insert: {
          answer: string
          bot_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          environment?: string | null
          id?: string
          metadata?: Json | null
          question: string
          resolved?: boolean | null
        }
        Update: {
          answer?: string
          bot_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          environment?: string | null
          id?: string
          metadata?: Json | null
          question?: string
          resolved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_logs_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          bot_id: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          user_id: string | null
        }
        Insert: {
          bot_id: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          user_id?: string | null
        }
        Update: {
          bot_id?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          bot_id: string | null
          created_at: string | null
          id: string
          reason: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          bot_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          bot_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          bot_id: string | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          source_id: string | null
        }
        Insert: {
          bot_id?: string | null
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
        }
        Update: {
          bot_id?: string | null
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          bot_id: string | null
          created_at: string | null
          doc_url: string | null
          id: string
          last_indexed: string | null
          name: string
          status: string | null
          type: string | null
        }
        Insert: {
          bot_id?: string | null
          created_at?: string | null
          doc_url?: string | null
          id?: string
          last_indexed?: string | null
          name: string
          status?: string | null
          type?: string | null
        }
        Update: {
          bot_id?: string | null
          created_at?: string | null
          doc_url?: string | null
          id?: string
          last_indexed?: string | null
          name?: string
          status?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_sources_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          bot_id: string
          count: number | null
          id: string
          ip: string
          window_start: string | null
        }
        Insert: {
          bot_id: string
          count?: number | null
          id?: string
          ip: string
          window_start?: string | null
        }
        Update: {
          bot_id?: string
          count?: number | null
          id?: string
          ip?: string
          window_start?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          alert_20_sent: boolean | null
          alert_5_sent: boolean | null
          balance: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_20_sent?: boolean | null
          alert_5_sent?: boolean | null
          balance?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_20_sent?: boolean | null
          alert_5_sent?: boolean | null
          balance?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      widget_analytics: {
        Row: {
          bot_id: string | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          bot_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          bot_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "widget_analytics_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      widgets: {
        Row: {
          bot_id: string | null
          button_color: string | null
          created_at: string | null
          greeting_message: string | null
          id: string
          primary_color: string | null
          theme: string | null
          title: string | null
        }
        Insert: {
          bot_id?: string | null
          button_color?: string | null
          created_at?: string | null
          greeting_message?: string | null
          id?: string
          primary_color?: string | null
          theme?: string | null
          title?: string | null
        }
        Update: {
          bot_id?: string | null
          button_color?: string | null
          created_at?: string | null
          greeting_message?: string | null
          id?: string
          primary_color?: string | null
          theme?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "widgets_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: true
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_users: {
        Row: {
          auth_user_id: string
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          workspace_id: string | null
        }
        Insert: {
          auth_user_id: string
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          workspace_id?: string | null
        }
        Update: {
          auth_user_id?: string
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          name: string
          owner_id: string | null
          tier: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          owner_id?: string | null
          tier?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          owner_id?: string | null
          tier?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_credit_alert: {
        Args: { p_user_id: string }
        Returns: {
          alert_20: boolean
          alert_5: boolean
          balance: number
        }[]
      }
      deduct_credit: { Args: { p_user_id: string }; Returns: boolean }
      match_documents: {
        Args: {
          match_count: number
          match_threshold: number
          p_bot_id: string
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
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
