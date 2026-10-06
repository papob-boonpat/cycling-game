import { NextRequest, NextResponse } from 'next/server';
import { SetFlagSchema } from '@/lib/lobbySchemas';
import { getRaceOpen, setRaceOpen } from '@/lib/lobby';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ raceOpen: await getRaceOpen() });
  } catch (err) {
    console.error('Failed to read admin state:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SetFlagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    await setRaceOpen(parsed.data.raceOpen);
    return NextResponse.json({ raceOpen: await getRaceOpen() });
  } catch (err) {
    console.error('Failed to set race flag:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
