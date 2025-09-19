
'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { TimetableEntry } from '@/lib/types';
import { useToast } from './use-toast';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/contexts/user-context';

type QueuedAction = 
  | { type: 'add', payload: Omit<TimetableEntry, 'id' | 'created_at' | 'engaging_user_ids'> }
  | { type: 'update', payload: { id: string, fields: Partial<Omit<TimetableEntry, 'id' | 'created_at'>> } }
  | { type: 'delete', payload: { id: string } }
  | { type: 'toggle_engagement', payload: { entryId: string; userId: string } };

type TimetableContextType = {
  entries: TimetableEntry[];
  loading: boolean;
  isOffline: boolean;
  addEntry: (newEntry: Omit<TimetableEntry, 'id' | 'created_at' | 'engaging_user_ids' | 'user_name' | 'user_color'>) => Promise<boolean>;
  updateEntry: (id: string, updatedFields: Partial<Omit<TimetableEntry, 'id' | 'created_at'>>) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;
  clearPersonalScheduleForDay: (dayOfWeek: number) => Promise<boolean>;
  clearPersonalScheduleForAllDays: () => Promise<boolean>;
  clearGeneralScheduleForDay: (dayOfWeek: number) => Promise<boolean>;
  clearGeneralScheduleForAllDays: () => Promise<boolean>;
  toggleEventEngagement: (entryId: string, userId: string) => Promise<void>;
  copySchedule: (sourceDay: number, destinationDays: number[]) => Promise<boolean>;
  updateUserEntries: (userId: string, newName: string, newColor: string) => Promise<void>;
};

export const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setLocalStorage = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

