
'use client';

import { useEffect, useState, useRef } from 'react';
import { useTimetable } from '@/hooks/use-timetable';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';
import type { TimetableEntry } from '@/lib/types';
import { Button } from '../ui/button';

const NOTIFICATION_THRESHOLD_MS = 60 * 1000; // 1 minute
const ALERT_INTERVAL_MS = 5000; // 5 seconds

export function EventNotification() {
  const { entries } = useTimetable();
  const { user } = useUser();
  const { toast, dismiss } = useToast();
  const [alarmingEvents, setAlarmingEvents] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    if (typeof Audio !== 'undefined') {
        audioRef.current = new Audio('/notification.mp3');
        audioRef.current.loop = false;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const triggerAlerts = (entry: TimetableEntry) => {
    // Web Notification
    new Notification('Upcoming Event', {
      body: `${entry.title} is starting now!`,
      tag: entry.id,
      renotify: true,
    });
    
    // Sound
    audioRef.current?.play().catch(e => console.warn("Could not play notification sound:", e));
    
    // Vibration
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([200, 100, 200]);
    }
  };
  
  const showToast = (entry: TimetableEntry) => {
    const toastId = `event-${entry.id}`;
    toast({
      id: toastId,
      title: 'Event Starting Soon!',
      description: `${entry.title} is about to begin.`,
      duration: Infinity,
      variant: 'default',
    });
  };

  useEffect(() => {
    const checkUpcomingEvents = () => {
      if (!user) return;
      const now = new Date();
      
      const upcomingEvents = entries.filter(entry => {
        const [hours, minutes] = entry.start_time.split(':').map(Number);
        const eventTime = new Date();
        eventTime.setHours(hours, minutes, 0, 0);

        const timeDiff = eventTime.getTime() - now.getTime();
        
        const isToday = entry.day_of_week === now.getDay();
        const isApproaching = timeDiff > 0 && timeDiff <= NOTIFICATION_THRESHOLD_MS;
        const isUserEngaged = entry.engaging_user_ids?.includes(user.id) ?? false;

        return isToday && isApproaching && !isUserEngaged;
      });

      const upcomingEventIds = new Set(upcomingEvents.map(e => e.id));
      
      // Stop alarms for events that are no longer upcoming or are now engaged
      alarmingEvents.forEach(id => {
        if (!upcomingEventIds.has(id)) {
            dismiss(`event-${id}`);
        }
      });
      
      // Start alarms for new upcoming events
      upcomingEvents.forEach(entry => {
        if (!alarmingEvents.has(entry.id)) {
            showToast(entry);
            triggerAlerts(entry); // Trigger immediately
        }
      });
      
      setAlarmingEvents(upcomingEventIds);
    };

    const intervalId = setInterval(checkUpcomingEvents, 1000);
    return () => clearInterval(intervalId);

  }, [entries, user, toast, dismiss, alarmingEvents]);


  useEffect(() => {
    if (alarmingEvents.size > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        alarmingEvents.forEach(eventId => {
            const entry = entries.find(e => e.id === eventId);
            if (entry) {
                triggerAlerts(entry);
            }
        });
      }, ALERT_INTERVAL_MS);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if(intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [alarmingEvents, entries]);


  return null;
}
