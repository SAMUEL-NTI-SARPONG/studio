'use client';

import { createContext, useContext, useState } from 'react';
import type { AppUser, TypedSupabaseClient } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { DAYS_OF_WEEK } from '@/lib/constants';

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

  const [user] = useState<AppUser | null>(null);
  const [loading] = useState(false);
  const [activeTab, setActiveTab] = useState(DAYS_OF_WEEK[today]);
  
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
