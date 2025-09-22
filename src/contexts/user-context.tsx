
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useTheme } from 'next-themes';

// This is a more app-specific user type.
export type AppUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  personal_color: string;
};

export type UserColors = {
  personal: string;
  general: string;
};

type UserContextType = {
  user: AppUser | null;
  loading: boolean;
  colors: UserColors;
  setColors: (colors: Pick<UserColors, 'personal'>) => Promise<void>;
  updateUserName: (newName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isInitialColorPickerOpen: boolean;
  setInitialColorPickerOpen: (isOpen: boolean) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [colors, setColorsState] = useState<UserColors>({ personal: '#84cc16', general: 'hsl(var(--primary))' });
  const [isInitialColorPickerOpen, setInitialColorPickerOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // This function will be defined in a style tag by ThemeProvider
    // and is safe to call here.
    const root = document.documentElement;
    const primaryColor = getComputedStyle(root).getPropertyValue('--primary').trim();
    
    // Convert HSL string to hex if necessary, or just use the HSL value.
    // For now, let's assume we can get the raw HSL values and re-compose it.
    if(primaryColor) {
      const generalColor = `hsl(${primaryColor})`;
      setColorsState(currentColors => ({...currentColors, general: generalColor}));
    }
    
  }, [resolvedTheme]);


  const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUser): AppUser => {
    const personalColor = supabaseUser.user_metadata?.personal_color || '#84cc16';
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      avatarUrl: `https://picsum.photos/seed/${supabaseUser.id}/200/200`,
      personal_color: personalColor,
    };
  };
  
  const getSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if(session?.user){
      const appUser = mapSupabaseUserToAppUser(session.user);
      setUser(appUser);
      setColorsState(prev => ({ ...prev, personal: appUser.personal_color }));
    }
    setLoading(false);
  }, [supabase.auth]);

  useEffect(() => {
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setLoading(true);
      if (session?.user) {
        const appUser = mapSupabaseUserToAppUser(session.user);
        setUser(appUser);
        setColorsState(prev => ({ ...prev, personal: appUser.personal_color }));
        if (!session.user.user_metadata?.personal_color) {
          setInitialColorPickerOpen(true);
        }
      } else {
        setUser(null);
        setInitialColorPickerOpen(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, getSession]);

  const setColors = async (newColors: Pick<UserColors, 'personal'>) => {
    if (user) {
      // Optimistically update local state
      setUser(prev => prev ? ({ ...prev, personal_color: newColors.personal }) : null);
      setColorsState(currentColors => ({...currentColors, personal: newColors.personal}));
      
      const { error } = await supabase.auth.updateUser({
          data: { ...user.user_metadata, personal_color: newColors.personal }
      });
      if(error){
          console.error("Error saving color to db", error);
      }
    }
  };

  const updateUserName = async (newName: string) => {
    if (user) {
        // Optimistically update local state
        setUser(prev => prev ? ({ ...prev, name: newName }) : null);
        
        const { data, error } = await supabase.auth.updateUser({
            data: { name: newName }
        });

        if(error) {
            console.error("Error saving name to db", error);
            // Revert optimistic update if there was an error
            setUser(prev => prev ? ({...prev, name: user.name}) : null);
        }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <UserContext.Provider value={{ user, loading, colors: { personal: user?.personal_color || '#84cc16', general: colors.general }, setColors, updateUserName, signOut, isInitialColorPickerOpen, setInitialColorPickerOpen }}>
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
