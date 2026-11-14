import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { TAGS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R81i (ADR-1037, the user's decision): the tags at a battle. As `tools/diag/battleTags.ts` (the critic's
// `c_battle`, seed 39915): Germany at war with Poland, days stepped until a German armoured formation is engaged, the
// camera on it at 250 m/px, paused. There, with formations in contact in view, the tag of each one not in contact is one
// line (flag and strength, no name); the engaged keep the whole tag, and so do the picked, a selected and a hovered one
// (the hover held when the grown tag moves: the mouse moved 1 px still has it). None overlap; every formation in view
// has its tag. At 300 m/px every tag whole, as before. Shots at 250 m/px looked at.

const GER = TAGS_1938.indexOf('GER') + 1;
const POL = TAGS_1938.indexOf('POL') + 1;

interface Read { battle: boolean; tags: { id: number; short: boolean; engaged: boolean; x: number; y: number; w: number; h: number }[]; inView: number[]; over: number }

function read(page: Page): Promise<Read> {
  return page.evaluate(() => {
    const v = window.__warsim!.view!;
    v.draw();
    const tags = v.tagRects.map((t) => ({ id: t.id, short: t.short === true, engaged: t.engaged, x: t.x, y: t.y, w: t.w, h: t.h }));
    let over = 0;
    for (let i = 0; i < tags.length; i++)
      for (let j = i + 1; j < tags.length; j++) {
        const [a, b] = [tags[i]!, tags[j]!];
        if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) over++;
      }
    const inView = v.tagInputs.filter((t) => t.x1 >= 0 && t.x0 <= innerWidth && t.y1 >= 0 && t.y0 <= innerHeight).map((t) => t.id);
    return { battle: v.tagBattle, tags, inView, over };
  });
}

const byId = (r: Read, id: number): Read['tags'][number] => r.tags.find((t) => t.id === id)!;

test("at a battle at 250 m/px the tags not in contact are one line; the engaged, picked, selected and hovered whole", async ({ page }, info) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=39915');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null && window.__warsim!.sim.mapLayers !== null, null, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: GER, d: POL });
  let armour = 0;
  for (let d = 0; d < 12 && armour === 0; d++) {
    await page.evaluate(() => window.__warsim!.sim.step(24));
    await page.waitForFunction((t) => (window.__warsim!.view!.lastTick ?? 0) >= t, (d + 1) * 24, { timeout: 60_000 });
    armour = await page.evaluate((n) => {
      const v = window.__warsim!.view!;
      return v.formationsOf(n).find((f) => v.formationEngaged(f) && /Armoured/.test(v.formationTitle(f)?.kind ?? '')) ?? 0;
    }, GER);
  }
  expect(armour, 'a German armoured formation engaged in 12 days').toBeGreaterThan(0);
  const at = (m: number): Promise<void> =>
    page.evaluate(
      ({ f, m }) => {
        const v = window.__warsim!.view!;
        const p = v.formationPos(f)!;
        v.controller.set({ cx: p[0], cy: p[1], scale: (v.geo.kmPerCell * 1000) / m });
      },
      { f: armour, m },
    );
  await at(250);
  // The layers' handover run out.
  await page.waitForTimeout(1500);

  const r = await read(page);
  expect(r.battle).toBe(true);
  expect(r.over).toBe(0);
  for (const id of r.inView) expect(r.tags.some((t) => t.id === id), `formation ${id} tagged`).toBe(true);
  for (const t of r.tags) expect(t.short, `formation ${t.id}${t.engaged ? ', engaged,' : ''} short`).toBe(!t.engaged);
  const shorts = r.tags.filter((t) => t.short);
  expect(shorts.length).toBeGreaterThanOrEqual(5);
  expect(r.tags.filter((t) => t.engaged).length).toBeGreaterThanOrEqual(5);
  await page.screenshot({ path: path.join(info.outputPath(), 'battle-tags-250m.png') });

  // Picked and selected: whole.
  const [p, s] = [shorts[0]!.id, shorts[1]!.id];
  await page.evaluate(({ p, s }) => {
    const v = window.__warsim!.view!;
    v.pickedFormation = p;
    v.selectedFormations.add(s);
  }, { p, s });
  const r2 = await read(page);
  expect(byId(r2, p).short, 'the picked').toBe(false);
  expect(byId(r2, s).short, 'the selected').toBe(false);
  expect(r2.over).toBe(0);
  await page.evaluate(({ s }) => {
    const v = window.__warsim!.view!;
    v.pickedFormation = 0;
    v.selectedFormations.delete(s);
  }, { s });

  // Hovered: each short tag in turn, the mouse on its middle, then 1 px on.
  const r3 = await read(page);
  const box = (await page.locator('canvas.map-nations').boundingBox())!;
  const away = async (): Promise<void> => {
    await page.mouse.move(box.x + 2, box.y + box.height - 2);
    await page.waitForTimeout(80);
  };
  for (const id of r3.tags.filter((x) => x.short).map((x) => x.id)) {
    // From off every tag, at its short tag's place now (a grown tag before it moved the others).
    await away();
    const t = byId(await read(page), id);
    expect(t.short).toBe(true);
    const [mx, my] = [t.x + t.w / 2, t.y + t.h / 2];
    for (const dx of [0, 1]) {
      await page.mouse.move(box.x + mx + dx, box.y + my);
      await page.waitForTimeout(80);
      const h = await read(page);
      const hov = await page.evaluate(() => window.__warsim!.view!.tagHover);
      expect(hov, `formation ${t.id} hovered (+${dx} px)`).toBe(t.id);
      expect(byId(h, t.id).short, `formation ${t.id} whole while hovered (+${dx} px)`).toBe(false);
      expect(h.over, `no overlap with ${t.id} hovered`).toBe(0);
      expect(h.tags.filter((x) => x.id !== t.id && !x.engaged).every((x) => x.short), 'the others short').toBe(true);
    }
  }
  await away();
  await page.screenshot({ path: path.join(info.outputPath(), 'battle-tags-250m-after.png') });

  // Zoomed out past 250 m/px: every tag whole.
  await at(300);
  await page.waitForTimeout(1500);
  const r4 = await read(page);
  expect(r4.battle).toBe(false);
  expect(r4.tags.filter((t) => t.short)).toEqual([]);
});
