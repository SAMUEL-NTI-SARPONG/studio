
'use client';

import { createContext, useState, ReactNode } from 'react';

type ProfileModalContextType = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const ProfileModalContext = createContext<ProfileModalContextType | undefined>(undefined);

export function ProfileModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ProfileModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ProfileModalContext.Provider>
  );
}
