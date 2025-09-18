'use client';
import { TickingClock } from '../timetable/ticking-clock';
import { useUser } from '@/contexts/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { LogOut, Trash, Calendar, CalendarDays } from 'lucide-react';
import { useClearSchedule } from '@/hooks/use-clear-schedule';

export default function Header({ activeDayIndex }: { activeDayIndex: number }) {
  const { user, setUser } = useUser();
  const { openClearScheduleDialog } = useClearSchedule();

  const handleLogout = () => {
    setUser(null);
  };

  const handleClear = (scope: 'personal' | 'general', time: 'day' | 'all') => {
    openClearScheduleDialog({
      scope,
      time,
      day: activeDayIndex,
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-primary">CollabTime</h1>
        </div>
        <div className="flex items-center space-x-2">
          <TickingClock />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Trash className="h-4 w-4" />
                <span className="sr-only">Clear Schedule</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <DropdownMenuLabel>Clear Schedule</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  My Schedule
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleClear('personal', 'day')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>For Today</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleClear('personal', 'all')}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    <span>For All Days</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  General Schedule
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleClear('general', 'day')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>For Today</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleClear('general', 'all')}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    <span>For All Days</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.id}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
