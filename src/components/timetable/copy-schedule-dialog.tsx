
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { useTimetable } from '@/hooks/use-timetable';
import { useCopySchedule } from '@/hooks/use-copy-schedule';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const copyScheduleSchema = z.object({
  days: z.array(z.number()).refine((value) => value.some((day) => day !== undefined), {
    message: 'You have to select at least one day.',
  }),
});

export function CopyScheduleDialog() {
  const { state, closeCopyScheduleDialog } = useCopySchedule();
  const { copySchedule } = useTimetable();
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);

  const form = useForm<{ days: number[] }>({
    resolver: zodResolver(copyScheduleSchema),
    defaultValues: {
      days: [],
    },
  });

  if (!state || !state.isOpen) {
    return null;
  }

  const { day: sourceDay } = state;
  const sourceDayName = DAYS_OF_WEEK[sourceDay];

  const onSubmit = async (data: { days: number[] }) => {
    setIsCopying(true);
    const success = await copySchedule(sourceDay, data.days);
    if(success) {
      closeCopyScheduleDialog();
      form.reset();
    }
    setIsCopying(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      closeCopyScheduleDialog();
    }
  };

  return (
    <Dialog open={state.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Copy Schedule</DialogTitle>
          <DialogDescription>
            Copy all events from <strong>{sourceDayName}</strong> to other days of the week.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="days"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Destination Days</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {DAYS_OF_WEEK.map((day, index) => {
                      if (index === sourceDay) return null;
                      return (
                        <FormField
                          key={day}
                          control={form.control}
                          name="days"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={day}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(index)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, index])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== index
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {day}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      );
                    })}
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button variant="ghost" onClick={closeCopyScheduleDialog} disabled={isCopying}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isCopying}>
                    {isCopying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Copy Events
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
