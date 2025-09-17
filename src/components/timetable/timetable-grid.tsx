'use client';

import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useTimetable } from '@/hooks/use-timetable';
import { useAuth } from '@/hooks/use-auth';
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

export function TimetableGrid() {
  const { entries, loading } = useTimetable();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [selectedTime, setSelectedTime] = useState<string>('00:00');

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

  const today = new Date().getDay();
  const [activeTab, setActiveTab] = useState(DAYS_OF_WEEK[today]);

  useEffect(() => {
    setSelectedDay(DAYS_OF_WEEK.indexOf(activeTab));
  }, [activeTab]);


  return (
    <>
      <Card>
        <CardContent className="p-2 sm:p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 h-auto">
              {DAYS_OF_WEEK.map((day) => (
                <TabsTrigger key={day} value={day}>
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.substring(0,3)}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {DAYS_OF_WEEK.map((day, dayIndex) => (
              <TabsContent key={day} value={day} className="mt-4">
                <div className="flex">
                  <div className="w-16 text-right pr-2 text-xs text-muted-foreground">
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <div key={hour} className="h-12 flex items-start justify-end pt-0.5">
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
                      </div>
                    ))}
                  </div>
                  <div className="relative flex-1 bg-card border-l">
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
                      const isOwn = entry.user_id === user?.id;

                      return (
                        <div
                          key={entry.id}
                          className={cn(
                            'absolute w-full p-2 rounded-lg border text-left cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:z-10',
                            isOwn ? 'bg-primary/20 border-primary/50' : 'bg-accent/50 border-accent/80',
                            (entry as any).conflicts && 'ring-2 ring-destructive ring-offset-2'
                          )}
                          style={{
                            top: `${top}%`,
                            height: `${height}%`,
                            minHeight: '2rem'
                          }}
                          onClick={() => handleEntryClick(entry)}
                        >
                          <p className={cn("font-bold text-sm truncate", isOwn ? 'text-primary' : 'text-accent-foreground')}>{entry.title}</p>
                          <p className={cn("text-xs truncate", isOwn ? 'text-primary opacity-80' : 'text-accent-foreground/80')}>{entry.description}</p>
                          <p className={cn("text-xs italic truncate opacity-70", isOwn ? 'text-primary' : 'text-accent-foreground')}>
                            {entry.user_email.split('@')[0]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
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
