
'use client';

import { useEffect } from "react";
import { cn } from "@/lib/utils";


export function BouncingBallLoader({ showContent }: { showContent?: boolean }) {
  useEffect(() => {
    if (showContent) return;

    const vibrateOnImpact = () => {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        setTimeout(() => window.navigator.vibrate(50), 600);
      }
    };
    
    vibrateOnImpact(); 
    const intervalId = setInterval(vibrateOnImpact, 1200);

    return () => {
      clearInterval(intervalId);
    };
  }, [showContent]);

  return (
    <div className="relative w-full h-40 flex items-end justify-center overflow-visible">
        <div className={cn(
          "absolute w-20 h-20 bg-primary rounded-full",
          showContent ? 'animate-burst' : 'animate-jiggle-bounce'
        )} />
    </div>
  );
}
