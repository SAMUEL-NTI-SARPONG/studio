
import { cn } from "@/lib/utils";

export function FillingBottleLoader() {
  return (
    <div className="relative h-48 w-24">
      {/* Bottle Outline */}
      <div className="absolute inset-0 rounded-b-xl border-4 border-primary rounded-t-md"></div>
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-2 w-12 rounded-t-sm border-x-4 border-t-4 border-primary bg-background"></div>
      
      {/* Water */}
      <div className="absolute bottom-0 left-0 w-full h-full rounded-b-lg overflow-hidden">
        <div 
          className="absolute bottom-0 w-full bg-blue-400 animate-fill"
          style={{
            height: '100%',
          }}
        >
          {/* Wave effect */}
          <div className="absolute -top-1 left-0 w-[200%] h-4">
            <div className="absolute w-[100%] h-full bg-blue-400 rounded-full opacity-50 animate-wave"></div>
            <div className="absolute w-[100%] h-full bg-blue-500 rounded-full opacity-50 animate-wave-delay"></div>
          </div>
        </div>
      </div>
       <div className="absolute inset-0 rounded-b-xl border-4 border-transparent rounded-t-md"></div>
    </div>
  );
}
