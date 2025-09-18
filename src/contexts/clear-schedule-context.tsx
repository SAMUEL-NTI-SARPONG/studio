'use client';

import { createContext, useState, ReactNode } from 'react';

type ClearScheduleState = {
  isOpen: boolean;
  scope: 'personal' | 'general';
  time: 'day' | 'all';
  day?: number;
};

type ClearScheduleContextType = {
  state: ClearScheduleState | null;
  openClearScheduleDialog: (state: Omit<ClearScheduleState, 'isOpen'>) => void;
  closeClearScheduleDialog: () => void;
};

export const ClearScheduleContext = createContext<ClearScheduleContextType | undefined>(undefined);

export function ClearScheduleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ClearScheduleState | null>(null);

  const openClearScheduleDialog = (newState: Omit<ClearScheduleState, 'isOpen'>) => {
    setState({ ...newState, isOpen: true });
  };

  const closeClearScheduleDialog = () => {
    setState((prev) => (prev ? { ...prev, isOpen: false } : null));
  };

  return (
    <ClearScheduleContext.Provider value={{ state, openClearScheduleDialog, closeClearScheduleDialog }}>
      {children}
    </ClearScheduleContext.Provider>
  );
}
