import { expect, test } from '@playwright/test';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R82i (critic run 68, AI nukes "not 9": "the mark at 10 s sits over the struck stack's counter"): the counter of
// a stack at ground zero (T0's counter, T1's marker) is read through a burst. At 937 and 3,000 m/px a burst is put on a counter's own spot (the
// render's alone: no strike, so the stack is the same with it and without), drawn at 2, 4, 8, 10 and 15 s (`hold`),
// and the counter's own pixels (those it draws over a ground painted magenta) compared with the same frame without the
// burst: under 1 % differ (before: the mark's dot and amber over them). The burst's
// ground (mark, shockwave, the cloud's foot) is drawn under the counters; its cap and flash over all (ADR-389).

const { w: W, h: H } = SIZE_1938;
const BERLIN = cellOf(13.4, 52.52, W, H);
const ZOOMS = [937, 3000];
const AGES = [2000, 4000, 8000, 10_000, 15_000];

interface Read { m: number; age: number; differ: number; px: number; box: number[]; marks: number }

test("a stack's counter at ground zero is read through the burst's mark and the cloud's foot", async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null && window.__warsim!.sim.mapLayers !== null, null, { timeout: 60_000 });
  const reads: Read[] = [];
  for (const m of ZOOMS) {
    // The camera put there, and the layers' handovers run out before the reads.
    await page.evaluate(({ x, y, m }) => window.__warsim!.view!.controller.set({ cx: x, cy: y, scale: (window.__warsim!.view!.geo.kmPerCell * 1000) / m }), { x: BERLIN[0], y: BERLIN[1], m });
    await page.waitForTimeout(1500);
    const got = await page.evaluate(
      ({ x, y, m, ages }) => {
        const v = window.__warsim!.view!;
        v.controller.set({ cx: x, cy: y, scale: (v.geo.kmPerCell * 1000) / m });
        v.nukeFx.clear();
        v.nukeFx.hold = null;
        v.draw();
        const overlay = document.querySelector<HTMLCanvasElement>('canvas.map-nations')!;
        const vw = overlay.clientWidth;
        const vh = overlay.clientHeight;
        // The counter nearest the middle, wholly on screen, not under a panel's edge.
        // T0's counters (3,000 m/px) or T1's markers (937: the critic's "counter" was a marker).
        const all = [...v.counters.boxes, ...v.markerRects].map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h, alpha: b.alpha }));
        const boxes = all.filter((b) => b.alpha >= 0.99 && b.x > 40 && b.y > 120 && b.x + b.w < vw - 400 && b.y + b.h < vh - 120);
        boxes.sort((a, b) => Math.hypot(a.x + a.w / 2 - vw / 2, a.y + a.h / 2 - vh / 2) - Math.hypot(b.x + b.w / 2 - vw / 2, b.y + b.h / 2 - vh / 2));
        const b = boxes[0];
        if (!b) throw new Error(`no counter: ${vw}x${vh} ${JSON.stringify(all.slice(0, 8))} ${v.metresPerPx}`);
        const box = [Math.round(b.x), Math.round(b.y), Math.round(b.w), Math.round(b.h)];
        const ctx = overlay.getContext('2d')!;
        const dpr = overlay.width / vw;
        const pixels = (): Uint8ClampedArray => ctx.getImageData(Math.round(box[0]! * dpr), Math.round(box[1]! * dpr), Math.round(box[2]! * dpr), Math.round(box[3]! * dpr)).data;
        const plain = pixels();
        // The counter's own pixels: those it draws over a ground pass that paints the whole view magenta.
        const fx = v.nukeFx;
        fx.draw = (c, _cam, _geo, w, h, _now, part) => {
          if (part !== 'ground') return;
          c.save();
          c.fillStyle = '#ff00ff';
          c.fillRect(0, 0, w, h);
          c.restore();
        };
        v.draw();
        const magenta = pixels();
        delete (fx as { draw?: unknown }).draw;
        const same = (a: Uint8ClampedArray, k: number): boolean => Math.max(Math.abs(a[k]! - plain[k]!), Math.abs(a[k + 1]! - plain[k + 1]!), Math.abs(a[k + 2]! - plain[k + 2]!), Math.abs(a[k + 3]! - plain[k + 3]!)) <= 24;
        const cam = v.controller.cam;
        const wx = cam.cx + (b.x + b.w / 2 - vw / 2) / cam.scale;
        const wy = cam.cy + (b.y + b.h / 2 - vh / 2) / cam.scale;
        v.nukeFx.bursts = [{ x: wx, y: wy, yieldN: 1, born: performance.now() }];
        v.nukeFx.until = Infinity;
        const out: { m: number; age: number; differ: number; px: number; box: number[]; marks: number }[] = [];
        for (const age of ages) {
          v.nukeFx.hold = age;
          v.draw();
          const now = pixels();
          let differ = 0;
          let ink = 0;
          for (let k = 0; k < now.length; k += 4) {
            if (!same(magenta, k)) continue;
            ink++;
            if (!same(now, k)) differ++;
          }
          out.push({ m, age, differ, px: ink, box, marks: v.nukeFx.shown[3]! });
        }
        return out;
      },
      { x: BERLIN[0], y: BERLIN[1], m, ages: AGES },
    );
    reads.push(...got);
    for (const age of [2000, 10_000]) {
      await page.evaluate((age) => {
        const v = window.__warsim!.view!;
        v.nukeFx.hold = age;
        v.draw();
      }, age);
      await page.screenshot({ path: path.join(info.outputPath(), `burst-counter-${m}m-${age / 1000}s.png`) });
    }
  }
  await page.evaluate(() => {
    const v = window.__warsim!.view!;
    v.nukeFx.clear();
    v.nukeFx.hold = null;
  });
  console.log(reads.map((r) => `${r.m} m/px ${r.age / 1000} s: ${r.differ} of ${r.px} px differ (box ${r.box.join(',')})`).join('\n'));
  for (const r of reads) {
    expect(r.px, `${r.m} m/px`).toBeGreaterThan(200);
    expect(r.marks, `${r.m} m/px at ${r.age} ms`).toBe(1);
    expect(r.differ / r.px, `${r.m} m/px at ${r.age} ms`).toBeLessThan(0.01);
  }
});
