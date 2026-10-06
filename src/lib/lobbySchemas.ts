import { z } from 'zod';

export const SetFlagSchema = z.object({
  raceOpen: z.boolean()
});
