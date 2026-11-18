/**
 * ROADMAP R97a: a war's first month. Who moves first and who takes whose land: for each war that begins in a run of the
 * 1938 world, its two sides' leaders, their men as it begins, and by day (1, 2, 7, 14, 30) the land of each side the
 * other holds and the formations of each side ordered onto land the other holds.
 *
 * The user's case (2026-11-16): Germany's war on Poland, forced by God Mode on the first day of seed 1938: Poland held
 * 327 cells of Germany after 30 days and Germany 107 of Poland, Poland's formations moving 2 hours in and Germany's a
 * day in. `--force A,D` makes that war at the first hour; without it the wars are the AI's own.
 *
 * Usage: npx tsx tools/diag/warOpening.ts <out.json> [--years N = 3] [--force GER,POL] [--neighbours] [--no-massing] <seed> [...]
 * `--no-massing`: wars declared as before ROADMAP R97b (no army brought to the border first), for the comparison.
 * `--no-answer`: the target of a massing does nothing of it, as before ROADMAP R103.
 * `--no-lift`: a war across the sea is declared with no army to lift for it, as before ROADMAP R139.
 * `--neighbours`: only the wars whose two leaders share a land border as the war begins (a war over a sea has no front
 * to move over in a month). One line a war, a summary a seed, then `done:`. Each war also with the two leaders' men
 * within 300 km of their border as it begins, and the land of each leader the other holds (a side's colonies apart).
 */
import { writeFileSync } from 'node:fs';
import { MASS_DAYS, MASS_PROBE } from '../../src/sim/ai/massing';
import { SHIFT_PROBE } from '../../src/sim/ai/operational';
import { LIFT_PROBE } from '../../src/sim/ai/seaLift';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../headless/assets';

const argv = process.argv.slice(2);
const out = argv.shift()!;
let years = 3;
let force: [string, string] | null = null;
let neighbours = false;
const seeds: number[] = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--years') years = Number(argv[++i]);
  else if (argv[i] === '--force') force = argv[++i]!.split(',') as [string, string];
  else if (argv[i] === '--neighbours') neighbours = true;
  else if (argv[i] === '--no-massing') MASS_PROBE.off = true;
  else if (argv[i] === '--no-answer') MASS_PROBE.noAnswer = true;
  else if (argv[i] === '--no-lift') LIFT_PROBE.off = true;
  else if (argv[i] === '--invaded') SHIFT_PROBE.weight = Number(argv[++i]);
  else if (argv[i] === '--mass-days') MASS_PROBE.days = Number(argv[++i]);
  else if (argv[i] === '--mass-second') MASS_PROBE.second = Number(argv[++i]);
  else seeds.push(Number(argv[i]));
}
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
const DAYS = [1, 2, 7, 14, 30];
/** How near the border a formation is at the front as a war begins, cells (300 km). */
const NEAR_CELLS = 15;

interface Day { day: number; attHolds: number; defHolds: number; /** Of the two leaders alone: the defender's land the attacker holds, and the other way. */ attLeaderHolds: number; defLeaderHolds: number; attAdvancing: number; defAdvancing: number; attMen: number; defMen: number }
interface Row {
  seed: number;
  war: number;
  startDay: number;
  forced: boolean;
  attacker: string;
  defender: string;
  /** Members of each side as it begins. */
  sides: [string[], string[]];
  border: boolean;
  /** The attacker had prepared this war: it was massing against the defender the day before (ROADMAP R97b). */
  massed: boolean;
  /** The two leaders' men within NEAR_CELLS of their shared border as the war begins (land formations), and the border's cells. */
  nearFront: [number, number];
  borderCells: number;
  /** The first day (1-based) a formation of the leader's side is ordered onto land the other side holds; 0: none in the month. */
  attFirst: number;
  defFirst: number;
  days: Day[];
  /** Days the war ran of the month looked at. */
  ran: number;
}

