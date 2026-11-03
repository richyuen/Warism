// Critic run 24: how a sea hero is lost. Seed <seed>, heroes on, <days> days hourly: at each loss of a hero, its last
// position, whether engaged in its last 24 hours, in port (on a port's water), and the event kinds of the loss hour.
import { size1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { loadAssets1938 } from '../../tools/headless/assets';
const seed = Number(process.argv[2] ?? 8821), days = Number(process.argv[3] ?? 500);
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w), options: { heroes: 'on' } });
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const w0 = s.world;
const name = (row: number): string => `${NATIONS_1938[w0.heroRoster[row]!.nation - 1]?.tag} ${TEMPLATES_1938[w0.heroRoster[row]!.template]?.id}`;
const last = new Map<number, { f: number; x: number; y: number; engH: number; hp: number }>();
const losses: unknown[] = [];
let hour = 0;
for (let h = 0; h < days * 24; h++) {
  let kinds: Record<string, number> = {};
  s.step(1, (w) => { const e = w.out.events; for (let i = 0; i < e.length; i += 6) { const k = EV[e[i + 1]!] ?? String(e[i + 1]); kinds[k] = (kinds[k] ?? 0) + 1; } w.out.events.length = 0; w.out.fires.length = 0; });
  hour++;
  const w = s.world; const fc = w.formations.cols;
  const alive = new Map<number, number>(); for (const [f, row] of w.heroes) alive.set(row, f);
  for (let row = 0; row < w.heroRoster.length; row++) {
    const f = alive.get(row); const p = last.get(row);
    if (f === undefined) { if (p) { losses.push({ hour, day: Math.floor(hour / 24), hero: name(row), x: +p.x.toFixed(1), y: +p.y.toFixed(1), hoursSinceEngaged: p.engH, kinds }); last.delete(row); } continue; }
    const eng = fc.engaged[f] === 1;
    last.set(row, { f, x: fc.x[f]!, y: fc.y[f]!, engH: eng ? 0 : (p && p.f === f ? p.engH + 1 : 999), hp: 0 });
  }
}
const sea = (losses as { hero: string; hoursSinceEngaged: number }[]);
console.log(JSON.stringify(losses, null, 0).slice(0, 6000));
const by: Record<string, number[]> = {};
for (const l of sea) (by[l.hero] ??= []).push(l.hoursSinceEngaged);
console.log(JSON.stringify(by));
console.log('done:');
