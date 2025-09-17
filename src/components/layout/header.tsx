'use client';
import { CalendarCheck } from 'lucide-react';
import { UserNav } from './user-nav';
import { TickingClock } from '../timetable/ticking-clock';
import { ConnectionStatus } from '../timetable/connection-status';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">CollabTime</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="flex items-center space-x-2">
             <ConnectionStatus />
             <TickingClock />
          </div>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
