// Critic run 56: for one landingInvariants case, each division's spells in a gathering landing (state 0), with the
// clicks that named it, the landing's ready hour, groups and divisions at the spell's start and end, and whether its
// nation is at war with the target's owner. Lists spells over MIN days (default 5).
// Usage: SEED=24033 SETUP=3517 GROUPS=2 DAYS=120 MIN=5 npx tsx critic/scripts/c57_spells.ts
import { landingBreaks } from '../../tests/helpers/landingInvariants';
import { landingOfDivision } from '../../src/sim/systems/landings';

const seed = Number(process.env.SEED ?? 24033);
const setup = Number(process.env.SETUP ?? 3517);
const groups = Number(process.env.GROUPS ?? 2);
const days = Number(process.env.DAYS ?? 120);
const min = Number(process.env.MIN ?? 5) * 24;
const orders = Number(process.env.ORDERS ?? seed);
interface Spell { div: number; from: number; to: number; landing: number; start: string; end: string; clicks: string[] }
const open = new Map<number, Spell>();
const done: Spell[] = [];
const clicks: string[] = [];
const desc = (w: any, l: any): string => `L${l.id} st${l.state} port ${l.port} tgt ${l.target % w.cells.w},${Math.floor(l.target / w.cells.w)} fleets ${l.fleets.join('+')} divs ${[...l.divisions.keys()].join('+')} ready ${l.ready}`;
const lines = landingBreaks({
  seed, setup, days, orders, probeDays: [30, 90], groups,
  onHour: (w, click) => {
    if (click) clicks.push(`t${w.tick} click ${click.ids.join(',')} -> ${click.x.toFixed(1)},${click.y.toFixed(1)}`);
    const c = w.formations.cols;
    const seen = new Set<number>();
    for (let id = 0; id < c.x.length; id++) {
      const l = landingOfDivision(w, id);
      if (!l || l.state !== 0) continue;
      seen.add(id);
      const s = open.get(id);
      if (s && s.landing === l.id) { s.to = w.tick; s.end = desc(w, l); continue; }
      if (s) { done.push(s); }
      open.set(id, { div: id, from: w.tick, to: w.tick, landing: l.id, start: desc(w, l), end: desc(w, l), clicks: [] });
    }
    for (const [id, s] of open) if (!seen.has(id)) { done.push(s); open.delete(id); }
  },
});
for (const s of open.values()) done.push(s);
for (const s of done.filter((x) => x.to - x.from >= min)) {
  console.log(`div ${s.div} gathering t${s.from}-t${s.to} (${((s.to - s.from) / 24).toFixed(1)} d)\n  start: ${s.start}\n  end:   ${s.end}`);
  for (const k of clicks) { const t = Number(k.slice(1, k.indexOf(' '))); if (t >= s.from - 200 && t <= s.to && k.includes(String(s.div))) console.log('   ' + k); }
}
for (const l of lines) console.log('BROKEN', l);
console.log('done:');
