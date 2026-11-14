/**
 * ROADMAP R81d's measure (critic run 67: "Germany's 1938 label flag is told from Poland's only by a 2-px black band at
 * 250 m/px"): the label flags of two nations as drawn on the page, and how much of them differs.
 *
 * 1. As drawn: seed 39915 (or the first argument), `days` days on, at 250 m/px the camera on a formation of Germany's
 *    and then of Poland's; each tag's flag read from the overlay it is drawn on (the tag's own layout, `view.tagRects`),
 *    and the share of its pixels whose largest channel differs by over 60.
 * 2. Every pair of nations at war in the first year on `seeds`: their flags drawn at the tag's size (15 × 10 CSS px) on
 *    the tag's ground, the same share. The pairs under `bar` listed.
 *
 * Usage: `npm run build`, `npx vite preview --port 5355 --host 127.0.0.1`, then
 * `npx tsx tools/diag/flagPairs.ts [seed = 39915] [days = 5] [seeds = 39915,7019] [bar = 0.3] [out dir]` (the two tags'
 * shots, `tag-GER.png` and `tag-POL.png`, in the out dir; `-` for no second part: `seeds` empty).
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- the page's debug handle, `window.__warsim`, is read untyped */
import { mkdirSync } from 'node:fs';
import { chromium, type Page } from '@playwright/test';
import { TAGS_1938 } from '../../src/sim/scenario1938';
import { GPU_ARGS } from '../gate/render';

const seed = Number(process.argv[2] ?? 39915);
const days = Number(process.argv[3] ?? 5);
const seeds = (process.argv[4] ?? '39915,7019').split(',').filter((x) => x !== '-' && x !== '').map(Number);
const bar = Number(process.argv[5] ?? 0.3);
const outDir = process.argv[6] ?? '.cache/flagPairs';
mkdirSync(outDir, { recursive: true });
const BASE = process.env.BASE ?? 'http://127.0.0.1:5355';

const browser = await chromium.launch({ args: GPU_ARGS });
const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
await context.addInitScript({ content: 'window.__name = (f) => f;' });

async function open(s: number): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${s}`);
  await page.waitForFunction(() => { const w = (window as any).__warsim; return (w?.view?.frames ?? 0) > 0 && w.hud.stats.value !== null && w.sim.mapLayers !== null; }, null, { timeout: 120_000 });
  return page;
}

/** The flag of the first tag of `nation` in view at 250 m/px, as RGB rows cut from a screenshot. */
async function drawnFlag(page: Page, nation: number): Promise<{ px: number[][]; w: number; h: number; ring: number; box: { x: number; y: number; width: number; height: number } } | null> {
  return page.evaluate(async (n) => {
    const v = (window as any).__warsim.view;
    const overlay = document.querySelector<HTMLCanvasElement>('canvas.map-labels.map-nations')!;
    const dpr = overlay.width / overlay.clientWidth;
    for (const f of v.formationsOf(n) as number[]) {
      const p = v.formationPos(f);
      if (!p) continue;
      v.controller.set({ cx: p[0], cy: p[1], scale: (v.geo.kmPerCell * 1000) / 250 });
      await new Promise((d) => requestAnimationFrame(() => requestAnimationFrame(d)));
      v.draw();
      const t = v.tagRects.find((x: any) => x.nation === n && x.flag);
      if (!t) continue;
      const s = v.unitScale;
      const [x, y, w, h] = [t.x + 3 * s + 1, t.y + 3 * s + s, 15 * s, 10 * s].map((q) => Math.round(q * dpr));
      const d = overlay.getContext('2d')!.getImageData(x!, y!, w!, h!).data;
      const px: number[][] = [];
      for (let i = 0; i < w! * h!; i++) px.push([d[4 * i]!, d[4 * i + 1]!, d[4 * i + 2]!]);
      // The ring one pixel out of the flag against the tag's ground two pixels further out: the share of the ring's
      // pixels that differ from it by over 60 (the flag's edge seen on the tag).
      const g = overlay.getContext('2d')!;
      const at = (q: number, r: number): number[] => Array.from(g.getImageData(q, r, 1, 1).data.slice(0, 3));
      let seen = 0;
      let all = 0;
      for (let i = -1; i <= w!; i++)
        for (const [q, r, q2, r2] of [[x! + i, y! - 1, x! + i, y! - 3], [x! + i, y! + h!, x! + i, y! + h! + 2]] as const) {
          const [a, b] = [at(q, r), at(q2, r2)];
          all++;
          if (Math.max(...[0, 1, 2].map((c) => Math.abs(a[c]! - b[c]!))) > 60) seen++;
        }
      return { px, w: w!, h: h!, ring: seen / all, box: { x: t.x - 2, y: t.y - 2, width: t.w + 4, height: t.h + 4 } };
    }
    return null;
  }, nation);
}

const share = (a: number[][], b: number[][]): number => {
  let k = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (Math.max(...[0, 1, 2].map((c) => Math.abs(a[i]![c]! - b[i]![c]!))) > 60) k++;
  return k / Math.min(a.length, b.length);
};

// 1. As drawn.
{
  const page = await open(seed);
  const ids = [TAGS_1938.indexOf('GER') + 1, TAGS_1938.indexOf('POL') + 1];
  await page.evaluate(async (d) => { await (window as any).__warsim.sim.step(24 * d); }, days);
  await page.waitForTimeout(1500);
  const shot = async (n: number, name: string): Promise<Awaited<ReturnType<typeof drawnFlag>>> => {
    const f = await drawnFlag(page, n);
    if (f) await page.screenshot({ path: `${outDir}/tag-${name}.png`, clip: f.box });
    return f;
  };
  const a = await shot(ids[0]!, 'GER');
  const b = await shot(ids[1]!, 'POL');
  if (a && b) console.log(`the flag's edge seen against the tag (ring pixels over 60 from the ground): GER ${(100 * a.ring).toFixed(0)} %, POL ${(100 * b.ring).toFixed(0)} %`);
  if (a && b) console.log(`as drawn, seed ${seed} day ${days}, 250 m/px: GER ${a.w}x${a.h}, POL ${b.w}x${b.h}; pixels differing by over 60: ${(100 * share(a.px, b.px)).toFixed(0)} %`);
  else console.log(`as drawn: no tag found (GER ${!!a}, POL ${!!b})`);
  await page.close();
}

