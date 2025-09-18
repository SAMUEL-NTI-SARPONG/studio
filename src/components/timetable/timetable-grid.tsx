
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useTimetable } from '@/hooks/use-timetable';
import { DAYS_OF_WEEK } from '@/lib/constants';
import type { TimetableEntry } from '@/lib/types';
import { HourModal } from './hour-modal';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Utility to parse "HH:mm" string to minutes from midnight
const parseTime = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Utility to create a Date object from a day index and time string
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
    }, 60 * 1000); // Update every minute
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
      className="absolute w-full flex items-center"
      style={{ top: `${top}%` }}
    >
      <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 z-10"></div>
      <div className="w-full h-0.5 bg-red-500"></div>
    </div>
  );
};

export function TimetableGrid() {
  const { entries, loading } = useTimetable();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [selectedTime, setSelectedTime] = useState<string>('00:00');
  const [now, setNow] = useState(new Date());

  const today = new Date().getDay();
  const [activeTab, setActiveTab] = useState(DAYS_OF_WEEK[today]);


  useEffect(() => {
    // Update the current time every minute
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

    // Add conflict detection
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
                  <div key={hour} className="h-14 flex items-start justify-end pt-0.5 relative -top-2">
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
                    className="h-14 border-t cursor-pointer hover:bg-primary/5 relative"
                    onClick={() => handleSlotClick(dayIndex, hour)}
                  >
                    <div className="absolute top-1/2 w-full border-b border-dashed border-border"></div>
                  </div>
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


                  const startTime = getDateTime(dayIndex, entry.start_time);
                  const endTime = getDateTime(dayIndex, entry.end_time);

                  const isPast = now > endTime;
                  
                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        'absolute p-2 rounded-lg border text-left cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:z-10 bg-primary/20 text-primary-foreground',
                         {
                          'bg-primary/10 border-primary/20': !isPast,
                          'bg-muted/50 border-muted-foreground/20 opacity-70': isPast,
                         }
                      )}
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        left: `${left}%`,
                        width: `${width}%`,
                        minHeight: '1rem'
                      }}
                      onClick={() => handleEntryClick(entry)}
                    >
                      <p className={cn("font-bold text-sm truncate", {
                        'text-primary-foreground': !isPast,
                        'text-muted-foreground': isPast
                      })}>{entry.title}</p>
                      <p className={cn("text-xs truncate", {
                          'text-primary-foreground/80': !isPast,
                          'text-muted-foreground/80': isPast
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
