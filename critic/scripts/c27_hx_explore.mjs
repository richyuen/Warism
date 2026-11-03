// Critic run 24: explore the hero structures on a page (heroes=on).
import { launch, open1938, save, hours } from './c27_lib.mjs';
const { browser, page, errors } = await launch();
try {
  await open1938(page, 3739, '&heroes=on');
  await hours(page, 24);
  const r = await page.evaluate(async () => {
    const w = window.__warsim; const v = w.view;
    const st = await w.sim.inspect(true);
    const heroes = v.heroFormations();
    const fs = st.formations.filter((f) => heroes.includes(f.id));
    const s = w.hud.stats.value;
    const n0 = s.nations.find((n) => n.heroes && n.heroes.length);
    return { heroes, fkeys: Object.keys(st.formations[0] ?? {}), fs, nkeys: Object.keys(s.nations[0]), n0: n0 ? { id: n0.id, tag: n0.tag, name: n0.name, heroes: n0.heroes } : null, withHeroes: s.nations.filter((n) => n.heroes?.length).map((n) => [n.id, n.tag ?? n.name, n.heroes]) , names: heroes.map((id) => v.formationName?.(id) ?? null) };
  });
  save('c27_hx.json', { ...r, errors });
  console.log(JSON.stringify(r).slice(0, 3000));
} catch (e) { console.log('FATAL', e); }
await browser.close();
