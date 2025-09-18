
'use client';

import { useEffect, useState, ReactNode } from 'react';
import Header from '@/components/layout/header';
import { TimetableHeader } from '@/components/timetable/timetable-header';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { ModalProvider } from '@/contexts/modal-context';
import { HourModal } from '@/components/timetable/hour-modal';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useModal } from '@/hooks/use-modal';
import { ClearScheduleProvider } from '@/contexts/clear-schedule-context';
import { ClearScheduleDialog } from '@/components/timetable/clear-schedule-dialog';
import { ProfileModalProvider } from '@/contexts/profile-modal-context';
import { ProfileModal } from '@/components/profile/profile-modal';
import { TimetableProvider as TimetableContextProvider, useTimetableContext } from '@/contexts/timetable-context';
import { CopyScheduleProvider } from '@/contexts/copy-schedule-context';
import { CopyScheduleDialog } from '@/components/timetable/copy-schedule-dialog';
import { useUser } from '@/contexts/user-context';
import { BouncingBallLoader } from '@/components/ui/bouncing-ball-loader';
import { EventNotification } from '@/components/timetable/event-notification';
import { TimetableContext, useTimetableData, useTimetable } from '@/hooks/use-timetable';
import { DrippingTapLoader } from '@/components/ui/dripping-tap-loader';

function FloatingActionButtons() {
  const { openModal } = useModal();
  const { activeTab } = useTimetableContext();
  const { isOffline } = useTimetable();
  const dayIndex = DAYS_OF_WEEK.indexOf(activeTab);

  const handleAddClick = () => {
    const currentHour = new Date().getHours();
    openModal({
      entry: null,
      day: dayIndex,
      time: `${String(currentHour).padStart(2, '0')}:00`,
      source: 'fab',
    });
  };

  const handleReloadClick = () => {
    if (!isOffline) {
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-center gap-4">
       <Button
        className="h-14 w-14 rounded-2xl shadow-lg"
        size="icon"
        variant="secondary"
        onClick={handleReloadClick}
        disabled={isOffline}
      >
        <RefreshCw className={`h-7 w-7 ${!isOffline && "animate-spin"}`} />
        <span className="sr-only">Reload page</span>
      </Button>
      <Button
        className="h-16 w-16 rounded-2xl shadow-lg"
        size="icon"
        onClick={handleAddClick}
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">Add new event</span>
      </Button>
    </div>
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
      <FloatingActionButtons />
      <ClearScheduleDialog />
      <ProfileModal />
      <CopyScheduleDialog />
      <EventNotification />
    </div>
  );
}

function TimetableDataProvider({ children }: { children: ReactNode }) {
  const timetableData = useTimetableData();
  return (
    <TimetableContext.Provider value={timetableData}>
      {children}
    </TimetableContext.Provider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const [showContent, setShowContent] = useState(loading);

  useEffect(() => {
    if (!loading) {
      setShowContent(false);
    }
  }, [loading]);

  if (showContent) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-16">
        <BouncingBallLoader showContent={!loading} />
        <p className="text-muted-foreground">Loading Legend...</p>
      </div>
    );
  }

  return (
    <TimetableDataProvider>
      <ModalProvider>
        <ClearScheduleProvider>
          <ProfileModalProvider>
            <CopyScheduleProvider>
              <TimetableContextProvider>
                <AppLayoutContent>{children}</AppLayoutContent>
              </TimetableContextProvider>
            </CopyScheduleProvider>
          </ProfileModalProvider>
        </ClearScheduleProvider>
      </ModalProvider>
    </TimetableDataProvider>
  );
}
