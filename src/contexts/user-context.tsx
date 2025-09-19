
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// This is a more app-specific user type.
export type AppUser = {
  id: string;
  name: string; // We can enrich this from a 'profiles' table later.
  email: string;
  avatarUrl: string; // This can also come from a profile.
};

export type UserColors = {
  personal: string;
  general: string;
};

type UserContextType = {
  user: AppUser | null;
  loading: boolean;
  colors: UserColors;
  setColors: (colors: UserColors) => void;
  updateUserName: (newName: string) => void;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [colors, setColorsState] = useState<UserColors>({ personal: '#4299e1', general: '#0D5EA6' });

  const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUser): AppUser => {
    // For now, we'll create a simple AppUser from the SupabaseUser.
    // In a real app, you'd fetch a corresponding 'profiles' record.
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.email?.split('@')[0] || 'User',
      avatarUrl: `https://picsum.photos/seed/${supabaseUser.id}/200/200`,
    };
  };
  
  const getSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if(session?.user){
      const appUser = mapSupabaseUserToAppUser(session.user);
      setUser(appUser);
    }
    setLoading(false);
  }, [supabase.auth]);

  useEffect(() => {
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const appUser = mapSupabaseUserToAppUser(session.user);
        setUser(appUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, getSession]);

  useEffect(() => {
    if (user) {
      const storedColors = localStorage.getItem(`user-colors-${user.id}`);
      if (storedColors) {
        // We only care about the personal color from storage now.
        const parsedColors = JSON.parse(storedColors);
        setColorsState(currentColors => ({
          ...currentColors,
          personal: parsedColors.personal || '#4299e1'
        }));
      }
    }
  }, [user?.id]);

  const setColors = (newColors: UserColors) => {
    if (user) {
      // Only store and update the personal color.
      const colorsToStore = { personal: newColors.personal };
      localStorage.setItem(`user-colors-${user.id}`, JSON.stringify(colorsToStore));
      setColorsState(currentColors => ({...currentColors, personal: newColors.personal}));
    }
  };

  const updateUserName = (newName: string) => {
    if (user) {
      // In a real app, this would be an API call to update a 'profiles' table.
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
      // We could also update a mock user list if we were using one.
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <UserContext.Provider value={{ user, loading, colors, setColors, updateUserName, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
