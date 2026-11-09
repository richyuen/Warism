import { describe, expect, it } from 'vitest';
import { landingBreaks } from '../helpers/landingInvariants';

// ROADMAP R55c (critic run 56, R56-N2): 24033 (Japan, two groups), orders only in the first 8 days: t173's click of 367,
// in Hokkaido, to China joined the next voyage of a landing that had sailed from port 104, far down Honshu, and 367
// walked there 73 days, past Tokyo. A sailed landing's next voyage at a port other than the division's land's nearest
// is joined only where the march there is within SPLIT_SOONER_HOURS of that to the nearest; else the click is refused.

describe('a click joins a far port\'s next voyage only within a week\'s march of its nearest (ROADMAP R55c)', () => {
  it('24033, orders for 8 days: no division a month in a gathering landing, and 0 broken', () => {
    const notes: string[] = [];
    const lines = landingBreaks({ seed: 24033, setup: 3517, days: 120, orders: 24033, probeDays: [], groups: 2, orderDays: 8, notes });
    expect(lines).toEqual([]);
    const spells = notes.map((n) => /note: (\d+) longest in a gathering landing ([\d.]+) days/.exec(n)).filter((m) => m !== null).map((m) => [Number(m[1]), Number(m[2])] as const);
    for (const [id, days] of spells) expect(days, `${id} days in a gathering landing`).toBeLessThan(30);
  }, 300_000);
});
