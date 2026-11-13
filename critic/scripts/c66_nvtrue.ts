// Critic run 60 (new): is "the next voyage, in about N days" (R58b) true? In a landingInvariants run, every division
// whose panel (voyageOf) first reads 'nextVoyage' with days: the hour told, the days told, and the hour it is next at sea
// (voyageOf 'atSea'), or what became of it (gone, no landing, landed) by the end. Also the panel's days hour by hour
// while it waits (does the figure count down, or jump).
// Usage: SEED= SETUP= KEEPG= [ORDERDAYS=] [DAYS=120] npx tsx critic/scripts/c66_nvtrue.ts
import { landingBreaks } from '../../tests/helpers/landingInvariants';
import { voyageOf, landingOfDivision } from '../../src/sim/systems/landings';

const seed = Number(process.env.SEED);
interface Rec { id: number; told: number; days: number | undefined; port?: string; seq: string[]; states: string[]; sailed: number; end: string; maxUp: number }
const recs = new Map<number, Rec>();
const open = new Map<number, Rec>();
let lastTick = 0;
const br = landingBreaks({
  seed, setup: Number(process.env.SETUP ?? 3517), days: Number(process.env.DAYS ?? 120), orders: seed, probeDays: [30, 90],
  groups: Number(process.env.KEEPG ?? 2), notes: [],
  ...(process.env.ORDERDAYS ? { orderDays: Number(process.env.ORDERDAYS) } : {}),
  onHour: (w, click) => {
    if (click) return;
    lastTick = w.tick;
    const c = w.formations.cols;
    // every live division of the player's landings
    for (const [id, r] of open) {
      if (!w.formations.has(id)) { r.end = `gone t${w.tick}`; open.delete(id); continue; }
      const v = voyageOf(w, id);
      if (v?.state === 'atSea') { r.sailed = w.tick; r.end = `sailed (${r.states.join('>')})`; open.delete(id); continue; }
      if (v?.state !== 'nextVoyage') {
        // waiting at the port again is still on the way to the next voyage; no landing is the end of it
        if (!v || !landingOfDivision(w, id)) { r.end = `no landing t${w.tick} (${r.states.join('>')})`; open.delete(id); continue; }
        if (r.states[r.states.length - 1]?.split('@')[0] !== v.state) r.states.push(`${v.state}@t${w.tick}`);
        continue;
      }
      const prev = r.seq.length ? Number(r.seq[r.seq.length - 1]!.split(':')[1]) : NaN;
      const d = v.days ?? -1;
      if (d !== prev) {
        // a figure that grows while it waits: by how much over the time passed
        if (Number.isFinite(prev) && d > prev) r.maxUp = Math.max(r.maxUp, d - prev);
        r.seq.push(`t${w.tick}:${d}`);
      }
    }
    for (let id = 0; id < c.nation.length; id++) {
      if (!w.formations.has(id) || recs.has(id)) continue;
      const v = voyageOf(w, id);
      if (v?.state !== 'nextVoyage') continue;
      const r: Rec = { id, told: w.tick, days: v.days, port: v.port, seq: [`t${w.tick}:${v.days ?? -1}`], states: [], sailed: -1, end: '', maxUp: 0 };
      recs.set(id, r);
      open.set(id, r);
    }
  },
});
for (const r of open.values()) r.end = `still waiting at t${lastTick}`;
for (const r of recs.values()) {
  const actual = r.sailed > 0 ? ((r.sailed - r.told) / 24).toFixed(1) : '-';
  const err = r.sailed > 0 && r.days !== undefined ? ((r.sailed - r.told) / 24 - r.days).toFixed(1) : '-';
  console.log(`NV ${seed} div ${r.id} told t${r.told} days ${r.days ?? 'none'} port ${r.port} | sailed ${r.sailed > 0 ? `t${r.sailed}` : '-'} actual ${actual} d, err ${err} d | ${r.end} | grew by ${r.maxUp} | ${r.seq.slice(0, 12).join(' ')}`);
}
console.log(`broken ${br.length}`);
console.log('done:');
