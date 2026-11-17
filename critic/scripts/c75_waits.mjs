// Critic run 73 (new): R104 on the page, a case of its own. The player takes NATION (Germany), turns its army's AI
// off in Actions, declares war on FOE (Poland) and orders (a) the one formation nearest the foe's capital and (b) its
// land hero to the foe's capital by a click. Then DAYS days, sampled each 6 hours: where each stands, whether it has a
// way, the ticker's order news and the formation panel's notice (R104b: told once after 24 hours' wait before an
// enemy's cell), and the foe's cells the player holds (R104a: a hero takes ground).
// Usage: node critic/scripts/c75_waits.mjs <seed> [NATION=GER] [FOE=POL] [capital cell key=warsaw] [DAYS=6] [W H]
import { launch, open1938, shot, save, hours, lookAt, screenOf, CELLS } from './c75_lib.mjs';
const seed = Number(process.argv[2] ?? 56961);
const NAT = process.argv[3] ?? 'GER', FOE = process.argv[4] ?? 'POL', capKey = process.argv[5] ?? 'warsaw';
const DAYS = Number(process.argv[6] ?? 6), W = Number(process.argv[7] ?? 1600), H = Number(process.argv[8] ?? 900);
const out = { seed, NAT, FOE, samples: [] };
const { browser, page, errors } = await launch(W, H);
const T = (id) => page.getByTestId(id).first().innerText({ timeout: 1000 }).catch(() => null);
try {
  await open1938(page, seed);
  const me = CELLS.tags[NAT], foe = CELLS.tags[FOE];
  out.me = me; out.foe = foe;
  await page.evaluate((n) => window.__warsim.view.select(n), me);
  await page.waitForTimeout(800);
  await page.getByTestId('take-control').click();
  await page.waitForTimeout(500);
  out.label = await T('player-label');
  await page.getByTestId('tab-actions').click();
  await page.waitForTimeout(400);
  const army = page.getByTestId('act-assist-army');
  out.armyWas = await army.isChecked();
  if (out.armyWas) await army.click();
  await page.waitForTimeout(300);
  out.armyNow = await army.isChecked();
  await page.getByTestId('act-target').selectOption(String(foe));
  await page.waitForTimeout(300);
  out.standing = await T('act-standing');
  await page.getByTestId('act-war').click();
  await page.waitForTimeout(1200);
  out.banners = await T('war-banners');
  await shot(page, `c75wt_${seed}_0declared.png`);
  await page.getByTestId('nation-close').click().catch(() => {});
  const cap = CELLS[capKey];
  const pick = await page.evaluate(({ me, cap }) => {
    const v = window.__warsim.view;
    const heroes = new Set(v.heroFormations());
    let best = 0, bd = 1e9, hero = 0;
    for (const f of v.formationsOf(me)) {
      const p = v.formationPos(f); if (!p) continue;
      if (heroes.has(f)) { if (!hero && !(v.formationAfloat?.(f))) hero = f; continue; }
      const d = Math.hypot(p[0] - cap[0], p[1] - cap[1]);
      if (d < bd) { bd = d; best = f; }
    }
    return { best, bd, hero, heroPos: hero ? v.formationPos(hero) : null, bestPos: v.formationPos(best) };
  }, { me, cap });
  out.pick = pick;
  const order = async (id, name) => {
    await page.evaluate((id) => window.__warsim.hud.selectFormation(id), id);
    await page.waitForTimeout(500);
    const p = await page.evaluate((id) => window.__warsim.view.formationPos(id), id);
    await lookAt(page, (p[0] + cap[0]) / 2, (p[1] + cap[1]) / 2, 1500);
    let way = 0;
    await lookAt(page, p[0], p[1], 600);
    const [fx, fy] = await screenOf(page, p[0], p[1]);
    await page.keyboard.down('Shift');
    await page.mouse.move(fx - 30, fy - 40); await page.mouse.down();
    await page.mouse.move(fx, fy, { steps: 4 }); await page.mouse.move(fx + 30, fy + 40, { steps: 4 });
    await page.mouse.up(); await page.keyboard.up('Shift');
    await page.waitForTimeout(600);
    out[`${name}Sel`] = await page.evaluate(() => [...window.__warsim.view.selectedFormations]);
    await lookAt(page, (p[0] + cap[0]) / 2, (p[1] + cap[1]) / 2, 1500);
    for (const [dx, dy] of [[4, -5], [-5, 4], [6, 6]]) {
      const [x, y] = await screenOf(page, cap[0] + dx, cap[1] + dy);
      await page.mouse.click(x, y);
      await page.waitForTimeout(900);
      way = await page.evaluate((id) => window.__warsim.view.formationWay(id)?.length ?? 0, id);
      out[`${name}Try`] = [dx, dy];
      if (way) break;
    }
    out[`${name}Label`] = await T('player-label');
    await page.evaluate((id) => window.__warsim.hud.selectFormation(id), id);
    await page.waitForTimeout(300);
    out[`${name}Way`] = way;
    out[`${name}Name`] = await T('formation-name');
    await shot(page, `c75wt_${seed}_1order_${name}.png`);
  };
  if (!process.env.ONLYHERO) await order(pick.best, 'form');
  if (pick.hero) await order(pick.hero, 'hero');
  const holds = () => page.evaluate(async ({ me, foe }) => {
    const i = await window.__warsim.sim.inspect();
    const n = i.nations.find((x) => x.id === me);
    return { cells: n?.cells ?? null, occupied: n?.occupied ?? n?.occupying ?? null };
  }, { me, foe });
  out.holds0 = await holds();
  for (let h = 6; h <= DAYS * 24; h += 6) {
    await hours(page, 6);
    await page.waitForTimeout(250);
    const s = await page.evaluate(({ a, b }) => {
      const v = window.__warsim.view;
      const one = (id) => (id ? { pos: v.formationPos(id)?.map((x) => Math.round(x * 10) / 10) ?? null, way: v.formationWay(id)?.length ?? 0, engaged: v.formationEngaged(id) } : null);
      return { form: one(a), hero: one(b), news: [...document.querySelectorAll('[data-testid=order-news]')].map((e) => e.innerText), ticker: [...document.querySelectorAll('[data-testid=ticker-row]')].map((e) => e.innerText).slice(0, 6) };
    }, { a: pick.best, b: pick.hero });
    s.h = h;
    for (const [name, id] of [['form', pick.best], ['hero', pick.hero]]) {
      if (!id) continue;
      await page.evaluate((id) => window.__warsim.hud.selectFormation(id), id);
      await page.waitForTimeout(200);
      s[`${name}Notice`] = await page.locator('.formation-notice').first().innerText({ timeout: 500 }).catch(() => null);
      s[`${name}Status`] = await T('formation-status');
    }
    out.samples.push(s);
    console.log(`h ${h}: form ${JSON.stringify(s.form)} notice ${JSON.stringify(s.formNotice)} | hero ${JSON.stringify(s.hero)} notice ${JSON.stringify(s.heroNotice)} | news ${JSON.stringify(s.news)}`);
    if (h === 30 || h === 72 || h === DAYS * 24) { await lookAt(page, s.form?.pos?.[0] ?? cap[0], s.form?.pos?.[1] ?? cap[1], 600); await shot(page, `c75wt_${seed}_2h${h}.png`); }
  }
  out.holds1 = await holds();
} catch (e) {
  out.error = String(e?.stack ?? e).slice(0, 1500);
  console.log('ERROR', out.error);
  await shot(page, `c75wt_${seed}_error.png`).catch(() => {});
}
out.errors = errors;
save(`c75_wt_${seed}_${NAT}_${FOE}.json`, out);
console.log(JSON.stringify({ label: out.label, armyWas: out.armyWas, armyNow: out.armyNow, standing: out.standing, pick: out.pick, formWay: out.formWay, formSel: out.formSel, formLabel: out.formLabel, heroSel: out.heroSel, heroWay: out.heroWay, formName: out.formName, heroName: out.heroName, errors }, null, 1));
await browser.close();
