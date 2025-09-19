
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

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
};

const USER_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#0ea5e9', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#78716c'
];

const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

const getColorForUser = (userId: string) => {
  const hash = hashCode(userId);
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
};


const CurrentTimeIndicator = ({ dayIndex, gridHours }: { dayIndex: number, gridHours: number[] }) => {
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
  
  const currentHour = now.getHours();
  if(!gridHours.includes(currentHour)) {
    return null;
  }
  
  const hourIndex = gridHours.indexOf(currentHour);

  const minutesIntoHour = now.getMinutes();
  const top = ((hourIndex * 60 + minutesIntoHour) / (gridHours.length * 60)) * 100;

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
  const { isFiltered } = useTimetableContext();
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
  
  const gridHours = useMemo(() => {
    if (!isFiltered) {
      return Array.from({ length: 24 }, (_, i) => i);
    }
    const eventHours = new Set<number>();
    entriesForCurrentDay.forEach(entry => {
      const startHour = Math.floor(parseTime(entry.start_time) / 60);
      const endHour = Math.ceil(parseTime(entry.end_time) / 60);
      for (let h = startHour; h < endHour; h++) {
        eventHours.add(h);
      }
    });
    const hours = Array.from(eventHours).sort((a,b) => a - b);
    return hours.length > 0 ? hours : Array.from({ length: 24 }, (_, i) => i);
  }, [isFiltered, entriesForCurrentDay]);

  const totalMinutesInView = gridHours.length * 60;

  return (
    <TabsContent value={activeTab} forceMount>
      <div className="flex">
        <div className="w-20 text-right pr-2 text-xs text-primary">
            {gridHours.map((hour) => (
            <div key={hour} className="h-24 flex items-start justify-end pt-0.5 relative -top-2">
                <span className='text-xs font-medium'>
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
                </span>
            </div>
            ))}
        </div>
        <div className="relative flex-1 border-l">

            {gridHours.map((hour) => (
            <div
                key={hour}
                className="h-24 border-t"
                onClick={() => handleSlotClick(dayIndex, `${String(hour).padStart(2, '0')}:00`)}
            />
            ))}
            
            <CurrentTimeIndicator dayIndex={dayIndex} gridHours={gridHours} />

            {loading && <div className="absolute inset-0 flex items-center justify-center bg-card/50"><Loader2 className="animate-spin text-primary" /></div>}

            {entriesForCurrentDay.map((entry) => {
                const startHour = Math.floor(parseTime(entry.start_time) / 60);
                const firstHourInView = gridHours[0];
                const minutesOffset = gridHours.indexOf(startHour) * 60 - (isFiltered ? 0 : firstHourInView * 60);
                
                const startMinutes = parseTime(entry.start_time);
                const startTimeInView = isFiltered
                  ? (gridHours.indexOf(Math.floor(startMinutes/60)) * 60) + (startMinutes % 60)
                  : startMinutes;

                const top = (startTimeInView / totalMinutesInView) * 100;

                const duration = parseTime(entry.end_time) - parseTime(entry.start_time);
                const height = (duration / totalMinutesInView) * 100;
                
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
                    ? 'text-[10px]'
                    : duration < 60
                    ? 'text-xs'
                    : 'text-sm';
                
                const personalColor = user?.id === entry.user_id 
                    ? colors.personal 
                    : getColorForUser(entry.user_id || '');
                const eventColor = isPersonal ? personalColor : colors.general;

                const engagedUsers = (entry.engaging_user_ids || [])
                .map(userId => ({ id: userId, name: 'User', avatarUrl: `https://picsum.photos/seed/${userId}/200/200`}));
                
                if (isFiltered && !gridHours.includes(Math.floor(parseTime(entry.start_time)/60))) {
                   return null;
                }

                return (
                    <EventPopover
                    key={entry.id}
                    entry={entry}
                    canModify={canModify}
                >
                    <div
                    tabIndex={0}
                    className={cn(
                        'absolute p-2 cursor-pointer transition-all duration-200 ease-in-out flex flex-col items-center justify-center rounded-lg shadow-inner overflow-hidden',
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
                        minHeight: '2rem',
                        background: `linear-gradient(to bottom right, ${eventColor}99, ${eventColor}FF)`,
                        boxShadow: `inset 0 1px 1px ${eventColor}33, inset 0 -1px 1px #00000022`,

                    }}
                    >
                    <p
                        className={cn('font-bold text-white tracking-tight', fontSizeClass, {
                        'text-gray-200': isPast,
                        })}
                    >
                        {entry.title}
                    </p>
                     <p
                        className={cn('text-white/90', fontSizeClass, {
                            'text-gray-200/90': isPast,
                        })}
                        >
                        {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                    </p>
                    {engagedUsers.length > 0 && (
                        <div className="absolute bottom-1 right-1 flex items-center space-x-1">
                        <TooltipProvider>
                            {engagedUsers.slice(0, 2).map((u, i) => (
                            <Tooltip key={u.id}>
                                <TooltipTrigger asChild>
                                <Avatar
                                    className="h-5 w-5 border-2 border-white/50"
                                >
                                    <AvatarImage src={u.avatarUrl} alt={u.name} />
                                    <AvatarFallback className="text-xs">{u.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>{u.name}</p>
                                </TooltipContent>
                            </Tooltip>
                            ))}
                            {engagedUsers.length > 2 && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                <div
                                    className="h-5 w-5 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-bold text-white border-2 border-white/50"
                                >
                                    +{engagedUsers.length - 2}
                                </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>{engagedUsers.slice(2).map(u => u.name).join(', ')}</p>
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
