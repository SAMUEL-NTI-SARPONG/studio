'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TimetableEntry } from '@/lib/types';
import { useToast } from './use-toast';
import { createClient } from '@/lib/supabase/client';

export function useTimetable() {
  const supabase = createClient();
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('timetable_entries').select('*');
    if (error) {
      console.error('Error fetching timetable entries:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch timetable data. Please check your Supabase credentials and network connection.',
        variant: 'destructive',
      });
      setEntries([]);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchEntries();

    const channel = supabase
      .channel('timetable_entries_channel')
      .on<TimetableEntry>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timetable_entries' },
        (payload) => {
          // Re-fetch entries on any change to ensure data is fresh
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchEntries]);


  const addEntry = async (newEntry: Omit<TimetableEntry, 'id' | 'created_at' | 'user_id' >) => {
    const fullEntry = {
        ...newEntry,
        description: newEntry.description || '',
    }
    const { error } = await supabase.from('timetable_entries').insert(fullEntry as any);
    if (error) {
      console.error('Error adding entry:', error);
       toast({ title: 'Error: Permission Denied', description: 'Please ensure RLS is disabled or that anon users have INSERT permissions.', variant: 'destructive', duration: 20000 });
      return false;
    }
    toast({ title: 'Success', description: 'Event added to timetable.' });
    return true;
  };

  const updateEntry = async (id: string, updatedFields: Partial<Omit<TimetableEntry, 'id' | 'created_at' | 'user_id'>>) => {
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

  return { entries, loading, addEntry, updateEntry, deleteEntry, fetchEntries };
}
