// Critic run 30 (R10): where a sea hero is, day by day, after it came back (e.g. at Baku). 1938 heroes on, seed <seed>:
// at each sampled day from <from> to <to> every <every> days: the hero's lon/lat, alive, its nation's ports held (with
// lon/lat), and how many of its nation's fleets are within 600 km. Usage: <seed> <TAG> <heroSubstr> <from> <to> <every> <out>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { unproject } from '../../src/sim/data/projection';
import { loadAssets1938 } from '../../tools/headless/assets';
import { Domain } from '../../src/sim/world';
const [seed, TAG, sub, from, to, every, out] = [Number(process.argv[2]), process.argv[3]!, process.argv[4]!, Number(process.argv[5]), Number(process.argv[6]), Number(process.argv[7]), process.argv[8]!];
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w), options: { heroes: 'on' } });
const n = NATIONS_1938.findIndex((d) => d.tag === TAG) + 1;
const row = s.world.heroRoster.findIndex((r) => r.nation === n && TEMPLATES_1938[r.template]!.id.includes(sub));
const ll = (x: number, y: number): number[] => unproject(x / s.world.cells.w, y / s.world.cells.h).map((v) => +v.toFixed(1));
const clear = (w: typeof s.world): void => { w.out.events.length = 0; w.out.fires.length = 0; };
s.step(from * 24 - s.world.tick, clear);
const rows: unknown[] = [];
for (let d = from; d <= to; d += every) {
  const w = s.world; const f = w.formations.cols;
  let fid = 0; for (const [id, r] of w.heroes) if (r === row) fid = id;
  let near = 0, fleets = 0;
  w.formations.forEach((id) => { if (f.nation[id] !== n || id === fid || w.rules?.templates[f.template[id]!]?.domain !== Domain.sea) return; fleets++; if (fid && Math.hypot(f.x[id]! - f.x[fid]!, f.y[id]! - f.y[fid]!) < 30) near++; });
  const ports = w.ports.filter((p) => w.cells.controller[p.cell] === n).map((p) => ll(p.x, p.y));
  rows.push({ day: d, alive: fid !== 0, at: fid ? ll(f.x[fid]!, f.y[fid]!) : null, health: null, fleets, fleetsNear: near, portsHeld: ports.length, ports: ports.slice(0, 12), living: w.nations.cols.living[n] });
  if (d + every <= to) s.step(every * 24, clear);
}
writeFileSync(out, JSON.stringify({ seed, TAG, sub, row, rows }, null, 1));
for (const r of rows as { day: number; alive: boolean; at: number[] | null; fleets: number; fleetsNear: number; portsHeld: number }[]) console.log(r.day, r.alive, JSON.stringify(r.at), 'fleets', r.fleets, 'near', r.fleetsNear, 'ports', r.portsHeld);
console.log('done:');
