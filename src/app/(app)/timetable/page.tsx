
'use client';

import { TimetableGrid } from '@/components/timetable/timetable-grid';
import { useTimetableContext } from '@/contexts/timetable-context';

export default function TimetablePage() {
  const { activeTab } = useTimetableContext();

  return (
    <div className="mt-4">
      <TimetableGrid activeTab={activeTab} />
    </div>
  );
}
