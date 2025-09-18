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
};

export type Database = {
  public: {
    Tables: {
      timetable_entries: {
        Row: TimetableEntry;
        Insert: Omit<TimetableEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<TimetableEntry, 'id' | 'created_at'>>;
      };
    };
    Functions: {
      [_ in never]: never;
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
