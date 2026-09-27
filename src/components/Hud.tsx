import { useEffect, useRef } from 'react';
import { GameState, TRACK_LENGTH } from '@/lib/physics';
import { RacePhase } from '@/lib/useRaceEngine';

interface HudProps {
  phase: RacePhase;
  getSnapshot: () => GameState;
}

export default function Hud({ phase, getSnapshot }: HudProps) {
  const speedRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === 'idle') return;

    let frameId: number;
    const update = () => {
      const state = getSnapshot();
      
      if (speedRef.current) {
        // km/h = m/s * 3.6
        speedRef.current.textContent = `${(state.v * 3.6).toFixed(1)} km/h`;
      }
      
      if (progressRef.current) {
        progressRef.current.textContent = `${Math.min(TRACK_LENGTH, Math.floor(state.x))} / ${TRACK_LENGTH} m`;
      }
      
      if (progressBarRef.current) {
        const percent = Math.min(100, (state.x / TRACK_LENGTH) * 100);
        progressBarRef.current.style.width = `${percent}%`;
      }
      
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [phase, getSnapshot]);

  if (phase === 'idle') return null;

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none drop-shadow-md">
      <div className="bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm">
        <div className="text-sm text-gray-300">ความเร็ว</div>
        <div ref={speedRef} className="text-2xl font-bold font-mono">0.0 km/h</div>
      </div>
      
      <div className="w-1/2 max-w-md bg-black/50 p-3 rounded-lg backdrop-blur-sm">
        <div className="flex justify-between text-sm text-gray-300 mb-1">
          <span>ระยะทาง</span>
          <span ref={progressRef}>0 / {TRACK_LENGTH} m</span>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div ref={progressBarRef} className="h-full bg-green-500 w-0 transition-all duration-75" />
        </div>
      </div>
    </div>
  );
}
