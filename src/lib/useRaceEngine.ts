import { useState, useRef, useCallback } from 'react';
import { step, TRACK_LENGTH, GameState } from './physics';

export type RacePhase = 'idle' | 'countdown' | 'racing' | 'finished';

export interface RaceResult {
  timeMs: number;
  taps: number;
}

export function useRaceEngine(onFinish: (result: RaceResult) => void) {
  const [phase, setPhase] = useState<RacePhase>('idle');
  const phaseRef = useRef<RacePhase>('idle');
  
  const stateRef = useRef<GameState>({ x: 0, v: 0 });
  const tapsRef = useRef(0);
  const totalTapsRef = useRef(0);
  
  const startTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  const TAP_COOLDOWN = 60;
  
  const updatePhase = (newPhase: RacePhase) => {
    phaseRef.current = newPhase;
    setPhase(newPhase);
  };

  const loopRef = useRef<(time: number) => void>(null);
  
  loopRef.current = (time: number) => {
    if (phaseRef.current !== 'racing') return;

    let dt = (time - lastTimeRef.current) / 1000;
    if (dt > 0.05) dt = 0.05;
    
    if (dt > 0) {
      stateRef.current = step(stateRef.current, dt, tapsRef.current);
      tapsRef.current = 0;
    }

    lastTimeRef.current = time;

    if (stateRef.current.x >= TRACK_LENGTH) {
      updatePhase('finished');
      onFinish({
        timeMs: time - startTimeRef.current,
        taps: totalTapsRef.current
      });
      return;
    }

    requestAnimationFrame(loopRef.current!);
  };

  const start = useCallback(() => {
    updatePhase('countdown');
    
    // Simple 3-2-1-GO implementation - we just wait 3 seconds for now
    // A more visual countdown can be done in the component
    setTimeout(() => {
      updatePhase('racing');
      stateRef.current = { x: 0, v: 0 };
      tapsRef.current = 0;
      totalTapsRef.current = 0;
      const now = performance.now();
      startTimeRef.current = now;
      lastTimeRef.current = now;
      lastTapTimeRef.current = 0;
      requestAnimationFrame(loopRef.current!);
    }, 3000);
  }, []);

  const tap = useCallback(() => {
    if (phaseRef.current !== 'racing') return;
    
    const now = performance.now();
    if (now - lastTapTimeRef.current > TAP_COOLDOWN) {
      tapsRef.current++;
      totalTapsRef.current++;
      lastTapTimeRef.current = now;
    }
  }, []);

  const getSnapshot = useCallback(() => {
    return stateRef.current;
  }, []);

  return { start, tap, phase, getSnapshot };
}
