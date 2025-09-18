import { cn } from "@/lib/utils";

export function BouncingBallLoader() {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Ground and cracks */}
      <div className="absolute bottom-10 w-48 h-4">
        {/* Solid Ground */}
        <div className="absolute w-full h-full bg-yellow-900/70 rounded-md animate-ground-solid" />

        {/* Cracks */}
        <div className="absolute w-1 h-3 bg-black -rotate-45 top-1 left-24 animate-crack" style={{ animationDelay: '1s' }} />
        <div className="absolute w-1 h-3 bg-black rotate-45 top-1 left-24 animate-crack" style={{ animationDelay: '1s' }} />
        <div className="absolute w-1 h-4 bg-black rotate-12 top-1 left-20 animate-crack" style={{ animationDelay: '2s' }} />
        <div className="absolute w-1 h-4 bg-black -rotate-12 top-1 right-20 animate-crack" style={{ animationDelay: '3s' }} />

        {/* Broken Ground Pieces */}
        <div className="absolute w-1/2 h-full bg-yellow-900/70 rounded-l-md animate-ground-break-left" />
        <div className="absolute right-0 w-1/2 h-full bg-yellow-900/70 rounded-r-md animate-ground-break-right" />
      </div>

      {/* Bouncing Ball */}
      <div className="absolute w-8 h-8 bg-primary rounded-full animate-bounce ball-shadow" />
      
      {/* Ball falling through */}
       <div className="absolute w-8 h-8 bg-primary rounded-full animate-ball-fall-through" />
    </div>
  );
}
