
'use client';

import Header from '@/components/layout/header';
import { TimetableHeader } from '@/components/timetable/timetable-header';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { useState, useEffect, Children, cloneElement } from 'react';
import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import { ModalProvider } from '@/contexts/modal-context';
import { HourModal } from '@/components/timetable/hour-modal';
import { useModal } from '@/hooks/use-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClearScheduleProvider } from '@/contexts/clear-schedule-context';
import { ClearScheduleDialog } from '@/components/timetable/clear-schedule-dialog';

function FloatingActionButton() {
  const { openModal } = useModal();
  const today = new Date().getDay();

  const handleFabClick = () => {
    const currentHour = new Date().getHours();
    openModal({
      entry: null,
      day: today,
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user, router]);

  const today = new Date().getDay();
  const [activeTab, setActiveTab] = useState(DAYS_OF_WEEK[today]);
  
  const childrenWithProps = Children.map(children, (child) => {
    if (typeof child === 'object' && child !== null && 'props' in child) {
        return cloneElement(child as any, { activeTab });
    }
    return child;
  });

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading CollabTime...</p>
      </div>
    );
  }

  const activeDayIndex = DAYS_OF_WEEK.indexOf(activeTab);

  return (
    <ModalProvider>
      <ClearScheduleProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <Header activeDayIndex={activeDayIndex} />
          <div className="sticky top-16 z-30 w-full border-b bg-secondary/95 backdrop-blur-sm">
            <TimetableHeader activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <main className="flex-1 px-4 py-2">{childrenWithProps}</main>
          <HourModal />
          <FloatingActionButton />
          <ClearScheduleDialog />
        </div>
      </ClearScheduleProvider>
    </ModalProvider>
  );
}
