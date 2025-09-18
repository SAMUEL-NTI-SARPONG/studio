
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
        dayEntries.forEach((entry, i) => {
            (entry as any).conflicts = false;
            for(let j = 0; j < dayEntries.length; j++) {
                if(i === j) continue;
                const other = dayEntries[j];
                const startA = parseTime(entry.start_time);
                const endA = parseTime(entry.end_time);
                const startB = parseTime(other.start_time);
                const endB = parseTime(other.end_time);
                if (Math.max(startA, startB) < Math.min(endA, endB)) {
                    (entry as any).conflicts = true;
                    break;
                }
            }
        });
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
              <div className="w-16 text-right pr-2 text-xs text-muted-foreground">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div key={hour} className="h-12 flex items-start justify-end pt-0.5">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
                  </div>
                ))}
              </div>
              <div className="relative flex-1 bg-card border-l border">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div
                    key={hour}
                    className="h-12 border-t cursor-pointer hover:bg-primary/5"
                    onClick={() => handleSlotClick(dayIndex, hour)}
                  ></div>
                ))}
                
                {loading && <div className="absolute inset-0 flex items-center justify-center bg-card/50"><Loader2 className="animate-spin text-primary" /></div>}

                {(entriesByDay[dayIndex] || []).map((entry) => {
                  const top = (parseTime(entry.start_time) / (24 * 60)) * 100;
                  const duration = parseTime(entry.end_time) - parseTime(entry.start_time);
                  const height = (duration / (24 * 60)) * 100;

                  const startTime = getDateTime(dayIndex, entry.start_time);
                  const endTime = getDateTime(dayIndex, entry.end_time);

                  const isPast = now > endTime;
                  
                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        'absolute w-full p-2 rounded-lg border text-left cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:z-10',
                         {
                          'bg-red-100 border-red-200 text-red-700 opacity-70': isPast,
                          'bg-accent/50 border-accent/80': !isPast,
                          'ring-2 ring-destructive ring-offset-2': (entry as any).conflicts,
                        }
                      )}
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        minHeight: '2rem'
                      }}
                      onClick={() => handleEntryClick(entry)}
                    >
                      <p className={cn("font-bold text-sm truncate", {
                        'text-accent-foreground': !isPast,
                        'text-red-900': isPast
                      })}>{entry.title}</p>
                      <p className={cn("text-xs truncate", {
                          'text-accent-foreground/80': !isPast,
                          'text-red-900/80': isPast
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
