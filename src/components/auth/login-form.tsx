
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

// Using a hardcoded email for a shared-access system.
const SHARED_EMAIL = 'shared-user@collabti.me';

export function LoginForm() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
        email: SHARED_EMAIL,
        password: values.password
    });

    if (error) {
      toast({
        title: 'Sign In Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setLoginSuccess(true);
      // Hard redirect to ensure session is picked up by middleware
      window.location.href = '/timetable';
    }
    setLoading(false);
  }

  if (loginSuccess) {
    return (
        <div className="space-y-4 pt-4 text-center">
            <p className="text-foreground">Authentication successful! Redirecting...</p>
            <div className='flex justify-center'>
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            </div>
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enter
        </Button>
      </form>
    </Form>
  );
}
