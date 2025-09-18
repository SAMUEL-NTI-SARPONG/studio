
'use client';

import { useEffect } from "react";

export function BouncingBallLoader() {
  useEffect(() => {
    const vibrateOnImpact = () => {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    };
    
    const intervalId = setInterval(vibrateOnImpact, 1200);

    const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
    }, 3600); // Stop vibrating after 3 bounces (3 * 1.2s)

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="relative w-full h-40 flex items-center justify-center">
        <div className="absolute w-20 h-20 bg-primary rounded-full animate-jiggle-and-burst" />
    </div>
  );
}
