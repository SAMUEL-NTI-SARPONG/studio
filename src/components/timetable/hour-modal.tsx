
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTimetable } from '@/hooks/use-timetable';
import type { TimetableEntry } from '@/lib/types';
import { Loader2, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type HourModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: TimetableEntry | null;
  day: number;
  time: string;
};

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  start_time: z.string().nonempty('Start time is required'),
  end_time: z.string().nonempty('End time is required'),
}).refine(data => {
    if (!data.start_time || !data.end_time) return false;
    const start = parseInt(data.start_time.replace(':', ''), 10);
    const end = parseInt(data.end_time.replace(':', ''), 10);
    return end > start;
}, {
    message: "End time must be after start time",
    path: ["end_time"],
});

const generateTimeSlots = () => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = String(h).padStart(2, '0');
        const minute = String(m).padStart(2, '0');
        slots.push(`${hour}:${minute}`);
      }
    }
    return slots;
};
  
const timeSlots = generateTimeSlots();

export function HourModal({ isOpen, setIsOpen, entry, day, time }: HourModalProps) {
  const { addEntry, updateEntry, deleteEntry } = useTimetable();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      start_time: '',
      end_time: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (entry) {
            form.reset({
                title: entry.title,
                start_time: entry.start_time,
                end_time: entry.end_time,
            });
        } else {
            const startHour = parseInt(time.split(':')[0], 10);
            const endHour = startHour + 1;
            form.reset({
                title: '',
                start_time: `${String(startHour).padStart(2, '0')}:00`,
                end_time: `${String(endHour).padStart(2, '0')}:00`,
            });
        }
    }
  }, [entry, time, form, isOpen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let success = false;
    const data = { ...values, description: null };
    if (entry) {
      success = await updateEntry(entry.id, {
        ...data,
        day_of_week: day,
      });
    } else {
      success = await addEntry({
        ...data,
        day_of_week: day,
      });
    }
    if (success) {
        setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    setIsDeleting(true);
    const success = await deleteEntry(entry.id);
    if(success) {
        setIsOpen(false);
    }
    setIsDeleting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium tracking-tight">
            {entry ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Start Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map(slot => <SelectItem key={`start-${slot}`} value={slot}>{slot}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">End Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map(slot => <SelectItem key={`end-${slot}`} value={slot}>{slot}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
              </div>
              <DialogFooter className="pt-4 sm:justify-between flex-row-reverse w-full">
                 <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                   {entry ? 'Save Changes' : 'Create Event'}
                 </Button>
                {entry && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={handleDelete}
                    disabled={isDeleting || form.formState.isSubmitting}
                  >
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete
                  </Button>
                )}
              </DialogFooter>
            </form>
          </Form>
      </DialogContent>
    </Dialog>
  );
}
