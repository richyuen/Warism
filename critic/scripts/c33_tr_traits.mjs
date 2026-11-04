// Critic run 33 (R16, new): traits as a player meets them. 1938 seed <seed>, desk or phone. For each nation of a list:
// the panel's trait chips (text and title) and a screenshot. Then God: Poland's God tab, the trait boxes (held, disabled
// by a clash), tick two, untick one, try a clashing pair through the command (the refusal's text), the panel after,
// a save and load (traits kept), and the hash after 100 h both ways.
// Usage: node critic/scripts/c33_tr_traits.mjs <seed> <desk|phone> <tag>
import { chromium } from '@playwright/test';
import { launch, open1938, shot, save, hours, CELLS } from './c31_lib.mjs';
const [seedS, form, tag] = process.argv.slice(2);
const seed = Number(seedS);
const out = { seed, form, nations: [] };
let browser, page, errors;
if (form === 'phone') {
  browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page = await ctx.newPage(); errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`error: ${m.text()}`.slice(0, 300)); });
} else ({ browser, page, errors } = await launch());
const chips = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=trait-chip]')].map((c) => ({ id: c.dataset.trait, text: c.innerText, title: c.title, vis: c.offsetParent !== null })));
try {
  await open1938(page, seed);
  for (const T of ['GER', 'ENG', 'FRA', 'ITA', 'JAP', 'SOV', 'USA', 'POL', 'CHI', 'SWE', 'SWI', 'TUR']) {
    const n = CELLS.tags[T];
    if (!n) { out.nations.push({ T, missing: true }); continue; }
    await page.evaluate((n) => window.__warsim.view.select(n), n);
    await page.waitForTimeout(500);
    const e = { T, n, chips: await chips() };
    e.panelHasTraits = await page.getByTestId('panel-traits').isVisible().catch(() => false);
    if (['GER', 'SOV', 'USA', 'SWI'].includes(T)) {
      await page.getByTestId('panel-traits').scrollIntoViewIfNeeded().catch(() => {});
      e.shot = await shot(page, `c33tr_${tag}_${T}.png`);
    }
    out.nations.push(e);
  }
  // God
  const POL = CELLS.tags.POL;
  await page.getByTestId('god-btn').click();
  await page.evaluate((n) => window.__warsim.view.select(n), POL);
  await page.waitForTimeout(500);
  await page.getByTestId('tab-god').click();
  await page.waitForSelector('[data-testid=god-traits]', { timeout: 10_000 });
  const boxes = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=god-traits] input')].map((i) => ({ id: i.dataset.testid?.replace('god-trait-', ''), checked: i.checked, disabled: i.disabled, label: i.closest('label')?.innerText ?? i.parentElement?.innerText })));
  out.godBefore = await boxes();
  await page.getByTestId('god-traits').scrollIntoViewIfNeeded().catch(() => {});
  out.shotGod = await shot(page, `c33tr_${tag}_god_before.png`);
  const free = out.godBefore.filter((b) => !b.checked && !b.disabled).map((b) => b.id);
  out.ticked = [];
  for (const id of ['armored_doctrine', 'fortifier', 'militarist'].filter((x) => free.includes(x)).slice(0, 2)) {
    await page.getByTestId(`god-trait-${id}`).click(); await hours(page, 1); out.ticked.push(id);
  }
  out.godAfter = await boxes();
  out.shotGodAfter = await shot(page, `c33tr_${tag}_god_after.png`);
  // a clash through the command
  const mask = await page.evaluate(async (n) => (await window.__warsim.sim.inspect()).nations?.[n]?.traits ?? null, POL).catch(() => null);
  out.maskInspect = mask;
  out.clash = await page.evaluate(async (n) => { try { return await window.__warsim.hud.command({ kind: 'setTraits', nation: n, mask: 0xffff }); } catch (e) { return 'threw ' + String(e); } }, POL);
  await hours(page, 1);
  out.toasts = await page.evaluate(() => [...document.querySelectorAll('[role=status], [role=alert], .toast, [data-testid=ticker-row]')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(0, 8));
  out.godAfterClash = await boxes();
  await page.getByTestId('tab-overview').click().catch(() => {});
  await page.waitForTimeout(300);
  out.polChips = await chips();
  out.shotPol = await shot(page, `c33tr_${tag}_pol_after.png`);
  // save/load
  const st = () => page.evaluate(async () => ({ tick: window.__warsim.view.lastTick, hash: await window.__warsim.sim.hash() }));
  await page.evaluate(async () => { window.__critSave = await window.__warsim.sim.save(); });
  await hours(page, 100); out.runA = await st();
  await page.evaluate(async () => window.__warsim.sim.load(window.__critSave)); await page.waitForTimeout(1500);
  await page.evaluate((n) => window.__warsim.view.select(n), POL); await page.waitForTimeout(500);
  out.polChipsLoaded = await chips();
  await hours(page, 100); out.runB = await st();
  out.same = out.runA.hash === out.runB.hash;
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c33_tr_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 5000));
