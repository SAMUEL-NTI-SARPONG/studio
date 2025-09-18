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
import { Loader2, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useUser } from '@/contexts/user-context';
import { useModal } from '@/hooks/use-modal';

const formSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    start_time: z.string().nonempty('Start time is required'),
    end_time: z.string().nonempty('End time is required'),
    type: z.enum(['general', 'personal']).default('general'),
  })
  .refine(
    (data) => {
      if (!data.start_time || !data.end_time) return false;
      const start = parseInt(data.start_time.replace(':', ''), 10);
      const end = parseInt(data.end_time.replace(':', ''), 10);
      return end > start;
    },
    {
      message: 'End time must be after start time',
      path: ['end_time'],
    }
  );

const formatTime12h = (h: number, m: number) => {
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12)}:${String(m).padStart(2, '0')} ${period}`;
};

const generateTimeSlots = () => {
  const slots: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      const hour = String(h).padStart(2, '0');
      const minute = String(m).padStart(2, '0');
      slots.push({
        value: `${hour}:${minute}`,
        label: formatTime12h(h, m),
      });
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

export function HourModal() {
  const { modalState, closeModal } = useModal();
  const { addEntry, updateEntry, deleteEntry } = useTimetable();
  const { user } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, day, time, entry } = modalState || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      type: 'general',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        form.reset({
          title: entry.title,
          description: entry.description || '',
          start_time: entry.start_time,
          end_time: entry.end_time,
          type: entry.user_id ? 'personal' : 'general',
        });
      } else {
        const startHour = parseInt(time!.split(':')[0], 10);
        const startMinute = 0;

        let endHour = startHour + 1;
        let endMinute = 0;

        if (endHour > 23) {
          endHour = 23;
          endMinute = 55;
        }

        form.reset({
          title: '',
          description: '',
          start_time: `${String(startHour).padStart(2, '0')}:${String(
            startMinute
          ).padStart(2, '0')}`,
          end_time: `${String(endHour).padStart(2, '0')}:${String(
            endMinute
          ).padStart(2, '0')}`,
          type: 'general',
        });
      }
    }
  }, [entry, time, form, isOpen]);

  if (!isOpen) {
    return null;
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const entryData = {
      title: values.title,
      description: values.description,
      start_time: values.start_time,
      end_time: values.end_time,
      day_of_week: day,
      user_id: values.type === 'personal' ? user?.id : null,
    };

    let success = false;
    if (entry) {
      success = await updateEntry(entry.id, entryData);
    } else {
      success = await addEntry(entryData as any);
    }
    if (success) {
      closeModal();
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    setIsDeleting(true);
    const success = await deleteEntry(entry.id);
    if (success) {
      closeModal();
    }
    setIsDeleting(false);
  };
  
  const canModify =
    !entry || entry.user_id === null || entry.user_id === user?.id;
  
  const isNewEntry = !entry;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium tracking-tight">
            {entry ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <fieldset disabled={!canModify} className="space-y-4 group">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="general" id="r1" />
                          </FormControl>
                          <FormLabel htmlFor="r1" className="font-normal">
                            General
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="personal" id="r2" />
                          </FormControl>
                          <FormLabel htmlFor="r2" className="font-normal">
                            Personal
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Start Time
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isNewEntry}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem
                              key={`start-${slot.value}`}
                              value={slot.value}
                            >
                              {slot.label}
                            </SelectItem>
                          ))}
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
                      <FormLabel className="text-xs text-muted-foreground">
                        End Time
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={`end-${slot.value}`} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>
            <div className="pt-4 flex justify-between items-center w-full">
              <div>
                {entry && canModify && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={handleDelete}
                    disabled={isDeleting || form.formState.isSubmitting}
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete
                  </Button>
                )}
              </div>
               {canModify ? (

                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {entry ? 'Save Changes' : 'Save'}
                </Button>
               ) : (
                <Button type="button" onClick={closeModal}>Close</Button>
               )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
