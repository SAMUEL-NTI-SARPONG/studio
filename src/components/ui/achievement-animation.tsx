
'use client';

export function AchievementAnimation() {
  return (
    <div className="relative w-12 h-12 mr-4">
      {/* Sparkles */}
      <div className="absolute top-0 left-0 w-3 h-3 bg-yellow-400 rounded-full animate-sparkle" style={{ animationDelay: '0.3s' }} />
      <div className="absolute top-2 right-0 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1 left-2 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle" style={{ animationDelay: '0.7s' }} />

      {/* Trophy */}
      <div className="relative w-full h-full animate-trophy-pop">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-yellow-600 rounded-t-sm" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-700" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-8 bg-yellow-500 rounded-t-full rounded-b-sm overflow-hidden">
             {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-white/30 animate-trophy-shine" />
        </div>
      </div>
    </div>
  );
}
