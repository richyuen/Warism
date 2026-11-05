// Critic run 38 (copy of run 37): c38_fz.ts with a trace of TRACE ids (env, comma list) every 12 h and every event of theirs, to out.trace.
// Critic run 34 (R21, new): the player's orders over the sea, fuzzed. 1938 seed <seed>, <TAG> played. Every <every> days,
// <k> of its land divisions (random, not afloat) get a sea order to a random coastal cell of a nation at war with it
// (else of any foreign nation), escort random; optional peace with every enemy at day <peaceDay>. Hourly: per
// division, hours aboard while its convoy stands (not moving), hours bound (seaFetch) without boarding; at the end the
// worst of each, every MoveRejected reason by count, how many were still aboard/bound at the end, and any division
// aboard a group that is neither moving nor a convoy (stranded), any convoy entry for a dead group.
// Usage: npx tsx critic/scripts/c38_fz.ts <seed> <TAG> <days> <every> <k> <peaceDay|-1> <out.json>
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { hasLanding } from '../../src/sim/systems/amphibious';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seedS, T, dS, everyS, kS, peaceS, outF] = process.argv.slice(2);
const seed = Number(seedS);
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const N = NATIONS_1938.findIndex((d) => d.tag === T) + 1;
let rng = seed * 7919 + 13;
const rnd = (): number => { rng = (rng * 1103515245 + 12345) % 2147483648; return rng / 2147483648; };
s.command({ kind: 'setPlayer', nation: N } as never);
s.step(1);
const w = s.world, c = () => w.formations.cols;
const W = w.cells.w, H = w.cells.h;
// coastal land cells (sampled)
const coast: number[] = [];
for (let i = 0; i < 400000 && coast.length < 6000; i++) {
  const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H);
  if (w.cells.controller[y * W + x]! > 0 && hasLanding(w, x + 0.5, y + 0.5)) coast.push(y * W + x);
}
const reasons: Record<string, number> = {};
const aboardStill = new Map<number, number>();
const boundH = new Map<number, number>();
const worstAboard: [number, number, number][] = [];
const worstBound: [number, number, number][] = [];
let orders = 0, accepted = 0, landed = 0, embarked = 0, sentHome = 0, sentHomeMany = 0;
const stranded: string[] = [];
const TR = (process.env.TRACE ?? '').split(',').filter(Boolean).map(Number);
const trace: string[] = [];
const EVN: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([a, b]) => [b, a]));
const take = (wd: typeof w): void => {
  const e = wd.out.events;
  for (let i = 0; i < e.length; i += 6) {
    const k = e[i + 1]!;
    if (TR.includes(e[i + 2]!)) trace.push(`t${wd.tick} ${EVN[k]} a${e[i + 2]} b${e[i + 3]} c${e[i + 4]}`);
    if (k === EventKind.MoveRejected && e[i + 3] === N) reasons[String(e[i + 4])] = (reasons[String(e[i + 4])] ?? 0) + 1;
    if (k === EventKind.FormationLanded && e[i + 3] === N) landed++;
    if (k === EventKind.FormationEmbarked && e[i + 3] === N) embarked++;
    if (k === EventKind.FormationSentHome && e[i + 3] === N) sentHome++;
    if (k === (EventKind as Record<string, number>).FormationsSentHome && e[i + 2] === N) sentHomeMany++;
  }
  e.length = 0; wd.out.fires.length = 0;
};
const days = Number(dS), every = Number(everyS), k = Number(kS), peaceDay = Number(peaceS);
for (let h = 0; h < days * 24; h++) {
  if (h % (every * 24) === 0) {
    const mine: number[] = [];
    w.formations.forEach((f) => { if (c().nation[f] === N && !w.isFleet(f) && !w.offLand(f) && !w.afloat(f) && !w.isWing(f)) mine.push(f); });
    const enemy = coast.filter((cl) => w.wars.atWar(N, w.cells.controller[cl]!));
    const pool = enemy.length > 20 ? enemy : coast.filter((cl) => w.cells.controller[cl] !== N);
    for (let j = 0; j < k && mine.length > 0; j++) {
      const id = mine.splice(Math.floor(rnd() * mine.length), 1)[0]!;
      // one click: two to three divisions to one target, as a player does
      const tgt = pool[Math.floor(rnd() * pool.length)]!;
      const group = [id, ...mine.splice(0, Math.floor(rnd() * 3))];
      const esc = rnd() < 0.7;
      for (const g of group) { if (TR.includes(g)) trace.push(`t${w.tick} ORDER ${g} -> ${(tgt % W) + 0.5},${Math.floor(tgt / W) + 0.5} holder ${w.cells.controller[tgt]} esc ${esc} group ${group}`); orders++; if (s.command({ kind: 'moveFormation', id: g, x: (tgt % W) + 0.5, y: Math.floor(tgt / W) + 0.5, nation: N, escort: esc } as never)) accepted++; }
    }
  }
  if (peaceDay >= 0 && h === peaceDay * 24) {
    for (let e = 1; e < w.nations.cols.origin.length; e++) { const b = w.wars.between(N, e); if (b) s.command({ kind: 'forcePeace', war: b.war.id } as never); }
  }
  s.step(1, take as never);
  if (TR.length && w.tick % 12 === 0) for (const id of TR) { if (!w.formations.has(id)) continue; const e = w.embarked.get(id); trace.push(`t${w.tick} ${id} @${c().x[id]!.toFixed(1)},${c().y[id]!.toFixed(1)} mv${c().moving[id]} emb${e ? e.fleet : 0} fleetMv${e ? c().moving[e.fleet] : '-'} fleet@${e ? c().x[e.fleet]!.toFixed(1) + ',' + c().y[e.fleet]!.toFixed(1) : '-'} conv${e ? w.convoyPort.get(e.fleet) ?? '-' : '-'} fetch${w.seaFetch.get(id) ?? '-'} sb${w.seaBound.get(id) ?? '-'} po${JSON.stringify(w.playerOrders.get(id) ?? null)}`); }
  // durations
  for (const [id, e] of w.embarked) {
    if (c().nation[id] !== N) continue;
    const still = c().moving[e.fleet] === 0 && w.convoyPort.has(e.fleet);
    if (still) aboardStill.set(id, (aboardStill.get(id) ?? 0) + 1);
    if (!w.formations.has(e.fleet)) stranded.push(`t${w.tick} ${id} aboard dead group ${e.fleet}`);
  }
  for (const [id] of w.seaFetch) if (c().nation[id] === N) boundH.set(id, (boundH.get(id) ?? 0) + 1);
  for (const [id, hh] of [...aboardStill]) if (!w.embarked.has(id)) { worstAboard.push([hh, id, w.tick]); aboardStill.delete(id); }
  for (const [id, hh] of [...boundH]) if (!w.seaFetch.has(id)) { worstBound.push([hh, id, w.tick]); boundH.delete(id); }
}
for (const [id, hh] of aboardStill) worstAboard.push([hh, id, -1]);
for (const [id, hh] of boundH) worstBound.push([hh, id, -1]);
worstAboard.sort((a, b) => b[0] - a[0]); worstBound.sort((a, b) => b[0] - a[0]);
const out = {
  seed, T, days, every, k, peaceDay, orders, accepted, embarked, landed, sentHome, sentHomeMany, reasons,
  aboardNow: w.embarked.size, boundNow: w.seaFetch.size, convoysNow: w.convoyPort.size,
  worstAboardStill: worstAboard.slice(0, 10), aboardStillOver240: worstAboard.filter((x) => x[0] > 240).length, aboardStillOver720: worstAboard.filter((x) => x[0] > 720).length, aboardSpells: worstAboard.length,
  worstBound: worstBound.slice(0, 10), boundOver720: worstBound.filter((x) => x[0] > 720).length,
  stranded: stranded.slice(0, 20), strandedN: stranded.length, trace,
};
writeFileSync(outF!, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
