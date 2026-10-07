import { prisma } from "./prisma";

/** The settings row is a singleton; its id is fixed so upserts always hit it. */
const SETTINGS_ID = "singleton";

/**
 * How long a read of the race flag may be served from memory. Kept at or below
 * the client poll interval in `useLobby`, so the DB sees at most one read per
 * TTL no matter how many players are polling.
 */
const CACHE_TTL_MS = 3000;

interface FlagCache {
  value: boolean;
  /** `Date.now()` when `value` was last written; `0` means empty. */
  readAt: number;
  /** Shared promise for an in-flight DB read, so a cold cache can't stampede. */
  inFlight: Promise<boolean> | null;
}

// Held on globalThis for the same reason the Prisma client is: dev HMR
// re-evaluates this module, and a module-local cache would reset each time.
const globalForLobby = globalThis as unknown as { lobbyFlagCache?: FlagCache };

const cache: FlagCache = (globalForLobby.lobbyFlagCache ??= {
  value: false,
  readAt: 0,
  inFlight: null,
});

export async function getRaceOpen(): Promise<boolean> {
  if (cache.readAt && Date.now() - cache.readAt < CACHE_TTL_MS) {
    return cache.value;
  }
  if (cache.inFlight) return cache.inFlight;

  cache.inFlight = prisma.gameSetting
    .findUnique({ where: { id: SETTINGS_ID } })
    .then((setting) => {
      const value = setting?.raceOpen ?? false;
      cache.value = value;
      cache.readAt = Date.now();
      return value;
    })
    .finally(() => {
      cache.inFlight = null;
    });

  return cache.inFlight;
}

export async function setRaceOpen(raceOpen: boolean) {
  const row = await prisma.gameSetting.upsert({
    where: { id: SETTINGS_ID },
    update: { raceOpen },
    create: { id: SETTINGS_ID, raceOpen },
  });

  // Write through rather than invalidate: both admin routes read the flag back
  // immediately after writing it, and a lazy invalidation would let that read
  // race the DB and bounce the admin UI back to the old state.
  cache.value = row.raceOpen;
  cache.readAt = Date.now();
  cache.inFlight = null;

  return row;
}
