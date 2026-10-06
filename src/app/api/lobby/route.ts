import { NextResponse } from 'next/server';
import { getRaceOpen } from '@/lib/lobby';

export const dynamic = 'force-dynamic';

/** Public gate state: whether the admin has opened the race. */
export async function GET() {
  try {
    return NextResponse.json({ raceOpen: await getRaceOpen() });
  } catch (err) {
    console.error('Failed to read lobby state:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