// 2. The pairs at war in year 1.
for (const s of seeds) {
  const page = await open(s);
  const rows = await page.evaluate(async () => {
    const w = (window as any).__warsim;
    const pairs = new Set<string>();
    for (let d = 0; d < 365; d += 5) {
      await w.sim.step(24 * 5);
      await new Promise((r) => setTimeout(r, 30));
      for (const war of w.hud.stats.value.wars ?? []) for (const a of war.attackers) for (const b of war.defenders) pairs.add(`${Math.min(a, b)},${Math.max(a, b)}`);
    }
    const c = document.createElement('canvas');
    [c.width, c.height] = [15, 10];
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    const pix = (n: number): Uint8ClampedArray => {
      ctx.fillStyle = 'rgb(14, 17, 22)';
      ctx.fillRect(0, 0, 15, 10);
      ctx.drawImage(w.view.flags.canvasOf(n), 0, 0, 15, 10);
      return ctx.getImageData(0, 0, 15, 10).data;
    };
    const out: [string, number][] = [];
    for (const p of pairs) {
      const [a, b] = p.split(',').map(Number) as [number, number];
      const [pa, pb] = [pix(a), pix(b)];
      let k = 0;
      for (let i = 0; i < 150; i++) if (Math.max(Math.abs(pa[4 * i]! - pb[4 * i]!), Math.abs(pa[4 * i + 1]! - pb[4 * i + 1]!), Math.abs(pa[4 * i + 2]! - pb[4 * i + 2]!)) > 60) k++;
      out.push([`${a}-${b}`, k / 150]);
    }
    return out.sort((x, y) => x[1] - y[1]);
  });
  const tag = (n: string): string => TAGS_1938[Number(n) - 1] ?? `#${n}`;
  for (const r of rows) r[0] = r[0].split('-').map(tag).join('-');
  const under = rows.filter((r) => r[1] < bar);
  console.log(`seed ${s}: ${rows.length} pairs at war in year 1; under ${bar * 100} %: ${under.length ? under.map((r) => `${r[0]} ${(100 * r[1]).toFixed(0)} %`).join(', ') : 'none'}; the five least: ${rows.slice(0, 5).map((r) => `${r[0]} ${(100 * r[1]).toFixed(0)} %`).join(', ')}`);
  await page.close();
}
await browser.close();
