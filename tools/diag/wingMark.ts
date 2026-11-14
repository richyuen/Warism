/**
 * ROADMAP R81g's measure: the critic's `w_wing` probe (critic run 67, `critic/scripts/c67_w_wing.mjs`) as a tool. Germany
 * played and at war with Poland from the Actions tab; its fighter group farthest from Warsaw given a strike near Warsaw
 * and followed by its name; then at Speed ×1 for 8 s at 3,000 and at 250 m/px (zoomed by the wheel, so the follow
 * holds), and at ×5 at 3,000 m/px: each sample the followed wing's mark (`view.selectionMarks`, kind `wing`) against the
 * nearest drawn German sortie, px. The critic's bar (ROADMAP R81g): at 250 m/px the median at most 40 px, at 3,000 at
 * most 32. Shots at 1.5 s of each, in the out dir.
 *
 * Usage: `npm run build`, `npx vite preview --port 5355 --host 127.0.0.1`, then
 * `npx tsx tools/diag/wingMark.ts <seed> [out dir = .cache/wingMark]`.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- the page's debug handle, `window.__warsim`, is read untyped */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { GPU_ARGS } from '../gate/render';

const seed = Number(process.argv[2] ?? 39927);
const outDir = process.argv[3] ?? '.cache/wingMark';
const BASE = process.env.BASE ?? 'http://127.0.0.1:5355';
mkdirSync(outDir, { recursive: true });
const GER = TAGS_1938.indexOf('GER') + 1;
const WARSAW = cellOf(21.01, 52.23, SIZE_1938.w, SIZE_1938.h);

const browser = await chromium.launch({ args: GPU_ARGS });
const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
await context.addInitScript({ content: 'window.__name = (f) => f;' });
const page = await context.newPage();
const wings = (): Promise<any[]> => page.evaluate(() => (window as any).__warsim.hud.stats.value?.wings ?? []);
const hours = (n: number): Promise<void> =>
  page.evaluate(async (n) => {
    const w = (window as any).__warsim;
    const target = w.view.lastTick + n;
    await w.sim.step(n);
    await new Promise<void>((done) => { const look = (): void => (w.view.lastTick >= target ? done() : void setTimeout(look, 10)); look(); });
  }, n);
const sample = (id: number): Promise<{ flying: boolean; d: number | null }> =>
  page.evaluate(({ id, ger }) => {
    const v = (window as any).__warsim.view;
    const w = (window as any).__warsim.hud.stats.value?.wings.find((x: any) => x.id === id);
    const m = v.selectionMarks.find((k: any) => k.kind === 'wing');
    if (!m) return { flying: w?.flying ?? false, d: null };
    const [mx, my] = [(m.x0 + m.x1) / 2, (m.y0 + m.y1) / 2];
    let best: number | null = null;
    for (const s of v.sortieMarks) if (s.nation === ger) { const d = Math.hypot(s.x - mx, s.y - my); if (best === null || d < best) best = d; }
    return { flying: w?.flying ?? false, d: best };
  }, { id, ger: GER });

await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => { const w = (window as any).__warsim; return (w?.view?.frames ?? 0) > 0 && w.hud.stats.value !== null && w.sim.mapLayers !== null; }, null, { timeout: 120_000 });
await page.evaluate((n) => (window as any).__warsim.view.select(n), GER);
await page.getByTestId('take-control').click();
await page.getByTestId('tab-actions').click();
await page.waitForFunction(() => ((window as any).__warsim.hud.stats.value?.wings?.length ?? 0) > 10, null, { timeout: 60_000 });
await page.locator('.nation-panel select').first().selectOption({ label: 'Poland' });
await page.getByRole('button', { name: 'Declare war' }).click();
await page.waitForTimeout(800);
const names: string[] = await page.evaluate(() => (window as any).__warsim.hud.templates.value.map((t: any) => t.nameKey));
const fighters = (await wings()).filter((w) => w.template === names.indexOf('template.fighter_group') && !w.carrier);
fighters.sort((a, b) => Math.hypot(a.x - WARSAW[0], a.y - WARSAW[1]) - Math.hypot(b.x - WARSAW[0], b.y - WARSAW[1]));
const f = fighters[fighters.length - 1];
await page.getByTestId(`act-wing-${f.id}-strike`).click();
await page.evaluate(({ x, y }) => { const v = (window as any).__warsim.view; v.controller.set({ cx: x, cy: y, scale: (v.geo.kmPerCell * 1000) / 3000 }); }, { x: WARSAW[0], y: WARSAW[1] });
await page.waitForTimeout(500);
await page.mouse.click(800, 450);
await page.waitForTimeout(600);
await page.getByTestId(`act-wing-${f.id}-name`).click();
await page.waitForTimeout(800);
for (let i = 0; i < 24; i++) {
  if ((await wings()).find((x) => x.id === f.id)?.flying) break;
  await hours(1);
}
const rows: string[] = [];
for (const [mpp, lvl, tag] of [[3000, 0, 'x1_3000'], [250, 0, 'x1_250'], [3000, 4, 'x5_3000']] as const) {
  await page.evaluate((l) => (window as any).__warsim.hud.setSpeedLevel(l), lvl);
  await page.mouse.move(800, 450);
  for (let k = 0; k < 40; k++) {
    const cur: number = await page.evaluate(() => (window as any).__warsim.view.metresPerPx);
    if (cur > mpp * 0.8 && cur < mpp * 1.25) break;
    await page.mouse.wheel(0, cur > mpp ? -200 : 200);
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => { const h = (window as any).__warsim.hud; if (h.paused.value) h.togglePause(); }, null);
  const ss: { flying: boolean; d: number | null }[] = [];
  const t0 = Date.now();
  let shot = false;
  while (Date.now() - t0 < 8000) {
    ss.push(await sample(f.id));
    if (!shot && Date.now() - t0 > 1500) { await page.screenshot({ path: path.join(outDir, `wing_${seed}_${tag}.png`) }); shot = true; }
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => { const h = (window as any).__warsim.hud; if (!h.paused.value) h.togglePause(); }, null);
  const ds = ss.filter((s) => s.flying && s.d !== null).map((s) => s.d!).sort((a, b) => a - b);
  rows.push(`${tag}: ${ss.length} samples, ${ds.length} flying with a mark and a German sortie; median ${ds.length ? Math.round(ds[Math.floor(ds.length / 2)]!) : '-'} px, p90 ${ds.length ? Math.round(ds[Math.floor(ds.length * 0.9)]!) : '-'}`);
}
console.log(`seed ${seed}, wing ${f.id}:\n  ${rows.join('\n  ')}`);
await browser.close();
