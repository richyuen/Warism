import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R1b, ADR-806: the relations graph on the 1938 world. It opens from the bottom bar, draws
// the start's ties (wars, alliances, guarantees, puppets), a kind switched off hides its lines and
// leaves the nodes where they were, a click on a line says what it is, a click on a nation selects
// it, and after a year it still draws what the statistics message says.

const tag = (t: string): number => NATIONS_1938.findIndex((n) => n.tag === t) + 1;
const [JAP, MAN] = [tag('JAP'), tag('MAN')];

const edges = (page: Page, kind?: string): Promise<number> => page.locator(kind ? `.relations-edge[data-kind="${kind}"]` : '.relations-edge').count();

test('the relations graph: the start\'s ties, a kind switched off, a line read, a nation selected, a year on', async ({ page }, info) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=7019');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.sim.step(24));
  // The statistics of that day in (a war declared on it redraws the graph between two counts).
  await page.waitForFunction(() => (window.__warsim!.hud.stats.value?.tick ?? 0) >= 24, null, { timeout: 60_000 });
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R1') : info.outputPath();
  mkdirSync(out, { recursive: true });

  await page.getByTestId('relations-btn').click();
  const panel = page.getByTestId('relations-panel');
  await expect(panel).toBeVisible();
  // Every kind of the start is drawn: Japan's war in China, the alliances, the guarantees, Manchukuo under Japan.
  await expect.poll(() => edges(page, 'war')).toBeGreaterThan(0);
  for (const k of ['alliance', 'guarantee', 'puppet']) expect(await edges(page, k), k).toBeGreaterThan(0);
  await expect(page.locator(`.relations-edge[data-kind="puppet"][data-from="n${JAP}"][data-to="n${MAN}"]`)).toHaveCount(1);
  // As many lines of each kind as the statistics message has ties of it.
  const want = await page.evaluate(() => {
    const s = window.__warsim!.hud.stats.value!;
    const living = new Set(s.nations.map((n) => n.id));
    return {
      puppet: s.nations.filter((n) => n.overlord !== 0 && living.has(n.overlord)).length,
      guarantee: s.nations.reduce((k, n) => k + n.guarantees.filter((g) => living.has(g) && g !== n.id).length, 0),
    };
  });
  expect(await edges(page, 'puppet')).toBe(want.puppet);
  expect(await edges(page, 'guarantee')).toBe(want.guarantee);
  // The panel and the drawing inside the view.
  const box = (await panel.boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(900);
  await page.screenshot({ path: path.join(out, 'relations-start.png') });

  // Guarantees off: their lines go, the rest stay where they were.
  const before = await page.getByTestId(`relations-node-n${JAP}`).locator('circle').first().getAttribute('cx');
  const all = await edges(page);
  await page.getByTestId('relations-kind-guarantee').uncheck();
  await expect.poll(() => edges(page, 'guarantee')).toBe(0);
  expect(await edges(page)).toBe(all - want.guarantee);
  expect(await page.getByTestId(`relations-node-n${JAP}`).locator('circle').first().getAttribute('cx')).toBe(before);
  // Only puppets: the lines are puppet bonds alone.
  for (const k of ['war', 'alliance', 'truce']) await page.getByTestId(`relations-kind-${k}`).uncheck();
  await expect.poll(() => edges(page)).toBe(want.puppet);
  await page.screenshot({ path: path.join(out, 'relations-puppets.png') });

  // A line read: Manchukuo under Japan.
  await page.locator(`.relations-edge[data-kind="puppet"][data-from="n${JAP}"][data-to="n${MAN}"] .relations-hit`).click({ force: true });
  await expect(page.getByTestId('relations-said')).toContainText('Manchukuo is a puppet of Japan');
  // A nation selected: Japan's panel opens.
  await page.getByTestId(`relations-node-n${JAP}`).click({ force: true });
  await expect.poll(() => page.evaluate(() => window.__warsim!.hud.selected.value)).toBe(JAP);
  // One nation's ties: Japan's alone.
  for (const k of ['war', 'alliance', 'guarantee', 'truce']) await page.getByTestId(`relations-kind-${k}`).check();
  await page.getByTestId('relations-focus').selectOption(String(JAP));
  const touching = await page.locator('.relations-edge').evaluateAll((els, j) => els.every((e) => e.getAttribute('data-from') === `n${j}` || e.getAttribute('data-to') === `n${j}` || e.getAttribute('data-kind') === 'war'), JAP);
  expect(touching).toBe(true);
  await page.getByTestId('relations-focus').selectOption('0');

  // A year on: the graph is the statistics message's still.
  await page.evaluate(() => window.__warsim!.sim.step(24 * 365));
  await expect.poll(() => page.evaluate(() => window.__warsim!.hud.stats.value!.tick), { timeout: 60_000 }).toBeGreaterThan(24 * 365);
  const later = await page.evaluate(() => {
    const s = window.__warsim!.hud.stats.value!;
    const living = new Set(s.nations.map((n) => n.id));
    return { puppet: s.nations.filter((n) => n.overlord !== 0 && living.has(n.overlord)).length, wars: s.wars.filter((w) => w.attackers.some((a) => living.has(a)) && w.defenders.some((d) => living.has(d))).length };
  });
  await expect.poll(() => edges(page, 'puppet')).toBe(later.puppet);
  await expect.poll(() => page.locator('.relations-war').count()).toBe(later.wars);
  await page.screenshot({ path: path.join(out, 'relations-year1.png') });

  // Closing: the button and Escape.
  await page.getByTestId('relations-close').click();
  await expect(panel).toHaveCount(0);
  await page.getByTestId('relations-btn').click();
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
});

test('the relations graph on a phone: the button in reach, the panel inside the view', async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?scenario=1938&paused=1&seed=7019');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R1') : info.outputPath();
  mkdirSync(out, { recursive: true });
  const btn = page.getByTestId('relations-btn');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  const panel = page.getByTestId('relations-panel');
  await expect(panel).toBeVisible();
  await expect.poll(() => edges(page)).toBeGreaterThan(0);
  const box = (await panel.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390.5);
  expect(box.y + box.height).toBeLessThanOrEqual(844);
  const graph = (await page.getByTestId('relations-graph').boundingBox())!;
  expect(graph.width).toBeGreaterThan(300);
  await page.screenshot({ path: path.join(out, 'relations-phone.png') });
});
