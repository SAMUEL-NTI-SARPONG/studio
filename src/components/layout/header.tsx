
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '../ui/button';
import { Calendar, CalendarDays, User as UserIcon, LogOut, Trash2 } from 'lucide-react';
import { useClearSchedule } from '@/hooks/use-clear-schedule';
import { useProfileModal } from '@/hooks/use-profile-modal';
import { useTimetableContext } from '@/contexts/timetable-context';
import { Switch } from '@/components/ui/switch';

export default function Header({ activeDayIndex }: { activeDayIndex: number }) {
  const { user, signOut } = useUser();
  const router = useRouter();
  const { openClearScheduleDialog } = useClearSchedule();
  const { openModal } = useProfileModal();
  const { isFiltered, setIsFiltered } = useTimetableContext();

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

  const userName = user?.name || 'User';
  const userEmail = user?.email || 'No email';

  const handleFilterChange = (checked: boolean) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    setIsFiltered(checked);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-primary">Legend</h1>
        </div>
        <div className="flex items-center space-x-4">
          <TickingClock />

          <Switch
            id="filter-switch"
            checked={isFiltered}
            onCheckedChange={handleFilterChange}
          />

          {user && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} alt={userName} />
                      <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuLabel>
                    <div className="flex items-center">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Clear Schedule</span>
                    </div>
                   </DropdownMenuLabel>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="px-2 py-1.5 text-sm font-normal hover:no-underline">My Schedule</AccordionTrigger>
                        <AccordionContent className="pb-1">
                          <DropdownMenuItem onClick={() => handleClear('personal', 'day')} className="pl-6">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>For Today</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleClear('personal', 'all')} className="pl-6">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            <span>For All Days</span>
                          </DropdownMenuItem>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2" className="border-b-0">
                        <AccordionTrigger className="px-2 py-1.5 text-sm font-normal hover:no-underline">General Schedule</AccordionTrigger>
                        <AccordionContent className="pb-1">
                          <DropdownMenuItem onClick={() => handleClear('general', 'day')} className="pl-6">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>For Today</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleClear('general', 'all')} className="pl-6">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            <span>For All Days</span>
                          </DropdownMenuItem>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
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
