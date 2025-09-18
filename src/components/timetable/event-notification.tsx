
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useTimetable } from '@/hooks/use-timetable';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';
import type { TimetableEntry } from '@/lib/types';

const NOTIFICATION_THRESHOLD_MS = 60 * 1000; // 1 minute
const ALERT_INTERVAL_MS = 5000; // 5 seconds

export function EventNotification() {
  const { entries } = useTimetable();
  const { user } = useUser();
  const { toast, dismiss } = useToast();
  const [alarmingEvents, setAlarmingEvents] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    
    if (typeof Audio !== 'undefined') {
        audioRef.current = new Audio('/notification.mp3');
        audioRef.current.loop = false;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [requestNotificationPermission]);

  const triggerAlerts = (entry: TimetableEntry) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
                registration.showNotification('Upcoming Event', {
                    body: `${entry.title} is starting now!`,
                    tag: entry.id,
                    renotify: true,
                    vibrate: [200, 100, 200],
                });
            }
        });
    }
    
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
      if (!user || document.visibilityState !== 'visible') return;
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
      
      alarmingEvents.forEach(id => {
        if (!upcomingEventIds.has(id)) {
            dismiss(`event-${id}`);
        }
      });
      
      upcomingEvents.forEach(entry => {
        if (!alarmingEvents.has(entry.id)) {
            showToast(entry);
            triggerAlerts(entry);
        }
      });
      
      setAlarmingEvents(upcomingEventIds);
    };

    const intervalId = setInterval(checkUpcomingEvents, 1000);
    return () => clearInterval(intervalId);

  }, [entries, user, toast, dismiss, alarmingEvents]);


  useEffect(() => {
    if (alarmingEvents.size > 0 && document.visibilityState === 'visible') {
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
  
  const scheduleBackgroundNotification = useCallback(() => {
    if (!user) return;
    const now = new Date();
    const upcomingEvents = entries
      .map(entry => {
        const [hours, minutes] = entry.start_time.split(':').map(Number);
        const eventTime = new Date();
        eventTime.setHours(hours, minutes, 0, 0);
        
        const isToday = entry.day_of_week === now.getDay();
        const isUserEngaged = entry.engaging_user_ids?.includes(user.id) ?? false;
        
        if (isToday && !isUserEngaged && eventTime > now) {
          return { entry, eventTime };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.eventTime.getTime() - b!.eventTime.getTime());

    if (upcomingEvents.length > 0) {
      const nextEvent = upcomingEvents[0]!;
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          payload: {
            title: 'Upcoming Event: ' + nextEvent.entry.title,
            options: {
              body: `${nextEvent.entry.title} is starting soon!`,
              tag: nextEvent.entry.id,
              timestamp: nextEvent.eventTime.getTime() - NOTIFICATION_THRESHOLD_MS,
            }
          }
        });
      });
    }
  }, [entries, user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        scheduleBackgroundNotification();
      } else {
        navigator.serviceWorker.ready.then(registration => {
          registration.active?.postMessage({ type: 'CANCEL_NOTIFICATIONS' });
        });
        requestNotificationPermission();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [scheduleBackgroundNotification, requestNotificationPermission]);

  return null;
}
