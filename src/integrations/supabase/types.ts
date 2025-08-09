export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
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
      user_role: "admin" | "project_manager" | "supervisor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
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
      user_role: ["admin", "project_manager", "supervisor", "viewer"],
    },
  },
} as const
