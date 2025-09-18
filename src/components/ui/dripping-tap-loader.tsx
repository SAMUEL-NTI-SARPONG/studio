
import { cn } from "@/lib/utils";

export function DrippingTapLoader() {
  return (
    <div className="relative h-48 w-32 flex flex-col items-center justify-end">
      {/* Tap */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16">
        <div className="h-4 w-full bg-primary/30 rounded-t-sm"></div>
        <div className="h-8 w-4 bg-primary/50 mx-auto"></div>
        <div className="h-2 w-6 bg-primary/50 mx-auto rounded-b-sm"></div>
      </div>

      {/* Drip */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-2 h-4 bg-blue-400 rounded-full animate-drip"></div>

      {/* Bucket */}
      <div className="relative h-24 w-full">
        <div className="absolute inset-x-0 bottom-0 h-full w-full bg-gray-200 dark:bg-gray-700 clip-trapezoid"></div>
        <div className="absolute inset-x-2 bottom-0 h-full w-auto bg-transparent clip-trapezoid-inner">
           {/* Water in Bucket */}
          <div className="absolute bottom-0 left-0 w-full h-full rounded-b-lg overflow-hidden">
            <div 
              className="absolute bottom-0 w-full bg-blue-400 animate-fill-bucket"
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
        </div>
      </div>
    </div>
  );
}
