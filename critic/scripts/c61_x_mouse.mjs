// Critic run 61 (new): a player's war by mouse only. 1938 SEED: click Berlin, Take control; right-click Poland, the menu's
// declare-war item; Shift-drag a box over the border; click Warsaw; run DAYS at the UI's speed. Selection count, orders,
// ground moved, shots. Usage: node critic/scripts/c61_x_mouse.mjs <seed> [days] [W H]
import { launch, open1938, shot, save, hours, lookAt, screenOf, settle, CELLS } from './c61_lib.mjs';
const cellOf = async (_p, lon, lat) => [((lon + 180) / 360) * (CELLS.size.w ?? CELLS.size.width), ((90 - lat) / 180) * (CELLS.size.h ?? CELLS.size.height)];
const [seedS, daysS, wS, hS] = process.argv.slice(2);
const seed = Number(seedS), DAYS = Number(daysS ?? 10), W = Number(wS ?? 1600), H = Number(hS ?? 900);
const out = { seed, W, H, steps: [] };
const step = (s, o = {}) => { out.steps.push({ s, ...o }); console.log(s, JSON.stringify(o).slice(0, 300)); };
const { browser, page, errors } = await launch(W, H);
const label = () => page.getByTestId('player-label').innerText().catch(() => null);
try {
  await open1938(page, seed);
  const berlin = CELLS.berlin, warsaw = CELLS.warsaw;
  await lookAt(page, (berlin[0] + warsaw[0]) / 2, berlin[1], 1500);
  for (const [dx, dy] of [[0, 0], [-6, 8], [-12, 4], [-4, 14], [-16, 12]]) {
    const [bx, by] = await screenOf(page, berlin[0] + dx, berlin[1] + dy);
    await page.mouse.click(bx, by);
    await page.waitForTimeout(800);
    const tc = await page.getByTestId('take-control').count();
    step('click on Germany', { dx, dy, takeControl: tc, title: await page.evaluate(() => document.querySelector('[data-testid=nation-panel], [data-testid=formation-panel], .panel')?.innerText.slice(0, 40) ?? null) });
    if (tc > 0) break;
  }
  out.berlinShot = await shot(page, `c61xm_${seed}_berlin.png`);
  step('clicked Berlin', { panel: await page.getByTestId('nation-panel').innerText().then((t) => t.slice(0, 40)).catch(() => null) });
  await page.getByTestId('take-control').click();
  await page.waitForTimeout(500);
  step('take control', { label: await label() });
  if ((await page.getByTestId('nation-close').count()) > 0) await page.getByTestId('nation-close').click();
  let [wx, wy] = await screenOf(page, ...warsaw);
  await page.mouse.click(wx, wy, { button: 'right' });
  await page.waitForTimeout(800);
  const menu = await page.getByTestId('nation-menu').innerText().catch(() => null);
  step('right-click Poland', { menu });
  out.menuShot = await shot(page, `c61xm_${seed}_menu.png`);
  const items = await page.evaluate(() => [...document.querySelectorAll('[data-testid=nation-menu] button')].map((b) => ({ t: b.innerText, id: b.dataset.testid, dis: b.disabled, title: b.title })));
  step('menu items', { items });
  const war = items.find((i) => /declare war|war/i.test(i.t) && !i.dis);
  if (war) await page.locator(`[data-testid=nation-menu] button:has-text("${war.t.split('\n')[0]}")`).first().click();
  await page.waitForTimeout(1500);
  step('declared?', { banners: await page.getByTestId('war-banners').innerText().catch(() => null), ticker: await page.getByTestId('ticker').innerText().catch(() => null) });
  // Box: the border band, Frankfurt (Oder) to Breslau.
  const a = [berlin[0] + 2, berlin[1] - 10], b = [warsaw[0] - 14, berlin[1] + 16];
  await lookAt(page, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 900);
  const [ax, ay] = await screenOf(page, ...a), [cx2, cy2] = await screenOf(page, ...b);
  await page.keyboard.down('Shift');
  await page.mouse.move(ax, ay); await page.mouse.down();
  await page.mouse.move((ax + cx2) / 2, (ay + cy2) / 2, { steps: 5 }); await page.mouse.move(cx2, cy2, { steps: 5 });
  await page.mouse.up(); await page.keyboard.up('Shift');
  await page.waitForTimeout(800);
  const sel = await page.evaluate(() => [...window.__warsim.view.selectedFormations]);
  step('box', { label: await label(), n: sel.length, box: [ax, ay, cx2, cy2] });
  out.boxShot = await shot(page, `c61xm_${seed}_box.png`);
  const before = await page.evaluate((ids) => ids.map((id) => window.__warsim.view.formationPos(id)), sel);
  [wx, wy] = await screenOf(page, ...warsaw);
  const onScreen = wx > 0 && wx < W && wy > 0 && wy < H;
  if (!onScreen) { await lookAt(page, warsaw[0], warsaw[1], 900); [wx, wy] = await screenOf(page, ...warsaw); }
  await page.mouse.click(wx, wy);
  await page.waitForTimeout(1000);
  const ways = await page.evaluate((ids) => ids.map((id) => { const w = window.__warsim.view.formationWay(id); return w ? w.length : 0; }), sel);
  step('clicked Warsaw', { withWay: ways.filter((x) => x > 0).length, of: sel.length, label: await label(), news: await page.evaluate(() => [...document.querySelectorAll('[data-testid=order-news]')].map((e) => e.innerText).slice(0, 5)) });
  out.orderShot = await shot(page, `c61xm_${seed}_ordered.png`);
  await hours(page, 24 * DAYS);
  await settle(page);
  const after = await page.evaluate((ids) => ids.map((id) => window.__warsim.view.formationPos(id)), sel);
  const d0 = before.map((p, i) => (p && after[i] ? Math.hypot(p[0] - warsaw[0], p[1] - warsaw[1]) - Math.hypot(after[i][0] - warsaw[0], after[i][1] - warsaw[1]) : null));
  step(`after ${DAYS} days`, { closer: d0.filter((x) => x !== null && x > 1).length, alive: after.filter(Boolean).length, of: sel.length, meanGain: +(d0.filter((x) => x !== null).reduce((s, x) => s + x, 0) / Math.max(1, d0.filter((x) => x !== null).length)).toFixed(1) });
  await lookAt(page, warsaw[0] - 6, warsaw[1], 900);
  out.afterShot = await shot(page, `c61xm_${seed}_d${DAYS}.png`);
} catch (e) { out.fail = String(e).slice(0, 500); console.log(out.fail); }
finally { out.errors = errors; save(`c61_xm_${seed}_${W}x${H}.json`, out); await browser.close(); }
