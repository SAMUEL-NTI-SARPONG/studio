import { cn } from "@/lib/utils";

export function DrippingTapLoader() {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <div className="absolute bottom-10 w-24 h-1 bg-gray-300 rounded-full" />
      <div className="absolute bottom-11 w-24 h-12 bg-blue-500/80 rounded-t-none rounded-b-lg overflow-hidden">
        <div className="absolute bottom-0 w-full h-1/2 bg-blue-400 animate-fill-bucket">
          <div className="absolute top-0 w-full h-2 bg-blue-300 animate-wave" />
          <div className="absolute top-0 w-full h-2 bg-blue-300 animate-wave animation-delay-500" />
        </div>
      </div>
      <div className="absolute top-0 w-12 h-8 bg-gray-400 rounded-t-lg clip-trapezoid">
         <div className="absolute top-0 w-full h-full bg-gray-300 clip-trapezoid-inner" />
      </div>
       <div className="absolute w-2 h-2 bg-blue-400 rounded-full animate-drip" />
    </div>
  );
}
