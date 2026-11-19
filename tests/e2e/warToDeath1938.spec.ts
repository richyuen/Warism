import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';
import { open1938 } from './mapView';

// ROADMAP R135 (critic run 75: `c75_warAt100.ts 7019 5 off`, Japan's war in China at −100 for 738 days; China and both
// Spains fight to the death, and only the refusal of a peace the player offers said so). The banner's title says which
// side fights to the death and what that means; a war with neither says nothing of it. The critic's seed, at the start:
// the war in China and the Spanish war are the start's, with their flags.

const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const ENDS = "no peace is made, whatever the score; the war ends when one side holds three quarters of the other's land, or after five years";

test('a war banner says which side fights to the death and why the war goes on (ROADMAP R135)', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await open1938(page, 7019);
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }, true), { a: id('GER'), d: id('POL') });
  await page.evaluate(() => window.__warsim!.sim.step(24));
  await expect(page.getByTestId('war-banner')).toHaveCount(3, { timeout: 20_000 });
  const titleOf = async (who: string): Promise<string> => (await page.locator(`[data-testid="war-banner"][title*="${who}"]`).getAttribute('title'))!;
  const china = await titleOf('Japan');
  expect(china).toContain(`China fights to the death: ${ENDS}`);
  expect(china).not.toContain('Japan fights to the death');
  const spain = await titleOf('Spanish Republic');
  expect(spain).toMatch(new RegExp(`(Nationalist Spain and Spanish Republic|Spanish Republic and Nationalist Spain) fight to the death: `));
  const poland = await titleOf('Poland');
  expect(poland).not.toContain('to the death');
  await expect(page.locator('[data-testid="war-banner"][data-death="1"]')).toHaveCount(2);
  // R162 (critic run 77: "Portugal +2 +32 ☠"): a side's allies are "& n", not a second number with a plus by the score.
  await expect(page.getByTestId('war-allies').first()).toBeVisible({ timeout: 20_000 });
  for (const a of await page.getByTestId('war-allies').allInnerTexts()) expect(a).toMatch(/^& \d+$/);
  for (const b of await page.getByTestId('war-banner').allInnerTexts()) expect(b.replace(/\s+/g, ' ')).not.toMatch(/\+\d+ ?\+\d+/);

  // R156 (critic run 76): on a phone there is no hover. The two are marked on their banners; opened, each says it in words.
  await page.setViewportSize({ width: 390, height: 844 });
  // Closed, the row shows two and "+n" (one may be behind it): each to the death on the row has its mark.
  await page.waitForTimeout(500);
  const onRow = await page.locator('[data-testid="war-banner"][data-death="1"]').count();
  expect(onRow).toBeGreaterThan(0);
  await expect(page.locator('[data-testid="war-banner"][data-death="1"] [data-testid="war-death"]')).toHaveCount(onRow);
  await expect(page.getByTestId('war-death-line')).toHaveCount(0);
  await page.getByTestId('war-more').click();
  await expect(page.getByTestId('war-death')).toHaveCount(2);
  const lines = await page.getByTestId('war-death-line').allInnerTexts();
  expect(lines).toHaveLength(2);
  expect(lines.join(' | ')).toContain(`China fights to the death: ${ENDS}`);
  for (const line of await page.getByTestId('war-death-line').all()) await expect(line).toBeVisible();

  // R166 (critic run 78): opened, a war's banner with no death line stood as tall as its neighbour with one, half empty.
  // Each banner is its own content's height: Poland's, on a row with a banner to the death, is the shorter.
  for (const [w, h] of [[390, 844], [1400, 800]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(300);
    const boxes = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-testid="war-banner"]')].map((b) => {
        const r = b.getBoundingClientRect();
        return { death: b.dataset['death'] === '1', poland: (b.getAttribute('title') ?? '').includes('Poland'), top: r.top, bottom: r.bottom, h: r.height };
      }),
    );
    const poland = boxes.find((b) => b.poland)!;
    const beside = boxes.filter((b) => b.death && b.top < poland.bottom && poland.top < b.bottom);
    if (w === 1400) expect(beside.length, 'a banner to the death on Poland\'s row at 1400 × 800').toBeGreaterThan(0);
    for (const b of beside) expect(poland.h, `${w} × ${h}: Poland's banner beside one with its death line`).toBeLessThan(b.h - 5);
  }
});

// R172 (critic run 79's small things): on a phone three opened banners of one nation's wars to the death said the whole
// sentence three times. Said once in full; another banner of the same sentence says it short.
test('a death sentence said once in full on the opened banners, short on another of the same', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await open1938(page, 7019);
  // A second war on China, China to the death in it too (God's switch); and Poland's, so the row has a "+n" to open.
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }, true), { a: id('SOV'), d: id('CHI') });
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }, true), { a: id('GER'), d: id('POL') });
  await page.evaluate(() => window.__warsim!.sim.step(24));
  const war = await page.evaluate((sov) => window.__warsim!.hud.stats.value!.wars.find((w) => w.attackers[0] === sov)?.id ?? -1, id('SOV'));
  expect(war, "the Soviet Union's war on China").toBeGreaterThan(0);
  await page.evaluate((war) => window.__warsim!.sim.command({ kind: 'setWarFightToDeath', war, side: 1, value: true }, true), war);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.waitForFunction((war) => window.__warsim!.hud.stats.value!.wars.find((w) => w.id === war)?.toDeath[1] === true, war, { timeout: 20_000 });
  await page.getByTestId('war-more').click();
  const lines = await page.getByTestId('war-death-line').allInnerTexts();
  const china = lines.filter((l) => l.startsWith('China fights to the death'));
  expect(china, "China's lines").toHaveLength(2);
  expect(china.filter((l) => l === `China fights to the death: ${ENDS}`), 'in full once').toHaveLength(1);
  expect(china.filter((l) => l === 'China fights to the death: no peace is made'), 'short once').toHaveLength(1);
});
