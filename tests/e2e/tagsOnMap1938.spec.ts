import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { TAGS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R100 (BLOCKERS, 2026-11-16; found in R98c's scans): a formation's tag or an enemy's pointer drawn under the
// top clock (ADR-1086) or in the war banners' row took no hover and no click: the mouse there was on the page's box.
// The scenes are `battleTags1938`'s on the seeds its scan found a tag under a box on (39915: formation 4's short tag at
// the top edge under the clock; 1 and 11): Germany at war with Poland, days stepped until a German armoured formation
// is engaged, the camera on it at 250 m/px; then on each German formation in contact at 10 m/px, where the enemy is
// off the frame and has its pointer at the frame's edge.

const GER = TAGS_1938.indexOf('GER') + 1;
const POL = TAGS_1938.indexOf('POL') + 1;

interface Under { what: string; x: number; y: number; under: string }

/** The tags and the pointers of the frame of which a point is under a box of the page: what, where, and the box. */
function underBoxes(page: Page): Promise<{ tags: number; pointers: number; under: Under[] }> {
  return page.evaluate(() => {
    const v = window.__warsim!.view!;
    v.draw();
    const under: Under[] = [];
    const ask = (what: string, x: number, y: number): void => {
      if (x < 1 || y < 1 || x > innerWidth - 1 || y > innerHeight - 1) return;
      const el = document.elementFromPoint(x, y);
      if (el !== null && el.tagName !== 'CANVAS') under.push({ what, x: Math.round(x), y: Math.round(y), under: `${el.tagName}.${el.className}` });
    };
    for (const t of v.tagRects) {
      // Its middle and a point inside each corner.
      ask(`tag ${t.id}`, t.x + t.w / 2, t.y + t.h / 2);
      for (const [fx, fy] of [[0.1, 0.2], [0.9, 0.2], [0.1, 0.8], [0.9, 0.8]] as const) ask(`tag ${t.id}`, t.x + t.w * fx, t.y + t.h * fy);
    }
    const boxes = (v as unknown as { enemyPointerBoxes: { x: number; y: number; w: number; h: number }[] }).enemyPointerBoxes;
    for (const [k, b] of boxes.entries()) ask(`pointer to ${v.enemyPointersShown[k]!.enemy}`, b.x + b.w / 2, b.y + b.h / 2);
    return { tags: v.tagRects.length, pointers: boxes.length, under };
  });
}

for (const seed of [39915, 1, 11]) {
  test(`seed ${seed}: no tag and no enemy's pointer of a battle is under a box of the page`, async ({ page }) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(`/?scenario=1938&paused=1&seed=${seed}`);
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null && window.__warsim!.sim.mapLayers !== null, null, { timeout: 60_000 });
    await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: GER, d: POL });
    let armour = 0;
    for (let d = 0; d < 45 && armour === 0; d++) {
      await page.evaluate(() => window.__warsim!.sim.step(24));
      await page.waitForFunction((t) => (window.__warsim!.view!.lastTick ?? 0) >= t, (d + 1) * 24, { timeout: 60_000 });
      armour = await page.evaluate((n) => {
        const v = window.__warsim!.view!;
        return v.formationsOf(n).find((f) => v.formationEngaged(f) && /Armoured/.test(v.formationTitle(f)?.kind ?? '')) ?? 0;
      }, GER);
    }
    expect(armour, 'a German armoured formation engaged').toBeGreaterThan(0);
    const at = async (f: number, m: number): Promise<void> => {
      await page.evaluate(({ f, m }) => {
        const v = window.__warsim!.view!;
        const p = v.formationPos(f)!;
        v.controller.set({ cx: p[0], cy: p[1], scale: (v.geo.kmPerCell * 1000) / m });
      }, { f, m });
      // The layers' handover run out, and the page's boxes read again.
      await page.waitForTimeout(1500);
    };
    const engaged = await page.evaluate((n) => {
      const v = window.__warsim!.view!;
      return v.formationsOf(n).filter((f) => v.formationEngaged(f)).slice(0, 8);
    }, GER);
    let [tags, pointers] = [0, 0];
    const found: string[] = [];
    for (const [f, m] of [[armour, 250], [armour, 120], ...engaged.map((f) => [f, 10])] as [number, number][]) {
      await at(f, m);
      const r = await underBoxes(page);
      tags += r.tags;
      pointers += r.pointers;
      for (const u of r.under) found.push(`on formation ${f} at ${m} m/px: ${u.what} at ${u.x}, ${u.y} under ${u.under}`);
    }
    process.stderr.write(`seed ${seed}: ${tags} tags and ${pointers} pointers in ${2 + engaged.length} views; under a box: ${found.length}\n${found.map((s) => `  ${s}\n`).join('')}`);
    expect(tags, 'tags looked at').toBeGreaterThan(20);
    expect(pointers, 'pointers looked at').toBeGreaterThan(0);
    expect(found).toEqual([]);
  });
}
