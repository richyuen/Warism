// Critic run 58 (new): each click over the sea in a landingInvariants run, judged by its LAST division ashore (slowClick
// judges the first). Per click: its best way (the checker's clickBest), each division's first hour ashore (left the
// transports onto land not its nation's); a division clicked again before ashore leaves the click. Prints one line per
// click with 2+ divisions ashore and a summary. Runs in the repo root (HEAD) or in critic/old (d3519cb0's sim) with
// ROOT=. so imports resolve to that tree. Usage: npx tsx c59_lastashore.ts <seed> <setup> <groups> [orderDays]
import { landingBreaks } from './tests/helpers/landingInvariants';
import { clickBest } from './tests/helpers/slowClick';
import { landingOf } from './src/sim/systems/amphibious';
import { landingOfDivision } from './src/sim/systems/landings';
const [seedS, setupS, groupsS, odS] = process.argv.slice(2);
const seed = Number(seedS), setup = Number(setupS), groups = Number(groupsS ?? 2), orderDays = odS ? Number(odS) : undefined;
type K = { t0: number; best: number; ids: Set<number>; at: Map<number, number>; read?: boolean };
const clicks: K[] = [];
const wasEmb = new Set<number>();
let lines = 0;
landingBreaks({
  seed, setup, days: 120, orders: seed, probeDays: [30, 90], groups, ...(orderDays !== undefined ? { orderDays } : {}), notes: [],
  onHour: (w, click) => {
    const W = w.cells.w;
    if (click) {
      for (const k of clicks) for (const id of click.ids) if (!k.at.has(id)) k.ids.delete(id);
      const to = landingOf(w, Math.floor(click.y) * W + Math.floor(click.x));
      if (to) {
        const best = clickBest(w, click.ids, to.water, to.land);
        if (Number.isFinite(best)) clicks.push({ t0: w.tick, best, ids: new Set(click.ids), at: new Map() });
      }
      return;
    }
    const c = w.formations.cols;
    for (const k of clicks) {
      if (!k.read) { k.read = true; for (const id of [...k.ids]) if (!w.embarked.has(id) && !landingOfDivision(w, id)) k.ids.delete(id); }
      for (const id of k.ids) {
        if (k.at.has(id) || !w.formations.has(id)) continue;
        const emb = w.embarked.has(id);
        if (!emb && wasEmb.has(id)) {
          const cell = Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!);
          if (w.cells.owner[cell] !== c.nation[id]) k.at.set(id, w.tick);
        }
      }
    }
    wasEmb.clear();
    w.formations.forEach((id) => { if (w.embarked.has(id)) wasEmb.add(id); });
  },
});
let n = 0, over7 = 0, worst = -Infinity, firstOver7 = 0;
for (const k of clicks) {
  if (k.at.size < 2) continue;
  n++;
  const times = [...k.at.values()];
  const first = Math.min(...times) - k.t0, last = Math.max(...times) - k.t0;
  const lo = (last - k.best) / 24;
  if (lo > 7) over7++;
  if ((first - k.best) / 24 > 7) firstOver7++;
  worst = Math.max(worst, lo);
  if (lo > 7) { console.log(`t${k.t0} click of ${[...k.at.keys()].join(',')}: first ashore ${(first / 24).toFixed(1)} d, last ${(last / 24).toFixed(1)} d, best ${(k.best / 24).toFixed(1)} d, last over ${lo.toFixed(1)} d`); lines++; }
}
console.log(`SUMMARY seed ${seed} setup ${setup} g${groups} od${orderDays ?? '-'}: ${n} clicks with 2+ ashore; last ashore >7 d over best: ${over7}; first >7 d over: ${firstOver7}; worst last over ${Number.isFinite(worst) ? worst.toFixed(1) : '-'} d`);
