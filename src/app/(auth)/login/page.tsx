import { LoginForm } from '@/components/auth/login-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md border-primary/20">
      <CardHeader className="items-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
          LEGEND
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
