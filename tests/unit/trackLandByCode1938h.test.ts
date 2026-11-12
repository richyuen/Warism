import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import type { Admin1Meta } from '../../src/shared/admin1';
import { TimelineFile as TimelineSchema, type TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R69b (ADR-985): a birth and a transfer may name their land by the map's codes, whole countries (`adm0`) and
// provinces (`adm1`), beside or in place of a ring: Laos born of Indochina's land in Laos, Tunisia's provinces handed
// to Libya's owner, every land cell of them and no other. A transfer or birth naming no land is refused by the schema.

const id = (tag: string): number => TAGS_1938H.indexOf(tag) + 1;
const assets = assets1938(SIZE_1938.w);
const meta = JSON.parse(new TextDecoder().decode(assets.admin1Meta)) as Admin1Meta[];
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

/** The land cells whose province is one of the country's (or one of the provinces). */
function cellsOf(w: World, adm0: string | null, adm1: readonly string[] = []): number[] {
  const out: number[] = [];
  const { province, owner } = w.cells;
  for (let c = 0; c < province.length; c++) {
    const p = province[c]!;
    if (p === 0 || owner[c] === 0) continue;
    const m = meta[p - 1]!;
    if (m.adm0 === adm0 || adm1.includes(m.adm1)) out.push(c);
  }
  return out;
}

describe('land named by its codes (ROADMAP R69b)', () => {
  it("a nation born of a country's land, and provinces handed over: every cell of them, no other", () => {
    const tunis = meta.filter((m) => m.adm0 === 'TUN').slice(0, 3).map((m) => m.adm1);
    expect(tunis.length).toBe(3);
    const tl: TimelineFile = {
      events: [
        { date: '1938-01-02', kind: 'born', nation: 'LAO', from: ['INC'], countries: ['LAO'] },
        { date: '1938-01-02', kind: 'transfer', to: 'ITA', from: ['TUN'], provinces: tunis },
      ],
    };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets }, tl);
    const w = sim.world;
    const laos = cellsOf(w, 'LAO');
    const tun = cellsOf(w, null, tunis);
    expect(laos.length).toBeGreaterThan(100);
    expect(laos.every((c) => w.cells.owner[c] === id('INC'))).toBe(true);
    expect(tun.length).toBeGreaterThan(5);
    const others = new Map<number, number>();
    w.nations.forEach((n) => others.set(n, 0));
    const ownerBefore = w.cells.owner.slice();
    const kinds: number[] = [];
    sim.step(25, (x) => {
      for (let i = 0; i < x.out.events.length; i += 6) kinds.push(x.out.events[i + 1]!);
      quiet(x);
    });
    expect(w.nations.cols.living[id('LAO')]).toBe(1);
    expect(kinds).toContain(EventKind.NationBorn);
    expect(laos.every((c) => w.cells.owner[c] === id('LAO') && w.cells.controller[c] === id('LAO'))).toBe(true);
    expect(tun.every((c) => w.cells.owner[c] === id('ITA'))).toBe(true);
    // No other land changed hands.
    const named = new Set([...laos, ...tun]);
    let moved = 0;
    for (let c = 0; c < ownerBefore.length; c++) if (!named.has(c) && ownerBefore[c] !== w.cells.owner[c]) moved++;
    expect(moved).toBe(0);
  });

  it('a transfer or a birth that names no land is refused by the schema', () => {
    const bad = TimelineSchema.safeParse({ events: [{ date: '1938-01-02', kind: 'transfer', to: 'ITA', from: ['TUN'] }] });
    expect(bad.success).toBe(false);
    const good = TimelineSchema.safeParse({ events: [{ date: '1938-01-02', kind: 'born', nation: 'LAO', from: ['INC'], countries: ['LAO'] }] });
    expect(good.success).toBe(true);
  });
});
