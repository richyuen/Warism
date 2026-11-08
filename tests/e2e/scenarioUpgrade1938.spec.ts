import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { decodeScenarioFile } from '../../src/shared/scenarioFile';

// ROADMAP R53i (critic run 54, carried since run 48: `node critic/scripts/c54_os2_scen.mjs
// critic/c26_critic_standoff.warsim-scenario c54` read "Could not load: it was made by an older version of Warism, and
// this one cannot start it"). The run-26 file lacks the nations' traits alone (ADR-822 came after it): chosen on the
// title screen it is offered, with what was changed to start it, and its game starts at its own date.

const FILE = path.resolve(import.meta.dirname, '../../critic/c26_critic_standoff.warsim-scenario');

test("the run-26 scenario file starts, saying it was made before nation traits", async ({ page }) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const buffer = readFileSync(FILE);
  const { header } = await decodeScenarioFile(new Uint8Array(buffer));
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/');
  await expect(page.getByTestId('title-screen')).toBeVisible();
  await page.getByTestId('title-scenario-file').setInputFiles({ name: 'c26_critic_standoff.warsim-scenario', mimeType: 'application/octet-stream', buffer });
  await expect(page.getByTestId('title-file-error')).toHaveCount(0);
  await expect(page.getByTestId('title-file-pending')).toBeVisible();
  await expect(page.getByTestId('title-file-name')).toHaveText(header.name);
  await expect(page.getByTestId('title-file-upgraded')).toHaveText('Made before nation traits: its nations start with none.');
  await Promise.all([page.waitForURL(/load=scenario/, { timeout: 30_000 }), page.getByTestId('title-file-start').click()]);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 240_000 });
  // Its own world: its tick, and no nation with a trait.
  await expect.poll(() => page.evaluate(() => window.__warsim!.hud.tick.value)).toBe(header.tick);
  const traits = await page.evaluate(() => window.__warsim!.hud.stats.value!.nations.filter((n) => n.traits !== 0).length);
  expect(traits, 'nations with a trait').toBe(0);
  expect(page.url()).not.toContain('failed');
  expect(errors).toEqual([]);
});
