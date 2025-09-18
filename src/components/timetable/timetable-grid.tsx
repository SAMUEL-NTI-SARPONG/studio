
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useTimetable } from '@/hooks/use-timetable';
import { DAYS_OF_WEEK } from '@/lib/constants';
import type { TimetableEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/user-context';
import { EventPopover } from './event-popover';
import { useModal } from '@/hooks/use-modal';
import { USERS } from '@/lib/users';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useTimetableContext } from '@/contexts/timetable-context';

const parseTime = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const getDateTime = (day: number, time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  const dayDiff = day - date.getDay();
  date.setDate(date.getDate() + dayDiff);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const CurrentTimeIndicator = ({ dayIndex }: { dayIndex: number }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().getDay();
  if (dayIndex !== today) {
    return null;
  }

  const minutes = now.getHours() * 60 + now.getMinutes();
  const top = (minutes / (24 * 60)) * 100;

  return (
    <div
      className="absolute w-full flex items-center z-20"
      style={{ top: `${top}%` }}
    >
      <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
      <div className="w-full h-0.5 bg-red-500"></div>
    </div>
  );
};

export function TimetableGrid({ activeTab }: { activeTab: string }) {
  const { entries, loading } = useTimetable();
  const { user, colors } = useUser();
  const { openModal } = useModal();
  const [now, setNow] = useState(new Date());
  
  const dayIndex = useMemo(() => DAYS_OF_WEEK.indexOf(activeTab), [activeTab]);


  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const entriesForCurrentDay = useMemo(() => {
    const dayEntries = entries.filter(entry => entry.day_of_week === dayIndex);
    
    dayEntries.sort((a, b) => parseTime(a.start_time) - parseTime(b.start_time));
    
    const visualInfo = dayEntries.map(entry => ({
      ...entry,
      start: parseTime(entry.start_time),
      end: parseTime(entry.end_time),
      column: -1,
      totalColumns: 1
    }));

    for (let i = 0; i < visualInfo.length; i++) {
      const currentEntry = visualInfo[i];
      let col = 0;
      let placed = false;
      
      while (!placed) {
        let hasOverlap = false;
        for (let j = 0; j < i; j++) {
          const otherEntry = visualInfo[j];
          if (otherEntry.column === col && currentEntry.start < otherEntry.end && currentEntry.end > otherEntry.start) {
            hasOverlap = true;
            break;
          }
        }
        
        if (!hasOverlap) {
          currentEntry.column = col;
          placed = true;
        } else {
          col++;
        }
      }
    }

    for (let i = 0; i < visualInfo.length; i++) {
      const entryA = visualInfo[i];
      let maxColumns = 1;
      for (let j = 0; j < visualInfo.length; j++) {
        if (i === j) continue;
        const entryB = visualInfo[j];
        const A_overlaps_B = entryA.start < entryB.end && entryA.end > entryB.start;
        if (A_overlaps_B) {
          maxColumns = Math.max(maxColumns, entryB.column + 1);
        }
      }
      entryA.totalColumns = maxColumns;
    }
    
    for (let i = 0; i < visualInfo.length; i++) {
      const entryA = visualInfo[i];
      let newTotalColumns = entryA.totalColumns;
      for(let j=0; j < visualInfo.length; j++) {
         const entryB = visualInfo[j];
         if(entryA.start < entryB.end && entryA.end > entryB.start) {
            newTotalColumns = Math.max(newTotalColumns, entryB.totalColumns);
         }
      }
      entryA.totalColumns = newTotalColumns;
    }

    return visualInfo.map(entryInfo => {
      const originalEntry = dayEntries.find(e => e.id === entryInfo.id);
      if (originalEntry) {
        (originalEntry as any).column = entryInfo.column;
        (originalEntry as any).columnCount = entryInfo.totalColumns;
      }
      return originalEntry as TimetableEntry & { column: number, columnCount: number };
    }).filter(Boolean);

  }, [entries, dayIndex]);
  
  const handleSlotClick = (day: number, time: string) => {
    // openModal({ entry: null, day, time, source: 'slot' });
  };

  return (
    <TabsContent value={activeTab} forceMount>
      <div className="flex">
        <div className="w-20 text-right pr-2 text-xs text-primary">
            {Array.from({ length: 24 }).map((_, hour) => (
            <div key={hour} className="h-24 flex items-start justify-end pt-0.5 relative -top-2">
                <span className='text-xs font-medium'>
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
                </span>
            </div>
            ))}
        </div>
        <div className="relative flex-1 border-l">

            {Array.from({ length: 24 }).map((_, hour) => (
            <div
                key={hour}
                className="h-24 border-t"
                onClick={() => handleSlotClick(dayIndex, `${String(hour).padStart(2, '0')}:00`)}
            />
            ))}
            
            <CurrentTimeIndicator dayIndex={dayIndex}/>

            {loading && <div className="absolute inset-0 flex items-center justify-center bg-card/50"><Loader2 className="animate-spin text-primary" /></div>}

            {entriesForCurrentDay.map((entry) => {
                const top = (parseTime(entry.start_time) / (24 * 60)) * 100;
                const duration = parseTime(entry.end_time) - parseTime(entry.start_time);
                const height = (duration / (24 * 60)) * 100;
                
                const columnCount = (entry as any).columnCount || 1;
                const column = (entry as any).column || 0;
                const width = `calc(${100 / columnCount}% - 2px)`;
                const left = `calc(${column * (100 / columnCount)}% + 1px)`;

                const endTime = getDateTime(dayIndex, entry.end_time);
                const isPast = now > endTime;

                const isPersonal = entry.user_id !== null;
                const canModify = !entry.user_id || entry.user_id === user?.id;
                
                const fontSizeClass =
                duration < 30
                    ? 'text-sm'
                    : duration < 60
                    ? 'text-base'
                    : 'text-lg';
                
                const personalColor = user?.id === entry.user_id ? colors.personal : '#a0aec0';
                const eventColor = isPersonal ? personalColor : colors.general;

                const engagedUsers = (entry.engaging_user_ids || [])
                .map(userId => USERS.find(u => u.id === userId))
                .filter(Boolean) as (typeof USERS)[0][];

                return (
                    <EventPopover
                    key={entry.id}
                    entry={entry}
                    canModify={canModify}
                >
                    <div
                    tabIndex={0}
                    className={cn(
                        'absolute p-2 border cursor-pointer transition-all duration-200 ease-in-out flex flex-col items-center justify-center',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:z-10',
                        {
                        'opacity-60': isPast,
                        }
                    )}
                    style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        left: left,
                        width: width,
                        minHeight: '1.5rem',
                        backgroundColor: eventColor,
                        borderColor: eventColor,
                    }}
                    >
                    <p
                        className={cn('font-normal text-center text-white', fontSizeClass, {
                        'text-muted-foreground': isPast,
                        })}
                    >
                        {entry.title}
                    </p>
                    {engagedUsers.length > 0 && (
                        <div className="absolute bottom-1 right-1 flex items-center">
                        <TooltipProvider>
                            {engagedUsers.slice(0, 3).map((u, i) => (
                            <Tooltip key={u.id}>
                                <TooltipTrigger asChild>
                                <Avatar
                                    className="h-6 w-6 border-2 border-background"
                                    style={{ zIndex: engagedUsers.length - i, marginLeft: i > 0 ? -8 : 0 }}
                                >
                                    <AvatarImage src={u.avatarUrl} alt={u.name} />
                                    <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>{u.name}</p>
                                </TooltipContent>
                            </Tooltip>
                            ))}
                            {engagedUsers.length > 3 && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                <div
                                    className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border-2 border-background"
                                    style={{ zIndex: 0, marginLeft: -8 }}
                                >
                                    +{engagedUsers.length - 3}
                                </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>{engagedUsers.slice(3).map(u => u.name).join(', ')}</p>
                                </TooltipContent>
                            </Tooltip>
                            )}
                        </TooltipProvider>
                        </div>
                    )}
                    </div>
                </EventPopover>
                );
            })}
        </div>
      </div>
    </TabsContent>
  );
}
