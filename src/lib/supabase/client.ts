import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types';

export function createClient() {
  return createBrowserClient<Database>(
    "https://eltuoucnxkyexffeaxdc.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdHVvdWNueGt5ZXhmZmVheGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzA2NTMsImV4cCI6MjA3Mzc0NjY1M30.FC7RDFWOJSXTvVBO3tXllX6CPEf14n_UNST7w0bO2Dg"
  );
}
