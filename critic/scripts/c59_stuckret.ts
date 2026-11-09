// Critic run 56 (new): a landing "returning" (turned back) whose groups have stopped moving: how long it stays so, with
// its divisions, port, target, and the clicks that named its divisions meanwhile. A returning landing is not
// `gathering`, so `stuck` (gathering only) does not see it, and `slowClick` cannot reckon clicks with no idle group.
// Prints each landing returning-and-still over MIN hours (default 48), then the longest. Same args as landingInvariants:
// npx tsx critic/scripts/c59_stuckret.ts <seed> <setup> <days> <orders> <probeDays> <groups>
import { landingBreaks } from '../../tests/helpers/landingInvariants';

const a = process.argv.slice(2);
const seed = Number(a[0] ?? 24033);
const min = Number(process.env.MIN ?? 48);
const still = new Map<number, { from: number; to: number; desc: string; clicks: string[] }>();
const done: { id: number; from: number; to: number; desc: string; clicks: string[] }[] = [];
const lines = landingBreaks({
  seed, setup: Number(a[1] ?? 3517), days: Number(a[2] ?? 120), orders: Number(a[3] ?? seed), probeDays: (a[4] ?? '30,90').split(',').map(Number), groups: a[5] ? Number(a[5]) : undefined,
  onHour: (w: any, click) => {
    const c = w.formations.cols;
    const W = w.cells.w;
    if (click) for (const s of still.values()) if (click.ids.some((id) => s.desc.includes(`+${id}+`))) s.clicks.push(`t${w.tick} ${click.ids.join(',')}->${click.x.toFixed(0)},${click.y.toFixed(0)}`);
    const seen = new Set<number>();
    for (const l of w.landings.values()) {
      if (l.state !== 2) continue;
      if (l.fleets.some((o: number) => c.moving[o] === 1 || c.engaged[o] === 1)) continue;
      seen.add(l.id);
      const desc = `L${l.id} port ${w.ports[l.port]?.name} target ${l.target % W},${Math.floor(l.target / W)} fleets ${l.fleets.join('+')} divs +${[...l.divisions.keys()].join('+')}+`;
      const s = still.get(l.id);
      if (s) { s.to = w.tick; s.desc = desc; } else still.set(l.id, { from: w.tick, to: w.tick, desc, clicks: [] });
    }
    for (const [id, s] of still) if (!seen.has(id)) { done.push({ id, ...s }); still.delete(id); }
  },
});
for (const [id, s] of still) done.push({ id, ...s, desc: s.desc + ' (still at the end)' });
let worst = 0;
for (const s of done) {
  worst = Math.max(worst, s.to - s.from);
  if (s.to - s.from >= min) console.log(`returning and still t${s.from}-t${s.to} (${((s.to - s.from) / 24).toFixed(1)} d): ${s.desc}; clicks meanwhile: ${s.clicks.join(' ; ') || 'none'}`);
}
console.log(`seed ${seed}: ${done.length} returning-still spells, longest ${(worst / 24).toFixed(1)} d; checker ${lines.length} broken`);
console.log('done:');
