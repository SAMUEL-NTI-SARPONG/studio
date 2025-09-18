
'use client';

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { USERS } from '@/lib/users';

type User = (typeof USERS)[0];

export type UserColors = {
  personal: string;
  general: string;
};

type UserContextType = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  colors: UserColors;
  setColors: Dispatch<SetStateAction<UserColors>>;
  updateUserName: (newName: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultColors: UserColors = {
  personal: '#4299e1', // blue-500
  general: '#4a5568', // gray-600
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [colors, setColors] = useState<UserColors>(defaultColors);

  useEffect(() => {
    if (user) {
      const storedColors = localStorage.getItem(`user-colors-${user.id}`);
      if (storedColors) {
        setColors(JSON.parse(storedColors));
      } else {
        const userDefaults = USERS.find(u => u.id === user.id);
        if (userDefaults) {
           const initialColors = {
             personal: user.id === 'user_1' ? '#38a169' : '#dd6b20', // green-600 or orange-600
             general: '#718096', // gray-500
           };
           setColors(initialColors);
           localStorage.setItem(`user-colors-${user.id}`, JSON.stringify(initialColors));
        }
      }

      const storedName = localStorage.getItem(`user-name-${user.id}`);
      if (storedName) {
        setUser(prevUser => prevUser ? { ...prevUser, name: storedName } : null);
      }
    }
  }, [user?.id]);


  const handleSetUser = (newUser: SetStateAction<User | null>) => {
    if (newUser === null) {
      localStorage.removeItem('selectedUserId');
    } else if (typeof newUser === 'function') {
        const result = newUser(user);
        if(result) localStorage.setItem('selectedUserId', result.id);
    } else {
        localStorage.setItem('selectedUserId', newUser.id);
    }
    setUser(newUser);
  };
  
  const handleSetColors = (newColors: SetStateAction<UserColors>) => {
      setColors(prev => {
          const updatedColors = typeof newColors === 'function' ? newColors(prev) : newColors;
          if (user) {
            localStorage.setItem(`user-colors-${user.id}`, JSON.stringify(updatedColors));
          }
          return updatedColors;
      })
  }
  
  const updateUserName = (newName: string) => {
    if (user) {
      setUser({ ...user, name: newName });
      localStorage.setItem(`user-name-${user.id}`, newName);
    }
  };


  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser, colors, setColors: handleSetColors, updateUserName }}>
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
