
'use client';

import { createContext, useState, ReactNode, Dispatch, SetStateAction, useContext } from 'react';
import { DAYS_OF_WEEK } from '@/lib/constants';

type TimetableContextType = {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
};

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

export function TimetableProvider({ children }: { children: ReactNode }) {
  const today = new Date().getDay();
  const [activeTab, setActiveTab] = useState(DAYS_OF_WEEK[today]);

  return (
    <TimetableContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TimetableContext.Provider>
  );
}

export function useTimetableContext() {
  const context = useContext(TimetableContext);
  if (context === undefined) {
    throw new Error('useTimetableContext must be used within a TimetableProvider');
  }
  return context;
}
