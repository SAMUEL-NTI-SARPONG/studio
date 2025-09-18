import type { SupabaseClient, User } from '@supabase/supabase-js';

export type TimetableEntry = {
  id: string;
  user_id: string;
  user_email: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  title: string;
  description: string | null;
  created_at: string;
  partner1_checked_in: boolean;
  partner2_checked_in: boolean;
};

export type Database = {
  public: {
    Tables: {
      timetable_entries: {
        Row: TimetableEntry;
        Insert: Omit<TimetableEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<TimetableEntry, 'id' | 'created_at' | 'user_id'>>;
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

export type AppUser = User;
