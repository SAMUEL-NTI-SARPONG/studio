import { LoginForm } from '@/components/auth/login-form';
import { CalendarCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarCheck className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">CollabTime</h1>
        <p className="mt-1 text-muted-foreground">Coordinate your schedules in real-time</p>
      </div>
      <LoginForm />
    </div>
  );
}
