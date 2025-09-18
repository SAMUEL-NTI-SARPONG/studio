
'use client';

import { TimetableGrid } from '@/components/timetable/timetable-grid';
import { useTimetableContext } from '@/contexts/timetable-context';
import { Tabs } from '@/components/ui/tabs';

export default function TimetablePage() {
  const { activeTab } = useTimetableContext();

  return (
    <div className="mt-4">
       <Tabs value={activeTab} className="w-full">
        <TimetableGrid activeTab={activeTab} />
      </Tabs>
    </div>
  );
}
