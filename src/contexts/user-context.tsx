
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { USERS } from '@/lib/users';

// This is a mock user type for the new setup.
// It is simpler than the Supabase User type.
export type AppUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
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
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Default to the first user in the static list.
  const [user, setUser] = useState<AppUser | null>(USERS[0] || null);
  const [loading, setLoading] = useState(false); // No longer loading from an async source.
  const [colors, setColorsState] = useState<UserColors>({ personal: '#4299e1', general: '#4a5568' });

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

  const updateUserName = (newName: string) => {
    if (user) {
      // In this mock setup, we just update the state.
      // In a real app, this would be an API call.
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
      // We can also update our mock data source if we want persistence across reloads
      const userIndex = USERS.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        USERS[userIndex].name = newName;
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
