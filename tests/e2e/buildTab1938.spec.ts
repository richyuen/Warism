import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R53h (critic run 54, small; `critic/c54_p.json`, `actions`: on the phone the nation panel's 16 "Build"
// buttons below the screen, the Actions tab 139–1289 px of 844, "as in earlier runs"): the played nation's
// production is a tab of its own, Build, its templates by Infantry, Armour, Navy and Air, each a tile that builds.
// Playing Poland, at each of the four: every Build tile whole inside the panel's box and the screen, at a glance; and no
// control of the page off the screen (the critic's own count, `critic/scripts/c54_p_phone.mjs`) on Build or Actions.

const POL = NATIONS_1938.findIndex((n) => n.tag === 'POL') + 1;

/** The critic's count: visible buttons, selects, inputs and menu items outside the window. */
const offscreen = (page: Page): Promise<string[]> =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('button, select, input, [role=menuitem], [role=menuitemradio]')]
      .filter((b) => b.offsetParent !== null)
      .filter((b) => {
        const r = b.getBoundingClientRect();
        return r.right > innerWidth + 1 || r.bottom > innerHeight + 1 || r.left < -1 || r.top < -1;
      })
      .map((b) => (b.innerText || b.title || b.tagName).trim().slice(0, 30)),
  );

/** Build tiles not whole in the panel's scroll box (what shows without a scroll) or the window. */
const hidden = (page: Page): Promise<{ n: number; out: string[] }> =>
  page.evaluate(() => {
    const box = document.querySelector('[data-testid=nation-panel]')!.getBoundingClientRect();
    const tiles = [...document.querySelectorAll<HTMLElement>('[data-testid^=act-build-]')].filter((b) => b.offsetParent !== null);
    const out = tiles
      .filter((b) => {
        const r = b.getBoundingClientRect();
        return r.top < Math.max(0, box.top) - 1 || r.bottom > Math.min(innerHeight, box.bottom) + 1 || r.left < box.left - 1 || r.right > box.right + 1;
      })
      .map((b) => `${b.dataset['testid']} ${b.innerText.replace(/\n/g, ' ').slice(0, 30)}`);
    return { n: tiles.length, out };
  });

for (const [name, width, height] of [['phone', 390, 844], ['landscape phone', 844, 390], ['laptop', 1280, 720]] as const) {
  test(`the played nation's Build tab: every template of a kind at a glance (${name})`, async ({ page }, info) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height });
    await page.goto('/?scenario=1938&paused=1&seed=1938');
    await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
    const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R53h') : info.outputPath();
    mkdirSync(out, { recursive: true });
    await page.evaluate((n) => window.__warsim!.view!.select(n), POL);
    await page.getByTestId('take-control').click();
    await page.getByTestId('tab-actions').click();
    await expect(page.getByTestId('panel-actions')).toBeVisible();
    expect(await offscreen(page), 'Actions: controls off the screen').toEqual([]);
    await page.getByTestId('tab-build').click();
    let all = 0;
    for (const kind of ['infantry', 'armour', 'sea', 'air'] as const) {
      await page.getByTestId(`build-kind-${kind}`).click();
      await expect(page.getByTestId(`build-kind-${kind}`)).toHaveAttribute('aria-pressed', 'true');
      const h = await hidden(page);
      expect(h.n, `${kind}: tiles`).toBeGreaterThan(0);
      expect(h.out, `${kind}: tiles not whole in the panel at a glance`).toEqual([]);
      expect(await offscreen(page), `${kind}: controls off the screen`).toEqual([]);
      all += h.n;
      await page.screenshot({ path: path.join(out, `build-${name}-${kind}.png`) });
    }
    // Every template but a hero's, as the Actions tab listed them.
    const templates = await page.evaluate(() => window.__warsim!.sim.mapLayers!.templates.filter((tp) => !tp.hero).length);
    expect(all, 'tiles of the four kinds').toBe(templates);
    // A tile builds: the queue has its row.
    await page.getByTestId('build-kind-infantry').click();
    const tile = page.locator('[data-testid^=act-build-]:not([disabled])').first();
    await tile.click();
    await page.evaluate(() => window.__warsim!.sim.step(1));
    await expect(page.getByTestId('act-queue-row')).toHaveCount(1, { timeout: 20_000 });
    // With God Mode on, as the critic's next step: the Actions tab still whole on the screen.
    await page.getByTestId('god-btn').click();
    await page.getByTestId('tab-actions').click();
    await expect(page.getByTestId('panel-actions')).toBeVisible();
    expect(await offscreen(page), 'Actions in God Mode: controls off the screen').toEqual([]);
  });
}