const rows: Row[] = [];
for (const seed of seeds) {
  const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(SIZE_1938.w) });
  const w = s.world;
  const { w: W, h: H } = SIZE_1938;
  const quiet = (ww: typeof w): void => {
    ww.out.events.length = 0;
    ww.out.fires.length = 0;
  };
  if (force) {
    const [a, d] = force.map((t) => TAGS_1938.indexOf(t) + 1) as [number, number];
    s.command({ kind: 'declareWar', attacker: a, defender: d });
  }
  /** The wars being watched: by id, their row and the two sides as they began. */
  const open = new Map<number, { row: Row; att: Set<number>; def: Set<number> }>();
  const seen = new Set<number>();
  // The wars the world begins with are not openings.
  for (const war of w.wars.list) seen.add(war.id);

  /** The border of what two nations hold: its cells, and each one's men (land formations) within NEAR_CELLS of it. */
  const front = (a: number, b: number): { cells: number; near: [number, number] } => {
    const c = w.cells.controller;
    const near = new Uint8Array(W * H);
    let cells = 0;
    for (let y = 0; y < H - 1; y++) {
      for (let x = 0; x < W; x++) {
        const here = c[y * W + x]!;
        if (here !== a && here !== b) continue;
        const east = c[y * W + ((x + 1) % W)]!;
        const south = c[(y + 1) * W + x]!;
        if (!((here === a && (east === b || south === b)) || (here === b && (east === a || south === a)))) continue;
        cells++;
        for (let dy = -NEAR_CELLS; dy <= NEAR_CELLS; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= H) continue;
          for (let dx = -NEAR_CELLS; dx <= NEAR_CELLS; dx++) near[yy * W + ((x + dx + W) % W)] = 1;
        }
      }
    }
    const men: [number, number] = [0, 0];
    const fc = w.formations.cols;
    w.formations.forEach((fid) => {
      if (w.isFleet(fid) || w.isWing(fid)) return;
      const n = fc.nation[fid]!;
      if (n !== a && n !== b) return;
      if (near[Math.floor(fc.y[fid]!) * W + (((Math.floor(fc.x[fid]!) % W) + W) % W)]) men[n === a ? 0 : 1] += fc.strength[fid]!;
    });
    return { cells, near: men };
  };

  const days = years * 365;
  // The wars prepared (ROADMAP R97b): as they were the day before, and what became of each.
  let was = new Map<number, { target: number; since: number }>();
  const mass = { begun: 0, declared: 0, daysToDeclare: 0, givenUp: 0, atWarElsewhere: 0, timedOut: 0, other: 0 };
  // A war prepared against a puppet is led by its overlord.
  const massedOn = (a: number, d: number): boolean => {
    const t = was.get(a)?.target;
    return t !== undefined && (t === d || w.nations.cols.overlord[t] === d);
  };
  const lateList: string[] = [];
  const massEnds = (day: number): void => {
    for (const [n, m] of was) {
      const now = w.massing.get(n);
      if (now && now.target === m.target && now.since === m.since) continue;
      if (w.wars.atWar(n, m.target)) {
        mass.declared++;
        mass.daysToDeclare += day - m.since;
      } else {
        mass.givenUp++;
        if (w.wars.list.some((x) => x.sides[0].includes(n) || x.sides[1].includes(n))) mass.atWarElsewhere++;
        else if (day - m.since > (MASS_PROBE.days ?? MASS_DAYS)) {
          mass.timedOut++;
          lateList.push(`${tag(n)}-${tag(m.target)}`);
        }
        else mass.other++;
      }
    }
    for (const [n, m] of w.massing) if (was.get(n)?.since !== m.since || was.get(n)?.target !== m.target) mass.begun++;
  };
  for (let day = 1; day <= days; day++) {
    // The first hour apart: a forced war is made in it, and is a war of day 0.
    s.step(day === 1 ? 1 : 24, quiet);
    if (day === 1) {
      for (const war of w.wars.list) {
        if (seen.has(war.id)) continue;
        seen.add(war.id);
        const [a, d] = [war.sides[0][0]!, war.sides[1][0]!];
        const fr = front(a, d);
        const border = fr.cells > 0;
        if (neighbours && !border) continue;
        const row: Row = { seed, war: war.id, startDay: 0, forced: true, attacker: tag(a), defender: tag(d), sides: [war.sides[0].map(tag), war.sides[1].map(tag)], border, massed: massedOn(a, d), nearFront: fr.near, borderCells: fr.cells, attFirst: 0, defFirst: 0, days: [], ran: 0 };
        open.set(war.id, { row, att: new Set(war.sides[0]), def: new Set(war.sides[1]) });
      }
      s.step(23, quiet);
    }
    for (const war of w.wars.list) {
      if (seen.has(war.id)) continue;
      seen.add(war.id);
      const [a, d] = [war.sides[0][0]!, war.sides[1][0]!];
      const fr = front(a, d);
      const border = fr.cells > 0;
      if (neighbours && !border) continue;
      const row: Row = { seed, war: war.id, startDay: day, forced: false, attacker: tag(a), defender: tag(d), sides: [war.sides[0].map(tag), war.sides[1].map(tag)], border, massed: massedOn(a, d), nearFront: fr.near, borderCells: fr.cells, attFirst: 0, defFirst: 0, days: [], ran: 0 };
      open.set(war.id, { row, att: new Set(war.sides[0]), def: new Set(war.sides[1]) });
    }
    massEnds(day);
    was = new Map([...w.massing].map(([n, m]) => [n, { ...m }]));
    if (open.size === 0) continue;
    // One pass over the land held by another than its owner: by owner and holder.
    const held = new Map<number, number>();
    const { owner, controller } = w.cells;
    for (let i = 0; i < owner.length; i++) {
      const o = owner[i]!;
      const c = controller[i]!;
      if (o !== 0 && c !== 0 && o !== c) held.set(o * 65536 + c, (held.get(o * 65536 + c) ?? 0) + 1);
    }
    const live = new Set(w.wars.list.map((x) => x.id));
    const f = w.formations.cols;
    for (const [id, o] of [...open]) {
      const age = day - o.row.startDay;
      if (!live.has(id)) {
        o.row.ran = age - 1;
        rows.push(o.row);
        open.delete(id);
        continue;
      }
      // The formations of each side ordered onto land the other side holds, and each side's leader's men.
      let [attAdv, defAdv, attMen, defMen] = [0, 0, 0, 0];
      w.formations.forEach((fid) => {
        if (w.isFleet(fid) || w.isWing(fid)) return;
        const n = f.nation[fid]!;
        const mine = o.att.has(n) ? 0 : o.def.has(n) ? 1 : -1;
        if (mine < 0) return;
        if (n === [...o.att][0]) attMen += f.strength[fid]!;
        if (n === [...o.def][0]) defMen += f.strength[fid]!;
        if (f.moving[fid] !== 1) return;
        const holder = controller[f.targetCell[fid]!]!;
        if (mine === 0 && o.def.has(holder)) attAdv++;
        if (mine === 1 && o.att.has(holder)) defAdv++;
      });
      if (attAdv > 0 && o.row.attFirst === 0) o.row.attFirst = age;
      if (defAdv > 0 && o.row.defFirst === 0) o.row.defFirst = age;
      if (DAYS.includes(age)) {
        let [attHolds, defHolds] = [0, 0];
        for (const [k, n] of held) {
          const [ow, c] = [Math.floor(k / 65536), k % 65536];
          if (o.def.has(ow) && o.att.has(c)) attHolds += n;
          if (o.att.has(ow) && o.def.has(c)) defHolds += n;
        }
        const [la, ld] = [[...o.att][0]!, [...o.def][0]!];
        o.row.days.push({ day: age, attHolds, defHolds, attLeaderHolds: held.get(ld * 65536 + la) ?? 0, defLeaderHolds: held.get(la * 65536 + ld) ?? 0, attAdvancing: attAdv, defAdvancing: defAdv, attMen, defMen });
      }
      if (age >= 30) {
        o.row.ran = 30;
        rows.push(o.row);
        open.delete(id);
      }
    }
    if (force && open.size === 0 && day > 31) break;
  }
  for (const o of open.values()) rows.push(o.row);
  const mine = rows.filter((r) => r.seed === seed);
  for (const r of mine) {
    const last = r.days.at(-1);
    const first = r.days[0];
    process.stderr.write(
      `seed ${seed} day ${r.startDay}${r.forced ? ' (forced)' : ''} ${r.attacker} on ${r.defender}${r.border ? '' : ' (no border)'}: ran ${r.ran} d; first order over the front: attacker day ${r.attFirst || '-'}, defender day ${r.defFirst || '-'}; ` +
        (last ? `day ${last.day}: attacker holds ${last.attHolds} cells, defender ${last.defHolds}; men ${first!.attMen} v ${first!.defMen} -> ${last.attMen} v ${last.defMen}` : 'no day read') + '\n',
    );
  }
  // The wars with a border that ran the month: who held more of the other's land at its end.
  const full = mine.filter((r) => r.border && r.ran >= 30 && r.days.length > 0);
  const defAhead = full.filter((r) => r.days.at(-1)!.defHolds > r.days.at(-1)!.attHolds).length;
  const defFirst = full.filter((r) => r.defFirst !== 0 && (r.attFirst === 0 || r.defFirst < r.attFirst)).length;
  process.stderr.write(`seed ${seed} massing: ${mass.begun} begun, ${mass.declared} declared (after ${mass.declared ? (mass.daysToDeclare / mass.declared).toFixed(1) : '-'} days on average), ${mass.givenUp} given up (${mass.atWarElsewhere} at war by then, ${mass.timedOut} late, ${mass.other} else); ${mine.filter((r) => r.massed).length} of ${mine.length} wars prepared; late: ${lateList.join(' ')}\n`);
  process.stderr.write(`seed ${seed}: ${mine.length} wars, ${full.length} with a border that ran 30 days; the defender ahead in land at day 30 in ${defAhead}, the defender's first order over the front before the attacker's in ${defFirst}\n`);
}
writeFileSync(out, JSON.stringify(rows, null, 1));
console.log(`done: ${rows.length} wars -> ${out}`);
