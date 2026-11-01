/**
 * New-game options (SPEC §9 "Seeds & randomisation", PLAN 1.39b1), applied once when a game
 * starts, deterministically from the seed:
 *   loopingMap  — the map wraps east–west (scenario default) or has hard edges;
 *   aggression  — each nation's AI aggression from the scenario, or uniform 0..100;
 *   traits      — the scenario's traits, or 1–3 random ones (respecting `excludes`): income and
 *                 manpower multipliers follow, and their aggression biases apply;
 *   gold        — starting gold from the scenario, scaled by a random 0.25–2×, or equal for all
 *                 (the median of living nations' gold);
 *   ceMode      — combat-efficiency mode (PLAN 1.22);
 *   diplomacy   — the scenario's alliances, guarantees and wars, or as many of each drawn by the
 *                 seed (PLAN 7.182, ADR-785; `randomDiplomacy`). Puppets stay the scenario's.
 */
import traitsJson from '../../data/traits/traits.json' with { type: 'json' };
import { hash32, hashToUnit } from './core/hash';
import { neighbourMap } from './ai/strategic';
import { declareWar, whyNotWar } from './systems/war';
import { Refusal } from '../shared/commands';
import type { GameOptions } from '../shared/gameOptions';

export type { GameOptions };
import type { World } from './world';

interface TraitDef {
  id: string;
  modifiers: { income?: number; manpower?: number };
  aggressionBias?: number;
  excludes?: string[];
}
const TRAITS = traitsJson.traits as unknown as TraitDef[];

const SALT_AGGR = 0x41474752;
const SALT_TRAIT = 0x54524954;
const SALT_GOLD = 0x474f4c44;
const SALT_DIPLO = 0x4449504c;

export function applyGameOptions(world: World, o: GameOptions): void {
  const nc = world.nations.cols;
  const u = (n: number, salt: number, k = 0): number => hashToUnit(hash32(world.seed, salt, n, k));
  if (o.loopingMap !== undefined && o.loopingMap !== world.settings.loopingMap) {
    world.settings.loopingMap = o.loopingMap;
    // The scenario build already made the pathing grid (wrapping): rebuild it on demand. A
    // path stays (PLAN 3.7k): a march does not take a step over the seam that is one no more.
    world.nav = null;
    world.sea = null;
    world.lanes = null;
    world.portSea = null;
    world.frontier = null;
    world.supplyDirty = true;
  }
  if (o.ceMode) world.settings.ceMode = o.ceMode;
  // After the looping setting: the neighbours it draws wars between are those of the map as it wraps.
  if (o.diplomacy === 'random') randomDiplomacy(world);
  world.nations.forEach((n) => {
    if (o.aggression === 'random') nc.aggression[n] = Math.floor(u(n, SALT_AGGR) * 101);
    if (o.traits === 'random') {
      const count = 1 + Math.floor(u(n, SALT_TRAIT) * 3);
      const chosen: TraitDef[] = [];
      for (let k = 1; chosen.length < count && k < 40; k++) {
        const t = TRAITS[Math.floor(u(n, SALT_TRAIT, k) * TRAITS.length)]!;
        if (chosen.includes(t) || chosen.some((c) => c.excludes?.includes(t.id) || t.excludes?.includes(c.id))) continue;
        chosen.push(t);
      }
      nc.incomeMult[n] = 1 + chosen.reduce((s, t) => s + (t.modifiers.income ?? 0), 0);
      nc.manpowerMult[n] = 1 + chosen.reduce((s, t) => s + (t.modifiers.manpower ?? 0), 0);
      nc.aggression[n] = Math.max(0, Math.min(100, nc.aggression[n]! + chosen.reduce((s, t) => s + (t.aggressionBias ?? 0), 0)));
    }
    if (o.gold === 'random') nc.gold[n] = nc.gold[n]! * (0.25 + 1.75 * u(n, SALT_GOLD));
  });
  if (o.gold === 'equal') {
    const golds: number[] = [];
    world.nations.forEach((n) => {
      if (nc.living[n] === 1) golds.push(nc.gold[n]!);
    });
    golds.sort((a, b) => a - b);
    const median = golds.length > 0 ? golds[Math.floor(golds.length / 2)]! : 0;
    world.nations.forEach((n) => {
      if (nc.living[n] === 1) nc.gold[n] = median;
    });
  }
}

