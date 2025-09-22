
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
  const foregroundIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  }, [requestNotificationPermission]);

  const triggerForegroundAlerts = (entry: TimetableEntry) => {
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

  const stopAlarming = (eventId: string) => {
    setAlarmingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
    });
    dismiss(`event-${eventId}`);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'notification-clicked') {
            const { eventId } = event.data;
            if (eventId) {
                stopAlarming(eventId);
            }
        }
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('message', handleMessage);
    }
    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('message', handleMessage);
        }
    };
  }, []);
  
  useEffect(() => {
    if (!user) {
        alarmingEvents.forEach(id => stopAlarming(id));
        return;
    }
  }, [user, alarmingEvents]);

  // Effect for foreground notifications (when app is visible)
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
        
        const isPast = timeDiff < -5000; // Allow a small grace period
        if (isPast && alarmingEvents.has(entry.id)) {
            stopAlarming(entry.id);
        }

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
          triggerForegroundAlerts(entry);
        }
      });
      
      setAlarmingEvents(upcomingEventIds);
    };

    const intervalId = setInterval(checkUpcomingEvents, 1000);
    return () => clearInterval(intervalId);

  }, [entries, user, toast, dismiss, alarmingEvents]);

  // Effect for repeated sound/vibration for active foreground alarms
  useEffect(() => {
    if (alarmingEvents.size > 0 && document.visibilityState === 'visible') {
      if (foregroundIntervalRef.current) clearInterval(foregroundIntervalRef.current);
      foregroundIntervalRef.current = setInterval(() => {
        alarmingEvents.forEach(eventId => {
            const entry = entries.find(e => e.id === eventId);
            if (entry) {
                triggerForegroundAlerts(entry);
            }
        });
      }, ALERT_INTERVAL_MS);
    } else {
      if (foregroundIntervalRef.current) {
        clearInterval(foregroundIntervalRef.current);
        foregroundIntervalRef.current = null;
      }
    }
    
    return () => {
      if(foregroundIntervalRef.current) clearInterval(foregroundIntervalRef.current);
    }
  }, [alarmingEvents, entries]);
  
  // Effect for scheduling/cancelling background notifications
  useEffect(() => {
    const scheduleBackgroundNotification = () => {
      if (!user || !navigator.serviceWorker.ready) return;

      const now = new Date();
      
      navigator.serviceWorker.ready.then(registration => {
          registration.getNotifications().then(notifications => {
              notifications.forEach(notification => notification.close());
          });
      });
      
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
        .filter((e): e is { entry: TimetableEntry; eventTime: Date } => !!e);

      upcomingEvents.forEach(eventInfo => {
        const notificationTime = eventInfo.eventTime.getTime() - NOTIFICATION_THRESHOLD_MS;
        const delay = notificationTime - now.getTime();

        if (delay > 0) {
            setTimeout(() => {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('Upcoming Event: ' + eventInfo.entry.title, {
                    body: `${eventInfo.entry.title} is starting soon!`,
                    tag: eventInfo.entry.id,
                    renotify: true,
                    vibrate: [200, 100, 200],
                    sound: '/notification.mp3',
                    icon: '/icons/icon.svg',
                });
              });
            }, delay);
        }
      });
    };
    
    const cancelBackgroundNotifications = () => {
       if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(registration => {
            registration.getNotifications().then(notifications => {
                notifications.forEach(notification => notification.close());
            });
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        scheduleBackgroundNotification();
        // Clear foreground alarms when going to background
        alarmingEvents.forEach(id => stopAlarming(id));
      } else {
        cancelBackgroundNotifications();
        requestNotificationPermission(); // Re-check permission on focus
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Also schedule on initial load if page is not visible
    if(document.visibilityState === 'hidden') {
        scheduleBackgroundNotification();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelBackgroundNotifications();
    };
  }, [entries, user, requestNotificationPermission, alarmingEvents]);

  return null;
}
