'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { AppUser, TypedSupabaseClient } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { DAYS_OF_WEEK } from '@/lib/constants';
import type { User } from '@supabase/supabase-js';

type AppContextType = {
  supabase: TypedSupabaseClient;
  user: AppUser | null;
  loading: boolean;
  activeTab: string;
  setActiveTab: (value: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const today = new Date().getDay();

  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(DAYS_OF_WEEK[today]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);
  
  const value = {
    supabase,
    user,
    loading,
    activeTab,
    setActiveTab
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
