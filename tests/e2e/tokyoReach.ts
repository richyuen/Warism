import type { Page } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;

/**
 * ROADMAP R43a (ADR-838): a click's division whose own port lands it a week sooner makes a landing of its own there,
 * a sibling. Of Japan's divisions only 364 stands where Tokyo is its land's nearest port (365, "the second nearest
 * Tokyo", is near Ōsaka: R49-N5's case). A spec of one landing at Tokyo sets down three more divisions of 364's
 * strength `cells` straight cells from Tokyo's port (1819/385; 2, 5 and 8 by default), within Tokyo's reach (8 at
 * most; the unit tests' `nearPort`): Japan's nearest Tokyo are then 364 and these, nearest first. A spec whose
 * second must still be on its way when the first is at the port sets it far (8). Call it after the player takes
 * Japan, before the pick.
 */
const AT: Record<number, [number, number]> = { 2: [1817.5, 383.5], 5: [1814.5, 380.5], 6: [1813.5, 379.5], 7: [1816.5, 378.5], 8: [1819.5, 377.5] };

export async function tokyoReach(page: Page, cells: readonly (2 | 5 | 6 | 7 | 8)[] = [2, 5, 8]): Promise<void> {
  const at = cells.map((r) => AT[r]!);
  await page.evaluate(({ nation, at }) => {
    const hud = window.__warsim!.hud;
    for (const [x, y] of at) hud.command({ kind: 'spawnFormation', nation, x, y, strength: 20580, template: 1 });
  }, { nation: JAP, at });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.waitForFunction(({ n, k }) => {
    const v = window.__warsim!.view!;
    return v.formationsOf(n).filter((id) => Math.hypot(v.formationPos(id)![0] - 1819, v.formationPos(id)![1] - 385) < 10).length >= 1 + k;
  }, { n: JAP, k: cells.length }, { timeout: 30_000 });
}
