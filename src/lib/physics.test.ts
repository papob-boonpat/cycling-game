import { expect, test } from 'vitest';
import { step, GameState } from './physics';

test('step increases velocity on tap', () => {
  let state: GameState = { x: 0, v: 0 };
  state = step(state, 0.016, 1);
  expect(state.v).toBeGreaterThan(0);
});

test('step clamps velocity', () => {
  let state: GameState = { x: 0, v: 0 };
  state = step(state, 0.016, 100);
  expect(state.v).toBe(16);
});

test('step updates position based on velocity', () => {
  let state: GameState = { x: 0, v: 10 };
  state = step(state, 0.1, 0); // No taps, just movement
  // v will decay slightly: v -= 10 * 0.9 * 0.1 = 0.9, v becomes 9.1
  // x += 9.1 * 0.1 = 0.91
  expect(state.x).toBeCloseTo(0.91);
});
