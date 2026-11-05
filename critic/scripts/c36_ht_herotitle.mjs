// Critic run 29 (R5a, heroes), HT: how a player meets the heroes option and the heroes at the start.
// 1) The title screen: 1938 card, its form; the Heroes row (label, hint, values); the random world's and the scenario
//    file's forms (is the row there?). 2) Start 1938 with heroes on from the form: URL, hero count, boot.
// 3) The settings panel in game: the Heroes row's value. 4) God Mode's placing list and the editor's template list:
//    any hero? 5) A click on a hero on the map at T1 and T2: what its panel says. 6) ?scenario=random&heroes=on.
// Usage: node critic/scripts/c36_ht_herotitle.mjs <seed> [w] [h] [tag]
import { launch, shot, save, lookAt, hours, BASE, settle } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 5521);
const W = Number(process.argv[3] ?? 1600), H = Number(process.argv[4] ?? 900);
const tg = process.argv[5] ?? 'desk';
const L = `c36ht_${tg}`;
const out = { seed, W, H };
const { browser, page, errors } = await launch(W, H);
const file = `c36_ht_${tg}.json`;
try {
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-screen').waitFor({ timeout: 60_000 });
  await page.waitForTimeout(1200);
  out.cards = await page.evaluate(() => [...document.querySelectorAll('[data-testid^=title-scenario-]')].map((e) => e.getAttribute('data-testid')));
  const c1938 = page.locator('[data-testid=title-scenario-1938]');
  if (await c1938.count()) { await c1938.click(); await page.waitForTimeout(600); }
  out.form1938 = await page.evaluate(() => {
    const sel = document.querySelector('[data-testid=opt-heroes]');
    const row = sel?.closest('label');
    return { present: !!sel, label: row?.innerText.replace(/\n/g, ' | ') ?? null, title: row?.getAttribute('title') ?? null, value: sel?.value ?? null, options: sel ? [...sel.options].map((o) => o.textContent) : [], formRows: [...document.querySelectorAll('[data-testid=title-detail] .form-row, .form-row')].map((r) => r.innerText.replace(/\n/g, ' | ').slice(0, 60)) };
  });
  out.shotForm = await shot(page, `${L}_01_form1938.png`);
  // hover the row (desktop) to see if the hint shows anywhere
  const heroRow = page.locator('[data-testid=opt-heroes]');
  if (await heroRow.count()) { await heroRow.hover(); await page.waitForTimeout(1500); out.shotHover = await shot(page, `${L}_02_hover.png`); }
  for (const card of ['random', 'file']) {
    const c = page.locator(`[data-testid=title-scenario-${card}]`);
    if (await c.count()) {
      await c.click(); await page.waitForTimeout(600);
      out[`form_${card}`] = await page.evaluate(() => ({ heroes: !!document.querySelector('[data-testid=opt-heroes]'), rows: [...document.querySelectorAll('.form-row')].map((r) => r.innerText.replace(/\n/g, ' | ').slice(0, 60)) }));
      await shot(page, `${L}_03_form_${card}.png`);
    }
  }
  if (await c1938.count()) { await c1938.click(); await page.waitForTimeout(600); }
  const seedIn = page.getByTestId('settings-seed');
  if (await seedIn.count()) await seedIn.fill(String(seed));
  if (await heroRow.count()) await page.selectOption('[data-testid=opt-heroes]', 'on');
  await page.waitForTimeout(300);
  out.shotSet = await shot(page, `${L}_04_set.png`);
  const t0 = Date.now();
  await page.getByTestId('settings-new-game').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 180_000 });
  out.bootS = (Date.now() - t0) / 1000;
  out.url = page.url();
  await page.evaluate(() => { if (!window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
  await page.waitForTimeout(1500);
  out.heroCount = await page.evaluate(() => window.__warsim.view.heroFormations().length);
  out.shotStart = await shot(page, `${L}_05_start.png`);
  save(file, { ...out, errors });
  // 3) Settings
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.waitForTimeout(700);
  out.settings = await page.evaluate(() => { const s = document.querySelector('[data-testid=opt-heroes]'); return { present: !!s, value: s?.value ?? null, row: s?.closest('label')?.innerText.replace(/\n/g, ' | ') ?? null }; });
  out.shotSettings = await shot(page, `${L}_06_settings.png`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  // 4) God Mode place list
  await page.getByRole('button', { name: 'God Mode' }).click();
  await page.waitForTimeout(700);
  out.god = await page.evaluate(() => {
    const txt = document.body.innerText;
    const names = ['Yamato', 'Bismarck', 'Maus', 'Hood', 'Iowa', 'T28', 'O-I', 'Roma', 'Richelieu', 'Char 2C', 'TOG', 'T-42', 'Sovetsky', 'Ercole'];
    return { mentions: names.filter((n) => txt.includes(n)), placeButtons: [...document.querySelectorAll('[data-testid^=act-place-]')].map((b) => b.innerText.replace(/\n/g, ' ')).filter((x) => x).slice(0, 80) };
  });
  out.shotGod = await shot(page, `${L}_07_god.png`);
  await page.getByRole('button', { name: 'God Mode' }).click().catch(() => {});
  await page.waitForTimeout(400);
  // Editor
  await page.getByRole('button', { name: 'Editor', exact: true }).click();
  await page.waitForTimeout(700);
  for (const tool of ['fleet', 'army', 'formation', 'unit']) { const b = page.locator(`[data-testid=editor-tool-${tool}]`); if (await b.count()) { await b.click(); await page.waitForTimeout(300); break; } }
  out.editor = await page.evaluate(() => ({ tools: [...document.querySelectorAll('[data-testid^=editor-tool-]')].map((b) => b.getAttribute('data-testid')), templates: [...document.querySelectorAll('[data-testid=editor-template] option')].map((o) => o.textContent) }));
  out.shotEditor = await shot(page, `${L}_08_editor.png`);
  await page.locator('[data-testid=editor-close]').click().catch(() => {});
  await page.waitForTimeout(300);
  save(file, { ...out, errors });
  // 5) Click a hero on the map: the Maus (Germany) and Yamato.
  out.clicks = [];
  const hs = await page.evaluate(async () => {
    const w = window.__warsim; const st = w.hud.stats.value;
    const all = st.nations.filter((n) => n.heroes?.length).flatMap((n) => n.heroes.map((h) => ({ nation: n.name, key: h.nameKey, id: h.formation })));
    const ins = await w.sim.inspect(true);
    return all.map((h) => { const f = ins.formations.find((g) => g.id === h.id); return { ...h, x: f?.x, y: f?.y }; });
  });
  out.heroes = hs;
  for (const h of hs.filter((x) => /maus|yamato|t28|hood/.test(x.key))) {
    for (const m of [1200, 150]) {
      await lookAt(page, h.x, h.y, m);
      const sp = await page.evaluate(({ x, y }) => { const v = window.__warsim.view; const c = v.controller.cam; return [(x - c.cx) * c.scale + innerWidth / 2, (y - c.cy) * c.scale + innerHeight / 2]; }, { x: h.x, y: h.y });
      await page.mouse.click(sp[0], sp[1]);
      await page.waitForTimeout(900);
      const panel = await page.evaluate(() => { const p = document.querySelector('[data-testid=formation-panel], .formation-panel, [data-testid=selection-panel]'); return p ? p.innerText.replace(/\n/g, ' | ').slice(0, 700) : null; });
      out.clicks.push({ hero: h.key, m, at: sp, panel, shot: await shot(page, `${L}_09_click_${h.key.replace('template.hero_', '')}_${m}.png`) });
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    }
  }
  save(file, { ...out, errors });
  // 6) Random world with heroes=on in the URL.
  await page.goto(`${BASE}/?scenario=random&paused=1&seed=${seed}&nations=60&heroes=on`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 180_000 });
  await page.waitForTimeout(800);
  out.randomHeroes = await page.evaluate(() => window.__warsim.view.heroFormations().length);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.waitForTimeout(600);
  out.randomSettings = await page.evaluate(() => !!document.querySelector('[data-testid=opt-heroes]'));
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(file, out);
await browser.close();
console.log(JSON.stringify({ heroCount: out.heroCount, form: out.form1938, god: out.god, editor: out.editor?.templates?.length, clicks: out.clicks?.length, random: out.randomHeroes, fatal: out.fatal }).slice(0, 2500));
