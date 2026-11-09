import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { filterHistory, NO_FILTER } from '../../src/shared/history';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { historyText } from '../../src/ui/historyText';
import { historyRows } from '../../src/worker/historyRows';
import { assets1938 } from '../helpers/earth';

// ROADMAP R55i (critic run 55, R55-N1): on 26309 France joined Germany's war on Poland as its guarantor and History had
// no row of it; "My wars only", played as France, kept "Germany and France fought at sea" but dropped the declaration
// and the peace, as neither names France. Now a nation a bond calls in has a row ("France joined the war on Poland's
// side, as its guarantor"), and "My wars only" keeps the declaration and the peace of a war it was called into.

const id = (t: string): number => NATIONS_1938.findIndex((n) => n.tag === t) + 1;
const [GER, POL, FRA] = [id('GER'), id('POL'), id('FRA')];

describe('a war joined by a bond is in History, and in My wars only (ROADMAP R55i)', () => {
  it('Germany on Poland: France joins as its guarantor; France\'s wars keep the declaration and the peace', () => {
    const sim = new Sim({ scenario: '1938', seed: 26309, assets: assets1938(SIZE_1938.w) });
    sim.command({ kind: 'declareWar', attacker: GER, defender: POL });
    sim.step(2);
    const war = sim.world.wars.list.find((w) => w.sides[0].includes(GER) && w.sides[1].includes(POL))!;
    expect(war.sides[1], 'France on Poland\'s side').toContain(FRA);
    sim.command({ kind: 'forcePeace', war: war.id });
    sim.step(2);
    const rows = historyRows(sim.world, (n) => `nation.${NATIONS_1938[n - 1]!.tag}`, () => '');
    const joined = rows.filter((r) => r.kind === EventKind.WarJoined).map(historyText);
    expect(joined).toContain("France joined the war on Poland's side, as its guarantor");
    // Only those called in: not the two leaders.
    expect(joined.some((s) => s.startsWith('Germany ') || s.startsWith('Poland '))).toBe(false);
    const mine = filterHistory(rows, { ...NO_FILTER, mine: FRA }, 0).map(historyText);
    expect(mine).toContain('Germany declared war on Poland');
    expect(mine.some((s) => s.startsWith('France joined the war'))).toBe(true);
    expect(mine.some((s) => /peace/i.test(s) && s.includes('Germany') && s.includes('Poland')), mine.join(' | ')).toBe(true);
    // Another nation's wars are not France's.
    const other = filterHistory(rows, { ...NO_FILTER, mine: id('JAP') }, 0);
    expect(other.some((r) => r.kind === EventKind.WarDeclared && r.a === GER)).toBe(false);
  }, 300_000);
});
