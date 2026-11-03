// Critic run 24 (new), DP: the seed-drawn 1938 diplomacy (?diplo=random, ADR-785). For each seed: the drawn alliances,
// guarantees and wars by tag; checks a player would notice: cells held by a nation (controller) not its owner's with the
// two at peace (occupation without a war), at day 0, 1, 30, 90; foreign formations standing on a nation's land at peace;
// a puppet on the side against its overlord; a guarantor at war with the nation it guarantees; allies at war with
// each other. Same for the scenario's own diplomacy (control).
// Usage: npx tsx critic/scripts/c31_dp.ts <out.json> <seed...>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import type { World } from '../../src/sim/world';

const out = process.argv[2]!;
const seeds = process.argv.slice(3).map(Number);
const SZ = size1938();
const assets = loadAssets1938(SZ.w);
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const atWar = (w: World, a: number, b: number): boolean => w.wars.list.some((x) => (x.sides[0].includes(a) && x.sides[1].includes(b)) || (x.sides[1].includes(a) && x.sides[0].includes(b)));
function checks(w: World) {
  const c = w.cells;
  const occ = new Map<string, number>();
  for (let i = 0; i < c.owner.length; i++) {
    const o = c.owner[i]!, k = c.controller[i]!;
    if (o === 0 || k === 0 || o === k) continue;
    if (atWar(w, o, k)) continue;
    const nc = w.nations.cols;
    if (nc.overlord[o] === k || nc.overlord[k] === o) continue; // puppet's land held by its overlord, or the reverse
    const key = `${tag(k)} holds ${tag(o)}`;
    occ.set(key, (occ.get(key) ?? 0) + 1);
  }
  const fc = w.formations.cols;
  const guests = new Map<string, number>();
  w.formations.forEach((f) => {
    if (w.isFleet(f) || w.isWing(f)) return;
    const n = fc.nation[f]!;
    const x = Math.floor(fc.x[f]!), y = Math.floor(fc.y[f]!);
    const k = c.controller[y * c.w + x]!;
    if (k === 0 || k === n || atWar(w, n, k) || w.alliances.allied(n, k)) return;
    const nc = w.nations.cols;
    if (nc.overlord[n] === k || nc.overlord[k] === n || (nc.overlord[n] !== 0 && nc.overlord[n] === nc.overlord[k])) return;
    const key = `${tag(n)} in ${tag(k)}`;
    guests.set(key, (guests.get(key) ?? 0) + 1);
  });
  const odd: string[] = [];
  const nc = w.nations.cols;
  for (const war of w.wars.list) {
    for (const [s, o] of [[0, 1], [1, 0]] as const) for (const n of war.sides[s]) {
      const ov = nc.overlord[n]!;
      if (ov !== 0 && war.sides[o].includes(ov)) odd.push(`puppet ${tag(n)} against overlord ${tag(ov)} in war ${war.id}`);
      for (const m of war.sides[o]) if (w.alliances.allied(n, m)) odd.push(`allies ${tag(n)}-${tag(m)} on opposite sides of war ${war.id}`);
    }
  }
  for (const g of w.alliances.guarantees) if (atWar(w, g.guarantor, g.target)) odd.push(`guarantor ${tag(g.guarantor)} at war with ${tag(g.target)}`);
  return { occupiedAtPeace: Object.fromEntries([...occ].sort((a, b) => b[1] - a[1]).slice(0, 15)), occCells: [...occ.values()].reduce((a, b) => a + b, 0), guestsAtPeace: Object.fromEntries([...guests].sort((a, b) => b[1] - a[1]).slice(0, 15)), guestFormations: [...guests.values()].reduce((a, b) => a + b, 0), odd: odd.slice(0, 20) };
}
function dip(w: World) {
  return {
    alliances: w.alliances.list.map((a) => ({ name: a.nameKey, leader: tag(a.leader), members: a.members.map(tag) })),
    guarantees: w.alliances.guarantees.map((g) => `${tag(g.guarantor)}->${tag(g.target)}`),
    wars: w.wars.list.map((x) => ({ id: x.id, a: x.sides[0].map(tag), d: x.sides[1].map(tag) })),
  };
}
const res: unknown[] = [];
for (const seed of seeds) {
  for (const mode of ['scenario', 'random'] as const) {
    const s = new Sim({ scenario: '1938', seed, assets, ...(mode === 'random' ? { options: { diplomacy: 'random' } } : {}) });
    const row: Record<string, unknown> = { seed, mode, start: dip(s.world), at: {} };
    let day = 0;
    for (const d of [0, 1, 30, 90, 180]) {
      if (d > day) { s.step((d - day) * 24, (w) => { w.out.events.length = 0; w.out.fires.length = 0; }); day = d; }
      (row.at as Record<number, unknown>)[d] = checks(s.world);
    }
    row.d180 = dip(s.world);
    res.push(row);
    writeFileSync(out, JSON.stringify(res, null, 1));
    process.stderr.write(`seed ${seed} ${mode} done\n`);
  }
}
console.log('done:');
