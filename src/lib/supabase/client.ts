import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types';

export function createClient() {
  return createBrowserClient<Database>(
    "YOUR_NEW_SUPABASE_URL",
    "YOUR_NEW_SUPABASE_ANON_KEY"
  );
}
