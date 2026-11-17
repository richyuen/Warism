import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { open1938 } from './mapView';

// ROADMAP R133 (critic run 75, R75-N2: `NukeIntercepted` had no row in the ticker or History and no words; warheads
// 10 -> 8 with one strike told). Germany at war with Poland, given warheads and strategic bomber groups at Berlin (as the
// editor places them), sends them at Warsaw one at a time (`launchNuke`, a bomber) until one is stopped short by Poland's
// air (the roll is hashed: which launch is stopped is the seed's). Its row in History and in the ticker: who, the city
// nearest the target, the bomber stopped.

const { w: W, h: H } = SIZE_1938;
const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const [GER, POL] = [id('GER'), id('POL')];
const warsaw = cellOf(21.01, 52.23, W, H);
const berlin = cellOf(13.4, 52.52, W, H);
const BOMBER = TEMPLATES_1938.findIndex((t) => t.id === 'strategic_bomber_group');
const SAID = /^Germany's bomber carrying a warhead was stopped short of its target near [A-Z][\w ]+: no burst$/;

test("a warhead's bomber stopped short is told in History and the ticker (ROADMAP R133)", async ({ page }, info) => {
  test.setTimeout(300_000);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R133') : info.outputPath();
  mkdirSync(out, { recursive: true });
  await page.setViewportSize({ width: 1400, height: 800 });
  await open1938(page, 1);
  await page.evaluate(({ a, d }) => {
    const sim = window.__warsim!.sim;
    sim.command({ kind: 'declareWar', attacker: a, defender: d }, true);
    sim.command({ kind: 'grantWarheads', nation: a, count: 12 }, true);
  }, { a: GER, d: POL });
  // After the first hour (the month's budget lays up what is placed at hour 0).
  await page.evaluate(() => window.__warsim!.sim.step(2));
  await page.evaluate(({ n, x, y, t }) => {
    for (let k = 0; k < 4; k++) window.__warsim!.sim.command({ kind: 'spawnWing', nation: n, x: x + 0.5, y: y + 0.5, template: t }, true);
  }, { n: GER, x: berlin[0], y: berlin[1], t: BOMBER });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  const tries = await page.evaluate(async ({ n, x, y, KIND }) => {
    const sim = window.__warsim!.sim;
    for (let k = 1; k <= 12; k++) {
      sim.command({ kind: 'launchNuke', nation: n, x: x + 0.5, y: y + 0.5, missile: false }, true);
      await sim.step(24);
      if ((await sim.history()).some((r) => r.kind === KIND)) return k;
    }
    return -1;
  }, { n: GER, x: warsaw[0], y: warsaw[1], KIND: EventKind.NukeIntercepted });
  expect(tries, 'a bomber stopped short within 12 launches').toBeGreaterThan(0);
  process.stderr.write(`stopped short at launch ${tries}\n`);
  await page.waitForFunction(() => (window.__warsim!.view?.lastTick ?? 0) > 0, null, { timeout: 30_000 });
  // The ticker (it holds a row 30 days of the game).
  const told = page.locator('[data-testid="ticker-row"][data-kind-name="NukeIntercepted"]');
  await expect(told.first()).toBeVisible({ timeout: 20_000 });
  await expect(told.first()).toContainText(/Germany's bomber carrying a warhead was stopped short of its target near/);
  await page.getByTestId('ticker').screenshot({ path: path.join(out, 'intercept-ticker.png') });
  // History, by its kind's name.
  await page.getByTestId('history-btn').click();
  await page.getByTestId('history-kind').selectOption({ label: 'Nuclear strike stopped' });
  await expect(page.getByTestId('history-row').first()).toBeVisible();
  for (const text of await page.getByTestId('history-row').allInnerTexts()) expect(text.replace(/^.*?\n/, '').trim()).toMatch(SAID);
  await page.screenshot({ path: path.join(out, 'intercept-history.png') });
});
