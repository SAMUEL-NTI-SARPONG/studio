
'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import type { TimetableEntry } from '@/lib/types';
import { Pencil } from 'lucide-react';
import { useModal } from '@/hooks/use-modal';
import { USERS } from '@/lib/users';
import { Badge } from '../ui/badge';
import { useState } from 'react';

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
};

export function EventPopover({
  entry,
  canModify,
  children,
}: {
  entry: TimetableEntry;
  canModify: boolean;
  children: React.ReactNode;
}) {
  const { openModal, setModalOpen } = useModal();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleEditClick = () => {
    setPopoverOpen(false);
    // Timeout to allow popover to close before modal opens, preventing UI clash
    setTimeout(() => {
        openModal({ entry, day: entry.day_of_week, source: 'slot' });
    }, 100);
  };

  const popoverUser = entry.user_id ? USERS.find(u => u.id === entry.user_id) : null;

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">{entry.title}</h4>
            <p className="text-sm text-muted-foreground">
              {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
            </p>
            {entry.description && (
              <p className="text-sm">{entry.description}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
             <Badge variant={entry.user_id ? 'secondary' : 'default'}>
                {entry.user_id ? `Personal (${popoverUser?.name})` : 'General'}
            </Badge>

            {canModify && (
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
