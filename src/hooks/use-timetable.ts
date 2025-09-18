
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TimetableEntry } from '@/lib/types';
import { useToast } from './use-toast';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/contexts/user-context';

export function useTimetable() {
  const supabase = createClient();
  const { toast } = useToast();
  const { user } = useUser();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
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
  }, [supabase, toast]);

  useEffect(() => {
    // Only fetch entries if a user is loaded.
    if (user) {
      fetchEntries();
    }
  }, [fetchEntries, user]);


  useEffect(() => {
    const channel = supabase
      .channel('timetable_entries_channel')
      .on<TimetableEntry>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timetable_entries' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEntries((prevEntries) => [...prevEntries, payload.new as TimetableEntry]);
          } else if (payload.eventType === 'UPDATE') {
            setEntries((prevEntries) =>
              prevEntries.map((entry) =>
                entry.id === payload.new.id ? (payload.new as TimetableEntry) : entry
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setEntries((prevEntries) =>
              prevEntries.filter((entry) => entry.id !== (payload.old as {id: string}).id)
            );
          }
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, setEntries]);


  const addEntry = async (newEntry: Omit<TimetableEntry, 'id' | 'created_at' | 'engaging_user_ids'>) => {
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
    toast({ title: 'Success', description: 'Event added to timetable.' });
    return true;
  };

  const updateEntry = async (id: string, updatedFields: Partial<Omit<TimetableEntry, 'id' | 'created_at'>>) => {
    const { error } = await supabase.from('timetable_entries').update(updatedFields).eq('id', id);
     if (error) {
      console.error('Error updating entry:', error);
      toast({ title: 'Error updating event', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Event updated.' });
    return true;
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('timetable_entries').delete().eq('id', id);
    if (error) {
      console.error('Error deleting entry:', error);
      toast({ title: 'Error deleting event', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Event deleted.' });
    return true;
  };
  
  const clearPersonalScheduleForDay = async (dayOfWeek: number) => {
    if(!user) return false;
    const { error } = await supabase.from('timetable_entries').delete().eq('user_id', user.id).eq('day_of_week', dayOfWeek);
    if (error) {
      toast({ title: 'Error', description: 'Could not clear personal schedule for the day.', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Your schedule for the selected day has been cleared.' });
    return true;
  };
  
  const clearPersonalScheduleForAllDays = async () => {
    if(!user) return false;
    const { error } = await supabase.from('timetable_entries').delete().eq('user_id', user.id);
     if (error) {
      toast({ title: 'Error', description: 'Could not clear your personal schedule.', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Your entire personal schedule has been cleared.' });
    return true;
  };

  const clearGeneralScheduleForDay = async (dayOfWeek: number) => {
    const { error } = await supabase.from('timetable_entries').delete().is('user_id', null).eq('day_of_week', dayOfWeek);
    if (error) {
      toast({ title: 'Error', description: 'Could not clear general schedule for the day.', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'General schedule for the selected day has been cleared.' });
    return true;
  };

  const clearGeneralScheduleForAllDays = async () => {
    const { error } = await supabase.from('timetable_entries').delete().is('user_id', null);
    if (error) {
      toast({ title: 'Error', description: 'Could not clear the general schedule.', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'The entire general schedule has been cleared.' });
    return true;
  };
  
  const toggleEventEngagement = async (entryId: string, userId: string) => {
    setLoading(true);
    const entry = entries.find(e => e.id === entryId);
    if (!entry || !user) {
      setLoading(false);
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
    setLoading(false);
  };

  const copySchedule = async (sourceDay: number, destinationDays: number[]) => {
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

    toast({ title: 'Success', description: 'Schedule copied successfully.' });
    return true;
  }


  return { entries, loading, addEntry, updateEntry, deleteEntry, fetchEntries, clearPersonalScheduleForDay, clearPersonalScheduleForAllDays, clearGeneralScheduleForDay, clearGeneralScheduleForAllDays, toggleEventEngagement, copySchedule };
}
