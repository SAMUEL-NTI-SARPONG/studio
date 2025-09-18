
'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import type { TimetableEntry } from '@/lib/types';
import { Trash, UserCheck, Users } from 'lucide-react';
import { useModal } from '@/hooks/use-modal';
import { USERS } from '@/lib/users';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import { useUser } from '@/contexts/user-context';
import { useTimetable } from '@/hooks/use-timetable';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  const { user } = useUser();
  const { toggleEventEngagement, loading, deleteEntry } = useTimetable();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleEngagementClick = async () => {
    if (user) {
      await toggleEventEngagement(entry.id, user.id);
    }
  };

  const handleDelete = async () => {
    await deleteEntry(entry.id);
    setPopoverOpen(false);
  };
  
  const isEngaged = user && entry.engaging_user_ids?.includes(user.id);

  const engagedUsers = (entry.engaging_user_ids || [])
    .map(userId => ({ id: userId, name: 'User', avatarUrl: `https://picsum.photos/seed/${userId}/200/200`}))
    

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-4" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <h4 className="font-semibold leading-none">{entry.title}</h4>
            <p className="text-sm text-muted-foreground">
              {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
            </p>
            {entry.description && (
              <p className="text-sm text-muted-foreground pt-1">{entry.description}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <Badge variant={entry.user_id ? 'secondary' : 'default'} className="text-xs">
                {entry.user_id ? 'Personal' : 'General'}
            </Badge>
            <div className="flex items-center gap-2">
                {user && (
                  <Button
                    variant={isEngaged ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleEngagementClick}
                    disabled={loading}
                    className="h-8 px-3"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    {isEngaged ? 'Engaged' : 'Engage'}
                  </Button>
                )}
                {canModify && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-3 text-destructive hover:text-destructive">
                        <Trash className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the event.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
            </div>
          </div>
          
          {engagedUsers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span>Engaged Users</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                    {engagedUsers.map(u => (
                    <Tooltip key={u.id}>
                        <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={u.avatarUrl} alt={u.name} />
                                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{u.name}</p>
                        </TooltipContent>
                    </Tooltip>
                    ))}
                </TooltipProvider>
              </div>
            </div>
          )}

        </div>
      </PopoverContent>
    </Popover>
  );
}
