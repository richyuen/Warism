import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R53p (ADR-891): at Max a snapshot is several ticks on from the one before (about 6 hours, 33 a second on a
// late world), and its tick had no length: the view drew only when one came, and the units hopped. Now the step is as
// long as snapshots come apart, and its sprites go from where they were drawn when it came, not from their places an
// hour before (they would glide an hour and jump the rest). A pause still lets the step finish (PLAN 2.7y).

const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;

test('at Max the units glide between snapshots from where they were drawn, and a pause lets the step finish (R53p)', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=99');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  const got = await page.evaluate(
    async ([GER, POL]) => {
      const { sim } = window.__warsim!;
      const v = window.__warsim!.view!;
      const until = async (what: string, test: () => boolean, ms: number): Promise<void> => {
        const end = performance.now() + ms;
        while (!test()) {
          if (performance.now() > end) throw new Error(`waited ${ms} ms for ${what}`);
          await new Promise((done) => setTimeout(done, 4));
        }
      };
      sim.command({ kind: 'declareWar', attacker: GER!, defender: POL! });
      // Over Germany's army, at 150 m/px: its elements are in the snapshot.
      const at = v.formationsOf(GER!).map((f) => v.formationPos(f)).filter((p): p is [number, number] => p !== null);
      const cx = at.reduce((s, p) => s + p[0], 0) / at.length;
      const cy = at.reduce((s, p) => s + p[1], 0) / at.length;
      v.controller.set({ cx, cy, scale: (v.metresPerPx * v.controller.cam.scale) / 150 });
      sim.setSpeed('max');
      sim.setPaused(false);
      await until('elements in the view', () => v.elementCount > 50, 20_000);
      await new Promise((done) => setTimeout(done, 1500));

      // 1. Each snapshot of a new tick: where its sprites start, against where those before were drawn when it came.
      const apply = (v as never as { apply: (s: unknown) => void }).apply;
      let fromOff = 0;
      let hourOff = 0;
      let matched = 0;
      let moved = 0;
      let newTicks = 0;
      type Snap = { tick: number; elements: { count: number; id: Uint32Array; prevX: Float64Array; prevY: Float64Array } };
      (v as never as { apply: (s: Snap) => void }).apply = function (this: typeof v, s: Snap): void {
        const fresh = s.tick !== v.lastTick;
        // The snapshot's own places an hour before, which the sprites started from until R53p.
        const hour = new Map<number, [number, number]>();
        for (let i = 0; i < s.elements.count; i++) hour.set(s.elements.id[i]!, [s.elements.prevX[i]!, s.elements.prevY[i]!]);
        const t = v.tickProgress(performance.now());
        const shown = new Map<number, [number, number]>();
        for (let i = 0; i < v.elementCount; i++) shown.set(v.elementId[i]!, [v.elementPrevX[i]! + (v.elementX[i]! - v.elementPrevX[i]!) * t, v.elementPrevY[i]! + (v.elementY[i]! - v.elementPrevY[i]!) * t]);
        apply.call(this, s);
        if (!fresh) return;
        newTicks++;
        for (let i = 0; i < v.elementCount; i++) {
          const p = shown.get(v.elementId[i]!);
          if (!p) continue;
          matched++;
          fromOff = Math.max(fromOff, Math.hypot(v.elementPrevX[i]! - p[0], v.elementPrevY[i]! - p[1]));
          const h = hour.get(v.elementId[i]!)!;
          hourOff = Math.max(hourOff, Math.hypot(h[0] - p[0], h[1] - p[1]));
          if (Math.hypot(v.elementX[i]! - v.elementPrevX[i]!, v.elementY[i]! - v.elementPrevY[i]!) > 1e-3) moved++;
        }
      };
      // 2. The frames the browser gives against those the view draws, and the sprites' progress midway between snapshots.
      const f0 = v.frames;
      const t0 = performance.now();
      let raf = 0;
      let between = 0;
      let partway = 0;
      await new Promise<void>((done) => {
        const tick = (): void => {
          raf++;
          const p = v.tickProgress(performance.now());
          between++;
          if (p > 0 && p < 1) partway++;
          // Forty frames, or 20 s: a headless run without a GPU draws a few frames a second.
          if (raf >= 40 || performance.now() - t0 > 20_000) done();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      const draws = v.frames - f0;
      (v as never as { apply: unknown }).apply = apply;

      // 3. A pause on the way: the sprites finish the step, by the clock, and then stand.
      let pause: { before: number; after: number; ms: number } | null = null;
      for (let i = 0; i < 20 && !pause; i++) {
        sim.setPaused(false);
        const tick = v.lastTick;
        await until('the next tick', () => v.lastTick !== tick, 5000);
        const snapshots = v.snapshots;
        sim.setPaused(true);
        await until('the snapshot of the pause', () => v.snapshots > snapshots, 3000);
        const before = v.tickProgress(performance.now());
        if (before >= 0.95) continue;
        const t1 = performance.now();
        await until('the end of the step', () => v.tickProgress(performance.now()) >= 1, 3000);
        pause = { before, after: v.tickProgress(performance.now()), ms: performance.now() - t1 };
      }
      sim.setPaused(true);
      return { raf, draws, between, partway, newTicks, matched, moved, fromOff, hourOff, pause };
    },
    [id('GER'), id('POL')],
  );
  console.log(`R53p: ${got.draws} draws of ${got.raf} frames; progress partway in ${got.partway} of ${got.between}; ${got.newTicks} snapshots of new ticks, ${got.matched} elements matched, ${got.moved} moving, their start at most ${got.fromOff.toFixed(4)} cells from where drawn (the snapshot's place an hour before: ${got.hourOff.toFixed(4)}); pause ${JSON.stringify(got.pause)}`);
  expect(got.newTicks, 'snapshots of new ticks at Max').toBeGreaterThan(5);
  expect(got.moved, 'elements on their way').toBeGreaterThan(0);
  // Where each starts is where it was drawn when its snapshot came (to the few ms between the hook's clock and the
  // view's), and not its place an hour before.
  expect(got.fromOff, 'a sprite starts where it was drawn').toBeLessThan(0.02);
  expect(got.hourOff, 'the places an hour before are elsewhere').toBeGreaterThan(got.fromOff * 5);
  // Between snapshots the sprites are on their way, and the view draws them there.
  expect(got.partway / got.between, 'frames with the sprites partway').toBeGreaterThan(0.5);
  expect(got.draws / got.raf, 'frames drawn of those the browser gave').toBeGreaterThan(0.85);
  // A pause lets the step finish: no jump to its end.
  expect(got.pause, 'a pause on the way').not.toBeNull();
  expect(got.pause!.after).toBe(1);
  expect(got.pause!.ms).toBeGreaterThan(0);
});
