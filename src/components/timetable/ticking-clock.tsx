
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function TickingClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
        <div className="hidden sm:flex items-center justify-center text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-md h-[30px] w-[215px]">
      </div>
    );
  }

  return (
    <div className="hidden sm:flex items-center justify-center text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-md">
      <span>{format(time, 'EEE, MMM d')}</span>
      <span className="mx-2">|</span>
      <span>{format(time, 'h:mm:ss a')}</span>
    </div>
  );
}
