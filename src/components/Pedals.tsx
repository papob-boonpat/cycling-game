import { useEffect, useState } from 'react';
import { GameState } from '@/lib/physics';
import { RacePhase } from '@/lib/useRaceEngine';

interface PedalsProps {
  phase: RacePhase;
  onTap: (pedal: 'left' | 'right') => void;
  getSnapshot: () => GameState;
}

export default function Pedals({ phase, onTap, getSnapshot }: PedalsProps) {
  const [activePedal, setActivePedal] = useState<'left' | 'right' | null>(null);

  // Handle keyboard input
  useEffect(() => {
    if (phase !== 'racing') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Ignore hold
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onTap('left');
        setActivePedal('left');
        setTimeout(() => setActivePedal(null), 100);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onTap('right');
        setActivePedal('right');
        setTimeout(() => setActivePedal(null), 100);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, onTap]);

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full max-w-md px-4 z-40">
      {phase === 'racing' && (
        <span className="text-white font-bold drop-shadow-md text-xl animate-pulse bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm text-center">
          สลับปุ่มซ้าย-ขวาเพื่อปั่น! (← / →)
        </span>
      )}
      <div className="flex gap-4 w-full justify-center">
        <button
          onTouchStart={() => { onTap('left'); setActivePedal('left'); setTimeout(() => setActivePedal(null), 100); }}
          onMouseDown={(e) => { if (e.button !== 0) return; onTap('left'); setActivePedal('left'); setTimeout(() => setActivePedal(null), 100); }}
          disabled={phase !== 'racing'}
          style={{ touchAction: 'none' }}
          className={`w-32 h-32 rounded-full border-[6px] flex items-center justify-center select-none transition-all duration-100 disabled:opacity-50 ${
            activePedal === 'left' 
              ? 'bg-blue-600 border-blue-300 scale-90 -rotate-12 translate-y-3 shadow-[0_0_30px_rgba(59,130,246,0.8)]' 
              : 'bg-gray-800 border-gray-500 shadow-[0_12px_0_rgb(75,85,99)] hover:bg-gray-700 hover:-translate-y-1'
          }`}
        >
          <span className="text-white text-4xl font-black drop-shadow-md">L</span>
        </button>
        <button
          onTouchStart={() => { onTap('right'); setActivePedal('right'); setTimeout(() => setActivePedal(null), 100); }}
          onMouseDown={(e) => { if (e.button !== 0) return; onTap('right'); setActivePedal('right'); setTimeout(() => setActivePedal(null), 100); }}
          disabled={phase !== 'racing'}
          style={{ touchAction: 'none' }}
          className={`w-32 h-32 rounded-full border-[6px] flex items-center justify-center select-none transition-all duration-100 disabled:opacity-50 ${
            activePedal === 'right' 
              ? 'bg-blue-600 border-blue-300 scale-90 rotate-12 translate-y-3 shadow-[0_0_30px_rgba(59,130,246,0.8)]' 
              : 'bg-gray-800 border-gray-500 shadow-[0_12px_0_rgb(75,85,99)] hover:bg-gray-700 hover:-translate-y-1'
          }`}
        >
          <span className="text-white text-4xl font-black drop-shadow-md">R</span>
        </button>
      </div>
    </div>
  );
}
