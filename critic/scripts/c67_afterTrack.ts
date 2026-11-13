// Critic run 66: copy of tools/diag/afterTrack.ts with its cache in critic/c67_atcache (the .cache ones are the builder's, made before R75c).
/**
 * ROADMAP R67a: the world after the historical track ends (1938h, 27 July 1953 the last event). On its seed (or one
 * given): at the track's end, the alliances, the great powers (`greatPowers`) and the nuclear powers; then for `years`
 * every war declared, by year, marked where it sets two great powers against each other (`GP`), or nations of two
 * alliances that each hold a great power (`blocs`); at each year's end the wars running and the great-power pairs at war.
 *
 * The world at the track's end is saved to .cache/afterTrack_<seed>.sav.gz and loaded from there on a later run. Each
 * month of the first five years: the men of the leaders at the track's end and their formations disbanded.
 *
 * Daily, whether the leaders of the blocs at the track's end (alliances of 4 or more) are on opposite sides of a war.
 * `BLOCS=off|lasting|deterrence` switches R67c-d's rules off for a measure (`BLOC_PROBE`): off both, or that one.
 * R67e: the months each bloc's leader aided a nation at war with the other bloc, and the nations it aided.
 *
 * Usage: npx tsx tools/diag/afterTrack.ts [seed = SEED_1938H] [years = 20] [out.json]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync, gzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { BLOC_PROBE, greatPowers, strengths } from '../../src/sim/ai/strategic';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? SEED_1938H);
const years = Number(process.argv[3] ?? 20);
const out = process.argv[4] ?? `critic/c67_atcache/afterTrack_${seed}.json`;
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const HOURS_YEAR = 365 * 24;

const blocsOff = process.env.BLOCS ?? '';
BLOC_PROBE.lastingOff = blocsOff === 'off' || blocsOff === 'lasting';
BLOC_PROBE.deterrenceOff = blocsOff === 'off' || blocsOff === 'deterrence';
const sim = new Sim({ scenario: '1938h', seed, assets: assets1938(SIZE_1938.w) });
const w = sim.world;
const t = w.track!;
const quiet = (x: World): void => {
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
const save = `critic/c67_atcache/afterTrack_${seed}.sav.gz`;
if (existsSync(save)) sim.load(new Uint8Array(gunzipSync(readFileSync(save))));
else {
  while (!t.ended) sim.step(24, quiet);
  writeFileSync(save, gzipSync(sim.save()));
}
const end = sim.tick;

const blocOf = (n: number): number => w.alliances.list.find((a) => a.members.includes(n))?.id ?? 0;
const greats = (): Set<number> => greatPowers(w, strengths(w));
const nuclear = (): number[] => [...w.warheads.entries()].filter(([, s]) => s.stock > 0).map(([n]) => n);
const gpAtEnd = greats();
process.stdout.write(`track ended at tick ${end} (day ${Math.floor(end / 24)})\n`);
process.stdout.write(`great powers: ${[...gpAtEnd].map(tag).join(' ')}; nuclear: ${nuclear().map(tag).join(' ')}\n`);
for (const a of w.alliances.list) process.stdout.write(`alliance ${a.id} ${a.nameKey}: leader ${tag(a.leader)}; ${a.members.map(tag).join(' ')}\n`);

const endBlocs = w.alliances.list.filter((a) => a.members.length >= 4).map((a) => ({ leader: a.leader, members: [...a.members] }));
let leadersAtWar = 0;
const leadersOpposed = (): boolean =>
  endBlocs.some((a, i) => endBlocs.some((b, j) => j > i && w.wars.list.some((war) => (war.sides[0].includes(a.leader) && war.sides[1].includes(b.leader)) || (war.sides[1].includes(a.leader) && war.sides[0].includes(b.leader)))));
interface Declared {
  year: number;
  tick: number;
  a: string;
  b: string;
  gp: boolean;
  blocs: boolean;
}
const declared: Declared[] = [];
// The leaders at the track's end, followed by name: their men and the formations they disbanded, monthly.
const followed = [...gpAtEnd];
// R67e (ADR-990): the months of aid by giver, and the nations each aided.
const aidMonths = new Map<string, number>();
const aidedBy = new Map<string, Set<string>>();
const disbanded = new Map<number, number>();
const men = (n: number): number => {
  let m = 0;
  const f = w.formations.cols;
  w.formations.forEach((i) => {
    if (f.nation[i] === n) m += f.strength[i]!;
  });
  return m;
};
const yearly: { year: number; declared: number; gp: number; blocs: number; running: number; gpPairs: string[] }[] = [];
for (let y = 1; y <= years; y++) {
  const stop = end + y * HOURS_YEAR;
  while (sim.tick < stop) {
    sim.step(24, (x) => {
      const ev = x.out.events;
      const gp = greats();
      const gpBloc = new Set([...gp].map(blocOf).filter((b) => b !== 0));
      for (let i = 0; i < ev.length; i += 6) {
        if (ev[i + 1] === EventKind.BlocAid) {
          const [g, r] = [tag(ev[i + 2]!), tag(ev[i + 3]!)];
          aidMonths.set(g, (aidMonths.get(g) ?? 0) + 1);
          aidedBy.set(g, (aidedBy.get(g) ?? new Set()).add(r));
        }
        if (ev[i + 1] === EventKind.FormationsDisbanded) disbanded.set(ev[i + 2]!, (disbanded.get(ev[i + 2]!) ?? 0) + ev[i + 3]!);
        if (ev[i + 1] !== EventKind.WarDeclared) continue;
        const [a, b] = [ev[i + 2]!, ev[i + 3]!];
        const [ba, bb] = [blocOf(a), blocOf(b)];
        const d = { year: y, tick: ev[i]!, a: tag(a), b: tag(b), gp: gp.has(a) && gp.has(b), blocs: ba !== 0 && bb !== 0 && ba !== bb && gpBloc.has(ba) && gpBloc.has(bb) };
        declared.push(d);
        process.stdout.write(`y${y} day ${Math.floor(d.tick / 24)}: ${d.a} on ${d.b}${d.gp ? ' GP' : ''}${d.blocs ? ' blocs' : ''}\n`);
      }
      quiet(x);
    });
    if (leadersOpposed()) leadersAtWar++;
    if (y <= 5 && Math.floor((sim.tick - end) / 24) % 30 === 0)
      process.stdout.write(`  day ${Math.floor((sim.tick - end) / 24)}: ${followed.map((n) => `${tag(n)} ${Math.round(men(n) / 1000)}k −${disbanded.get(n) ?? 0}`).join(', ')}
`);
  }
  const gp = greats();
  const pairs = new Set<string>();
  for (const war of w.wars.list)
    for (const a of war.sides[0]) for (const b of war.sides[1]) if (gp.has(a) && gp.has(b)) pairs.add([tag(a), tag(b)].sort().join('-'));
  const these = declared.filter((d) => d.year === y);
  yearly.push({ year: y, declared: these.length, gp: these.filter((d) => d.gp).length, blocs: these.filter((d) => d.blocs).length, running: w.wars.list.length, gpPairs: [...pairs] });
  // The blocs at the track's end (their leaders' alliances then), followed: how many of their members are still in.
  const blocNow = endBlocs.map((b) => {
    const now = w.alliances.allianceOf(b.leader);
    const kept = b.members.filter((m) => now?.members.includes(m)).length;
    return `${tag(b.leader)} ${now ? `${kept}/${b.members.length}${now.leader === b.leader ? '' : ` led by ${tag(now.leader)}`}` : 'none'}`;
  });
  process.stdout.write(`  blocs: ${blocNow.join(', ')}
`);
  process.stdout.write(`year ${y}: declared ${these.length} (GP ${yearly.at(-1)!.gp}, blocs ${yearly.at(-1)!.blocs}); running ${w.wars.list.length}; great powers at war: ${[...pairs].join(' ') || 'none'}; greats ${[...gp].map(tag).join(' ')}\n`);
}
writeFileSync(out, JSON.stringify({ seed, end, declared, yearly }, null, 1));
const sum = (k: 'declared' | 'gp' | 'blocs'): number => yearly.reduce((s, r) => s + r[k], 0);
process.stdout.write(`aid: ${[...aidMonths].map(([g, k]) => `${g} ${k} months to ${[...aidedBy.get(g)!].sort().join(' ')}`).join('; ') || 'none'}
`);
process.stdout.write(`days with the blocs' leaders on opposite sides: ${leadersAtWar}
`);
process.stdout.write(`done: ${years} years, declared ${sum('declared')}, GP ${sum('gp')}, blocs ${sum('blocs')}, years with great powers at war ${yearly.filter((r) => r.gpPairs.length > 0).length} → ${out}\n`);
