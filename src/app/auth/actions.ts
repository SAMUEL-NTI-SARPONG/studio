
'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { message: error.message };
  }

  redirect('/timetable');
}

export async function signup(prevState: any, formData: FormData) {
  const origin = headers().get('origin');
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { message: error.message };
  }

  // For server-side rendering, you might need to handle the confirmation email message.
  // For now, we redirect and let the user know to check their email.
  redirect('/?message=Check email to continue sign in process');
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}
