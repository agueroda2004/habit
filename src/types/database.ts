export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type HabitType = "boolean" | "numeric" | "duration";
export type FrequencyType = "daily" | "weekly";

export interface Database {
  public: {
    Tables: {
      categories_habit: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string | null;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          icon: string | null;
          color: string;
          type: HabitType;
          target_value: number | null;
          unit: string | null;
          start_date: string;
          end_date: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string;
          type?: HabitType;
          target_value?: number | null;
          unit?: string | null;
          start_date?: string;
          end_date?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          icon?: string | null;
          color?: string;
          type?: HabitType;
          target_value?: number | null;
          unit?: string | null;
          start_date?: string;
          end_date?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      habit_schedules: {
        Row: {
          id: string;
          habit_id: string;
          frequency_type: FrequencyType;
          days_of_week: number[];
          reminder_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          frequency_type?: FrequencyType;
          days_of_week?: number[];
          reminder_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          frequency_type?: FrequencyType;
          days_of_week?: number[];
          reminder_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          date: string;
          value: number | null;
          completed: boolean;
          skipped: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          date: string;
          value?: number | null;
          completed?: boolean;
          skipped?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          date?: string;
          value?: number | null;
          completed?: boolean;
          skipped?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
