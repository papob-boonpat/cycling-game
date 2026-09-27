import { prisma } from './prisma';

export interface ScoreEntry {
  id?: string;
  name: string;
  timeMs: number;
  taps: number;
  createdAt?: Date;
}

export async function insertScore(entry: ScoreEntry) {
  return prisma.score.create({
    data: {
      name: entry.name,
      timeMs: entry.timeMs,
      taps: entry.taps
    }
  });
}

export async function listTop(limit: number = 20) {
  return prisma.score.findMany({
    orderBy: { timeMs: 'asc' },
    take: limit
  });
}
