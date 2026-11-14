/**
 * ROADMAP R81f's measure (critic run 67: "the 250 m/px labels crowd a battle", 39915 day 5): the formations' tags at a
 * battle. As the critic's `c_battle`: Germany declares war on Poland, days stepped until a German armoured formation is
 * engaged, the camera on it at 250 m/px (and the first engaged infantry's), 2.5 s live. Read from the view: the tags
 * (`view.tagRects`) and the pairs of them overlapping; the boxes of elements they are laid out for (`view.tagInputs`,
 * one a formation) in the view; those left without a place (`view.tagsLeft`); and the engaged formations in
 * the view whose tag is not drawn (a tag is a formation's: the tags are laid out per formation); and the engaged
 * formations' elements in the view that lie under a tag.
 *
 * Usage: `npm run build`, `npx vite preview --port 5355 --host 127.0.0.1`, then
 * `npx tsx tools/diag/battleTags.ts [seeds = 39915] [m/px = 250] [out dir = .cache/battleTags]`.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- the page's debug handle, `window.__warsim`, is read untyped */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { TAGS_1938 } from '../../src/sim/scenario1938';
import { GPU_ARGS } from '../gate/render';

const seeds = (process.argv[2] ?? '39915').split(',').map(Number);
const mpp = Number(process.argv[3] ?? 250);
const outDir = process.argv[4] ?? '.cache/battleTags';
const BASE = process.env.BASE ?? 'http://127.0.0.1:5355';
mkdirSync(outDir, { recursive: true });
const GER = TAGS_1938.indexOf('GER') + 1;
const POL = TAGS_1938.indexOf('POL') + 1;

const browser = await chromium.launch({ args: GPU_ARGS });
for (const seed of seeds) {
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await context.addInitScript({ content: 'window.__name = (f) => f;' });
  const page = await context.newPage();
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => { const w = (window as any).__warsim; return (w?.view?.frames ?? 0) > 0 && w.hud.stats.value !== null && w.sim.mapLayers !== null; }, null, { timeout: 120_000 });
  await page.evaluate(({ a, d }) => (window as any).__warsim.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: GER, d: POL });
  let picks: { f: number; kind: string }[] = [];
  let day = 0;
  for (let d = 0; d < 12; d++) {
    await page.evaluate(async () => { const w = (window as any).__warsim; await w.sim.step(24); }, null);
    await page.waitForFunction((t) => ((window as any).__warsim.view.lastTick ?? 0) >= t, (d + 1) * 24, { timeout: 60_000 });
    day = d + 1;
    const all = await page.evaluate((n) => {
      const v = (window as any).__warsim.view;
      return (v.formationsOf(n) as number[]).filter((f) => v.formationEngaged(f)).map((f) => ({ f, t: JSON.stringify(v.formationTitle(f)) }));
    }, GER);
    const arm = all.filter((x) => /Armoured|Tank|Panzer/i.test(x.t));
    const inf = all.filter((x) => /Infantry/i.test(x.t));
    if (arm.length > 0) {
      picks = [{ f: arm[0]!.f, kind: 'arm' }, ...(inf[0] ? [{ f: inf[0].f, kind: 'inf' }] : [])];
      break;
    }
  }
  for (const p of picks) {
    await page.evaluate(({ f, m }) => {
      const v = (window as any).__warsim.view;
      const pos = v.formationPos(f);
      v.controller.set({ cx: pos[0], cy: pos[1], scale: (v.geo.kmPerCell * 1000) / m });
      const h = (window as any).__warsim.hud;
      h.setSpeedLevel(0);
      if (h.paused.value) h.togglePause();
    }, { f: p.f, m: mpp });
    await page.waitForTimeout(2500);
    await page.evaluate(() => { const h = (window as any).__warsim.hud; if (!h.paused.value) h.togglePause(); }, null);
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const v = (window as any).__warsim.view;
      const tags = v.tagRects as { id: number; x: number; y: number; w: number; h: number; name: string }[];
      const over: string[] = [];
      for (let i = 0; i < tags.length; i++)
        for (let j = i + 1; j < tags.length; j++) {
          const [a, b] = [tags[i]!, tags[j]!];
          if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) over.push(`${a.name} / ${b.name}`);
        }
      const [vw, vh] = [innerWidth, innerHeight];
      const inputs = (v.tagInputs as any[]).filter((t) => t.x1 >= 0 && t.x0 <= vw && t.y1 >= 0 && t.y0 <= vh);
      const tagged = new Set(tags.map((t) => t.id));
      // Engaged formations in view, by nation, and whether a tag names it or a formation of its stack.
      const unshown: string[] = [];
      let engaged = 0;
      for (let n = 1; n < 400; n++) {
        let fs: number[];
        try { fs = v.formationsOf(n); } catch { continue; }
        for (const f of fs) {
          if (!v.formationEngaged(f)) continue;
          const p = v.formationPos(f);
          if (!p) continue;
          const cam = v.controller.cam;
          const x = (p[0] - cam.cx) * cam.scale + vw / 2;
          const y = (p[1] - cam.cy) * cam.scale + vh / 2;
          if (x < 0 || x > vw || y < 0 || y > vh) continue;
          engaged++;
          if (!tagged.has(f)) unshown.push(JSON.stringify(v.formationTitle(f)));
        }
      }
      // The engaged formations' elements in view, and those under a tag (the fight hidden by its labels).
      let els = 0;
      let covered = 0;
      const cam = v.controller.cam;
      for (let i = 0; i < v.elementCount; i++) {
        if (!v.formationEngaged(v.elementFormation[i])) continue;
        const x = (v.elementX[i] - cam.cx) * cam.scale + vw / 2;
        const y = (v.elementY[i] - cam.cy) * cam.scale + vh / 2;
        if (x < 0 || x > vw || y < 0 || y > vh) continue;
        els++;
        if (tags.some((t) => x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h)) covered++;
      }
      return { tags: tags.length, over, inputs: inputs.length, left: v.tagsLeft, engaged, unshown, els, covered };
    });
    const tag = `${seed}_${p.kind}_d${day}`;
    await page.screenshot({ path: path.join(outDir, `${tag}.png`) });
    console.log(`${seed} day ${day} ${p.kind} at ${mpp} m/px: ${r.tags} tags, ${r.over.length} overlapping${r.over.length ? ` (${r.over.slice(0, 4).join('; ')})` : ''}; ${r.inputs} stacks in view, ${r.left} left unplaced; ${r.engaged} engaged in view, ${r.unshown.length} unshown${r.unshown.length ? `: ${r.unshown.slice(0, 5).join(', ')}` : ''}; the engaged formations' elements in view ${r.els}, under a tag ${r.covered}`);
  }
  await context.close();
}
await browser.close();
