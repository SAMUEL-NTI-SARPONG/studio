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
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    const channel = supabase
      .channel('timetable_entries_channel')
      .on<TimetableEntry>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timetable_entries' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEntries((prev) => [...prev, payload.new as TimetableEntry]);
          } else if (payload.eventType === 'UPDATE') {
            setEntries((prev) =>
              prev.map((entry) =>
                entry.id === payload.new.id ? (payload.new as TimetableEntry) : entry
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setEntries((prev) => prev.filter((entry) => entry.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, setEntries]);

  const addEntry = async (newEntry: Omit<TimetableEntry, 'id' | 'created_at' | 'user_id' | 'user_email' | 'partner1_checked_in' | 'partner2_checked_in' | 'description'>) => {
    const fullEntry = {
        ...newEntry,
        description: '',
        user_id: '00000000-0000-0000-0000-000000000000', // Anonymous user
        user_email: 'anonymous@example.com',
        partner1_checked_in: false,
        partner2_checked_in: false
    }
    const { error } = await supabase.from('timetable_entries').insert(fullEntry);
    if (error) {
      console.error('Error adding entry:', error);
      toast({ title: 'Error saving event', description: error.message, variant: 'destructive' });
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
  
  const updateCheckIn = async (id: string, partner: 1 | 2, status: boolean) => {
    const updatedField = partner === 1 ? 'partner1_checked_in' : 'partner2_checked_in';
    const { error } = await supabase.from('timetable_entries').update({ [updatedField]: status }).eq('id', id);
    if (error) {
      console.error(`Error updating partner ${partner} check-in:`, error);
      toast({ title: 'Error', description: 'Could not update check-in status.', variant: 'destructive' });
    }
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

  return { entries, loading, addEntry, updateEntry, deleteEntry, fetchEntries, updateCheckIn };
}
