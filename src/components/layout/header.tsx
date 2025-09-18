
'use client';
import { useRouter } from 'next/navigation';
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
  DropdownMenuGroup,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Trash, Calendar, CalendarDays, User as UserIcon, LogOut, ArrowLeft } from 'lucide-react';
import { useClearSchedule } from '@/hooks/use-clear-schedule';
import { useProfileModal } from '@/hooks/use-profile-modal';
import { useState } from 'react';

export default function Header({ activeDayIndex }: { activeDayIndex: number }) {
  const { user, signOut } = useUser();
  const router = useRouter();
  const { openClearScheduleDialog } = useClearSchedule();
  const { openModal } = useProfileModal();
  const [menuView, setMenuView] = useState<'main' | 'personal' | 'general'>('main');

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const handleClear = (scope: 'personal' | 'general', time: 'day' | 'all') => {
    openClearScheduleDialog({
      scope,
      time,
      day: activeDayIndex,
    });
  };

  const userAvatar = user?.avatarUrl || '';
  const userName = user?.name || 'User';
  const userEmail = user?.email || 'No email';


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-primary">CollabTime</h1>
        </div>
        <div className="flex items-center space-x-2">
          <TickingClock />

          {user && (
            <>
              <DropdownMenu onOpenChange={(isOpen) => !isOpen && setMenuView('main')}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  {menuView === 'main' && (
                    <>
                      <DropdownMenuLabel>Clear Schedule</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => setMenuView('personal')}>
                        My Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setMenuView('general')}>
                        General Schedule
                      </DropdownMenuItem>
                    </>
                  )}
                   {menuView === 'personal' && (
                    <>
                      <DropdownMenuLabel className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-6 w-6 mr-2" onClick={(e) => {e.stopPropagation(); setMenuView('main');}}><ArrowLeft className="h-4 w-4" /></Button>
                        My Schedule
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleClear('personal', 'day')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>For Today</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleClear('personal', 'all')}>
                        <CalendarDays className="mr-2 h-4 w-4" />
                        <span>For All Days</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {menuView === 'general' && (
                    <>
                       <DropdownMenuLabel className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-6 w-6 mr-2" onClick={(e) => {e.stopPropagation(); setMenuView('main');}}><ArrowLeft className="h-4 w-4" /></Button>
                        General Schedule
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleClear('general', 'day')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>For Today</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleClear('general', 'all')}>
                        <CalendarDays className="mr-2 h-4 w-4" />
                        <span>For All Days</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} alt={userName} />
                      <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={openModal}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
