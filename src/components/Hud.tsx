import { useEffect, useRef } from 'react';
import { GameState, TRACK_LENGTH } from '@/lib/physics';
import { RacePhase } from '@/lib/useRaceEngine';

interface HudProps {
  phase: RacePhase;
  getSnapshot: () => GameState;
}

export default function Hud({ phase, getSnapshot }: HudProps) {
  const speedRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLDivElement>(null);
  const progressIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === 'idle') return;

    let frameId: number;
    const update = () => {
      const state = getSnapshot();
      
      if (speedRef.current) {
        // km/h = m/s * 3.6
        speedRef.current.textContent = `${(state.v * 3.6).toFixed(1)} km/h`;
      }
      
      if (progressTextRef.current) {
        progressTextRef.current.textContent = `${Math.min(TRACK_LENGTH, Math.floor(state.x))} / ${TRACK_LENGTH} m`;
      }
      
      if (progressIconRef.current) {
        const percent = Math.min(100, (state.x / TRACK_LENGTH) * 100);
        progressIconRef.current.style.left = `calc(${percent}% - 16px)`;
      }
      
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [phase, getSnapshot]);

  if (phase === 'idle') return null;

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none drop-shadow-md z-30">
      <div className="bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm">
        <div className="text-sm text-gray-300">ความเร็ว</div>
        <div ref={speedRef} className="text-2xl font-bold font-mono">0.0 km/h</div>
      </div>
      
      <div className="w-1/2 max-w-md bg-black/50 p-3 rounded-lg backdrop-blur-sm flex flex-col justify-center">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>ระยะทาง</span>
          <span ref={progressTextRef}>0 / {TRACK_LENGTH} m</span>
        </div>
        <div className="relative w-full h-8 flex items-center">
          {/* Track line */}
          <div className="absolute w-full h-2 bg-gray-700 rounded-full overflow-hidden"></div>
          {/* Finish flag */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl z-0">🏁</div>
          {/* Cyclist icon */}
          <div 
            ref={progressIconRef} 
            className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl transition-all duration-75 z-10"
            style={{ transform: 'scaleX(-1)' }}
          >
            🚴
          </div>
        </div>
      </div>
    </div>
  );
}
