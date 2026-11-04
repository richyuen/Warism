import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';

// ROADMAP R17d AT (the page's part; the sim's cases are `landingEscort1938.test.ts`): the panel of
// the player's division has an "Escort with warships" box, ticked by default; a click's order over
// the sea carries it, and with no warfleet free the panel tells the transports sail alone; the box
// unticked stays so after a reload of the page.

const { w: W, h: H } = SIZE_1938;
const ENG = NATIONS_1938.findIndex((n) => n.tag === 'ENG') + 1;
const TRANSPORT = TEMPLATES_1938.findIndex((t) => t.id === 'transport_group');
const cell = (lon: number, lat: number): [number, number] => cellOf(lon, lat, W, H).map((v) => Math.floor(v)) as [number, number];
const LONDON = cell(-0.12, 51.5);
const BELFAST = cell(-5.93, 54.6);

/** The 1938 world with Britain played, and its land division nearest London selected and its panel open. */
async function britain(page: Page): Promise<number> {
  await page.goto('/?scenario=1938&paused=1&seed=2207');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.view!.formationsOf(n).length > 3, ENG, { timeout: 60_000 });
  await page.evaluate((n) => window.__warsim!.view!.select(n), ENG);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();
  const div = await page.evaluate(({ n, x, y }) => {
    const v = window.__warsim!.view!;
    return v
      .formationsOf(n)
      .filter((id) => !v.formationAfloat(id))
      .map((id) => [id, Math.hypot(v.formationPos(id)![0] - x, v.formationPos(id)![1] - y)] as const)
      .sort((a, b) => a[1] - b[1])[0]![0];
  }, { n: ENG, x: LONDON[0] + 0.5, y: LONDON[1] + 0.5 });
  await page.evaluate((id) => {
    window.__warsim!.view!.selectedFormations.add(id);
    window.__warsim!.hud.selectFormation(id);
  }, div);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(div), { timeout: 10_000 });
  return div;
}

test('the escort box: ticked by default, carried by a click over the sea (none free: told), unticked after a reload', async ({ page }) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await britain(page);
  const box = page.getByTestId('formation-escort');
  await expect(box).toBeVisible({ timeout: 10_000 });
  await expect(box).toBeChecked();

  // No warfleet of Britain's left: every fleet but the transports removed.
  const warfleets = await page.evaluate(
    async ({ n, tpl }) => {
      const v = window.__warsim!.view!;
      const out: number[] = [];
      for (const id of v.formationsOf(n).filter((f) => v.formationAfloat(f))) {
        const d = await window.__warsim!.sim.formation(id);
        if (d && d.template !== tpl && window.__warsim!.hud.templates.value[d.template]?.domain === 1) out.push(id);
      }
      return out;
    },
    { n: ENG, tpl: TRANSPORT },
  );
  expect(warfleets.length, "Britain's warfleets").toBeGreaterThan(0);
  for (const id of warfleets) await page.evaluate((f) => window.__warsim!.hud.command({ kind: 'removeFormation', id: f }), id);
  await page.evaluate(() => window.__warsim!.sim.step(1));

  // A click over the sea with the box ticked: the order asks for an escort, and is told none is free.
  await page.evaluate(([x, y]) => window.__warsim!.player!.click(x, y, -9999, -9999, false), BELFAST);
  await page.evaluate(() => window.__warsim!.sim.step(2));
  await expect(page.getByTestId('formation-notice')).toContainText('no warships free', { timeout: 10_000 });

  // Unticked, and after a reload of the page still unticked.
  await box.uncheck();
  await expect(box).not.toBeChecked();
  await page.reload();
  await britain(page);
  await expect(page.getByTestId('formation-escort')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('formation-escort')).not.toBeChecked();
});
