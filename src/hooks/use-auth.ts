'use client';

import { useAuthContext } from '@/context/auth-provider';

export const useAuth = () => {
  const { user, loading, supabase } = useAuthContext();
  return { user, loading, supabase };
};
