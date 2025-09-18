'use client';

import { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import type { TimetableEntry } from '@/lib/types';

type ModalState = {
  isOpen: boolean;
  entry: TimetableEntry | null;
  day: number;
  time?: string;
  source?: 'slot' | 'fab';
};

type ModalContextType = {
  modalState: ModalState | null;
  openModal: (state: Omit<ModalState, 'isOpen'>) => void;
  closeModal: () => void;
  setModalOpen: (isOpen: boolean) => void;
};

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const openModal = (state: Omit<ModalState, 'isOpen'>) => {
    setModalState({ ...state, isOpen: true });
  };

  const closeModal = () => {
    setModalState((prev) => (prev ? { ...prev, isOpen: false } : null));
  };

  const setModalOpen = (isOpen: boolean) => {
     setModalState((prev) => (prev ? { ...prev, isOpen } : { isOpen, entry: null, day: 0 }));
  }
  
  return (
    <ModalContext.Provider value={{ modalState, openModal, closeModal, setModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
}
