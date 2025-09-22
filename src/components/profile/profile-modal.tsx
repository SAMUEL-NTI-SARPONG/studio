
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
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/contexts/user-context';
import { useProfileModal } from '@/hooks/use-profile-modal';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const profileFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  personalColor: z.string(),
  generalColor: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const COLOR_SWATCHES = [
  '#ef4444', '#ec4899', '#fca5a5',
  '#f97316', '#eab308', '#fcd34d',
  '#84cc16', '#22c55e', '#86efac',
  '#14b8a6', '#0ea5e9', '#3b82f6',
  '#8b5cf6', '#d946ef', '#c4b5fd',
  '#78716c', '#a16207', '#d2b48c', '#854d0e', '#a52a2a',
];

const GENERAL_COLOR_SWATCHES = [
  '#78716c', '#a1a1aa', '#52525b',
  '#134686', '#1e3a8a', '#312e81',
  '#86198f', '#881337', '#7f1d1d',
];

export function ProfileModal({ updateUserEntries }: { updateUserEntries: (userId: string, newName: string, newColor: string) => Promise<void> }) {
  const { isOpen, closeModal } = useProfileModal();
  const { user, colors, setColors, setGeneralColor, updateUserName, isInitialColorPickerOpen, setInitialColorPickerOpen } = useUser();
  const { toast } = useToast();

  const isFirstTimeSetup = isInitialColorPickerOpen && !isOpen;
  const isModalOpen = isOpen || isFirstTimeSetup;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      personalColor: '',
      generalColor: '',
    },
  });

  useEffect(() => {
    if (user && isModalOpen) {
      form.reset({
        name: user.name || '',
        personalColor: colors.personal,
        generalColor: colors.general,
      });
    }
  }, [user, colors, isModalOpen, form]);

  if (!user) return null;

  const handleClose = () => {
    if (isFirstTimeSetup) {
      if (!user.personal_color || user.personal_color === '#84cc16') {
         setColors({
           personal: '#84cc16',
         });
      }
      setInitialColorPickerOpen(false);
    }
    closeModal();
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    const hasNameChanged = data.name !== user.name;
    const hasPersonalColorChanged = data.personalColor !== user.personal_color;
    const hasGeneralColorChanged = data.generalColor !== colors.general;

    if (hasNameChanged) {
      await updateUserName(data.name);
    }
    if (hasPersonalColorChanged) {
      await setColors({
          personal: data.personalColor,
      });
    }
    if (hasGeneralColorChanged) {
        await setGeneralColor(data.generalColor);
    }

    if (hasNameChanged || hasPersonalColorChanged) {
      await updateUserEntries(user.id, data.name, data.personalColor);
    }

    toast({
        title: 'Profile Updated!',
        description: 'Your changes have been saved.',
        variant: 'achievement',
    });
    
    if (isFirstTimeSetup) {
      setInitialColorPickerOpen(false);
    }
    closeModal();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent onInteractOutside={isFirstTimeSetup ? (e) => e.preventDefault() : undefined} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isFirstTimeSetup ? "Welcome! Let's get you set up." : 'Edit Profile'}</DialogTitle>
          {isFirstTimeSetup && (
            <DialogDescription>
              Choose a color for your personal events to get started.
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {!isFirstTimeSetup && (
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
              )}

              <FormField
                control={form.control}
                name="personalColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isFirstTimeSetup ? "Choose Your Color" : "My Schedule Color"}</FormLabel>
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

              {!isFirstTimeSetup && (
                <>
                  <Separator />
                  <FormField
                    control={form.control}
                    name="generalColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Schedule Color (for all users)</FormLabel>
                         <FormControl>
                              <div className="grid grid-cols-6 gap-2">
                              {GENERAL_COLOR_SWATCHES.map(color => (
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
                </>
              )}
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isFirstTimeSetup ? 'Continue' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
