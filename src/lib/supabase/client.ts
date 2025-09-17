import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL! || "https://your-supabase-url.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || "your-supabase-anon-key"
  );
}
