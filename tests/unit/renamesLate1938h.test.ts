import { describe, expect, it } from 'vitest';
import { TIMELINE_1938H } from '../../src/sim/scenario1938h';
import en from '../../src/ui/i18n/en.json' with { type: 'json' };

// ROADMAP R84f (critic run 69, R69-N3: names frozen while others change): Egypt stayed "United Arab Republic" from
// 1958 to 1991, and Ceylon, Dahomey, the Congo (Zaire from 1971) and Burma kept their names past the dates they took
// new ones, while Upper Volta became Burkina Faso. Each takes its name on its date (`rename`); at the track's end each
// is called by the name it had then. `historyTrack1938h` holds every rename applied on the scenario's seed.

const EN = en as Record<string, string>;
const CASES: [tag: string, date: string, name: string][] = [
  ['EGY', '1971-09-02', 'Egypt'],
  ['BCO', '1971-10-27', 'Zaire'],
  ['CEY', '1972-05-22', 'Sri Lanka'],
  ['DAH', '1975-11-30', 'Benin'],
  ['BUR', '1989-06-18', 'Myanmar'],
];

describe('the names of the late replay (ROADMAP R84f)', () => {
  it.each(CASES)("%s takes its name on %s and is %s at the track's end", (tag, date, name) => {
    const renames = TIMELINE_1938H.events.filter((e) => e.kind === 'rename' && e.nation === tag && e.date <= TIMELINE_1938H.end!);
    const last = renames.at(-1);
    expect(last?.kind === 'rename' ? [last.date, EN[`nation.${last.as}`]] : []).toEqual([date, name]);
  });
});
