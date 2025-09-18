
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
  DialogDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { useTimetable } from '@/hooks/use-timetable';
import type { TimetableEntry } from '@/lib/types';
import { Loader2, Trash2, CalendarDays, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type HourModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: TimetableEntry | null;
  day: number;
  time: string;
};

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
}).refine(data => {
    const start = parseInt(data.start_time.replace(':', ''), 10);
    const end = parseInt(data.end_time.replace(':', ''), 10);
    return end > start;
}, {
    message: "End time must be after start time",
    path: ["end_time"],
});

export function HourModal({ isOpen, setIsOpen, entry, day, time }: HourModalProps) {
  const { addEntry, updateEntry, deleteEntry } = useTimetable();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      start_time: '09:00',
      end_time: '10:00',
    },
  });

  useEffect(() => {
    if (entry) {
      form.reset({
        title: entry.title,
        description: entry.description || '',
        start_time: entry.start_time,
        end_time: entry.end_time,
      });
    } else {
      const startHour = parseInt(time.split(':')[0], 10);
      const endHour = startHour + 1;
      form.reset({
        title: '',
        description: '',
        start_time: time,
        end_time: `${String(endHour).padStart(2, '0')}:00`,
      });
    }
  }, [entry, day, time, form, isOpen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let success = false;
    if (entry) {
      success = await updateEntry(entry.id, {
        ...values,
        day_of_week: day,
      });
    } else {
      success = await addEntry({
        ...values,
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Event' : 'Create New Event'}</DialogTitle>
        </DialogHeader>
        <Separator />
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
                        <Input placeholder="e.g., Project Sync-up" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Discuss Q3 goals" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                    <FormLabel className="flex items-center gap-2 mb-3">
                        <CalendarDays className="h-4 w-4 text-muted-foreground"/>
                        <span className="text-sm font-medium">When</span>
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="start_time"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Start Time</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input type="time" className="pl-10" {...field} />
                                </div>
                            </FormControl>
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
                            <FormControl>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input type="time" className="pl-10" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>
              </div>
              <DialogFooter className="pt-4 flex-col sm:flex-row sm:justify-between w-full">
                <div>
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
                </div>
                 <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                   {entry ? 'Save Changes' : 'Create Event'}
                 </Button>
              </DialogFooter>
            </form>
          </Form>
      </DialogContent>
    </Dialog>
  );
}
