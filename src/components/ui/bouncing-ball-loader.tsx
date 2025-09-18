
'use client';

import { useEffect } from "react";

export function BouncingBallLoader() {
  useEffect(() => {
    const vibrateOnImpact = () => {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    };

    // The animation is 1.5s long, with impact at the start/end of the cycle.
    const intervalId = setInterval(vibrateOnImpact, 1500); 

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
      <div className="w-12 h-12 bg-primary rounded-full animate-bounce-vertical-perspective" />
    </div>
  );
}
