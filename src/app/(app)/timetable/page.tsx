'use client';
import { TimetableGrid } from '@/components/timetable/timetable-grid';

export default function TimetablePage() {
  return (
    <div>
      <p className="text-muted-foreground mb-6">
        Click on a time slot to create an event. Click an existing event to edit.
      </p>
      <TimetableGrid />
    </div>
  );
}
