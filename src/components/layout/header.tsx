'use client';
import { TickingClock } from '../timetable/ticking-clock';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-primary">CollabTime</h1>
        </div>
        <div className="flex items-center space-x-4">
          <TickingClock />
        </div>
      </div>
    </header>
  );
}
