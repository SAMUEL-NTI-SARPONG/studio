
'use client';

import { useEffect } from 'react';
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
import { useUser } from '@/contexts/user-context';
import { useProfileModal } from '@/hooks/use-profile-modal';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const profileFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  personalColor: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const COLOR_SWATCHES = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#0ea5e9', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#78716c'
];


export function ProfileModal() {
  const { isOpen, closeModal } = useProfileModal();
  const { user, colors, setColors, updateUserName } = useUser();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      personalColor: '',
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        name: user.name || '',
        personalColor: colors.personal,
      });
    }
  }, [user, colors, isOpen, form]);

  if (!user) return null;

  const onSubmit = (data: ProfileFormValues) => {
    updateUserName(data.name);
    setColors({
        personal: data.personalColor,
        general: colors.general, // Keep general color from context
    });
    toast({
        title: 'Profile Updated!',
        description: 'Your changes have been saved.',
        variant: 'achievement',
    });
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personalColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>My Schedule Color</FormLabel>
                   <FormControl>
                        <div className="grid grid-cols-6 gap-2">
                        {COLOR_SWATCHES.map(color => (
                            <button
                            type="button"
                            key={color}
                            className={cn(
                                'h-8 w-8 rounded-full border-2 flex items-center justify-center',
                                field.value === color ? 'border-primary' : 'border-transparent'
                            )}
                            style={{ backgroundColor: color }}
                            onClick={() => field.onChange(color)}
                            >
                            {field.value === color && <Check className="h-4 w-4 text-white" />}
                            </button>
                        ))}
                        </div>
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
