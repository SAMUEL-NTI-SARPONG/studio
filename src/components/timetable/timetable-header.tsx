'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function TimetableHeader({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-7 p-0 bg-transparent">
          {DAYS_OF_WEEK.map((day) => (
            <TabsTrigger
              key={day}
              value={day}
              className={cn(
                'text-muted-foreground/80 data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3',
              )}
            >
              <span className="sm:hidden">{day.substring(0, 3)}</span>
              <span className="hidden sm:inline">{day}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
