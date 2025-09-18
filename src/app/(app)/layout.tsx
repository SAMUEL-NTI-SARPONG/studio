
'use client';

import Header from '@/components/layout/header';
import { TimetableHeader } from '@/components/timetable/timetable-header';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { ModalProvider } from '@/contexts/modal-context';
import { HourModal } from '@/components/timetable/hour-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useModal } from '@/hooks/use-modal';
import { ClearScheduleProvider } from '@/contexts/clear-schedule-context';
import { ClearScheduleDialog } from '@/components/timetable/clear-schedule-dialog';
import { ProfileModalProvider } from '@/contexts/profile-modal-context';
import { ProfileModal } from '@/components/profile/profile-modal';
import { TimetableProvider, useTimetableContext } from '@/contexts/timetable-context';
import { CopyScheduleProvider } from '@/contexts/copy-schedule-context';
import { CopyScheduleDialog } from '@/components/timetable/copy-schedule-dialog';

function FloatingActionButton() {
  const { openModal } = useModal();
  const { activeTab } = useTimetableContext();
  const dayIndex = DAYS_OF_WEEK.indexOf(activeTab);

  const handleFabClick = () => {
    const currentHour = new Date().getHours();
    openModal({
      entry: null,
      day: dayIndex,
      time: `${String(currentHour).padStart(2, '0')}:00`,
      source: 'fab',
    });
  };

  return (
    <Button
      className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
      size="icon"
      onClick={handleFabClick}
    >
      <Plus className="h-8 w-8" />
      <span className="sr-only">Add new event</span>
    </Button>
  );
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { activeTab } = useTimetableContext();
  const activeDayIndex = DAYS_OF_WEEK.indexOf(activeTab);
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header activeDayIndex={activeDayIndex} />
      <div className="sticky top-16 z-30 w-full border-b bg-secondary/95 backdrop-blur-sm">
        <TimetableHeader />
      </div>
      <main className="flex-1 px-4 py-2">{children}</main>
      <HourModal />
      <FloatingActionButton />
      <ClearScheduleDialog />
      <ProfileModal />
      <CopyScheduleDialog />
    </div>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <ClearScheduleProvider>
        <ProfileModalProvider>
          <CopyScheduleProvider>
            <TimetableProvider>
              <AppLayoutContent>{children}</AppLayoutContent>
            </TimetableProvider>
          </CopyScheduleProvider>
        </ProfileModalProvider>
      </ClearScheduleProvider>
    </ModalProvider>
  );
}