export function useTimetableData() {
  const supabase = createClient();
  const { toast } = useToast();
  const { user } = useUser();
  
  const [entries, setEntries] = useState<TimetableEntry[]>(() => 
    getLocalStorage<TimetableEntry[]>(`timetable-entries-${user?.id || 'guest'}`, [])
  );
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [actionQueue, setActionQueue] = useState<QueuedAction[]>(() =>
    getLocalStorage<QueuedAction[]>(`timetable-queue-${user?.id || 'guest'}`, [])
  );

  useEffect(() => {
    setLocalStorage(`timetable-entries-${user?.id || 'guest'}`, entries);
  }, [entries, user?.id]);

  useEffect(() => {
    setLocalStorage(`timetable-queue-${user?.id || 'guest'}`, actionQueue);
  }, [actionQueue, user?.id]);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast({ title: 'You are back online!', description: 'Syncing your changes.' });
      processQueue();
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast({ title: 'You are offline', description: 'Changes will be saved locally and synced when you reconnect.', variant: 'destructive'});
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      if (!window.navigator.onLine) {
        handleOffline();
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const processQueue = useCallback(async () => {
    if (isOffline || actionQueue.length === 0) return;

    const currentQueue = [...actionQueue];
    setActionQueue([]); // Clear queue optimistically

    for (const action of currentQueue) {
      try {
        if (action.type === 'add') {
          const { error } = await supabase.from('timetable_entries').insert(action.payload as any);
          if (error) throw error;
        } else if (action.type === 'update') {
          const { error } = await supabase.from('timetable_entries').update(action.payload.fields).eq('id', action.payload.id);
          if (error) throw error;
        } else if (action.type === 'delete') {
          const { error } = await supabase.from('timetable_entries').delete().eq('id', action.payload.id);
          if (error) throw error;
        } else if (action.type === 'toggle_engagement') {
          const { entryId, userId } = action.payload;
          const { data: currentEntry } = await supabase.from('timetable_entries').select('engaging_user_ids').eq('id', entryId).single();
          if (currentEntry) {
            const currentEngagedUsers = currentEntry.engaging_user_ids || [];
            const isEngaged = currentEngagedUsers.includes(userId);
            const newEngagedUsers = isEngaged
              ? currentEngagedUsers.filter(id => id !== userId)
              : [...currentEngagedUsers, userId];
            const { error } = await supabase.from('timetable_entries').update({ engaging_user_ids: newEngagedUsers }).eq('id', entryId);
            if (error) throw error;
          }
        }
      } catch (error: any) {
        console.error('Failed to process queued action:', action, error);
        // If an action fails, put it back in the queue
        setActionQueue(prev => [action, ...prev]);
        toast({ title: 'Sync Error', description: `An action failed to sync: ${error.message}`, variant: 'destructive'});
        // Stop processing further actions to maintain order
        return;
      }
    }

    // If all actions succeeded, fetch the latest state from the server
    await fetchInitialEntries(false);
    toast({ title: 'Sync Complete!', description: 'Your schedule is up to date.', variant: 'achievement'});

  }, [actionQueue, isOffline, supabase]);

  const fetchInitialEntries = useCallback(async (showLoading = true) => {
    if (isOffline) {
      setLoading(false);
      return;
    }
    if(showLoading) setLoading(true);

    const { data, error } = await supabase.from('timetable_entries').select('*');
    
    if (error) {
      console.error('Error fetching timetable entries:', error);
      toast({ title: 'Error', description: 'Could not fetch timetable data. Displaying cached data.', variant: 'destructive'});
    } else if(data) {
      setEntries(data || []);
    }
    setLoading(false);
  }, [supabase, toast, isOffline]);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    fetchInitialEntries();
    
    if(!isOffline) {
        processQueue();
    }

    const channel = supabase
      .channel('public:timetable_entries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timetable_entries' },
        (payload) => {
          if (isOffline) return; // Don't process server changes if offline
          console.log('Change received!', payload);
          if (payload.eventType === 'INSERT') {
            setEntries((currentEntries) => [...currentEntries, payload.new as TimetableEntry]);
          } else if (payload.eventType === 'UPDATE') {
            setEntries((currentEntries) =>
              currentEntries.map((entry) =>
                entry.id === (payload.new as TimetableEntry).id ? (payload.new as TimetableEntry) : entry
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setEntries((currentEntries) =>
              currentEntries.filter((entry) => entry.id !== (payload.old as TimetableEntry).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [user, toast, supabase, isOffline, processQueue, fetchInitialEntries]);
  

  const addEntry = useCallback(async (newEntry: Omit<TimetableEntry, 'id' | 'created_at' | 'engaging_user_ids' | 'user_name' | 'user_color'>) => {
    if (!user) return false;

    const entryWithUserData = {
      ...newEntry,
      user_name: newEntry.user_id ? user.name : null,
      user_color: newEntry.user_id ? user.personal_color : null,
    };

    const tempId = `offline-${Date.now()}`;
    const optimisticEntry: TimetableEntry = {
      ...entryWithUserData,
      id: tempId,
      created_at: new Date().toISOString(),
      engaging_user_ids: [],
      description: newEntry.description || null,
    };
    setEntries(prev => [...prev, optimisticEntry]);
    
    if (isOffline) {
      setActionQueue(prev => [...prev, { type: 'add', payload: entryWithUserData }]);
      toast({ title: 'Saved Locally', description: 'Event will be synced when you\'re back online.' });
      return true;
    }
    
    const { error } = await supabase.from('timetable_entries').insert(entryWithUserData as any);
    if (error) {
      console.error('Error adding entry:', error);
      toast({ title: 'Error: Could not add event', description: error.message, variant: 'destructive'});
      setEntries(prev => prev.filter(e => e.id !== tempId)); // Rollback optimistic update
      return false;
    }
    await fetchInitialEntries(false); // Re-sync with server to get the real ID
    toast({ title: 'Event Added!', description: 'A new event is on the timetable.', variant: 'achievement' });
    return true;
  }, [supabase, toast, isOffline, fetchInitialEntries, user]);

  const updateEntry = useCallback(async (id: string, updatedFields: Partial<Omit<TimetableEntry, 'id' | 'created_at'>>) => {
    const originalEntries = entries;
    const optimisticEntries = entries.map(e => e.id === id ? { ...e, ...updatedFields } : e);
    setEntries(optimisticEntries as TimetableEntry[]);
    
    if (isOffline) {
      setActionQueue(prev => [...prev, { type: 'update', payload: { id, fields: updatedFields } }]);
      toast({ title: 'Saved Locally', description: 'Changes will be synced when you\'re back online.' });
      return true;
    }

    const { error } = await supabase.from('timetable_entries').update(updatedFields).eq('id', id);
     if (error) {
      console.error('Error updating entry:', error);
      toast({ title: 'Error updating event', description: error.message, variant: 'destructive' });
      setEntries(originalEntries); // Rollback
      return false;
    }
    toast({ title: 'Event Updated!', description: 'Your changes have been saved.', variant: 'achievement' });
    return true;
  }, [supabase, toast, isOffline, entries]);

  const deleteEntry = useCallback(async (id: string) => {
    const originalEntries = entries;
    setEntries(prev => prev.filter(e => e.id !== id));
    
    if (isOffline) {
      setActionQueue(prev => [...prev, { type: 'delete', payload: { id } }]);
      toast({ title: 'Deleted Locally', description: 'Deletion will be synced when you\'re back online.' });
      return true;
    }

    const { error } = await supabase.from('timetable_entries').delete().eq('id', id);
    if (error) {
      console.error('Error deleting entry:', error);
      toast({ title: 'Error deleting event', description: error.message, variant: 'destructive' });
      setEntries(originalEntries); // Rollback
      return false;
    }
    toast({ title: 'Event Deleted!', description: 'The event has been removed.', variant: 'achievement' });
    return true;
  }, [supabase, toast, isOffline, entries]);

   const toggleEventEngagement = useCallback(async (entryId: string, userId: string) => {
    if (!user) return;

    const originalEntries = entries;
    const optimisticEntries = entries.map(entry => {
      if (entry.id === entryId) {
        const currentEngagedUsers = entry.engaging_user_ids || [];
        const isEngaged = currentEngagedUsers.includes(userId);
        const newEngagedUsers = isEngaged
          ? currentEngagedUsers.filter(id => id !== userId)
          : [...currentEngagedUsers, userId];
        return { ...entry, engaging_user_ids: newEngagedUsers };
      }
      return entry;
    });
    setEntries(optimisticEntries);

    if (isOffline) {
      setActionQueue(prev => [...prev, { type: 'toggle_engagement', payload: { entryId, userId } }]);
      return;
    }

    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    const currentEngagedUsers = entry.engaging_user_ids || [];
    const isEngaged = currentEngagedUsers.includes(userId);

    const newEngagedUsers = isEngaged
      ? currentEngagedUsers.filter(id => id !== userId)
      : [...currentEngagedUsers, userId];

    const { error } = await supabase
      .from('timetable_entries')
      .update({ engaging_user_ids: newEngagedUsers })
      .eq('id', entryId);

    if (error) {
      console.error('Engagement error:', error);
      toast({ title: 'Error', description: 'Could not update engagement status.', variant: 'destructive' });
      setEntries(originalEntries); // Rollback
    }
  }, [entries, supabase, user, toast, isOffline]);

  
  const clearPersonalScheduleForDay = useCallback(async (dayOfWeek: number) => {
    if(!user) return false;
    const { error } = await supabase.from('timetable_entries').delete().eq('user_id', user.id).eq('day_of_week', dayOfWeek);
    if (error) {
      toast({ title: 'Error', description: 'Could not clear personal schedule for the day.', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Schedule Cleared!', description: 'Your schedule for the selected day is empty.', variant: 'achievement' });
    return true;
  }, [supabase, user, toast]);
  
  const clearPersonalScheduleForAllDays = useCallback(async () => {
    if(!user) return false;
    const { error } = await supabase.from('timetable_entries').delete().eq('user_id', user.id);
     if (error) {
      toast({ title: 'Error', description: 'Could not clear your personal schedule.', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Schedule Cleared!', description: 'Your entire personal schedule is now empty.', variant: 'achievement' });
    return true;
  }, [supabase, user, toast]);

  const clearGeneralScheduleForDay = useCallback(async (dayOfWeek: number) => {
    const { error } = await supabase.from('timetable_entries').delete().is('user_id', null).eq('day_of_week', dayOfWeek);
    if (error) {
      toast({ title: 'Error', description: 'Could not clear general schedule for the day.', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Schedule Cleared!', description: 'General schedule for the day is now empty.', variant: 'achievement' });
    return true;
  }, [supabase, toast]);

  const clearGeneralScheduleForAllDays = useCallback(async () => {
    const { error } = await supabase.from('timetable_entries').delete().is('user_id', null);
    if (error) {
      toast({ title: 'Error', description: 'Could not clear the general schedule.', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Schedule Cleared!', description: 'The entire general schedule is now empty.', variant: 'achievement' });
    return true;
  }, [supabase, toast]);

  const copySchedule = useCallback(async (sourceDay: number, destinationDays: number[]) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to copy a schedule.', variant: 'destructive' });
      return false;
    }
  
    const entriesToCopy = entries.filter(entry => entry.day_of_week === sourceDay);
    if (entriesToCopy.length === 0) {
      toast({ title: 'No events to copy', description: 'The selected source day has no events.' });
      return false;
    }
  
    const newEntries = destinationDays.flatMap(day =>
      entriesToCopy.map(entry => {
        const newEntry: Omit<TimetableEntry, 'id' | 'created_at'> = {
          title: entry.title,
          description: entry.description,
          start_time: entry.start_time,
          end_time: entry.end_time,
          day_of_week: day,
          user_id: entry.user_id, // Keep the original user_id
          user_name: entry.user_name,
          user_color: entry.user_color,
          engaging_user_ids: [],
        };
        // If it's the current user's personal event being copied, use their current info
        if (entry.user_id && entry.user_id === user.id) {
            newEntry.user_name = user.name;
            newEntry.user_color = user.personal_color;
        }
        return newEntry;
      })
    );
  
    if (newEntries.length === 0) {
      return true; // Nothing to copy
    }
  
    // For offline, we can just run addEntry for each
    if (isOffline) {
        for (const entry of newEntries) {
            await addEntry(entry as any);
        }
        toast({ title: 'Copied Locally!', description: 'Schedule will be synced when you\'re back online.' });
        return true;
    }

    const { error } = await supabase.from('timetable_entries').insert(newEntries as any);
  
    if (error) {
      toast({ title: 'Error', description: 'Could not copy schedule.', variant: 'destructive' });
      console.error('Error copying schedule:', error);
      return false;
    }
  
    toast({ title: 'Schedule Copied!', description: 'Events have been copied to the selected days.', variant: 'achievement' });
    return true;
  }, [entries, supabase, toast, user, isOffline, addEntry]);

  const updateUserEntries = useCallback(async (userId: string, newName: string, newColor: string) => {
    if (isOffline) {
      toast({ title: 'Offline', description: 'Cannot update all entries while offline.', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('timetable_entries')
      .update({ user_name: newName, user_color: newColor })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user entries:', error);
      toast({ title: 'Error', description: 'Could not update your existing events.', variant: 'destructive' });
    } else {
      // Optimistically update local state to reflect changes immediately
      setEntries(prevEntries => 
        prevEntries.map(entry => 
          entry.user_id === userId 
            ? { ...entry, user_name: newName, user_color: newColor }
            : entry
        )
      );
    }
  }, [supabase, toast, isOffline]);


  const value = { entries, loading, isOffline, addEntry, updateEntry, deleteEntry, clearPersonalScheduleForDay, clearPersonalScheduleForAllDays, clearGeneralScheduleForDay, clearGeneralScheduleForAllDays, toggleEventEngagement, copySchedule, updateUserEntries };
  
  return value;
}

export function useTimetable() {
  const context = useContext(TimetableContext);
  if (context === undefined) {
    throw new Error('useTimetable must be used within a TimetableProvider');
  }
  return context;
}
