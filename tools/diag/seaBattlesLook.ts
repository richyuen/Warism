/**
 * ROADMAP R46's page check: each battle `seaBattles.ts` lists, looked at in the page at its first hour from its camera.
 * A battle is seen when each side has a fleet whose ships (`view.elementPlaces`) are drawn inside the view: each side,
 * not each nation (ROADMAP R56e; critic run 57: t809 ENG v GER was "seen" with British and French ships and no German).
 * A list from before R56e has no sides: each nation is taken as one.
 *
 * Usage: `npm run build`, `npx vite preview --port 4173`, then
 * `npx tsx tools/diag/seaBattlesLook.ts <seaBattles json> [--max N] [--shots K] [--out file.json]`.
 * One line a battle, a summary, then `done:`; exit 1 when a battle is not seen.
 * Looked at in the order of their first hours, the page stepping only forward (ROADMAP R59e; critic run 60: 31501's
 * t6243 listed after t6257 was looked at 14 hours late). A battle listed with no fleet (both sides sunk or out of
 * `seaBattles`' search in its one hour: 31501's t17369 NED v USA, the Dutch all sunk) has nothing to look at: told
 * "no fleet to see" and counted, not failed (R59e; critic run 60, R60-N5).
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- the page's debug handle, `window.__warsim`, is read untyped */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const argv = process.argv.slice(2);
const pos: string[] = [];
let max = Infinity;
let shots = 3;
let outFile: string | undefined;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--max') max = Number(argv[++i]);
  else if (argv[i] === '--shots') shots = Number(argv[++i]);
  else if (argv[i] === '--out') outFile = argv[++i];
  else pos.push(argv[i]!);
}
interface Fleet { id: number; nation: string; side?: 'a' | 'b'; ships: number }
/** A fleet's side, or its nation in a list from before R56e. */
const sideKey = (f: Fleet): string => f.side ?? f.nation;
interface Battle { start: number; end: number; a: string; b: string; sea: string; at: [number, number]; fleets: Fleet[]; camera: { cx: number; cy: number; mpp: number } }
const src = JSON.parse(readFileSync(pos[0]!, 'utf8')) as { seed: number; diplomacy: string; world: string; battles: Battle[] };
if (src.world !== '1938') throw new Error('the page check opens the 1938 world');
outFile ??= pos[0]!.replace(/\.json$/, '_look.json');
const shotDir = path.join(path.dirname(outFile), `seaBattles_${src.seed}_shots`);
mkdirSync(shotDir, { recursive: true });
const BASE = process.env.BASE ?? 'http://localhost:4173';

const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
// tsx names the functions declared inside an evaluated one with esbuild's `__name`, which the page lacks.
await context.addInitScript({ content: 'window.__name = (f) => f;' });
const page = await context.newPage();
const errors: string[] = [];
page.on('pageerror', (e) => errors.push(e.message));
const ev = <T, A>(fn: (a: A) => T | Promise<T>, arg: A): Promise<T> => page.evaluate(fn as never, arg) as Promise<T>;

await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${src.seed}${src.diplomacy === 'random' ? '&diplo=random' : ''}`);
await page.waitForFunction(() => ((window as any).__warsim?.view?.frames ?? 0) > 0 && (window as any).__warsim.hud.stats.value !== null, null, { timeout: 120_000 });

/** Steps the page to tick `t` and waits for its snapshot. */
const toTick = (t: number): Promise<void> => ev(async (t: number) => {
  const w = (window as any).__warsim;
  const n = t - w.view.lastTick;
  if (n > 0) await w.sim.step(n);
  await new Promise<void>((done) => { const wait = (): void => void (w.view.lastTick >= t ? done() : setTimeout(wait, 10)); wait(); });
}, t);

/** At the camera, until each side's ships are drawn in the view (3 s at most): the fleets seen, by nation. */
const look = (b: Battle): Promise<{ seen: Record<string, number>; sidesSeen: number; mpp: number; tick: number }> => ev(async ({ b }: { b: Battle }) => {
  const v = (window as any).__warsim.view;
  v.controller.set({ cx: b.camera.cx, cy: b.camera.cy, scale: (v.metresPerPx * v.controller.cam.scale) / b.camera.mpp });
  const vw = innerWidth;
  const vh = innerHeight;
  const key = (f: Fleet): string => f.side ?? f.nation;
  const sidesOf = new Set<string>();
  const seenNow = (): Record<string, number> => {
    const c = v.controller.cam;
    const seen: Record<string, number> = {};
    sidesOf.clear();
    for (const f of b.fleets) {
      const inView = (v.elementPlaces(f.id) as [number, number][]).filter(([x, y]) => {
        const sx = (x - c.cx) * c.scale + vw / 2;
        const sy = (y - c.cy) * c.scale + vh / 2;
        return sx >= 0 && sy >= 0 && sx < vw && sy < vh;
      }).length;
      if (inView > 0) {
        seen[f.nation] = (seen[f.nation] ?? 0) + inView;
        sidesOf.add(key(f));
      }
    }
    return seen;
  };
  const t0 = performance.now();
  let seen = seenNow();
  const sides = new Set(b.fleets.map(key));
  while (performance.now() - t0 < 3000 && sidesOf.size < Math.min(2, sides.size)) {
    v.draw(performance.now());
    await new Promise((d) => setTimeout(d, 50));
    seen = seenNow();
  }
  return { seen, sidesSeen: sidesOf.size, mpp: Math.round(v.metresPerPx), tick: v.lastTick };
}, { b });

const rows: unknown[] = [];
let unseen = 0;
/** Battles listed with one side's fleets alone: seen with that side, and so told (the other's are not to be looked for). */
let oneSide = 0;
let noFleet = 0;
const list = [...src.battles].sort((a, b) => a.start - b.start).slice(0, max);
for (const [k, b] of list.entries()) {
  await toTick(b.start);
  const r = await look(b);
  const sides = new Set(b.fleets.map(sideKey));
  // A battle listed with one side's fleets alone (the other's all sunk in its hour, `fleetsNear`) is seen with that
  // side; one listed with none has nothing to look at (R59e).
  const none = sides.size === 0;
  const ok = none || r.sidesSeen >= Math.min(2, sides.size);
  if (!ok) unseen++;
  if (none) noFleet++;
  if (sides.size === 1) oneSide++;
  let shot: string | undefined;
  if (k < shots || !ok) {
    shot = path.join(shotDir, `t${b.start}_${b.a}_${b.b}.png`);
    await page.screenshot({ path: shot });
  }
  rows.push({ start: b.start, a: b.a, b: b.b, sea: b.sea, camera: b.camera, ...r, ok, ...(none ? { noFleet: true } : {}), shot });
  process.stderr.write(`${none ? 'no fleet to see' : ok ? (sides.size === 1 ? 'seen (one side listed)' : 'seen') : 'NOT SEEN'} t${b.start} ${b.a} v ${b.b} (${b.sea}) at ${r.mpp} m/px, tick ${r.tick}: ${JSON.stringify(r.seen)}\n`);
}
writeFileSync(outFile, JSON.stringify({ seed: src.seed, battles: list.length, unseen, oneSide, noFleet, errors, rows }, null, 1));
await browser.close();
process.stdout.write(`seed ${src.seed}: ${list.length - unseen - noFleet} of ${list.length - noFleet} battles seen at their camera (${oneSide} listed with one side alone, ${noFleet} with no fleet to see); page errors ${errors.length}; ${outFile}\ndone:\n`);
process.exitCode = unseen > 0 ? 1 : 0;
