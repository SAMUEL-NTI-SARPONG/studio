import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL! || "https://eyelrvkcsbatuvxsnurf.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZWxydmtjc2JhdHV2eHNudXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzMxMzUsImV4cCI6MjA3MzcwOTEzNX0.1uHkXPKBgft2zRRw0On1cJniZTseIQjU-n08SBugKtM"
  );
}
