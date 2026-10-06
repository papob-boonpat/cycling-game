import { prisma } from './prisma';

/** The settings row is a singleton; its id is fixed so upserts always hit it. */
const SETTINGS_ID = 'singleton';

export async function getRaceOpen(): Promise<boolean> {
  const setting = await prisma.gameSetting.findUnique({ where: { id: SETTINGS_ID } });
  return setting?.raceOpen ?? false;
}

export async function setRaceOpen(raceOpen: boolean) {
  return prisma.gameSetting.upsert({
    where: { id: SETTINGS_ID },
    update: { raceOpen },
    create: { id: SETTINGS_ID, raceOpen }
  });
}
