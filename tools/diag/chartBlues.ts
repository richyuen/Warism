// R82h's AT on a save (critic run 68, stats "not 9"): load it in the page, open the Ranking's Charts on Land with
// France selected, and read the two land names (the chart's, the Ranking's), each line's stroke and its ΔE (CIE76) to
// every other line's, and whether it is dashed; a shot of the chart. Needs the dev server (`npm run dev`, BASE).
// Usage: npx tsx tools/diag/chartBlues.ts <save.bin> <out dir> [nation tag = FRA]
import { chromium } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { deltaE, parseHex } from '../../src/shared/color';

const [file, outDir, tagArg] = process.argv.slice(2) as [string, string, string | undefined];
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const tag = tagArg ?? 'FRA';
mkdirSync(outDir, { recursive: true });
const bytes = readFileSync(file);
const dE = (a: string, b: string): number => deltaE(parseHex(a), parseHex(b));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.addInitScript(() => ((window as unknown as { __name: (f: unknown) => unknown }).__name = (f) => f));
await page.route('**/__r82h.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
await page.goto(`${BASE}/?scenario=1938&paused=1`);
await page.waitForFunction(() => (window.__warsim?.hud.stats.value ?? null) !== null, null, { timeout: 120_000 });
await page.evaluate(async () => window.__warsim!.sim.load(new Uint8Array(await (await fetch('/__r82h.bin')).arrayBuffer())));
await page.waitForTimeout(3000);
if ((await page.getByTestId('stats-ranking').count()) === 0) await page.getByTestId('stats-btn').click();
const held = (await page.getByTestId('rank-metric').locator('option[value="land"]').textContent())!.trim();
const id = await page.evaluate((t) => window.__warsim!.hud.stats.value!.nations.find((n) => n.name === `nation.${t}` || n.name === t)?.id ?? 0, tag);
await page.getByTestId('ranking-charts').click();
if (id) await page.evaluate((n) => window.__warsim!.view!.select(n), id);
await page.getByTestId('chart-metric').selectOption('land');
await page.waitForTimeout(1500);
const owned = (await page.getByTestId('chart-metric').locator('option[value="land"]').textContent())!.trim();
const lines = await page.getByTestId('chart-line').evaluateAll((els) => els.map((e) => ({ n: Number(e.getAttribute('data-nation')), stroke: e.getAttribute('stroke') ?? '#000000', dashed: e.getAttribute('data-dashed') === '1' })));
const names = await page.getByTestId('chart-legend').evaluateAll((els) => els.map((e) => [Number(e.getAttribute('data-nation')), (e.textContent ?? '').trim()] as [number, string]));
const nameOf = new Map(names);
console.log(`${tag}: ${id ? `id ${id}, selected` : 'not alive'}`);
console.log(`names: chart "${owned}", ranking "${held}": first words ${owned.split(' ')[0] === held.split(' ')[0] ? 'THE SAME' : 'differ'}`);
for (const l of lines) {
  const near = lines.filter((o) => o !== l).map((o) => ({ o, d: dE(l.stroke, o.stroke) })).sort((a, b) => a.d - b.d)[0];
  console.log(`${nameOf.get(l.n) ?? l.n} ${l.stroke}${l.dashed ? ' dashed' : ''}; nearest ${near ? `${nameOf.get(near.o.n) ?? near.o.n} ΔE ${near.d.toFixed(1)}` : '-'}`);
}
await page.getByTestId('stats-chart').screenshot({ path: path.join(outDir, `chart_${tag}.png`) });
await page.screenshot({ path: path.join(outDir, `page_${tag}.png`) });
await browser.close();
console.log('done:');
