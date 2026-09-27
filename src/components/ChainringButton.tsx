import { useEffect, useRef } from 'react';
import { GameState } from '@/lib/physics';
import { RacePhase } from '@/lib/useRaceEngine';

interface ChainringButtonProps {
  phase: RacePhase;
  onTap: () => void;
  getSnapshot: () => GameState;
}

export default function ChainringButton({ phase, onTap, getSnapshot }: ChainringButtonProps) {
  const ringRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase !== 'racing') return;

    let frameId: number;
    const update = () => {
      const state = getSnapshot();
      if (ringRef.current) {
        ringRef.current.style.transform = `rotate(${state.x * 20}deg)`;
      }
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [phase, getSnapshot]);

  // Handle keyboard input
  useEffect(() => {
    if (phase !== 'racing') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Ignore hold
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        onTap();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, onTap]);

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
      {phase === 'racing' && (
        <span className="text-white font-bold drop-shadow-md text-xl animate-pulse">
          แตะเพื่อปั่น!
        </span>
      )}
      <button
        ref={ringRef}
        onTouchStart={(e) => {
          // No preventDefault here so it registers properly
          onTap();
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          onTap();
        }}
        disabled={phase !== 'racing'}
        style={{ touchAction: 'none' }}
        className="w-32 h-32 rounded-full bg-gray-800 border-4 border-gray-600 flex items-center justify-center select-none active:scale-95 transition-transform disabled:opacity-50"
      >
        <div className="w-24 h-24 rounded-full border-[12px] border-dashed border-gray-400" />
      </button>
    </div>
  );
}
