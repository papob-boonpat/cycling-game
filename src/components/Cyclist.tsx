import { useEffect, useRef } from 'react';
import { GameState, TRACK_LENGTH } from '@/lib/physics';

interface CyclistProps {
  getSnapshot: () => GameState;
}

export default function Cyclist({ getSnapshot }: CyclistProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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
      if (containerRef.current) {
        // Move across the screen as progress
        const percent = Math.min(1, Math.max(0, state.x / TRACK_LENGTH));
        const leftPos = 5 + (percent * 75); // moves from 5% to 80%
        containerRef.current.style.left = `${leftPos}%`;
      }
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [getSnapshot]);

  return (
    <div ref={containerRef} className="absolute bottom-[55%] w-20 h-20 sm:w-32 sm:h-32 pointer-events-none z-20" style={{ left: '5%' }}>
      <div 
        ref={cyclistRef}
        className="w-full h-full bg-[url('/sprites/cyclist.svg')] bg-contain bg-no-repeat bg-bottom"
      />
    </div>
  );
}
