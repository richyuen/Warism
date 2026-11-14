// Pile-ons at their birth (R82f; critic run 68's R68-N5): plain 1938 to DAY on each seed, hour by hour. Each war
// declared is read in the hour it begins: its two sides by count of nations, each member and why it is there (the
// leader, a puppet of whom, an ally, a guarantor of the defender), and the declarer's utility terms (`warUtility`, with
// its wars and restlessness of the hour before). At DAY, the wars over 4 to 1 then, against their sides at birth.
// Usage: npx tsx tools/diag/pileSides.ts <day> <seed>... [--all] (--all: every declaration, not only those born over 4:1)
import { restlessOf, sides, strengths, warsOf, warUtility } from '../../src/sim/ai/strategic';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const args = process.argv.slice(2);
const all = args.includes('--all');
const [dayS, ...seedS] = args.filter((a) => a !== '--all');
const day = Number(dayS);
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
const over = (a: number, d: number): boolean => Math.max(a, d) > 4 * Math.max(1, Math.min(a, d));
const totals = { declared: 0, bornOver: 0, over365: 0, wars365: 0 };

function why(w: World, x: number, lead: number, defender: boolean): string {
  if (x === lead) return 'leader';
  const nc = w.nations.cols;
  const al = w.alliances;
  const parts: string[] = [];
  if (nc.overlord[x]) parts.push(`puppet of ${tag(nc.overlord[x]!)}`);
  const ax = al.allianceOf(x);
  if (ax?.members.includes(lead)) parts.push('ally');
  else if (ax && nc.overlord[x] === 0) parts.push(`of ${tag(ax.leader)}'s alliance`);
  if (defender && al.guarantorsOf(lead).includes(x)) parts.push('guarantor');
  return parts.join(', ') || '?';
}

for (const seed of seedS.map(Number)) {
  const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) });
  const w = s.world;
  const seen = new Set(w.wars.list.map((x) => x.id));
  const before = { restless: new Map<number, number>(), wars: new Map<number, number>() };
  const lines: string[] = [];
  const birth = new Map<number, string>();
  for (let h = 0; h < 24 * day; h++) {
    before.restless.clear();
    before.wars.clear();
    w.nations.forEach((n) => {
      before.restless.set(n, warsOf(w, n) > 0 ? 0 : restlessOf(w, n));
      before.wars.set(n, warsOf(w, n));
    });
    s.step(1, (x) => {
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
    for (const war of w.wars.list) {
      if (seen.has(war.id)) continue;
      seen.add(war.id);
      totals.declared++;
      const [a, d] = war.sides;
      const realms = (side: readonly number[]): number => side.filter((x) => w.nations.cols.overlord[x] === 0).length;
      const born = `${a.length}:${d.length} (realms ${realms(a)}:${realms(d)}${over(realms(a), realms(d)) ? ' OVER' : ''})`;
      birth.set(war.id, born);
      if (over(a.length, d.length)) totals.bornOver++;
      if (!all && !over(a.length, d.length)) continue;
      const str = strengths(w);
      const sd = sides(w, str);
      const n = a[0]!;
      const t = d[0]!;
      const u = warUtility(w, n, t, sd.withAllies(n), sd.defence(t), before.wars.get(n) ?? 0, before.restless.get(n) ?? 0);
      const f = (v: number): string => v.toFixed(2);
      lines.push(`  day ${Math.floor(war.startTick / 24)} ${tag(n)} on ${tag(t)} born ${born}${over(a.length, d.length) ? ' OVER' : ''}: attack ${sd.withAllies(n).toFixed(0)} defence ${sd.defence(t).toFixed(0)} aggression ${w.nations.cols.aggression[n]} | strength ${f(u.strength)} opportunity ${f(u.opportunity)} claim ${f(u.claim)} restless ${f(u.restless)} exhaustion -${f(u.exhaustion)} wars -${f(u.wars)} pariah ${f(u.pariah)} = u ${f(u.u)}`);
      lines.push(`    attackers: ${a.map((x) => `${tag(x)} [${why(w, x, n, false)}]`).join('; ')}`);
      lines.push(`    defenders: ${d.map((x) => `${tag(x)} [${why(w, x, t, true)}]`).join('; ')}`);
    }
  }
  const at = w.wars.list.map((x) => {
    const [a, d] = x.sides;
    return { s: `${tag(a[0]!)} vs ${tag(d[0]!)} ${a.length}:${d.length} (born ${birth.get(x.id) ?? 'before'})`, o: over(a.length, d.length) };
  });
  totals.wars365 += at.length;
  totals.over365 += at.filter((x) => x.o).length;
  console.log(`seed ${seed} day ${day}: ${at.length} wars; over 4:1: ${at.filter((x) => x.o).map((x) => x.s).join(', ') || 'none'}`);
  for (const l of lines) console.log(l);
}
console.log(`done: ${seedS.length} seeds, ${totals.declared} declared, ${totals.bornOver} born over 4:1; at day ${day} ${totals.wars365} wars, ${totals.over365} over 4:1`);
