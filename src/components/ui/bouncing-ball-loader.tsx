
'use client';

import { useEffect } from "react";

export function BouncingBallLoader() {
  useEffect(() => {
    const vibrateOnImpact = () => {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        // Vibrate for 50ms when the ball hits the ground.
        // The animation is 1s, and impact is at 50%.
        window.navigator.vibrate(50);
      }
    };
    
    // The impact happens once per animation cycle (1.2s).
    const intervalId = setInterval(vibrateOnImpact, 1200);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
        <div className="absolute w-20 h-20 bg-primary rounded-full animate-jiggle-bounce" />
        <div className="absolute bottom-[4.5rem] w-32 h-2 bg-gray-300 rounded-full" />
    </div>
  );
}
