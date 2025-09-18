'use client';

import { TimetableGrid } from '@/components/timetable/timetable-grid';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { useState } from 'react';

export default function TimetablePage() {
  const today = new Date().getDay();
  const [activeTab, setActiveTab] = useState(DAYS_OF_WEEK[today]);
  return (
    <div className="mt-4">
      <TimetableGrid activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
