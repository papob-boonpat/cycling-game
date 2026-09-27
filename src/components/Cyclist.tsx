import { useEffect, useRef } from 'react';
import { GameState } from '@/lib/physics';

interface CyclistProps {
  getSnapshot: () => GameState;
}

export default function Cyclist({ getSnapshot }: CyclistProps) {
  const cyclistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;
    const update = () => {
      const state = getSnapshot();
      if (cyclistRef.current) {
        // Cyclist leans backward dynamically based on speed (wheelie effect!)
        const lean = Math.min(25, state.v * 1.8);
        cyclistRef.current.style.transform = `rotate(-${lean}deg)`;
        cyclistRef.current.style.transformOrigin = `bottom center`;
      }
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [getSnapshot]);

  return (
    <div className="absolute bottom-[30%] left-1/4 w-32 h-32 pointer-events-none">
      <div 
        ref={cyclistRef}
        className="w-full h-full bg-[url('/sprites/cyclist.svg')] bg-contain bg-no-repeat bg-bottom"
      />
    </div>
  );
}
