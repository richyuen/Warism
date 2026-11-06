// Critic run 41 (new): R29a batched the paradrop of a selection too (player.ts dropArmed -> hud.commands).
// Seed 1938, Germany at war with Poland; the second transport group rebased to the first's airbase; N garrison
// brigades spawned there; all N selected; Paradrop armed from the Actions tab; Warsaw clicked (a real click).
// Logs each brigade's place after one hour, the order news rows, the panel's refusal words, and shots.
// Usage: BASE=http://127.0.0.1:5299 npx tsx critic/scripts/c44_pd_paradrop.ts <n> <tag>
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';

const [nS, tag] = process.argv.slice(2);
const N = Number(nS);
const BASE = process.env.BASE ?? 'http://127.0.0.1:5299';
const GER = NATIONS_1938.findIndex((n) => n.tag === 'GER') + 1;
const POL = NATIONS_1938.findIndex((n) => n.tag === 'POL') + 1;
const w = new Sim({ scenario: '1938', seed: 1938, assets: loadAssets1938(SIZE_1938.w) }).world;
const lifts = [...w.wingBase].filter(([id, b]) => w.formations.cols.nation[id] === GER && b > 0 && TEMPLATES_1938[w.formations.cols.template[id]!]!.id === 'air_transport_group').map(([id, b]) => [id, b] as const).sort((a, b) => a[0] - b[0]);
const [bx, by] = w.cellPoint(w.airbases[lifts[0]![1] - 1]!.cell);
const garrison = TEMPLATES_1938.findIndex((t) => t.id === 'garrison_brigade');
const [wx, wy] = cellOf(21.0, 52.2, SIZE_1938.w, SIZE_1938.h);
const out: Record<string, unknown> = { tag, n: N, base: BASE, lifts, bx, by, wx, wy };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });
await page.addInitScript(() => { (window as unknown as { __name: (f: unknown) => unknown }).__name = (f) => f; });
const errors: string[] = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=1938`);
  await page.waitForFunction(() => ((window as any).__warsim?.view?.frames ?? 0) > 0 && (window as any).__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  await page.evaluate((n) => (window as any).__warsim.view.select(n), GER);
  await page.getByTestId('take-control').click();
  await page.getByTestId('tab-actions').click();
  await page.evaluate(({ GER, POL, second, bx, by, garrison, N }) => {
    const sim = (window as any).__warsim.sim;
    (window as any).__pre = (window as any).__warsim.view.formationIds();
    sim.command({ kind: 'declareWar', attacker: GER, defender: POL });
    sim.command({ kind: 'wingRebase', id: second, x: bx, y: by, nation: GER });
    for (let i = 0; i < N; i++) sim.command({ kind: 'spawnFormation', nation: GER, x: bx, y: by, strength: 0, template: garrison });
    sim.step(1);
  }, { GER, POL, second: lifts[1]![0], bx, by, garrison, N });
  await page.waitForFunction(({ bx, by, N }) => {
    const v = (window as any).__warsim.view;
    return v.lastTick >= 1 && v.formationIds().filter((id: number) => { const p = v.formationPos(id); return p !== null && Math.hypot(p[0] - bx, p[1] - by) < 1.5 && !(window as any).__pre.includes(id); }).length >= N;
  }, { bx, by, N }, { timeout: 30_000 });
  const ids: number[] = await page.evaluate(({ bx, by }) => {
    const v = (window as any).__warsim.view;
    return v.formationIds().filter((id: number) => { const p = v.formationPos(id); return p !== null && Math.hypot(p[0] - bx, p[1] - by) < 1.5 && !(window as any).__pre.includes(id); }).sort((a: number, b: number) => a - b);
  }, { bx, by });
  out.ids = ids;
  await page.evaluate((ids) => {
    const { view, player } = (window as any).__warsim;
    for (const id of ids) view.selectedFormations.add(id);
    player.selectedCount.value = ids.length;
    (window as any).__news = [];
    (window as any).__warsim.sim.onOrderNews((m: unknown) => (window as any).__news.push(m));
  }, ids);
  await page.getByTestId('act-drop').click();
  out.armed = await page.getByTestId('act-wing-armed').innerText().catch(() => null);
  await page.evaluate(({ wx, wy }) => { const v = (window as any).__warsim.view; v.controller.set({ cx: wx, cy: wy, scale: (v.metresPerPx * v.controller.cam.scale) / 1500 }); }, { wx, wy });
  await page.waitForTimeout(800);
  const box = (await page.locator('canvas.map-nations').boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(500);
  await page.evaluate(() => (window as any).__warsim.sim.step(1));
  await page.waitForTimeout(1500);
  out.after = await page.evaluate(({ ids, wx, wy }) => ids.map((id: number) => { const p = (window as any).__warsim.view.formationPos(id); return { id, p, dWarsaw: p ? Math.hypot(p[0] - wx, p[1] - wy) : null }; }), { ids, wx, wy });
  out.news = await page.evaluate(() => (window as any).__news);
  out.rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=order-news]')].map((x) => [x.getAttribute('data-order'), (x as HTMLElement).innerText.replace(/\n/g, ' ')]));
  out.refusal = await page.evaluate(() => (window as any).__warsim.hud.refusal.value);
  await page.screenshot({ path: `critic/shots/c44pd_${tag}.png` });
  out.shot = `critic/shots/c44pd_${tag}.png`;
} catch (e) { out.fatal = String((e as Error)?.stack ?? e).slice(0, 800); }
out.errors = errors;
writeFileSync(`critic/c44_pd_${tag}.json`, JSON.stringify(out, null, 1));
await browser.close();
console.log(JSON.stringify(out).slice(0, 1500));
