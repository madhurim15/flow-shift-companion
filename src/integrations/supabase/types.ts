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
      action_completions: {
        Row: {
          actual_duration: number
          completed_at: string
          completion_type: string
          dice_roll_id: string
          id: string
          planned_duration: number
          user_id: string
        }
        Insert: {
          actual_duration: number
          completed_at?: string
          completion_type: string
          dice_roll_id: string
          id?: string
          planned_duration: number
          user_id: string
        }
        Update: {
          actual_duration?: number
          completed_at?: string
          completion_type?: string
          dice_roll_id?: string
          id?: string
          planned_duration?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_completions_dice_roll_id_fkey"
            columns: ["dice_roll_id"]
            isOneToOne: false
            referencedRelation: "dice_roll_usage"
            referencedColumns: ["id"]
          },
        ]
      }
      action_streaks: {
        Row: {
          best_streak: number
          created_at: string
          current_streak: number
          id: string
          last_completion_date: string | null
          total_completions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_completion_date?: string | null
          total_completions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_completion_date?: string | null
          total_completions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_categories: {
        Row: {
          app_name: string | null
          app_package_name: string
          category: string
          created_at: string
          id: string
          mindful_threshold_minutes: number | null
          psychological_triggers: string[] | null
        }
        Insert: {
          app_name?: string | null
          app_package_name: string
          category: string
          created_at?: string
          id?: string
          mindful_threshold_minutes?: number | null
          psychological_triggers?: string[] | null
        }
        Update: {
          app_name?: string | null
          app_package_name?: string
          category?: string
          created_at?: string
          id?: string
          mindful_threshold_minutes?: number | null
          psychological_triggers?: string[] | null
        }
        Relationships: []
      }
      app_usage_sessions: {
        Row: {
          app_category: string | null
          app_name: string | null
          app_package_name: string
          created_at: string
          duration_seconds: number | null
          id: string
          intervention_triggered: boolean | null
          psychological_state: string | null
          session_end: string | null
          session_start: string
          user_id: string
        }
        Insert: {
          app_category?: string | null
          app_name?: string | null
          app_package_name: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          intervention_triggered?: boolean | null
          psychological_state?: string | null
          session_end?: string | null
          session_start: string
          user_id: string
        }
        Update: {
          app_category?: string | null
          app_name?: string | null
          app_package_name?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          intervention_triggered?: boolean | null
          psychological_state?: string | null
          session_end?: string | null
          session_start?: string
          user_id?: string
        }
        Relationships: []
      }
      behavioral_patterns: {
        Row: {
          created_at: string
          detected_frequency: number | null
          id: string
          improvement_trend: number | null
          last_detected: string
          pattern_type: string
          successful_interventions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detected_frequency?: number | null
          id?: string
          improvement_trend?: number | null
          last_detected?: string
          pattern_type: string
          successful_interventions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          detected_frequency?: number | null
          id?: string
          improvement_trend?: number | null
          last_detected?: string
          pattern_type?: string
          successful_interventions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      check_in_reminders: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          mood_response: string | null
          reminder_type: string
          scheduled_time: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mood_response?: string | null
          reminder_type: string
          scheduled_time: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mood_response?: string | null
          reminder_type?: string
          scheduled_time?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_journals: {
        Row: {
          created_at: string
          entry: string
          id: string
          prompt: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry: string
          id?: string
          prompt?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry?: string
          id?: string
          prompt?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_photos: {
        Row: {
          caption: string | null
          created_at: string
          file_path: string
          file_size: number | null
          id: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_path: string
          file_size?: number | null
          id?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_path?: string
          file_size?: number | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      dice_roll_usage: {
        Row: {
          action_suggested: string
          cooldown_expires_at: string
          created_at: string
          id: string
          mood: string
          user_id: string
        }
        Insert: {
          action_suggested: string
          cooldown_expires_at?: string
          created_at?: string
          id?: string
          mood: string
          user_id: string
        }
        Update: {
          action_suggested?: string
          cooldown_expires_at?: string
          created_at?: string
          id?: string
          mood?: string
          user_id?: string
        }
        Relationships: []
      }
      fcm_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          priority: string
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          action_taken: string | null
          created_at: string
          id: string
          mood: string
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          id?: string
          mood: string
          user_id: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          id?: string
          mood?: string
          user_id?: string
        }
        Relationships: []
      }
      nudge_responses: {
        Row: {
          completed_duration: number | null
          created_at: string
          effectiveness_rating: number | null
          id: string
          reminder_type: string
          response_data: Json | null
          response_type: string
          user_id: string
        }
        Insert: {
          completed_duration?: number | null
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          reminder_type: string
          response_data?: Json | null
          response_type: string
          user_id: string
        }
        Update: {
          completed_duration?: number | null
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          reminder_type?: string
          response_data?: Json | null
          response_type?: string
          user_id?: string
        }
        Relationships: []
      }
      pomodoro_sessions: {
        Row: {
          actual_duration: number | null
          completed: boolean | null
          completed_at: string | null
          id: string
          interrupted: boolean | null
          interruption_reason: string | null
          planned_duration: number
          session_type: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          actual_duration?: number | null
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          interrupted?: boolean | null
          interruption_reason?: string | null
          planned_duration?: number
          session_type?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          actual_duration?: number | null
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          interrupted?: boolean | null
          interruption_reason?: string | null
          planned_duration?: number
          session_type?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          preferred_name: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          preferred_name?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          preferred_name?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      psychological_interventions: {
        Row: {
          alternative_chosen: string | null
          app_package_name: string
          created_at: string
          detected_state: string
          effectiveness_rating: number | null
          id: string
          intervention_message: string | null
          intervention_type: string
          user_id: string
          user_response: string | null
        }
        Insert: {
          alternative_chosen?: string | null
          app_package_name: string
          created_at?: string
          detected_state: string
          effectiveness_rating?: number | null
          id?: string
          intervention_message?: string | null
          intervention_type: string
          user_id: string
          user_response?: string | null
        }
        Update: {
          alternative_chosen?: string | null
          app_package_name?: string
          created_at?: string
          detected_state?: string
          effectiveness_rating?: number | null
          id?: string
          intervention_message?: string | null
          intervention_type?: string
          user_id?: string
          user_response?: string | null
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          afternoon_time: string | null
          created_at: string
          evening_time: string | null
          id: string
          morning_time: string | null
          night_time: string | null
          notifications_enabled: boolean | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          afternoon_time?: string | null
          created_at?: string
          evening_time?: string | null
          id?: string
          morning_time?: string | null
          night_time?: string | null
          notifications_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          afternoon_time?: string | null
          created_at?: string
          evening_time?: string | null
          id?: string
          morning_time?: string | null
          night_time?: string | null
          notifications_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_notes: {
        Row: {
          created_at: string
          duration_seconds: number | null
          file_path: string
          file_size: number | null
          id: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_path: string
          file_size?: number | null
          id?: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_path?: string
          file_size?: number | null
          id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          referral_source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          referral_source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          referral_source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_action: {
        Args: {
          p_actual_duration: number
          p_dice_roll_id: string
          p_planned_duration: number
        }
        Returns: Json
      }
      request_dice_roll: {
        Args: { p_action: string; p_mood: string }
        Returns: Json
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
