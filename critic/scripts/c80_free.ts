// Critic run 69 (new): the rule checkers on a game started from a built year of the replay (critic/c80_starts/<year>.sav).
// mode "free": the track left at once with R83b's options (JSON); mode "track": the replay played on to its 1991 end and
// beyond. Every hour: diploInvariants' exit, rise, pile and bloc; each day its held and realm; every hour worldInvariants'
// rule sets; no formation of a dead nation. Reports wars declared by year, the worst realm ratio of a war at each
// year's end, alliances, the US-Soviet (or Russian) pair, heroes, detonations.
// Usage: npx tsx critic/scripts/c80_free.ts <year> <after seed> <days> <free|track> [k=v,k=v | - ]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { blocBreaks, bondsOf, Breaks, membersOf, pileBreaks, riseBreaks, silentExits, useTags, worldBreaks } from '../../tests/helpers/diploInvariants';
import { assets1938 } from '../../tests/helpers/earth';
import { hourChecks, RULE_SETS } from '../../tests/helpers/worldInvariants';

const year = Number(process.argv[2] ?? 1975);
const after = Number(process.argv[3] ?? 4242) >>> 0;
const days = Number(process.argv[4] ?? 365);
const mode = process.argv[5] ?? 'free';
// Options as k=v,k=v (or JSON): loopingMap=false is a boolean.
const optArg = process.argv[6] ?? '-';
const options: Record<string, unknown> = optArg.startsWith('{') ? JSON.parse(optArg) : Object.fromEntries(optArg.split(',').filter((x) => x.includes('=')).map((x) => { const [k, v] = x.split('='); return [k!, v === 'false' ? false : v === 'true' ? true : v]; }));
const tags: readonly string[] = TAGS_1938H;
const tag = (n: number): string => tags[n - 1] ?? `#${n}`;
const id = (t: string): number => tags.indexOf(t) + 1;
useTags(tag);
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
if (year !== 1938) sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c80_starts/${year}.sav`))));
sim.world.track!.afterSeed = after;
const label = `${year} ${mode} after ${after} ${JSON.stringify(options)}`;
const t00 = Date.now();
if (mode === 'free') {
  sim.command(Object.keys(options).length > 0 ? { kind: 'leaveTrack', options } : { kind: 'leaveTrack' });
  sim.applyNow((x) => {
    x.out.events.length = 0;
    x.out.fires.length = 0;
  });
}
const w = sim.world;
const nc = w.nations.cols;
const f = w.formations.cols;
const heroes0 = w.heroes.size;
const heroNations = [...new Set(w.heroRoster.map((r) => tag(r.nation)))].join(',');
const breaks = new Breaks();
const h = hourChecks(w, new Set(RULE_SETS), tag, label, breaks);
let before = membersOf(w);
let bonds = bondsOf(w);
const t0 = sim.tick;
const decl: Map<number, number> = new Map();
const declList: string[] = [];
let nukes = 0;
let trackEndDay = -1;
const yearly: string[] = [];
const realms = (side: readonly number[]): number => side.filter((x) => nc.overlord[x] === 0).length;
const dateOf = (tick: number): string => new Date(Date.UTC(1938, 0, 1) + tick * 3600000).toISOString().slice(0, 10);
const check = (x: World): void => {
  const where = `${label} ${dateOf(x.tick)}`;
  const ev = x.out.events;
  breaks.add(where, silentExits(x, before, bonds.overlord, ev));
  breaks.add(where, riseBreaks(x, bonds, ev));
  breaks.add(where, pileBreaks(x, ev));
  breaks.add(where, blocBreaks(x, ev));
  if (x.tick % 24 === 0) breaks.add(where, worldBreaks(x));
  const dead = new Map<number, number>();
  x.formations.forEach((i) => {
    const n = f.nation[i]!;
    if (nc.living[n] !== 1) dead.set(n, (dead.get(n) ?? 0) + 1);
  });
  breaks.add(where, [...dead].map(([n, k]) => `dead: ${k} formations of ${tag(n)}, dead`));
  for (let i = 0; i < ev.length; i += 6) {
    const k = ev[i + 1];
    if (k === EventKind.WarDeclared) {
      const y = Number(dateOf(ev[i]!).slice(0, 4));
      decl.set(y, (decl.get(y) ?? 0) + 1);
      if (declList.length < 400) declList.push(`${dateOf(ev[i]!)} ${tag(ev[i + 2]!)}>${tag(ev[i + 3]!)}`);
    }
    if (k === EventKind.NukeDetonated) nukes++;
    if (k === EventKind.TrackEnded && trackEndDay < 0) trackEndDay = Math.floor((ev[i]! - t0) / 24);
  }
  h.check(x);
  before = membersOf(x);
  bonds = bondsOf(x);
};
const yearEnd = (): void => {
  let worst = '';
  let worstR = 0;
  for (const war of w.wars.list) {
    const [a, d] = [realms(war.sides[0]), realms(war.sides[1])];
    const r = Math.max(a, d) / Math.max(1, Math.min(a, d));
    if (r > worstR) {
      worstR = r;
      worst = `${tag(war.sides[0][0]!)} ${a}:${d} ${tag(war.sides[1][0]!)}`;
    }
  }
  const living = nc.living.reduce((s: number, v: number) => s + (v === 1 ? 1 : 0), 0);
  const al = w.alliances.list.map((a) => `${tag(a.leader)}${a.members.length}`).join(' ');
  const usa = id('USA');
  const sov = id('SOV');
  yearly.push(`${dateOf(w.tick)} living ${living} wars ${w.wars.list.length} worst ${worst || '-'} USA-SOV ${w.wars.atWar(usa, sov) ? 'WAR' : 'peace'} alliances ${al} track ${w.track!.ended ? 'ended' : 'on'}`);
};
for (let d = 0; d < days; d++) {
  sim.step(24, check);
  if ((d + 1) % 365 === 0 || d === days - 1) yearEnd();
}
const heroes1 = w.heroes.size;
process.stdout.write(`${label}: start ${dateOf(t0)}, end ${dateOf(sim.tick)}, track ended day ${trackEndDay}${mode === 'free' ? ' (left at start)' : ''}\n`);
for (const l of yearly) process.stdout.write(`YEAR ${l}\n`);
process.stdout.write(`declared by year: ${[...decl].map(([y, k]) => `${y}:${k}`).join(' ')}\n`);
process.stdout.write(`first declarations: ${declList.slice(0, 40).join(', ')}\n`);
process.stdout.write(`detonations ${nukes}; heroes at start ${heroes0} (roster ${w.heroRoster.length}: ${heroNations}), at end ${heroes1}\n`);
for (const l of breaks.lines) process.stdout.write(`BREAK ${l}\n`);
process.stdout.write(`done: ${label}, broken lines ${breaks.lines.length}, ${Math.round((Date.now() - t00) / 1000)} s\n`);
