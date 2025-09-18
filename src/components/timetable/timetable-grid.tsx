
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useTimetable } from '@/hooks/use-timetable';
import { DAYS_OF_WEEK } from '@/lib/constants';
import type { TimetableEntry } from '@/lib/types';
import { HourModal } from './hour-modal';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/user-context';

const parseTime = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
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

export function TimetableGrid() {
  const { entries, loading } = useTimetable();
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [selectedTime, setSelectedTime] = useState<string>('00:00');
  const [now, setNow] = useState(new Date());

  const today = new Date().getDay();
  const [activeTab, setActiveTab] = useState(DAYS_OF_WEEK[today]);


  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSlotClick = (day: number, hour: number) => {
    setSelectedDay(day);
    setSelectedTime(`${String(hour).padStart(2, '0')}:00`);
    setSelectedEntry(null);
    setIsModalOpen(true);
  };

  const handleEntryClick = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setSelectedDay(entry.day_of_week);
    setIsModalOpen(true);
  };

  const entriesByDay = useMemo(() => {
    const grouped: { [key: number]: TimetableEntry[] } = {};
    for (let i = 0; i < 7; i++) {
      grouped[i] = [];
    }
    entries.forEach((entry) => {
      if (grouped[entry.day_of_week]) {
        grouped[entry.day_of_week].push(entry);
      } else {
        grouped[entry.day_of_week] = [entry];
      }
    });

    Object.values(grouped).forEach(dayEntries => {
        dayEntries.sort((a, b) => parseTime(a.start_time) - parseTime(b.start_time));
        
        const columns: TimetableEntry[][] = [];
        dayEntries.forEach(entry => {
            let placed = false;
            for (const col of columns) {
                const lastEntry = col[col.length - 1];
                if (parseTime(entry.start_time) >= parseTime(lastEntry.end_time)) {
                    col.push(entry);
                    (entry as any).column = columns.indexOf(col);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                columns.push([entry]);
                (entry as any).column = columns.length - 1;
            }
        });

        (dayEntries as any).columnCount = columns.length;
    });

    return grouped;
  }, [entries]);

  useEffect(() => {
    setSelectedDay(DAYS_OF_WEEK.indexOf(activeTab));
  }, [activeTab]);


  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {DAYS_OF_WEEK.map((day, dayIndex) => (
          <TabsContent key={day} value={day} className="mt-0">
            <div className="flex">
              <div className="w-20 text-right pr-2 text-xs text-muted-foreground">
                 {Array.from({ length: 24 }).map((_, hour) => (
                  <div key={hour} className="h-24 flex items-start justify-end pt-0.5 relative -top-2">
                    <span className='text-xs'>
                      {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative flex-1 border-l">

                {Array.from({ length: 24 }).map((_, hour) => (
                  <div
                    key={hour}
                    className="h-24 border-t cursor-pointer hover:bg-primary/5"
                    onClick={() => handleSlotClick(dayIndex, hour)}
                  />
                ))}
                
                <CurrentTimeIndicator dayIndex={dayIndex}/>

                {loading && <div className="absolute inset-0 flex items-center justify-center bg-card/50"><Loader2 className="animate-spin text-primary" /></div>}

                {(entriesByDay[dayIndex] || []).map((entry) => {
                  const top = (parseTime(entry.start_time) / (24 * 60)) * 100;
                  const duration = parseTime(entry.end_time) - parseTime(entry.start_time);
                  const height = (duration / (24 * 60)) * 100;
                  
                  const columnCount = (entriesByDay[dayIndex] as any).columnCount || 1;
                  const column = (entry as any).column || 0;
                  const width = 100 / columnCount;
                  const left = column * width;

                  const endTime = getDateTime(dayIndex, entry.end_time);
                  const isPast = now > endTime;

                  const isPersonal = entry.user_id !== null;
                  const isMyEvent = isPersonal && entry.user_id === user?.id;
                  
                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        'absolute p-2 rounded-lg border text-left cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:z-10 overflow-hidden',
                        {
                          'bg-primary/20 border-primary/30 text-primary-foreground': !isPersonal,
                          'bg-green-500/20 border-green-500/30 text-green-800 dark:text-green-200': isMyEvent,
                          'bg-orange-500/20 border-orange-500/30 text-orange-800 dark:text-orange-200': isPersonal && !isMyEvent,
                          'opacity-60': isPast,
                        }
                      )}
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        left: `${left}%`,
                        width: `${width}%`,
                        minHeight: '1.5rem'
                      }}
                      onClick={() => handleEntryClick(entry)}
                    >
                      <p className={cn("font-bold text-sm truncate", {
                        'text-primary-foreground': !isPersonal && !isPast,
                        'dark:text-white text-black': isPersonal && !isPast,
                        'text-muted-foreground': isPast
                      })}>{entry.title}</p>
                      <p className={cn("text-xs truncate", {
                         'text-primary-foreground/80': !isPersonal && !isPast,
                         'dark:text-white/80 text-black/80': isPersonal && !isPast,
                         'text-muted-foreground/80': isPast,
                      })}>
                        {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                      </p>
                      <p className={cn("text-xs truncate pt-1", {
                         'text-primary-foreground/70': !isPersonal && !isPast,
                         'dark:text-white/70 text-black/70': isPersonal && !isPast,
                         'text-muted-foreground/70': isPast
                      })}>{entry.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <HourModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        entry={selectedEntry}
        day={selectedDay}
        time={selectedTime}
      />
    </>
  );
}
