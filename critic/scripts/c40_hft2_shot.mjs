// Critic run 31: phone start view, heroes on, seed 5521: the folded "Bismarck +2" counter, then one tap on it (shots).
import { chromium } from '@playwright/test';
import { BASE, shot, settle } from './c31_lib.mjs';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=5521&heroes=on`);
await page.waitForFunction(() => window.__warsim?.hud?.stats?.value != null && window.__warsim.view.counters.drawn.some((d) => d.hero !== undefined), null, { timeout: 120_000 });
await page.waitForTimeout(1500); await settle(page);
console.log(await shot(page, 'c40hft2_5521_phone_start.png'));
const c = await page.evaluate(() => window.__warsim.view.counters.drawn.find((d) => /^Bismarck/.test(d.text ?? '')));
await page.touchscreen.tap(c.x + c.w / 2, c.y + c.h / 2); await page.waitForTimeout(800);
console.log(await shot(page, 'c40hft2_5521_phone_tap1.png'));
await page.touchscreen.tap(c.x + c.w / 2, c.y + c.h / 2); await page.waitForTimeout(800);
console.log(await shot(page, 'c40hft2_5521_phone_tap2.png'), await page.evaluate(() => window.__warsim.view.picked));
await browser.close();
