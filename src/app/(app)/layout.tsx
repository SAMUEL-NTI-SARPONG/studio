'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { DAYS_OF_WEEK } from '@/lib/constants';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const today = new Date().getDay();
  const [activeTab, setActiveTab] = useState(DAYS_OF_WEEK[today]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 container mx-auto px-4 py-2">{children}</main>
    </div>
  );
}