/**
 * The start's diplomacy drawn by the seed (PLAN 7.182, ADR-785): the scenario's alliances,
 * guarantees and wars give way to as many of each. An alliance keeps its place's size and unity;
 * its members are independent nations, grown from a first one through its members' land
 * neighbours (any unaligned nation when none borders them), and the largest by land leads it. A
 * guarantee is between two independent nations that are not allies, its guarantor of the larger
 * half of them by land. A war is declared as any other (`declareWar`: puppets, allies and guarantors called,
 * a bond kept out of it) by an independent nation at peace on an independent land neighbour at
 * peace. Puppets stay the scenario's. The scenario's own diplomacy is let go of without a trace:
 * no alliance of it goes into `past` (the history log would show it dissolved on the first day).
 */
export function randomDiplomacy(world: World): void {
  const nc = world.nations.cols;
  const al = world.alliances;
  const wars = world.wars;
  const shape = al.list.map((a) => ({ size: a.members.length, unity: a.unity }));
  const guarantees = al.guarantees.length;
  const warCount = wars.list.length;
  al.list = [];
  al.guarantees = [];
  al.changed();
  wars.list = [];
  wars.changed();

  let k = 0;
  const pick = (xs: readonly number[]): number => (xs.length > 0 ? xs[Math.floor(hashToUnit(hash32(world.seed, SALT_DIPLO, k++)) * xs.length)]! : 0);
  const free: number[] = [];
  world.nations.forEach((n) => {
    if (nc.living[n] === 1 && nc.overlord[n] === 0) free.push(n);
  });
  const isFree = new Set(free);
  const nb = neighbourMap(world);
  const near = (n: number): number[] => [...(nb.get(n) ?? [])].filter((m) => isFree.has(m)).sort((a, b) => a - b);
  const land = world.landCounts().owned;

  for (const { size, unity } of shape) {
    const members: number[] = [];
    const open = (m: number): boolean => al.allianceOf(m) === undefined && !members.includes(m);
    const first = pick(free.filter(open));
    if (first === 0) break;
    members.push(first);
    while (members.length < size) {
      const by = [...new Set(members.flatMap(near))].filter(open).sort((a, b) => a - b);
      const next = pick(by.length > 0 ? by : free.filter(open));
      if (next === 0) break;
      members.push(next);
    }
    if (members.length < 2) break;
    const leader = members.reduce((b, m) => (land[m]! > land[b]! ? m : b));
    al.create(leader, members, 'alliance.defensive', unity);
  }

  // A guarantor is of the larger half by land (a small state's pledge to one far off was a pact
  // with nothing behind it); its target any other.
  const larger = [...free].sort((a, b) => land[b]! - land[a]! || a - b).slice(0, Math.ceil(free.length / 2));
  for (let made = 0, tries = 0; made < guarantees && tries < guarantees * 50; tries++) {
    const guarantor = pick(larger);
    const target = pick(free);
    if (guarantor === target || al.allied(guarantor, target)) continue;
    if (al.guarantees.some((g) => g.guarantor === guarantor && g.target === target)) continue;
    al.guarantees.push({ guarantor, target });
    made++;
  }

  for (let made = 0, tries = 0; made < warCount && tries < warCount * 50; tries++) {
    const fighting = wars.nations();
    const attacker = pick(free.filter((n) => !fighting.has(n)));
    const target = pick(near(attacker).filter((n) => !fighting.has(n)));
    if (attacker === 0 || target === 0 || whyNotWar(world, attacker, target) !== Refusal.None) continue;
    if (declareWar(world, attacker, target)) made++;
  }
}
