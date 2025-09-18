'use client';
import { useState } from 'react';
import { TimetableGrid } from '@/components/timetable/timetable-grid';
import { TimetableHeader } from '@/components/timetable/timetable-header';
import { DAYS_OF_WEEK } from '@/lib/constants';

export default function TimetablePage() {
  const today = new Date().getDay();
  const [activeTab, setActiveTab] = useState(DAYS_OF_WEEK[today]);
  
  return (
    <>
      <TimetableHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="mt-4">
        <TimetableGrid activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </>
  );
}
