
'use client';

import { useContext } from 'react';
import { ProfileModalContext } from '@/contexts/profile-modal-context';

export function useProfileModal() {
  const context = useContext(ProfileModalContext);
  if (context === undefined) {
    throw new Error('useProfileModal must be used within a ProfileModalProvider');
  }
  return context;
}
