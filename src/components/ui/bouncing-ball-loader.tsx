
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

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="relative w-full h-40 flex items-center justify-center">
        <div className="absolute w-20 h-20 bg-primary rounded-full animate-jiggle-bounce" />
    </div>
  );
}
