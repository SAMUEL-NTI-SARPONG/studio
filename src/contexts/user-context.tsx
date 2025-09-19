
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
  isInitialColorPickerOpen: boolean;
  setInitialColorPickerOpen: (isOpen: boolean) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [colors, setColorsState] = useState<UserColors>({ personal: '#4299e1', general: '#000000' });
  const [isInitialColorPickerOpen, setInitialColorPickerOpen] = useState(false);

  const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUser): AppUser => {
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
      const hasChosenInitialColor = localStorage.getItem(`has-chosen-initial-color-${user.id}`);

      if (storedColors) {
        const parsedColors = JSON.parse(storedColors);
        setColorsState(currentColors => ({
          ...currentColors,
          personal: parsedColors.personal || '#4299e1'
        }));
      }

      if (!hasChosenInitialColor) {
        setInitialColorPickerOpen(true);
      }
    }
  }, [user?.id]);

  const setColors = (newColors: UserColors) => {
    if (user) {
      const colorsToStore = { personal: newColors.personal };
      localStorage.setItem(`user-colors-${user.id}`, JSON.stringify(colorsToStore));
      localStorage.setItem(`has-chosen-initial-color-${user.id}`, 'true');
      setColorsState(currentColors => ({...currentColors, personal: newColors.personal}));
    }
  };

  const updateUserName = (newName: string) => {
    if (user) {
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <UserContext.Provider value={{ user, loading, colors, setColors, updateUserName, signOut, isInitialColorPickerOpen, setInitialColorPickerOpen }}>
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
