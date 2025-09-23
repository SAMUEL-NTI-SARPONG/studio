
import type { SupabaseClient } from '@supabase/supabase-js';

export type TimetableEntry = {
  id: string;
  user_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  title: string;
  description: string | null;
  created_at: string;
  engaging_user_ids: string[] | null;
  user_name: string | null;
  user_color: string | null;
};

export type Database = {
  public: {
    Tables: {
      timetable_entries: {
        Row: {
          id: string;
          created_at: string;
          day_of_week: number;
          start_time: string; // Assuming TIME without time zone is treated as string
          end_time: string; // Assuming TIME without time zone is treated as string
          title: string;
          description: string | null;
          user_id: string | null;
          engaging_user_ids: string[] | null;
          user_name: string | null;
          user_color: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          title: string;
          description?: string | null;
          user_id?: string | null;
          engaging_user_ids?: string[] | null;
          user_name?: string | null;
          user_color?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          title?: string;
          description?: string | null;
          user_id?: string | null;
          engaging_user_ids?: string[] | null;
          user_name?: string | null;
          user_color?: string | null;
        };
      };
      global_settings: {
        Row: {
          id: number;
          general_event_color: string;
        };
        Insert: {
          id?: number;
          general_event_color: string;
        };
        Update: {
          id?: number;
          general_event_color?: string;
        };
      }
    };
    Functions: {
      update_general_event_color: {
        Args: { new_color: string };
        Returns: undefined;
      };
      toggle_user_engagement: {
        Args: { p_user_id: string; p_entry_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type TypedSupabaseClient = SupabaseClient<Database>;
