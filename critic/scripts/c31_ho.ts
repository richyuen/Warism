// Critic run 29 (R5a, heroes): the 1938 world with heroes on or off, same seed, <years> years.
// Per year: living nations, wars at year end, declarations, peaces, capitals taken, eliminations, revolts, puppet events,
// sea battles and ships sunk, nuclear bursts, land share of the seven hero nations and the top nation.
// With heroes on, per hero: days alive, days its nation at war, days engaged (any hour of the day), days moved > 1 cell,
// times lost (with tick, place, and the nations at war with its own), returns (tick, place, days late), days its
// formation served a nation other than its roster's (integration), days "waiting" past its hour with its nation living,
// lowest health seen, mean health on war days.
// Usage: npx tsx critic/scripts/c31_ho.ts <seed> <years> <on|off> <out.json> [random]
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { SIDE_SHIPS } from '../../src/shared/history';
import { size1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { heroHealth } from '../../src/sim/systems/heroes';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2]);
const years = Number(process.argv[3] ?? 20);
const on = process.argv[4] === 'on';
const out = process.argv[5]!;
const diplo = process.argv[6] === 'random';
const SZ = size1938();
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(SZ.w), options: { ...(on ? { heroes: 'on' } : {}), ...(diplo ? { diplomacy: 'random' } : {}) } });
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const tag = (n: number): string => (n === 0 ? '-' : (s.world.nations.cols.origin[n] ?? 0) === 0 ? (NATIONS_1938[n - 1]?.tag ?? `#${n}`) : `new#${n}`);
const GP = ['GER', 'ENG', 'FRA', 'ITA', 'JAP', 'SOV', 'USA'];
const gpId = GP.map((t) => NATIONS_1938.findIndex((d) => d.tag === t) + 1);
const w0 = s.world;
const rows = w0.heroRoster.length;
const label = (row: number): string => `${tag(w0.heroRoster[row]!.nation)} ${TEMPLATES_1938[w0.heroRoster[row]!.template]?.id}`;
type H = { name: string; alive: number; war: number; engaged: number; moved: number; lost: { tick: number; x: number; y: number; foes: string[]; engagedLast24: boolean }[]; returns: { tick: number; x: number; y: number; lateDays: number }[]; servedOther: number; servedBy: string[]; waitingPast: number; minHealth: number; healthWarSum: number; healthWarDays: number };
const heroes: H[] = Array.from({ length: rows }, (_, r) => ({ name: label(r), alive: 0, war: 0, engaged: 0, moved: 0, lost: [], returns: [], servedOther: 0, servedBy: [], waitingPast: 0, minHealth: 1, healthWarSum: 0, healthWarDays: 0 }));
const perYear: unknown[] = [];
const last = new Map<number, { f: number; x: number; y: number; engH: number }>();
const dueAt = new Map<number, number>();
const foesOf = (n: number): string[] => { const r = new Set<string>(); for (const wr of s.world.wars.list) { const i = wr.sides.findIndex((sd) => sd.includes(n)); if (i < 0) continue; for (const m of wr.sides[1 - i]!) r.add(tag(m)); } return [...r].sort(); };
const t0 = performance.now();
let tick = 0;
for (let y = 1; y <= years; y++) {
  const ev: Record<string, number> = {};
  let seaN = 0, sunk = 0;
  for (let d = 0; d < 365; d++) {
    const engDay = new Set<number>();
    for (let hh = 0; hh < 24; hh++) {
      s.step(1, (w) => {
        const e = w.out.events;
        for (let i = 0; i < e.length; i += 6) {
          const k = EV[e[i + 1]!] ?? `k${e[i + 1]}`;
          ev[k] = (ev[k] ?? 0) + 1;
          if (e[i + 1] === EventKind.SeaBattle) { seaN++; sunk += Math.floor(e[i + 2]! / SIDE_SHIPS) + Math.floor(e[i + 3]! / SIDE_SHIPS); }
        }
        e.length = 0;
        w.out.fires.length = 0;
      });
      tick++;
      if (!on) continue;
      const w = s.world, fc = w.formations.cols;
      const alive = new Map<number, number>();
      for (const [f, row] of w.heroes) alive.set(row, f);
      for (let row = 0; row < rows; row++) {
        const f = alive.get(row), p = last.get(row);
        if (f === undefined) {
          if (p) { heroes[row]!.lost.push({ tick, x: +p.x.toFixed(1), y: +p.y.toFixed(1), foes: foesOf(w.heroRoster[row]!.nation), engagedLast24: p.engH < 24 }); last.delete(row); }
          continue;
        }
        if (p === undefined && tick > 1) { const due = w.heroReturn.get(row); heroes[row]!.returns.push({ tick, x: +fc.x[f]!.toFixed(1), y: +fc.y[f]!.toFixed(1), lateDays: 0 }); }
        if (fc.engaged[f] === 1) engDay.add(row);
        const eng = fc.engaged[f] === 1;
        last.set(row, { f, x: fc.x[f]!, y: fc.y[f]!, engH: eng ? 0 : p && p.f === f ? p.engH + 1 : 999 });
      }
    }
    if (!on) continue;
    const w = s.world, fc = w.formations.cols;
    const alive = new Map<number, number>();
    for (const [f, row] of w.heroes) alive.set(row, f);
    for (let row = 0; row < rows; row++) {
      const h = heroes[row]!, r = w.heroRoster[row]!;
      const f = alive.get(row);
      const atWar = w.wars.list.some((wr) => wr.sides.some((sd) => sd.includes(r.nation)));
      if (f === undefined) {
        const at = w.heroReturn.get(row);
        if (at !== undefined && w.tick > at + 24 && w.nations.cols.living[r.nation] === 1) h.waitingPast++;
        continue;
      }
      h.alive++;
      if (fc.nation[f] !== r.nation) { h.servedOther++; const b = tag(fc.nation[f]!); if (!h.servedBy.includes(b)) h.servedBy.push(b); }
      const hp = heroHealth(w, f);
      h.minHealth = Math.min(h.minHealth, hp);
      if (atWar) { h.war++; h.healthWarSum += hp; h.healthWarDays++; }
      if (engDay.has(row)) h.engaged++;
      const pk = `${row}`;
      const prev = (dueAt.get(row) ?? -1);
      void prev; void pk;
    }
  }
  // Late returns: a return's lateness = its tick − (loss tick + 60 days).
  const w = s.world;
  const ctl = w.cells.controller;
  const cnt = new Map<number, number>();
  let land = 0;
  for (let i = 0; i < ctl.length; i++) { const c = ctl[i]!; if (c === 0) continue; land++; cnt.set(c, (cnt.get(c) ?? 0) + 1); }
  let living = 0;
  w.nations.forEach((id) => { if (w.nations.cols.living[id] === 1) living++; });
  const top = [...cnt].sort((a, b) => b[1] - a[1])[0]!;
  perYear.push({
    year: y, living, wars: w.wars.list.length,
    declared: ev.WarDeclared ?? 0, peace: ev.PeaceSigned ?? 0, capitals: ev.CapitalCaptured ?? 0, eliminated: ev.NationEliminated ?? 0, annexed: ev.NationAnnexed ?? 0,
    revolts: ev.RevoltSpawned ?? 0, puppetCreated: ev.PuppetCreated ?? 0, puppetRevolt: ev.PuppetRevolt ?? 0, puppetIntegrated: ev.PuppetIntegrated ?? 0,
    seaBattles: seaN, shipsSunk: sunk, bursts: ev.NukeDetonated ?? 0, majorBattles: ev.MajorBattleStarted ?? 0,
    gpShare: Object.fromEntries(GP.map((t, i) => [t, +((100 * (cnt.get(gpId[i]!) ?? 0)) / land).toFixed(2)])),
    gpLiving: Object.fromEntries(GP.map((t, i) => [t, w.nations.cols.living[gpId[i]!]])),
    top: `${tag(top[0])} ${((100 * top[1]) / land).toFixed(1)}%`,
    hash: s.hash?.() ?? null,
  });
  process.stderr.write(`year ${y} living ${living} wars ${w.wars.list.length} ${((performance.now() - t0) / 1000).toFixed(0)}s\n`);
}
for (const h of heroes) for (let i = 0; i < h.returns.length; i++) { const l = h.lost[i]; if (l) h.returns[i]!.lateDays = +((h.returns[i]!.tick - l.tick) / 24 - 60).toFixed(2); }
writeFileSync(out, JSON.stringify({ seed, years, heroes: on, diplomacy: diplo ? 'random' : 'scenario', perYear, heroRows: heroes, alsoGone: on ? [...s.world.heroReturn].map(([r, at]) => ({ hero: label(r), at, living: s.world.nations.cols.living[s.world.heroRoster[r]!.nation] })) : [], ms: performance.now() - t0 }, null, 1));
console.log('done:', out);
