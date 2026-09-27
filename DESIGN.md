# Cycling Tap Game — Plan & Design

## Context
`/Users/strong/playground/cycling-game` is an empty git repo. We're building a web game: a cyclist (image sprite) races toward a finish line, and the player taps a chainring+pedal button to move him forward. All physics and animation run **client-side**; when the player crosses the finish line the client POSTs the result to an API, and a **ranking/leaderboard** is displayed.

Stack: **Next.js (App Router) + TypeScript + Tailwind**. Art: **SVG/PNG sprites** in `/public` (placeholder SVGs we generate, swappable later).

---

## 1. Game design

### Core loop
1. **Idle** → name entry + "Start" button.
2. **Countdown** 3-2-1-GO (prevents early-tap advantage).
3. **Racing** — each tap of the chainring button applies an impulse; cyclist accelerates, drag slows him down. Progress bar / scrolling road shows distance.
4. **Finished** — timer stops, result POSTed; UI simply shows a "ส่งผลลัพธ์แล้ว" (result sent) confirmation state rather than the leaderboard (the full ranking lives only on the admin `/results` page — see §3a).

### Physics (per `requestAnimationFrame` tick, `dt` in seconds)
```
TRACK_LENGTH = 200          // metres
IMPULSE      = 1.8          // m/s added per tap
DRAG         = 0.9          // 1/s, velocity decay
MAX_SPEED    = 16           // m/s clamp

v += pendingTaps * IMPULSE
v -= v * DRAG * dt
v  = clamp(v, 0, MAX_SPEED)
x += v * dt
if (x >= TRACK_LENGTH) finish()
```
Taps are accumulated into a ref between frames (never into React state) so rapid tapping is never dropped.

**Anti-spam / feel:** a short `TAP_COOLDOWN` (~60ms) caps effective tap rate at ~16/s, so autoclickers gain little and the button feels responsive.

### Animation
- **Cyclist**: fixed on screen (~25% from left). Legs/wheels animate via CSS `animation-duration` bound to speed (`dur = clamp(0.8 / (v+0.1), 0.06, 1.2)s`), plus a small bob transform.
- **World scroll**: road stripes + parallax background move by `background-position-x` driven by `x`. Finish-line banner is absolutely positioned at `TRACK_LENGTH` and slides in as it approaches.
- **Chainring button**: rotates `x * 20deg` — it visibly spins as you pedal, giving tactile feedback.
- All visual updates in the RAF loop write **directly to DOM refs** (`style.transform`, CSS vars). React state is only used for phase changes (idle/countdown/racing/finished) so we don't re-render 60×/s.

### Input
`onPointerDown` (not click) for zero-latency mobile, plus `Space` / `ArrowUp` keydown with `repeat` guard. `touch-action: manipulation` + `user-select: none` to kill double-tap zoom.

### Localization
The app is **Thai-only** (no language switcher, no i18n library) — copy is written directly in Thai in each component's JSX. `<html lang="th">` in `layout.tsx`; use a Thai-friendly font (e.g. Noto Sans Thai via `next/font/google`) alongside the default so Thai glyphs render properly.

Draft copy (adjust wording as needed):
| Key | Thai | Context |
|---|---|---|
| `nameLabel` | ชื่อผู้เล่น | name input label |
| `namePlaceholder` | กรอกชื่อของคุณ | name input placeholder |
| `startButton` | เริ่ม | start button |
| `countdownGo` | ไป! | end of countdown |
| `tapHint` | แตะเพื่อปั่น! | racing hint text |
| `finishedTitle` | ส่งผลลัพธ์แล้ว | finish confirmation heading |
| `finishedSubtitle` | เวลาของคุณ: {time} วินาที | finish confirmation detail |
| `playAgainButton` | เล่นอีกครั้ง | replay button |
| `resultsPageTitle` | ผลการแข่งขัน | `/results` page heading |
| `tableRank` / `tableName` / `tableTime` / `tableTaps` / `tableDate` | อันดับ / ชื่อ / เวลา / จำนวนครั้งที่แตะ / วันที่ | `/results` table headers |
| `errorGeneric` | เกิดข้อผิดพลาด กรุณาลองใหม่ | submit failure toast |

Admin `/results` page copy is also Thai (same audience/language), even though it's an internal-only page.

---

## 2. Architecture

```
app/
  layout.tsx
  page.tsx                  # renders <Game/>
  results/page.tsx          # admin-only ranking view (server component)
  api/scores/route.ts       # GET (top N) + POST (submit)
components/
  Game.tsx                  # phase state machine, owns the RAF loop
  Track.tsx                 # road, parallax, finish line
  Cyclist.tsx               # sprite + pedal animation
  ChainringButton.tsx       # the tap button
  Hud.tsx                   # timer, speed, distance/progress
  Leaderboard.tsx           # ranking table (shared by finish screen + /results)
lib/
  physics.ts                # constants + step() — pure, unit-testable
  useRaceEngine.ts          # RAF loop hook wrapping physics
  scores.ts                 # client fetch helpers + zod schemas
  store.ts                  # server-side score storage (Prisma-backed)
  prisma.ts                 # shared PrismaClient singleton
prisma/
  schema.prisma             # Score model + migrations
public/sprites/
  cyclist.svg  chainring.svg  finish-flag.svg  road.svg  hills.svg
```

