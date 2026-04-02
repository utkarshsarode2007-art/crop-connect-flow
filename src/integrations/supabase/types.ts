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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      batch_transactions: {
        Row: {
          amount: number
          batch_id: string
          created_at: string
          currency: string
          from_stage: Database["public"]["Enums"]["supply_chain_stage"]
          id: string
          status: string
          to_stage: Database["public"]["Enums"]["supply_chain_stage"]
        }
        Insert: {
          amount: number
          batch_id: string
          created_at?: string
          currency?: string
          from_stage: Database["public"]["Enums"]["supply_chain_stage"]
          id?: string
          status?: string
          to_stage: Database["public"]["Enums"]["supply_chain_stage"]
        }
        Update: {
          amount?: number
          batch_id?: string
          created_at?: string
          currency?: string
          from_stage?: Database["public"]["Enums"]["supply_chain_stage"]
          id?: string
          status?: string
          to_stage?: Database["public"]["Enums"]["supply_chain_stage"]
        }
        Relationships: [
          {
            foreignKeyName: "batch_transactions_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_updates: {
        Row: {
          action: string
          batch_id: string
          created_at: string
          details: string | null
          handler: string | null
          id: string
          location: string | null
          notes: string | null
          stage: Database["public"]["Enums"]["supply_chain_stage"]
          temperature: string | null
        }
        Insert: {
          action: string
          batch_id: string
          created_at?: string
          details?: string | null
          handler?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          stage: Database["public"]["Enums"]["supply_chain_stage"]
          temperature?: string | null
        }
        Update: {
          action?: string
          batch_id?: string
          created_at?: string
          details?: string | null
          handler?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          stage?: Database["public"]["Enums"]["supply_chain_stage"]
          temperature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_updates_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          assigned_supplier: string | null
          created_at: string
          crop_name: string
          current_stage: Database["public"]["Enums"]["supply_chain_stage"]
          farm_location: string
          farmer_name: string
          harvest_date: string | null
          id: string
          quantity: string
          status: Database["public"]["Enums"]["batch_status"]
          unit: string
          updated_at: string
          variety: string | null
        }
        Insert: {
          assigned_supplier?: string | null
          created_at?: string
          crop_name: string
          current_stage?: Database["public"]["Enums"]["supply_chain_stage"]
          farm_location: string
          farmer_name: string
          harvest_date?: string | null
          id: string
          quantity: string
          status?: Database["public"]["Enums"]["batch_status"]
          unit?: string
          updated_at?: string
          variety?: string | null
        }
        Update: {
          assigned_supplier?: string | null
          created_at?: string
          crop_name?: string
          current_stage?: Database["public"]["Enums"]["supply_chain_stage"]
          farm_location?: string
          farmer_name?: string
          harvest_date?: string | null
          id?: string
          quantity?: string
          status?: Database["public"]["Enums"]["batch_status"]
          unit?: string
          updated_at?: string
          variety?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      batch_status:
        | "harvested"
        | "created"
        | "picked_up"
        | "in_transit"
        | "stored"
        | "delivered"
        | "processing"
      supply_chain_stage:
        | "farmer"
        | "supplier"
        | "distributor"
        | "retailer"
        | "consumer"
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
      batch_status: [
        "harvested",
        "created",
        "picked_up",
        "in_transit",
        "stored",
        "delivered",
        "processing",
      ],
      supply_chain_stage: [
        "farmer",
        "supplier",
        "distributor",
        "retailer",
        "consumer",
      ],
    },
  },
} as const
