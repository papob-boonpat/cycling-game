import { z } from 'zod';
import { TRACK_LENGTH, MAX_SPEED } from './physics';

export const ScoreSubmitSchema = z.object({
  name: z.string().min(1, "Name is required").max(20, "Name must be under 20 characters").trim(),
  timeMs: z.number().int().positive(),
  taps: z.number().int().nonnegative(),
  clientVersion: z.string().optional()
}).refine(data => {
  // Plausibility check: Could they possibly finish this fast?
  const minTimeS = TRACK_LENGTH / MAX_SPEED;
  return (data.timeMs / 1000) >= minTimeS * 0.9;
}, "Time is impossibly fast");

export type ScoreSubmitPayload = z.infer<typeof ScoreSubmitSchema>;
