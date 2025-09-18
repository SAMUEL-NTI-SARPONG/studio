
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import type { TimetableEntry } from '@/lib/types';
import { useToast } from './use-toast';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/contexts/user-context';


type TimetableContextType = {
  entries: TimetableEntry[];
  loading: boolean;
  addEntry: (newEntry: Omit<TimetableEntry, 'id' | 'created_at' | 'engaging_user_ids'>) => Promise<boolean>;
  updateEntry: (id: string, updatedFields: Partial<Omit<TimetableEntry, 'id' | 'created_at'>>) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;
  clearPersonalScheduleForDay: (dayOfWeek: number) => Promise<boolean>;
  clearPersonalScheduleForAllDays: () => Promise<boolean>;
  clearGeneralScheduleForDay: (dayOfWeek: number) => Promise<boolean>;
  clearGeneralScheduleForAllDays: () => Promise<boolean>;
  toggleEventEngagement: (entryId: string, userId: string) => Promise<void>;
  copySchedule: (sourceDay: number, destinationDays: number[]) => Promise<boolean>;
};

export const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

export function useTimetableData() {
  const supabase = createClient();
  const { toast } = useToast();
  const { user } = useUser();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const fetchInitialEntries = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('timetable_entries').select('*');
      
      if (error) {
        console.error('Error fetching timetable entries:', error);
        toast({
          title: 'Error',
          description: 'Could not fetch timetable data.',
          variant: 'destructive',
        });
        setEntries([]);
      } else {
        setEntries(data || []);
      }
      setLoading(false);
    };

    fetchInitialEntries();

    const channel = supabase
      .channel('public:timetable_entries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timetable_entries' },
        (payload) => {
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

  }, [user, toast, supabase]);
  

  const addEntry = useCallback(async (newEntry: Omit<TimetableEntry, 'id' | 'created_at' | 'engaging_user_ids'>) => {
    const fullEntry = {
        ...newEntry,
        description: newEntry.description || null,
        engaging_user_ids: [],
    }
    const { error } = await supabase.from('timetable_entries').insert(fullEntry as any);
    if (error) {
      console.error('Error adding entry:', error);
       toast({ title: 'Error: Could not add event', description: 'Please check console for details.', variant: 'destructive'});
      return false;
    }
    toast({ title: 'Event Added!', description: 'A new event is on the timetable.', variant: 'achievement' });
    return true;
  }, [supabase, toast]);

  const updateEntry = useCallback(async (id: string, updatedFields: Partial<Omit<TimetableEntry, 'id' | 'created_at'>>) => {
    const { error } = await supabase.from('timetable_entries').update(updatedFields).eq('id', id);
     if (error) {
      console.error('Error updating entry:', error);
      toast({ title: 'Error updating event', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Event Updated!', description: 'Your changes have been saved.', variant: 'achievement' });
    return true;
  }, [supabase, toast]);

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await supabase.from('timetable_entries').delete().eq('id', id);
    if (error) {
      console.error('Error deleting entry:', error);
      toast({ title: 'Error deleting event', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Event Deleted!', description: 'The event has been removed.', variant: 'achievement' });
    return true;
  }, [supabase, toast]);
  
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
  
  const toggleEventEngagement = useCallback(async (entryId: string, userId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry || !user) {
      return;
    }

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
    }
  }, [entries, supabase, user, toast]);

  const copySchedule = useCallback(async (sourceDay: number, destinationDays: number[]) => {
    const entriesToCopy = entries.filter(entry => entry.day_of_week === sourceDay);
    if (entriesToCopy.length === 0) {
      toast({ title: 'No events to copy', description: 'The selected source day has no events.' });
      return false;
    }

    const newEntries = destinationDays.flatMap(day => 
      entriesToCopy.map(entry => {
        const { id, created_at, ...rest } = entry;
        return {
          ...rest,
          day_of_week: day,
          engaging_user_ids: [],
        };
      })
    );

    const { error } = await supabase.from('timetable_entries').insert(newEntries as any);

    if (error) {
      toast({ title: 'Error', description: 'Could not copy schedule.', variant: 'destructive' });
      console.error('Error copying schedule:', error);
      return false;
    }

    toast({ title: 'Schedule Copied!', description: 'Events have been copied to the selected days.', variant: 'achievement' });
    return true;
  }, [entries, supabase, toast]);


  return { entries, loading, addEntry, updateEntry, deleteEntry, clearPersonalScheduleForDay, clearPersonalScheduleForAllDays, clearGeneralScheduleForDay, clearGeneralScheduleForAllDays, toggleEventEngagement, copySchedule };
}

export function useTimetable() {
  const context = useContext(TimetableContext);
  if (context === undefined) {
    throw new Error('useTimetable must be used within a TimetableProvider');
  }
  return context;
}
