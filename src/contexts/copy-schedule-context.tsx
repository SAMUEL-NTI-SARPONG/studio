
'use client';

import { createContext, useState, ReactNode } from 'react';

type CopyScheduleState = {
  isOpen: boolean;
  day: number;
};

type CopyScheduleContextType = {
  state: CopyScheduleState | null;
  openCopyScheduleDialog: (state: Omit<CopyScheduleState, 'isOpen'>) => void;
  closeCopyScheduleDialog: () => void;
};

export const CopyScheduleContext = createContext<CopyScheduleContextType | undefined>(undefined);

export function CopyScheduleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CopyScheduleState | null>(null);

  const openCopyScheduleDialog = (newState: Omit<CopyScheduleState, 'isOpen'>) => {
    setState({ ...newState, isOpen: true });
  };

  const closeCopyScheduleDialog = () => {
    setState((prev) => (prev ? { ...prev, isOpen: false } : null));
  };

  return (
    <CopyScheduleContext.Provider value={{ state, openCopyScheduleDialog, closeCopyScheduleDialog }}>
      {children}
    </CopyScheduleContext.Provider>
  );
}
