'use client';

import Header from '@/components/layout/header';
import { TimetableHeader } from '@/components/timetable/timetable-header';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';

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

  if (!user) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading CollabTime...</p>
    </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="sticky top-16 z-30 w-full border-b bg-secondary/95 backdrop-blur-sm">
        <TimetableHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <main className="flex-1 container mx-auto px-4 py-2">{children}</main>
    </div>
  );
}
