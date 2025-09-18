'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { USERS } from '@/lib/users';

export default function LoginPage() {
  const { setUser } = useUser();
  const router = useRouter();

  const handleUserSelect = (user: (typeof USERS)[0]) => {
    setUser(user);
    router.push('/timetable');
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Who are you?</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          {USERS.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className="flex flex-col items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors hover:bg-accent"
            >
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-lg font-medium">{user.name}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
