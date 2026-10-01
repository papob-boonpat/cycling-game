import { useEffect, useRef } from 'react';
import { GameState, TRACK_LENGTH } from '@/lib/physics';

interface TrackProps {
  getSnapshot: () => GameState;
}

export default function Track({ getSnapshot }: TrackProps) {
  const roadRef = useRef<HTMLDivElement>(null);
  const hillsRef = useRef<HTMLDivElement>(null);
  const windRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;
    const update = () => {
      const state = getSnapshot();
      // Cranked up to 80 for extreme speed!
      const pixelsPerMeter = 80;
      
      if (roadRef.current) {
        roadRef.current.style.backgroundPositionX = `-${state.x * pixelsPerMeter}px`;
      }
      
      if (hillsRef.current) {
        // Hills move slower to create parallax depth
        hillsRef.current.style.backgroundPositionX = `-${state.x * (pixelsPerMeter * 0.15)}px`;
      }

        if (windRef.current) {
          // Wind moves extremely fast
          windRef.current.style.backgroundPositionX = `-${state.x * (pixelsPerMeter * 4)}px`;
          // Fade in wind lines earlier and make them stronger
          const opacity = Math.min(1, Math.max(0, (state.v - 5) / 10));
          windRef.current.style.opacity = opacity.toString();
        }
  
        frameId = requestAnimationFrame(update);
      };
  
      frameId = requestAnimationFrame(update);
      return () => cancelAnimationFrame(frameId);
    }, [getSnapshot]);
  
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-sky-200">
        {/* Background / Hills with parallax */}
        <div 
          ref={hillsRef}
          className="absolute bottom-[70%] w-full h-32 bg-[url('/sprites/hills.svg')] bg-repeat-x opacity-60" 
        />
        
        {/* Road */}
        <div 
          ref={roadRef}
          className="absolute bottom-[45%] w-full h-[25%] bg-gray-700 border-t-8 border-gray-400 shadow-[inset_0_20px_20px_rgba(0,0,0,0.3)]"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 150px, rgba(255,255,255,0.8) 150px, rgba(255,255,255,0.8) 200px)',
            backgroundSize: '200px 6px',
            backgroundPosition: '0 30%',
            backgroundRepeat: 'repeat-x'
          }}
        />
        
        {/* Finish Line on Ground */}
        <div 
          className="absolute bottom-[45%] h-[25%] w-8 sm:w-16 z-10 opacity-90 border-x-4 border-white"
          style={{
            left: '85%',
            backgroundImage: 'conic-gradient(#fff 90deg, #000 90deg 180deg, #fff 180deg 270deg, #000 270deg)',
            backgroundSize: '32px 32px'
          }}
        />
  
        {/* Wind Streaks (Speed Lines) Overlay */}
        <div 
          ref={windRef}
          className="absolute inset-0 z-20 mix-blend-overlay"
          style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%),
              linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%),
              linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%),
              linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%),
              linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)
            `,
            backgroundSize: '600px 2px, 400px 1px, 300px 3px, 500px 2px, 200px 1px',
            backgroundPosition: '0 20%, 50% 60%, 20% 85%, 70% 35%, 10% 75%',
            backgroundRepeat: 'repeat-x',
            opacity: 0,
            transition: 'opacity 0.1s'
          }}
        />
    </div>
  );
}
