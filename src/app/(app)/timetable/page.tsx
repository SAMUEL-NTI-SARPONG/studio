
'use client';

import { TimetableGrid } from '@/components/timetable/timetable-grid';

export default function TimetablePage({ activeTab }: { activeTab?: string }) {
  return (
    <div className="mt-4">
      <TimetableGrid activeTab={activeTab} />
    </div>
  );
}
