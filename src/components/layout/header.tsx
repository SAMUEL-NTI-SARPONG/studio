'use client';
import { CalendarCheck } from 'lucide-react';
import { TickingClock } from '../timetable/ticking-clock';
import { TimetableHeader } from '../timetable/timetable-header';
import { useAuthContext } from '@/context/auth-provider';
import { UserNav } from './user-nav';
import { ConnectionStatus } from '../timetable/connection-status';

export default function Header() {
  const { activeTab, setActiveTab, user, loading } = useAuthContext();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">CollabTime</h1>
        </div>
        <div className="flex flex-1 justify-center">
          <TimetableHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="flex items-center justify-end space-x-4">
          <div className="flex items-center space-x-2">
            <TickingClock />
            <ConnectionStatus />
          </div>
          {!loading && user && <UserNav />}
        </div>
      </div>
    </header>
  );
}
