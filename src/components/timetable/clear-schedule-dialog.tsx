'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useClearSchedule } from '@/hooks/use-clear-schedule';
import { useTimetable } from '@/hooks/use-timetable';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export function ClearScheduleDialog() {
  const { state, closeClearScheduleDialog } = useClearSchedule();
  const {
    clearPersonalScheduleForDay,
    clearPersonalScheduleForAllDays,
    clearGeneralScheduleForDay,
    clearGeneralScheduleForAllDays,
  } = useTimetable();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!state || !state.isOpen) {
    return null;
  }
  
  const { scope, time, day } = state;
  const dayName = day !== undefined ? DAYS_OF_WEEK[day] : '';

  const getTitle = () => {
    return `Clear ${scope === 'personal' ? 'My' : 'General'} Schedule`;
  }
  
  const getDescription = () => {
    let message = 'Are you sure you want to delete ';
    if (scope === 'personal') {
      message += 'all your personal events ';
    } else {
      message += 'all general events ';
    }
    if (time === 'day') {
      message += `for ${dayName}?`;
    } else {
      message += 'for all days?';
    }
    return message + ' This action cannot be undone.';
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    let success = false;
    if (scope === 'personal') {
      if (time === 'day' && day !== undefined) {
        success = await clearPersonalScheduleForDay(day);
      } else if (time === 'all') {
        success = await clearPersonalScheduleForAllDays();
      }
    } else if (scope === 'general') {
       if (time === 'day' && day !== undefined) {
        success = await clearGeneralScheduleForDay(day);
      } else if (time === 'all') {
        success = await clearGeneralScheduleForAllDays();
      }
    }

    if(success) {
      closeClearScheduleDialog();
    }
    setIsDeleting(false);
  };

  return (
    <AlertDialog open={state.isOpen} onOpenChange={(open) => !open && closeClearScheduleDialog()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
