import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">LEGEND</h1>
      </div>
      <LoginForm />
    </div>
  );
}
