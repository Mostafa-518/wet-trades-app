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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          id: string
          is_dismissed: boolean
          is_read: boolean
          message: string
          project_id: string | null
          subcontractor_id: string | null
          threshold_amount: number | null
          title: string
          total_amount: number | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message: string
          project_id?: string | null
          subcontractor_id?: string | null
          threshold_amount?: number | null
          title: string
          total_amount?: number | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message?: string
          project_id?: string | null
          subcontractor_id?: string | null
          threshold_amount?: number | null
          title?: string
          total_amount?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_subcontractor_id_fkey"
            columns: ["subcontractor_id"]
            isOneToOne: false
            referencedRelation: "subcontractors"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          after_snapshot: Json | null
          before_snapshot: Json | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          after_snapshot?: Json | null
          before_snapshot?: Json | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          after_snapshot?: Json | null
          before_snapshot?: Json | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      data_access_logs: {
        Row: {
          access_type: string
          accessed_entity_id: string | null
          accessed_table: string
          additional_context: Json | null
          created_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          access_type: string
          accessed_entity_id?: string | null
          accessed_table: string
          additional_context?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          access_type?: string
          accessed_entity_id?: string | null
          accessed_table?: string
          additional_context?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      estimate_feedback: {
        Row: {
          created_at: string
          estimate_id: string
          id: string
          rating: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          estimate_id: string
          id?: string
          rating: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          estimate_id?: string
          id?: string
          rating?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_feedback_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_line_items: {
        Row: {
          created_at: string
          estimate_id: string
          id: string
          name: string
          qty: number | null
          source_ref: string | null
          total_price: number | null
          type: Database["public"]["Enums"]["estimate_line_type"]
          unit: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimate_id: string
          id?: string
          name: string
          qty?: number | null
          source_ref?: string | null
          total_price?: number | null
          type: Database["public"]["Enums"]["estimate_line_type"]
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimate_id?: string
          id?: string
          name?: string
          qty?: number | null
          source_ref?: string | null
          total_price?: number | null
          type?: Database["public"]["Enums"]["estimate_line_type"]
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_line_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          ai_confidence: number | null
          ai_notes: string | null
          ai_rate: number | null
          created_at: string
          currency: string
          final_rate: number | null
          id: string
          inflation_ref_month: string | null
          item_name: string
          location: string | null
          market_factor: number
          project_id: string | null
          quantity: number | null
          source_item_ids: string[] | null
          specs: string | null
          status: Database["public"]["Enums"]["estimate_status"]
          trade_id: string | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_notes?: string | null
          ai_rate?: number | null
          created_at?: string
          currency?: string
          final_rate?: number | null
          id?: string
          inflation_ref_month?: string | null
          item_name: string
          location?: string | null
          market_factor?: number
          project_id?: string | null
          quantity?: number | null
          source_item_ids?: string[] | null
          specs?: string | null
          status?: Database["public"]["Enums"]["estimate_status"]
          trade_id?: string | null
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          ai_notes?: string | null
          ai_rate?: number | null
          created_at?: string
          currency?: string
          final_rate?: number | null
          id?: string
          inflation_ref_month?: string | null
          item_name?: string
          location?: string | null
          market_factor?: number
          project_id?: string | null
          quantity?: number | null
          source_item_ids?: string[] | null
          specs?: string | null
          status?: Database["public"]["Enums"]["estimate_status"]
          trade_id?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          code: string
          created_at: string
          id: string
          location: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          location: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      responsibilities: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      subcontract_responsibilities: {
        Row: {
          created_at: string
          id: string
          responsibility_id: string | null
          subcontract_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          responsibility_id?: string | null
          subcontract_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          responsibility_id?: string | null
          subcontract_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcontract_responsibilities_responsibility_id_fkey"
            columns: ["responsibility_id"]
            isOneToOne: false
            referencedRelation: "responsibilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcontract_responsibilities_subcontract_id_fkey"
            columns: ["subcontract_id"]
            isOneToOne: false
            referencedRelation: "subcontracts"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontract_trade_items: {
        Row: {
          created_at: string
          id: string
          quantity: number | null
          subcontract_id: string | null
          total_price: number | null
          trade_item_id: string | null
          unit_price: number | null
          wastage_percentage: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number | null
          subcontract_id?: string | null
          total_price?: number | null
          trade_item_id?: string | null
          unit_price?: number | null
          wastage_percentage?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number | null
          subcontract_id?: string | null
          total_price?: number | null
          trade_item_id?: string | null
          unit_price?: number | null
          wastage_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subcontract_trade_items_subcontract_id_fkey"
            columns: ["subcontract_id"]
            isOneToOne: false
            referencedRelation: "subcontracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcontract_trade_items_trade_item_id_fkey"
            columns: ["trade_item_id"]
            isOneToOne: false
            referencedRelation: "trade_items"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontractors: {
        Row: {
          commercial_registration: string | null
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          phone: string | null
          representative_name: string | null
          tax_card_no: string | null
          updated_at: string
        }
        Insert: {
          commercial_registration?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          representative_name?: string | null
          tax_card_no?: string | null
          updated_at?: string
        }
        Update: {
          commercial_registration?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          representative_name?: string | null
          tax_card_no?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subcontracts: {
        Row: {
          addendum_number: string | null
          contract_number: string | null
          contract_type: string
          created_at: string
          date_of_issuing: string | null
          description: string | null
          end_date: string | null
          id: string
          parent_subcontract_id: string | null
          pdf_url: string | null
          project_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["subcontract_status"] | null
          subcontractor_id: string | null
          total_value: number | null
          updated_at: string
        }
        Insert: {
          addendum_number?: string | null
          contract_number?: string | null
          contract_type?: string
          created_at?: string
          date_of_issuing?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          parent_subcontract_id?: string | null
          pdf_url?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["subcontract_status"] | null
          subcontractor_id?: string | null
          total_value?: number | null
          updated_at?: string
        }
        Update: {
          addendum_number?: string | null
          contract_number?: string | null
          contract_type?: string
          created_at?: string
          date_of_issuing?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          parent_subcontract_id?: string | null
          pdf_url?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["subcontract_status"] | null
          subcontractor_id?: string | null
          total_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcontracts_parent_subcontract_id_fkey"
            columns: ["parent_subcontract_id"]
            isOneToOne: false
            referencedRelation: "subcontracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcontracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcontracts_subcontractor_id_fkey"
            columns: ["subcontractor_id"]
            isOneToOne: false
            referencedRelation: "subcontractors"
            referencedColumns: ["id"]
          },
        ]
      }
      system_errors: {
        Row: {
          context: string | null
          created_at: string | null
          error_message: string
          id: string
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          error_message: string
          id?: string
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          error_message?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trade_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          trade_id: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          trade_id?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          trade_id?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_items_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_login: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_clear_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      admin_delete_audit_logs: {
        Args: { ids: string[] }
        Returns: number
      }
      admin_undo_project: {
        Args: { p_log_id: string }
        Returns: undefined
      }
      admin_undo_subcontract: {
        Args: { p_log_id: string }
        Returns: undefined
      }
      admin_undo_subcontractor: {
        Args: { p_log_id: string }
        Returns: undefined
      }
      admin_undo_trade: {
        Args: { p_log_id: string }
        Returns: undefined
      }
      admin_undo_trade_item: {
        Args: { p_log_id: string }
        Returns: undefined
      }
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      call_send_alert_notification: {
        Args: { alert_data: Json }
        Returns: undefined
      }
      get_current_user_role_safe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { data: Json; uri: string } | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { data: Json; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_only: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_or_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_critical_data_access: {
        Args:
          | { access_details?: Json; record_id: string; table_name: string }
          | { access_details?: Json; record_id: string; table_name: string }
        Returns: undefined
      }
      log_data_access: {
        Args: { access_type?: string; entity_id?: string; table_name: string }
        Returns: undefined
      }
      purge_old_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      estimate_line_type: "material" | "labor" | "equipment" | "overhead"
      estimate_status: "draft" | "final"
      project_status:
        | "planning"
        | "active"
        | "on_hold"
        | "completed"
        | "cancelled"
      subcontract_status:
        | "draft"
        | "pending"
        | "active"
        | "completed"
        | "cancelled"
      user_role:
        | "admin"
        | "project_manager"
        | "supervisor"
        | "viewer"
        | "procurement_manager"
        | "procurement_engineer"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
      estimate_line_type: ["material", "labor", "equipment", "overhead"],
      estimate_status: ["draft", "final"],
      project_status: [
        "planning",
        "active",
        "on_hold",
        "completed",
        "cancelled",
      ],
      subcontract_status: [
        "draft",
        "pending",
        "active",
        "completed",
        "cancelled",
      ],
      user_role: [
        "admin",
        "project_manager",
        "supervisor",
        "viewer",
        "procurement_manager",
        "procurement_engineer",
      ],
    },
  },
} as const
