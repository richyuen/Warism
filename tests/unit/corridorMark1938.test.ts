import { describe, expect, it } from 'vitest';
import { CORRIDOR_STRIDE } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { CORRIDOR_DAYS, CORRIDOR_HALF_WIDTH, CORRIDOR_LEN } from '../../src/sim/systems/majorBattles';
import type { World } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R53e (critic run 54's objection to ADR-864: "the map still shows nothing of the 10-day corridor that is the
// tool's whole effect"). The snapshot's `corridors` has each breakthrough corridor in force (God's and a major
// battle's winner's, SPEC §5.4): its start, its way, its length and half width in cells, its nation and its days
// left; the map draws them.

const [GER, POL] = [nationId('GER'), nationId('POL')];

function server(seed: number): { s: SimServer; rows: () => number[][] } {
  const s = new SimServer(() => {});
  s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed, assets: assets1938(SIZE_1938.w) } }, 0);
  const rows = (): number[][] => {
    const all = (s as unknown as { corridors(w: World): number[] }).corridors(s.sim!.world);
    const out: number[][] = [];
    for (let i = 0; i + CORRIDOR_STRIDE <= all.length; i += CORRIDOR_STRIDE) out.push(all.slice(i, i + CORRIDOR_STRIDE));
    return out;
  };
  return { s, rows };
}

const step = (s: SimServer, n: number): void => s.handle({ type: 'step', reqId: 0, n }, 0);
const at = (lon: number, lat: number): [number, number] => cellOf(lon, lat, SIZE_1938.w, SIZE_1938.h).map((v) => Math.floor(v) + 0.5) as [number, number];
const BERLIN = at(13.4, 52.5);
const WARSAW = at(21.0, 52.2);

describe('a breakthrough corridor is in the snapshot for its days (ROADMAP R53e)', () => {
  it("24123, at war: God's corridor from Berlin toward Warsaw, Germany's, its 10 days, then gone", { timeout: 600_000 }, () => {
    const { s, rows } = server(24123);
    s.handle({ type: 'cmd', cmd: { kind: 'declareWar', attacker: GER, defender: POL } }, 0);
    step(s, 1);
    s.handle({ type: 'cmd', cmd: { kind: 'forceBreakthrough', nation: GER, x: BERLIN[0], y: BERLIN[1], toX: WARSAW[0], toY: WARSAW[1] } }, 0);
    step(s, 1);
    const mine = (): number[][] => rows().filter((r) => Math.abs(r[0]! - BERLIN[0]) < 1e-3 && Math.abs(r[1]! - BERLIN[1]) < 1e-3);
    expect(mine().length).toBe(1);
    const [, , dx, dy, len, half, nation, days] = mine()[0]!;
    expect(nation).toBe(GER);
    expect(Math.hypot(dx!, dy!)).toBeCloseTo(1, 5);
    expect(dx!).toBeGreaterThan(0.9);
    expect(len).toBe(CORRIDOR_LEN);
    expect(half).toBe(CORRIDOR_HALF_WIDTH);
    expect(days!).toBeGreaterThan(CORRIDOR_DAYS - 0.1);
    expect(days!).toBeLessThanOrEqual(CORRIDOR_DAYS);
    step(s, CORRIDOR_DAYS * 24);
    expect(mine()).toEqual([]);
  });

  it('20879, at peace: refused, no corridor', { timeout: 600_000 }, () => {
    const { s, rows } = server(20879);
    step(s, 1);
    s.handle({ type: 'cmd', cmd: { kind: 'forceBreakthrough', nation: GER, x: BERLIN[0], y: BERLIN[1], toX: WARSAW[0], toY: WARSAW[1] } }, 0);
    step(s, 1);
    expect(rows().filter((r) => Math.abs(r[0]! - BERLIN[0]) < 1e-3)).toEqual([]);
  });
});
