
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/app/auth/actions';
import { useFormState, useFormStatus } from 'react-dom';

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit" className="w-full">
      {pending ? 'Submitting...' : text}
    </Button>
  );
}

export default function LoginPage() {
  const [loginState, loginAction] = useFormState(login, undefined);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Welcome back! Please enter your details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {loginState?.message && (
              <p className="text-sm text-destructive">{loginState.message}</p>
            )}
            <SubmitButton text="Login" />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
