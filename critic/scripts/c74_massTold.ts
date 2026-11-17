// Critic run 74 (new): R122's "massing seen" row and R123's lone declaration, on plain 1938 (or a random world of N).
// Each day: the MassingSeen events, the wars declared, the massings that left `World.massing`. Per massing told: whether
// the war it told of was declared (a on b), in how many days, or given up (no row is built for that: a false alarm).
// Also: a nation told twice in one massing; a row for a massing that had begun with the army there.
// `--no-alone`: MASS_PROBE.alone = false (as before R123), to diff the declarations. `--saveload`: at the first day a
// massing is told, save, load into a new Sim, run both 120 days: the hashes and the MassingSeen rows of both.
// Usage: npx tsx critic/scripts/c74_massTold.ts <years> [--no-alone] [--saveload] [--random N] <seed>...
import { EventKind } from '../../src/shared/events';
import { MASS_PROBE } from '../../src/sim/ai/massing';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const argv = process.argv.slice(2);
const years = Number(argv.shift());
let saveload = false, randomN = 0;
const seeds: number[] = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--no-alone') MASS_PROBE.alone = false;
  else if (argv[i] === '--saveload') saveload = true;
  else if (argv[i] === '--random') randomN = Number(argv[++i]);
  else seeds.push(Number(argv[i]));
}
const assets = assets1938(SIZE_1938.w);
const tag = (n: number): string => (randomN ? `n${n}` : ((TAGS_1938 as readonly string[])[n - 1] ?? String(n)));
const hx = (n: number): string => (n >>> 0).toString(16).padStart(8, '0');
let T = 0, Tdecl = 0, Tgiven = 0, Topen = 0, Ttwice = 0;
for (const seed of seeds) {
  const make = (): Sim => (randomN ? new Sim({ scenario: 'random', seed, assets, options: { nations: randomN } }) : new Sim({ scenario: '1938', seed, assets }));
  const sim = make();
  const w = sim.world;
  /** Told massings in course: nation -> { target, day told }. */
  const told = new Map<number, { t: number; day: number }>();
  const rows: string[] = [];
  let nTold = 0, nDecl = 0, nGiven = 0, nTwice = 0, declAll = 0, declNoMass = 0;
  const daysToWar: number[] = [];
  let prev = new Map<number, number>();
  /** The day each massing of the day before began, and the nations told of by then (critic run 74: why a massed war had no row). */
  let prevSince = new Map<number, number>();
  let prevTold = new Set<number>();
  let saved = false;
  for (let d = 0; d < years * 365; d++) {
    const seenToday: [number, number][] = [];
    const declToday: [number, number][] = [];
    sim.step(24, (x: World) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (ev[i + 1] === EventKind.MassingSeen) seenToday.push([ev[i + 2]!, ev[i + 3]!]);
        else if (ev[i + 1] === EventKind.WarDeclared) declToday.push([ev[i + 2]!, ev[i + 3]!]);
      }
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
    for (const [a, b] of seenToday) {
      nTold++;
      if (told.has(a)) { nTwice++; rows.push(`d${d} ${tag(a)}>${tag(b)} TOLD TWICE`); }
      told.set(a, { t: b, day: d });
    }
    for (const [a, b] of declToday) {
      declAll++;
      const m = told.get(a);
      const massed = prev.get(a) === b;
      if (!massed) declNoMass++;
      if (m && m.t === b) { nDecl++; daysToWar.push(d - m.day); told.delete(a); rows.push(`d${m.day} ${tag(a)}>${tag(b)} told, war d${d} (+${d - m.day})`); }
      else if (massed) rows.push(`d${d} ${tag(a)}>${tag(b)} war after a massing never told (the massing ${d - (prevSince.get(a) ?? d)} days old the day before; the nation in massTold the day before: ${prevTold.has(a)})`);
    }
    // Massings that ended today with no declaration: given up.
    for (const [a, m] of [...told]) {
      if (!w.massing.has(a) || w.massing.get(a)!.target !== m.t) { nGiven++; told.delete(a); rows.push(`d${m.day} ${tag(a)}>${tag(m.t)} told, GIVEN UP d${d} (+${d - m.day}), no row of it`); }
    }
    prev = new Map([...w.massing].map(([n, m]) => [n, m.target]));
    prevSince = new Map([...w.massing].map(([n, m]) => [n, m.since]));
    prevTold = new Set(w.massTold);
    if (saveload && !saved && w.massTold.size > 0) {
      saved = true;
      const bytes = sim.save();
      const b = make();
      b.load(bytes);
      const count = (s: Sim, days: number): number => {
        let c = 0;
        for (let k = 0; k < days; k++) s.step(24, (x: World) => { const ev = x.out.events; for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.MassingSeen) c++; x.out.events.length = 0; x.out.fires.length = 0; });
        return c;
      };
      const a2 = make();
      a2.load(bytes);
      const ca = count(a2, 120), cb = count(b, 120);
      process.stdout.write(`seed ${seed} saveload at d${d} (massTold ${[...w.massTold].map(tag).join(',')}): loaded twice, 120 days: hashes ${hx(a2.hash())} ${hx(b.hash())} ${a2.hash() === b.hash() ? 'same' : 'DIFFER'}; MassingSeen rows ${ca} and ${cb}; massTold after load ${[...b.world.massTold].length >= 0 ? 'kept' : ''}\n`);
    }
  }
  const open = told.size;
  daysToWar.sort((x, y) => x - y);
  process.stdout.write(`seed ${seed}${MASS_PROBE.alone === false ? ' no-alone' : ''}: told ${nTold}, war followed ${nDecl} (median +${daysToWar[Math.floor(daysToWar.length / 2)] ?? '-'} d, max +${daysToWar[daysToWar.length - 1] ?? '-'}), given up ${nGiven}, open ${open}, twice ${nTwice}; wars declared ${declAll}, of them with no massing the day before ${declNoMass}; hash ${hx(sim.hash())}\n`);
  for (const r of rows) process.stdout.write(`  ${r}\n`);
  T += nTold; Tdecl += nDecl; Tgiven += nGiven; Topen += open; Ttwice += nTwice;
}
process.stdout.write(`total: told ${T}, war followed ${Tdecl}, given up ${Tgiven}, open ${Topen}, twice ${Ttwice}\n`);
process.stdout.write('done:\n');