### Key modules
- **`lib/physics.ts`** — constants and `step(state, dt, taps) => state`. Pure function, no React, so the exact same code can verify a submitted run server-side later.
- **`lib/useRaceEngine.ts`** — owns `requestAnimationFrame`, a `tapsRef`, and `performance.now()` timing. Exposes `{ start, tap, phase, getSnapshot }` and calls `onFinish(result)`. Clamps `dt` to ≤50ms so a backgrounded tab can't teleport the rider.
- **Timing**: elapsed time comes from `performance.now()` deltas accumulated in the loop, **not** wall-clock difference, so tab-throttling can't shorten a run.

---

## 3. API & ranking

`POST /api/scores`
```ts
{ name: string(1..20), timeMs: number, taps: number, clientVersion: string }
→ { rank: number, id: string }
```
`GET /api/scores?limit=20` → `{ scores: Array<{rank,name,timeMs,taps,createdAt}> }`

**Validation (zod)** on POST — reject `timeMs` below a theoretical minimum derived from `physics.ts` (max speed + max tap rate), reject impossible `taps`/`timeMs` ratios, trim/sanitise name. This is plausibility checking, not anti-cheat; note in the README that a client-authoritative game can't be fully trusted.

**Storage — Postgres.** Hosted Postgres (Neon / Supabase / Vercel Postgres — any works, connected via a single `DATABASE_URL` env var) rather than local Docker, so it works immediately against Vercel deploys with no local setup.

- **Prisma** as the ORM/migration tool.
  ```prisma
  model Score {
    id        String   @id @default(cuid())
    name      String
    timeMs    Int
    taps      Int
    createdAt DateTime @default(now())

    @@index([timeMs])
  }
  ```
- `lib/store.ts` keeps the same tiny interface (`listTop(limit)`, `insert(entry)`) but implements it with `prisma.score.findMany({ orderBy: { timeMs: 'asc' }, take: limit })` / `prisma.score.create(...)`. Route handlers and `app/results/page.tsx` don't need to change — they only depend on the interface.
- `prisma/schema.prisma` + `npx prisma migrate dev` for local schema changes, `npx prisma migrate deploy` in the deploy step.
- `.env` holds `DATABASE_URL` (from whichever provider is chosen); `.env.example` checked into the repo as a template.
- Reuse a single `PrismaClient` across hot reloads in dev via the standard Next.js `globalThis` pattern (`lib/prisma.ts`) to avoid exhausting connections.

---

## 3a. `/results` page (admin ranking view)

Plain, unauthenticated route at `/results` — not linked from the game UI or nav, just a direct URL for whoever needs to check standings. No login flow (per explicit request); can add a password gate later if this ever needs to be public-facing.

- **`app/results/page.tsx`** — server component, calls `store.listTop()` directly (no extra HTTP round-trip since it's on the server already) and renders a full table: rank, name, time, taps, tapsper-second, submitted-at.
- Renders the full ranking via `<Leaderboard>` (rank, name, time, taps, submitted-at, sortable by column). This is the only place the leaderboard is shown — players never see rankings, just the "result sent" confirmation.
- `export const dynamic = 'force-dynamic'` so it always reflects the latest in-memory scores rather than being statically cached at build time.
- Simple manual refresh (button or `<meta refresh>`); no need for websockets/polling for v1.

---

## 4. Build steps
1. `npx create-next-app@latest . --ts --tailwind --app --eslint` (into the existing empty repo).
2. Set up hosted Postgres (Neon/Supabase/Vercel Postgres), add `DATABASE_URL` to `.env` (+ `.env.example`).
3. `npx prisma init`, define the `Score` model in `prisma/schema.prisma`, `npx prisma migrate dev`.
4. Author placeholder SVG sprites in `public/sprites/`.
5. `lib/physics.ts` + a Vitest unit test for `step()` (monotonic progress, speed clamp, deterministic finish time for a fixed tap pattern).
6. `lib/useRaceEngine.ts` RAF hook.
7. `Cyclist`, `Track`, `ChainringButton`, `Hud` presentational components, ref-driven.
8. `Game.tsx` state machine wiring it together, Thai copy throughout, finish state shows "ส่งผลลัพธ์แล้ว".
9. `lib/prisma.ts`, `lib/store.ts` (Prisma-backed), `app/api/scores/route.ts` + zod schemas.
10. `Leaderboard.tsx` — ranking table component (used only by `/results`, not shown to players).
11. `app/results/page.tsx` — full ranking table for admins at `/results`.
12. Polish: mobile layout, reduced-motion fallback, best-time in `localStorage`.

## 5. Verification
- `npx prisma migrate dev` runs clean against the hosted DB; `npx prisma studio` shows an empty `Score` table.
- `npx vitest run` — physics unit tests pass.
- `npm run dev`, open `localhost:3000`: countdown runs, tapping visibly accelerates the cyclist, chainring spins, finish line arrives, timer stops, UI shows "ส่งผลลัพธ์แล้ว".
- Submit a score → row appears in Postgres (check via `prisma studio` or the DB provider's dashboard).
- `curl -X POST localhost:3000/api/scores -d '{"name":"x","timeMs":1,"taps":1}'` → 400 (implausible-time validation).
- Throttle CPU in devtools + switch tabs mid-race → no teleporting, timer stays sane.
- Test on a phone viewport: no double-tap zoom, button reachable with a thumb.
- Open `localhost:3000/results` → shows scores from Postgres, persists across a server restart, updates after a new run + manual refresh.
