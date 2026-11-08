import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R53j (critic run 54, carried: "the editor's nation list is still one flat list of 100+ names",
// `c54_g_editor.mjs 24121`): a typed filter narrows it. Typed, the list holds the nations whose names hold the text
// (case and accents aside), the one chosen among them; a nation chosen that does not match gives way to the first
// that does. Cleared, the whole list again. The mask's list of nations is narrowed the same way.

const POL = NATIONS_1938.findIndex((n) => n.tag === 'POL') + 1;
const options = (page: Page, id: string): Promise<string[]> => page.getByTestId(id).locator('option').allInnerTexts();

for (const [name, width, height] of [['desk', 1400, 800], ['phone', 390, 844]] as const) {
  test(`the editor's nation list narrows to what is typed (${name})`, async ({ page }, info) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height });
    await page.goto('/?scenario=1938&paused=1&seed=24121');
    await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
    const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R53j') : info.outputPath();
    mkdirSync(out, { recursive: true });
    await page.getByTestId('editor-btn').click();
    // Every nation, living and gone, and "Unowned" first.
    const all = await options(page, 'editor-nation');
    expect(all.length, 'the whole list').toBeGreaterThan(100);
    const filter = page.getByTestId('editor-nation-filter');
    await expect(filter).toBeVisible();
    await expect(filter).toBeInViewport();
    // "pol": Poland, and the few others with "pol" in their names; Poland chosen.
    await filter.fill('pol');
    const some = await options(page, 'editor-nation');
    expect(some.length, some.join(', ')).toBeLessThan(6);
    expect(some).toContain('Poland');
    expect(some.every((o) => o.toLowerCase().includes('pol')), some.join(', ')).toBe(true);
    await expect(page.getByTestId('editor-nation')).toHaveValue(String(POL));
    await expect(page.getByTestId('editor-nation-count')).toHaveText(`${some.length} of ${all.length - 1}`);
    await page.screenshot({ path: path.join(out, `editor-filter-${name}.png`) });
    // Case aside: "POLAND" is Poland (accents aside too: `fold`).
    await filter.fill('POLAND');
    expect(await options(page, 'editor-nation')).toEqual(['Poland']);
    // Nothing matches: the chosen one stays, the only one, and the count says none.
    await filter.fill('zzzz');
    expect(await options(page, 'editor-nation')).toEqual(['Poland']);
    await expect(page.getByTestId('editor-nation-count')).toHaveText(`0 of ${all.length - 1}`);
    // The mask's list too.
    await page.getByTestId('editor-mask').selectOption('nation');
    await filter.fill('ger');
    const mask = await options(page, 'editor-mask-nation');
    expect(mask.length, mask.join(', ')).toBeLessThan(all.length);
    expect(mask).toContain('Germany');
    // Cleared: the whole list.
    await filter.fill('');
    expect(await options(page, 'editor-nation')).toEqual(all);
    await expect(page.getByTestId('editor-nation-count')).toHaveCount(0);
  });
}
