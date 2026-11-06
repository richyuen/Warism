import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { LandingState, landingOfDivision } from '../../src/sim/systems/landings';
import { assets1938 } from '../helpers/earth';

// ROADMAP R33b (ADR-829 "How": older saves still load; ADR-830): a save written before R33b, at `f9e7ab94`
// (`tests/fixtures/landingPreR33b-3517.bin.gz`): seed 3517, Japan's two nearest Tokyo sent to Shanghai,
// hour 32: 364 aboard group 1136 at Tokyo, 365 bound for group 1144 (`convoyPort` 1136 and 1144 at port 33,
// `seaFetch`, two escorts by group). Loaded now: no refusal; at its first hour one landing gathering at that
// port with both, both groups and both escorts, nobody aboard; saved again, the old sections are gone; the
// two land within a day of each other.

const { w: W } = SIZE_1938;
const bytes = (): Uint8Array => new Uint8Array(gunzipSync(readFileSync(new URL('../fixtures/landingPreR33b-3517.bin.gz', import.meta.url))));

describe('a save from before R33b loads, its convoys made one landing (ROADMAP R33b)', () => {
  it('seed 3517 at hour 32: one landing of the two at Tokyo, nobody aboard; they land together', () => {
    const sim = new Sim({ scenario: '1938', seed: 3517, assets: assets1938(W) });
    sim.load(bytes());
    const w = sim.world;
    expect(w.embarked.has(364), 'aboard in the old save').toBe(true);
    const landed = new Map<number, number>();
    const step = (): void =>
      sim.step(1, (x) => {
        const ev = x.out.events;
        for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.FormationLanded && (ev[i + 2] === 364 || ev[i + 2] === 365)) landed.set(ev[i + 2]!, x.tick);
        x.out.events.length = 0;
        x.out.fires.length = 0;
      });
    step();
    const l = landingOfDivision(w, 364)!;
    expect(l, "364's landing").toBeDefined();
    expect(landingOfDivision(w, 365), 'one landing of the two').toBe(l);
    expect(w.landings.size).toBe(1);
    expect(l.state).toBe(LandingState.gathering);
    expect(l.port).toBe(33);
    expect(l.fleets, 'both groups').toEqual([1136, 1144]);
    expect(w.embarked.has(364), 'ashore at its port').toBe(false);
    expect([...w.escorts.values()].map((e) => e.convoy), 'the escorts its').toEqual([l.id, l.id]);
    const names = (b: Uint8Array): string => new TextDecoder().decode(b);
    const again = names(sim.save());
    expect(again.includes('world.convoyPort') || again.includes('world.seaFetch'), 'the old sections gone').toBe(false);
    expect(again.includes('world.landings'), 'the landing saved').toBe(true);
    for (let h = 0; h < 24 * 60 && landed.size < 2; h++) step();
    expect(landed.size, 'both landed').toBe(2);
    expect(Math.abs(landed.get(364)! - landed.get(365)!), 'together').toBeLessThanOrEqual(24);
  }, 300_000);
});
