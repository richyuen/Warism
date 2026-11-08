import { STATE_FORMAT } from './saveFormat';
import { sectionNames } from './sectionNames';
import STATE_REQUIRED from './stateRequired.json' with { type: 'json' };

/**
 * The sections a load cannot do without (`tests/unit/saveFormat.test.ts` finds and pins them per
 * state format) that the state `bytes` (unpacked) lack, as "name:dtype"; [] when it loads here. What the
 * title screen asks of a save or a scenario file before it offers to start it (PLAN 7.168; critic
 * runs 19–21: a run 10 save and scenario file were offered, and failed only once started). Bytes
 * that do not decode lack them all.
 */
export function missingSections(bytes: Uint8Array): string[] {
  const need = (STATE_REQUIRED as Record<string, string[]>)[String(STATE_FORMAT)] ?? [];
  let have: Set<string>;
  try {
    have = new Set(sectionNames(bytes));
  } catch {
    return need;
  }
  return need.filter((s) => !have.has(s));
}

/**
 * Sections a scenario file of an older version may lack and still start (ROADMAP R53i): each with what the title
 * screen says it became. The worker adds them, zeros (`sim/core/upgrade.ts`). A save is not upgraded: it is a game
 * under way, refused whole (PLAN 7.149).
 */
export const UPGRADABLE_SECTIONS: Readonly<Record<string, 'traits'>> = {
  // Nation traits (ROADMAP R16, ADR-822): a file from before them starts with none, as its nations had.
  'nations.traits:u16': 'traits',
};

/** What a scenario file lacks: the sections it cannot start without, and those added for it (`UPGRADABLE_SECTIONS`). */
export function scenarioGaps(bytes: Uint8Array): { missing: string[]; upgraded: ('traits')[] } {
  const all = missingSections(bytes);
  return { missing: all.filter((s) => !(s in UPGRADABLE_SECTIONS)), upgraded: all.filter((s) => s in UPGRADABLE_SECTIONS).map((s) => UPGRADABLE_SECTIONS[s]!) };
}
