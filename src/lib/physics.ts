export const TRACK_LENGTH = 200;          // metres
export const IMPULSE      = 1.8;          // m/s added per tap
export const DRAG         = 0.9;          // 1/s, velocity decay
export const MAX_SPEED    = 16;           // m/s clamp

export interface GameState {
  x: number;
  v: number;
}

export function step(state: GameState, dt: number, pendingTaps: number): GameState {
  let { x, v } = state;
  v += pendingTaps * IMPULSE;
  v -= v * DRAG * dt;
  v = Math.max(0, Math.min(v, MAX_SPEED));
  x += v * dt;
  return { x, v };
}
