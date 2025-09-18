'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DAYS_OF_WEEK } from '@/lib/constants';

export function TimetableHeader({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (value: string) => void;
}) {
  return (
    <div className="bg-card border-b -mx-4 px-4 sticky top-16 z-30">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="container mx-auto px-0">
          <TabsList className="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-7">
            {DAYS_OF_WEEK.map((day) => (
              <TabsTrigger key={day} value={day}>
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.substring(0, 3)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
    </div>
  );
}
