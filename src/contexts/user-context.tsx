
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { USERS } from '@/lib/users';

export type UserColors = {
  personal: string;
  general: string;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  colors: UserColors;
  setColors: (colors: UserColors) => void;
  updateUserName: (newName: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [colors, setColorsState] = useState<UserColors>({ personal: '#4299e1', general: '#4a5568' });

  const fetchUserProfile = useCallback(async (user: User) => {
    // For now, we are not using a separate profiles table.
    // We can extend this later.
    // The user object from auth has email, id, etc.
    // We can simulate name/avatar from the old USERS object for now if needed.
    const staticUser = USERS.find(u => u.id.includes(user.email?.charAt(0) || ''));
    if (user.user_metadata.name) {
       return { ...user, name: user.user_metadata.name, avatarUrl: staticUser?.avatarUrl || '' };
    }
    return { ...user, name: user.email, avatarUrl: staticUser?.avatarUrl || '' };
  }, []);


  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        // This is a bit of a hack to merge profile data
        // In a real app, you might want to manage this better
        setUser(prevUser => ({...prevUser, ...profile} as User));
      }
      setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
       if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        setUser(prevUser => ({...prevUser, ...profile} as User));
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);
  
  useEffect(() => {
    if (user) {
      const storedColors = localStorage.getItem(`user-colors-${user.id}`);
      if (storedColors) {
        setColorsState(JSON.parse(storedColors));
      } else {
        const initialColors = {
          personal: '#38a169',
          general: '#718096',
        };
        setColorsState(initialColors);
        localStorage.setItem(`user-colors-${user.id}`, JSON.stringify(initialColors));
      }
    }
  }, [user?.id]);


  const setColors = (newColors: UserColors) => {
    if (user) {
      localStorage.setItem(`user-colors-${user.id}`, JSON.stringify(newColors));
      setColorsState(newColors);
    }
  };

  const updateUserName = async (newName: string) => {
    if (user) {
      const { data, error } = await supabase.auth.updateUser({
        data: { name: newName },
      });
      if (data.user) {
        setUser({ ...user, user_metadata: data.user.user_metadata });
      }
      if (error) {
        console.error('Error updating user name:', error);
      }
    }
  };


  return (
    <UserContext.Provider value={{ user, loading, colors, setColors, updateUserName }}>
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
