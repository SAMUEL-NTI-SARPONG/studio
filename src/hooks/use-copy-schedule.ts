
'use client';

import { useContext } from 'react';
import { CopyScheduleContext } from '@/contexts/copy-schedule-context';

export function useCopySchedule() {
  const context = useContext(CopyScheduleContext);
  if (context === undefined) {
    throw new Error('useCopySchedule must be used within a CopyScheduleProvider');
  }
  return context;
}
