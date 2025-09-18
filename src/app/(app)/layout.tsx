'use client';

import Header from '@/components/layout/header';
import { TimetableHeader } from '@/components/timetable/timetable-header';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const today = new Date().getDay();
  const [activeTab, setActiveTab] = useState(DAYS_OF_WEEK[today]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="sticky top-16 z-30 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <TimetableHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
      <main className="flex-1 container mx-auto px-4 py-2">{children}</main>
    </div>
  );
}
