import { loadAssets1938 } from '../../tools/headless/assets';
import { NATIONS_1938, SIZE_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { cellOf } from '../../src/sim/data/terrain';
import { elementIndex } from '../../src/sim/systems/elements';
import { heroHealth } from '../../src/sim/systems/heroes';
import type { World } from '../../src/sim/world';

// PLAN 7.184a3: a hero against standard forces, alone on a sea or a front of the 1938 world (seed
// 99, heroes on, the AI off, every other formation of both nations gone). At sea the Bismarck
// against British battle squadrons in the North Atlantic; on land the Maus against French
// armoured divisions over the Franco-German border, the French attacking it.

export interface HeroFight {
  /** The hero's least health in the fight, hour by hour (0 once lost), and whether it was lost. */
  least: number;
  lost: boolean;
  /** The enemy's ships (sea) or men (land) at the start and at the end. */
  start: number;
  end: number;
  /** Enemy formations still in the fight with the hero at the end (engaged at sea; engaged or not on the retreat on land). */
  fighting: number;
  /** One line a day, for a probe. */
  days: string[];
}

const tag = (t: string): number => NATIONS_1938.findIndex((n) => n.tag === t) + 1;
const tpl = (id: string): number => TEMPLATES_1938.findIndex((t) => t.id === id);
const quiet = (x: World): void => {
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
let assets: ReturnType<typeof loadAssets1938> | null = null;

function base(): Sim {
  assets ??= loadAssets1938(SIZE_1938.w);
  const sim = new Sim({ scenario: '1938', seed: 99, assets, options: { heroes: 'on' } });
  sim.world.settings.aiEnabled = false;
  return sim;
}

function heroOf(w: World, template: string): number {
  return [...w.heroes].find(([, row]) => TEMPLATES_1938[w.heroRoster[row]!.template]!.id === template)?.[0] ?? 0;
}

function ships(w: World, ids: readonly number[]): number {
  let n = 0;
  for (const id of ids) for (const el of (w.formations.has(id) ? elementIndex(w).get(id) : undefined) ?? []) n += w.elements.cols.strength[el]!;
  return n;
}

function men(w: World, ids: readonly number[]): number {
  return ids.reduce((s, id) => s + (w.formations.has(id) ? w.formations.cols.strength[id]! : 0), 0);
}

/** Every formation of `nations` gone but `keep`. */
function clear(sim: Sim, nations: readonly number[], keep: readonly number[]): void {
  const w = sim.world;
  const gone: number[] = [];
  w.formations.forEach((id) => {
    if (nations.includes(w.formations.cols.nation[id]!) && !keep.includes(id)) gone.push(id);
  });
  for (const id of gone) sim.command({ kind: 'removeFormation', id });
  sim.applyNow(quiet);
}

/** The new formations of `nation` since `before`. */
function added(w: World, before: ReadonlySet<number>, nation: number): number[] {
  const out: number[] = [];
  w.formations.forEach((id) => {
    if (!before.has(id) && w.formations.cols.nation[id] === nation) out.push(id);
  });
  return out;
}

/** `days` days, hour by hour, of the hero `template` against `enemy`, counted by `count`; `fighting` says which enemies are still in it. */
function run(sim: Sim, template: string, enemy: readonly number[], count: (w: World, ids: readonly number[]) => number, fighting: (w: World, id: number) => boolean, days: number): HeroFight {
  const w = sim.world;
  const start = count(w, enemy);
  let least = 1;
  const lines: string[] = [];
  for (let d = 1; d <= days; d++) {
    for (let h = 0; h < 24; h++) {
      sim.step(1, quiet);
      const id = heroOf(w, template);
      least = Math.min(least, id ? heroHealth(w, id) : 0);
    }
    const id = heroOf(w, template);
    lines.push(`d${d} hero ${id ? heroHealth(w, id).toFixed(2) : 'lost'} (least ${least.toFixed(2)}) enemy ${count(w, enemy)}/${start} fighting ${enemy.filter((e) => w.formations.has(e) && fighting(w, e)).length}`);
    if (!id) break;
  }
  return { least, lost: heroOf(w, template) === 0, start, end: count(w, enemy), fighting: enemy.filter((e) => w.formations.has(e) && fighting(w, e)).length, days: lines };
}

/** The Bismarck against `squadrons` British battle squadrons, for `days` days. */
export function seaFight(squadrons: number, days: number): HeroFight {
  const sim = base();
  const w = sim.world;
  const ger = tag('GER');
  const eng = tag('ENG');
  const hero = heroOf(w, 'hero_bismarck');
  clear(sim, [ger, eng], [hero]);
  const [x, y] = cellOf(-30, 52, w.cells.w, w.cells.h);
  [w.formations.cols.x[hero], w.formations.cols.y[hero]] = w.seaPoint(Math.floor(y) * w.cells.w + Math.floor(x))!;
  const before = new Set<number>();
  w.formations.forEach((id) => void before.add(id));
  for (let k = 0; k < squadrons; k++) sim.command({ kind: 'spawnFleet', nation: eng, x: x + 0.6, y: y + 0.3 * k, template: tpl('battle_squadron'), free: true });
  sim.command({ kind: 'forceWar', attacker: ger, defender: eng });
  sim.applyNow(quiet);
  return run(sim, 'hero_bismarck', added(w, before, eng), ships, (x, id) => x.formations.cols.engaged[id] === 1, days);
}

/** The Maus on a German cell of the border by Saarbrücken, attacked by `divisions` French armoured divisions from the French cell beside it (one behind another), for `days` days. */
export function landFight(divisions: number, days: number): HeroFight {
  const sim = base();
  const w = sim.world;
  const ger = tag('GER');
  const fra = tag('FRA');
  const hero = heroOf(w, 'hero_maus');
  clear(sim, [ger, fra], [hero]);
  const { w: W, controller } = w.cells;
  const [sx, sy] = cellOf(7.0, 49.2, W, w.cells.h);
  let gc = -1;
  let fc = -1;
  for (let r = 0; r < 12 && gc < 0; r++) {
    for (let dy = -r; dy <= r && gc < 0; dy++) {
      for (let dx = -r; dx <= r && gc < 0; dx++) {
        const c = (Math.floor(sy) + dy) * W + Math.floor(sx) + dx;
        if (controller[c] !== ger) continue;
        for (const o of [c - 1, c + 1, c - W, c + W]) if (controller[o] === fra && gc < 0) [gc, fc] = [c, o];
      }
    }
  }
  const [gx, gy] = [(gc % W) + 0.5, Math.floor(gc / W) + 0.5];
  const [fx, fy] = [(fc % W) + 0.5, Math.floor(fc / W) + 0.5];
  [w.formations.cols.x[hero], w.formations.cols.y[hero]] = w.standPoint(gx, gy);
  const before = new Set<number>();
  w.formations.forEach((id) => void before.add(id));
  for (let k = 0; k < divisions; k++) sim.command({ kind: 'spawnFormation', nation: fra, x: fx + (fx - gx) * k, y: fy + (fy - gy) * k, strength: 0, template: tpl('panzer_div') });
  sim.command({ kind: 'forceWar', attacker: ger, defender: fra });
  sim.applyNow(quiet);
  const enemy = added(w, before, fra);
  for (const id of enemy) sim.command({ kind: 'moveFormation', id, x: gx, y: gy });
  return run(sim, 'hero_maus', enemy, men, (x, id) => x.formations.cols.engaged[id] === 1 && x.formations.cols.retreat[id] === 0, days);
}
