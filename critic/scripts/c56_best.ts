// Critic run 56: at each click of a landingInvariants case, each division's own best way by sea (bestWayHours), whether
// it stands on the target's landmass (ADR-892 drops those from `clickBest`), and, 6 h later, whether it is in a landing
// (so a same-landmass division the game sends by sea, now unreckoned, shows). Usage: SEED=26045 npx tsx critic/scripts/c56_best.ts
import { landingBreaks } from '../../tests/helpers/landingInvariants';
import { bestWayHours } from '../../tests/helpers/slowClick';
import { landingOfDivision } from '../../src/sim/systems/landings';
import { landingOf } from '../../src/sim/systems/amphibious';
import { navOf } from '../../src/sim/world';

const seed = Number(process.env.SEED ?? 26045);
const pending: { at: number; ids: number[]; line: string }[] = [];
let sameButSea = 0, same = 0;
const lines = landingBreaks({
  seed, setup: Number(process.env.SETUP ?? 3517), days: Number(process.env.DAYS ?? 120), orders: Number(process.env.ORDERS ?? seed), probeDays: [30, 90], groups: Number(process.env.GROUPS ?? 2),
  onHour: (w: any, click) => {
    const c = w.formations.cols;
    const W = w.cells.w;
    for (const p of pending.filter((q) => q.at === w.tick)) {
      const ins = p.ids.map((id) => { const l = landingOfDivision(w, id); return `${id}:${l ? 'L' + l.id + (l.state === 0 ? 'g' : 's') : 'none'}`; });
      console.log(`${p.line} | +6h ${ins.join(' ')}`);
      for (const s of p.line.matchAll(/(\d+)\[same/g)) { if (ins.some((x) => x.startsWith(s[1] + ':L'))) sameButSea++; }
    }
    if (!click) return;
    const to = landingOf(w, Math.floor(click.y) * W + Math.floor(click.x));
    if (!to) return;
    const comp = navOf(w).grid.component;
    const parts = click.ids.map((id: number) => {
      const s = comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] === comp[to.land];
      if (s) same++;
      return `${id}[${s ? 'same' : 'cross'} ${(bestWayHours(w, id, to.water) / 24).toFixed(1)}d]`;
    });
    pending.push({ at: w.tick + 6, ids: click.ids, line: `t${w.tick} click -> ${click.x.toFixed(1)},${click.y.toFixed(1)} ${parts.join(' ')}` });
  },
});
console.log(`same-landmass divisions clicked: ${same}; of them in a landing 6 h later: ${sameButSea}`);
for (const l of lines) console.log('BROKEN', l);
console.log('done:');
