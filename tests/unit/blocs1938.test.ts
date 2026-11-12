import { describe, expect, it } from 'vitest';
import { deterred } from '../../src/sim/ai/strategic';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../helpers/earth';

// ROADMAP R67d (ADR-981): no nation of one bloc declares on a side the other bloc stands on (its member, the overlord
// that would lead its defence, or a guarantor of either); everyone else as before. The 1938 world's Anglo-French
// Entente and Comintern stand in for the two blocs.

describe('deterrence between the two blocs (ROADMAP R67d)', () => {
  const sim = new Sim({ scenario: '1938', seed: 1, assets: assets1938(SIZE_1938.w) });
  const w = sim.world;
  const id = (t: string): number => TAGS_1938.indexOf(t) + 1;
  const al = w.alliances;
  const blocs = new Set([al.allianceOf(id('ENG'))!.id, al.allianceOf(id('SOV'))!.id]);

  it("a bloc's nation is held back from the other bloc's leader and members", () => {
    expect(deterred(w, id('ENG'), id('SOV'), blocs)).toBe(true);
    expect(deterred(w, id('FRA'), id('MON'), blocs)).toBe(true);
    expect(deterred(w, id('SOV'), id('FRA'), blocs)).toBe(true);
  });

  it('not from a nation of neither bloc, nor one of neither bloc from a bloc', () => {
    expect(deterred(w, id('ENG'), id('GER'), blocs)).toBe(false);
    expect(deterred(w, id('GER'), id('SOV'), blocs)).toBe(false);
    expect(deterred(w, id('ENG'), id('FRA'), blocs)).toBe(false);
  });

  it("a nation the other bloc guarantees stands as the other bloc does; with fewer than two blocs nobody is held", () => {
    const poland = id('POL');
    expect(deterred(w, id('SOV'), poland, blocs)).toBe(al.guarantorsOf(poland).some((g) => al.allianceOf(g)?.id === al.allianceOf(id('ENG'))!.id));
    al.guarantees.push({ guarantor: id('FRA'), target: id('LIT') });
    expect(deterred(w, id('SOV'), id('LIT'), blocs)).toBe(true);
    expect(deterred(w, id('ENG'), id('SOV'), new Set([al.allianceOf(id('ENG'))!.id]))).toBe(false);
  });
});
