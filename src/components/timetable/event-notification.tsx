
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
  const foregroundIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const triggerForegroundAlerts = () => {
    // Vibration
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([200, 100, 200]);
    }
  };
  
  const showToast = (entry: TimetableEntry, type: 'start' | 'end') => {
    const toastId = `event-${type}-${entry.id}`;
    toast({
      id: toastId,
      title: type === 'start' ? 'Event Starting Soon!' : 'Event Concluded',
      description: `${entry.title} is about to ${type === 'start' ? 'begin' : 'end'}.`,
      duration: Infinity,
      variant: 'default',
    });
  };

  const stopAlarming = (eventId: string, type: 'start' | 'end') => {
    const alarmId = `${type}-${eventId}`;
    setAlarmingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(alarmId);
        return newSet;
    });
    dismiss(`event-${alarmId}`);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'notification-clicked') {
            const { eventId, notificationType } = event.data;
            if (eventId && notificationType) {
                stopAlarming(eventId, notificationType);
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
        alarmingEvents.forEach(id => {
            const [type, eventId] = id.split('-');
            stopAlarming(eventId, type as 'start' | 'end');
        });
        return;
    }
  }, [user, alarmingEvents]);

  // Effect for foreground notifications (when app is visible)
  useEffect(() => {
    const checkUpcomingEvents = () => {
      if (!user || document.visibilityState !== 'visible') return;

      const now = new Date();
      const currentAlarms = new Set<string>();

      entries.forEach(entry => {
        const isToday = entry.day_of_week === now.getDay();
        if (!isToday) return;

        const isUserEngaged = entry.engaging_user_ids?.includes(user.id) ?? false;

        // Check for starting events
        const [startHours, startMinutes] = entry.start_time.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(startHours, startMinutes, 0, 0);
        const startTimeDiff = startTime.getTime() - now.getTime();
        
        if (startTimeDiff > 0 && startTimeDiff <= NOTIFICATION_THRESHOLD_MS && !isUserEngaged) {
          const alarmId = `start-${entry.id}`;
          currentAlarms.add(alarmId);
          if (!alarmingEvents.has(alarmId)) {
            showToast(entry, 'start');
            triggerForegroundAlerts();
          }
        } else if (startTimeDiff < -5000 && alarmingEvents.has(`start-${entry.id}`)) {
          stopAlarming(entry.id, 'start');
        }

        // Check for ending events
        const [endHours, endMinutes] = entry.end_time.split(':').map(Number);
        const endTime = new Date();
        endTime.setHours(endHours, endMinutes, 0, 0);
        const endTimeDiff = endTime.getTime() - now.getTime();
        
        if (endTimeDiff > 0 && endTimeDiff <= NOTIFICATION_THRESHOLD_MS) {
          const alarmId = `end-${entry.id}`;
          currentAlarms.add(alarmId);
          if (!alarmingEvents.has(alarmId)) {
            showToast(entry, 'end');
            triggerForegroundAlerts();
          }
        } else if (endTimeDiff < -5000 && alarmingEvents.has(`end-${entry.id}`)) {
          stopAlarming(entry.id, 'end');
        }
      });
      
      alarmingEvents.forEach(id => {
        if (!currentAlarms.has(id)) {
          const [type, eventId] = id.split('-');
          dismiss(`event-${type}-${eventId}`);
        }
      });
      
      setAlarmingEvents(currentAlarms);
    };

    const intervalId = setInterval(checkUpcomingEvents, 1000);
    return () => clearInterval(intervalId);

  }, [entries, user, toast, dismiss, alarmingEvents]);

  // Effect for repeated sound/vibration for active foreground alarms
  useEffect(() => {
    if (alarmingEvents.size > 0 && document.visibilityState === 'visible') {
      if (foregroundIntervalRef.current) clearInterval(foregroundIntervalRef.current);
      foregroundIntervalRef.current = setInterval(() => {
        triggerForegroundAlerts();
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
  }, [alarmingEvents]);
  
  // Effect for scheduling/cancelling background notifications
  useEffect(() => {
    const scheduleBackgroundNotifications = async () => {
      if (!user || !navigator.serviceWorker.ready) return;

      const now = new Date();
      
      // Clear all existing notifications before scheduling new ones
      navigator.serviceWorker.ready.then(registration => {
          registration.getNotifications().then(notifications => {
              notifications.forEach(notification => notification.close());
          });
      });

      entries.forEach(entry => {
        const isToday = entry.day_of_week === now.getDay();
        if (!isToday) return;

        const isUserEngaged = entry.engaging_user_ids?.includes(user.id) ?? false;

        // Schedule start notification
        const [startHours, startMinutes] = entry.start_time.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(startHours, startMinutes, 0, 0);

        if (startTime > now && !isUserEngaged) {
          const startDelay = startTime.getTime() - NOTIFICATION_THRESHOLD_MS - now.getTime();
          if (startDelay > 0) {
            setTimeout(() => {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('Upcoming Event: ' + entry.title, {
                    body: `${entry.title} is starting soon!`,
                    tag: `start-${entry.id}`,
                    renotify: true,
                    vibrate: [200, 100, 200],
                    icon: '/icons/icon.svg',
                });
              });
            }, startDelay);
          }
        }
        
        // Schedule end notification
        const [endHours, endMinutes] = entry.end_time.split(':').map(Number);
        const endTime = new Date();
        endTime.setHours(endHours, endMinutes, 0, 0);

        if (endTime > now) {
          const endDelay = endTime.getTime() - NOTIFICATION_THRESHOLD_MS - now.getTime();
          if (endDelay > 0) {
            setTimeout(() => {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('Event Ending: ' + entry.title, {
                    body: `${entry.title} is ending soon.`,
                    tag: `end-${entry.id}`,
                    renotify: true,
                    vibrate: [200, 100, 200],
                    icon: '/icons/icon.svg',
                });
              });
            }, endDelay);
          }
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
        scheduleBackgroundNotifications();
        // Clear foreground alarms when going to background
        alarmingEvents.forEach(id => {
          const [type, eventId] = id.split('-');
          stopAlarming(eventId, type as 'start' | 'end')
        });
      } else {
        cancelBackgroundNotifications();
        requestNotificationPermission(); // Re-check permission on focus
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Also schedule on initial load if page is not visible
    if(document.visibilityState === 'hidden') {
        scheduleBackgroundNotifications();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelBackgroundNotifications();
    };
  }, [entries, user, requestNotificationPermission, alarmingEvents]);

  return null;
}
