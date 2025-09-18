'use client';

import { useContext } from 'react';
import { ClearScheduleContext } from '@/contexts/clear-schedule-context';

export function useClearSchedule() {
  const context = useContext(ClearScheduleContext);
  if (context === undefined) {
    throw new Error('useClearSchedule must be used within a ClearScheduleProvider');
  }
  return context;
}
