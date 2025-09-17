import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types';

export function createClient() {
  return createBrowserClient<Database>(
    "https://ggrjwnsdsulmmymrygvq.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdncmp3bnNkc3VsbW15bXJ5Z3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk1ODU2MjUsImV4cCI6MjAzNTE2MTYyNX0.CSoY0-hFwV2u2n_6n22vD5Lj_2i5fA_4R2Pb_8Fdgq8"
  );
}
