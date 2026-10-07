import { NextResponse } from 'next/server';
import { getRaceOpen, setRaceOpen } from '@/lib/lobby';
import { clearScores } from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * Starts a fresh game: wipes every score, then opens the race. Clearing first
 * avoids a window where a score submitted by an early player survives the wipe.
 */
export async function POST() {
  try {
    const { count } = await clearScores();
    await setRaceOpen(true);
    return NextResponse.json({ cleared: count, raceOpen: await getRaceOpen() });
  } catch (err) {
    console.error('Failed to reset game:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
