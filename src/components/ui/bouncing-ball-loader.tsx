
'use client';

import { useEffect } from "react";

export function BouncingBallLoader() {
  useEffect(() => {
    const vibrateOnImpact = () => {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    };

    // The animation is 2s long, with impacts at 0s, 1s, and 2s.
    vibrateOnImpact(); // Initial impact
    const intervalId = setInterval(vibrateOnImpact, 1000); 

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="relative w-full h-48 flex items-center justify-start overflow-hidden">
      <div className="w-8 h-8 bg-primary rounded-full animate-bounce-horizontal" />
    </div>
  );
}
