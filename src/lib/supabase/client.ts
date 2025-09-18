
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types';

export const supabase = createBrowserClient<Database>(
    'https://kztkzgflpbicrskjfvca.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6dGt6Z2ZscGJpY3Jza2pmdmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxODU3NzksImV4cCI6MjA3Mzc2MTc3OX0.D7RZq8DczF4UiouZFp8lc-qaszQ7g75V1f9x6vbOj9g'
  );

export function createClient() {
  return createBrowserClient<Database>(
    'https://kztkzgflpbicrskjfvca.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6dGt6Z2ZscGJpY3Jza2pmdmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxODU3NzksImV4cCI6MjA3Mzc2MTc3OX0.D7RZq8DczF4UiouZFp8lc-qaszQ7g75V1f9x6vbOj9g'
  );
}
