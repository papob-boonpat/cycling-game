import { NextRequest, NextResponse } from "next/server";
import { ScoreSubmitSchema } from "@/lib/scores";
import { insertScore, listTop } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = ScoreSubmitSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues },
        { status: 400 },
      );
    }

    const score = await insertScore(parseResult.data);

    // Calculate simple rank based on time
    // In a real app we might want to do this in the DB, but for now this is fine.
    const top = await listTop(100);
    const rank = top.findIndex((s: { id: any }) => s.id === score.id) + 1;

    return NextResponse.json({ rank: rank > 0 ? rank : null, id: score.id });
  } catch (err) {
    console.error("Failed to submit score:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 20;

  try {
    const scores = await listTop(limit);
    return NextResponse.json({ scores });
  } catch (err) {
    console.error("Failed to fetch scores:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
