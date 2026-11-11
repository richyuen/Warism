import { Refusal } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { Breaks, bondsOf, membersOf, silentExits, useTags, worldBreaks } from './diploInvariants';
import { assets1938 } from './earth';

// ROADMAP R62k (ADR-947): the historical track's checker, on any seed, from its start to its end.
//   skip    no timeline event passed over but by rule: one that no longer applies on that seed (a party dead or not
//           born, a war already joined or over, nothing left to do); on the scenario's own seed none at all;
//   course  no war declared and no peace made while the track runs but in an hour of a timeline event, or with a
//           party's death in that hour (the fighting's own: a capital taken, a nation's last land lost);
//   exit, realm, held  the diplomatic rules of `diploInvariants` (ADR-803) through the track, `held` save the land
//           the timeline occupies at peace (an armistice's line, a zone of occupation): its holder is then the
//           timeline's, as its maps' `occupied`.

const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
/** The refusals of an event that no longer applies on a seed (`TrackSkipped`'s why). */
export const BY_RULE: ReadonlySet<number> = new Set([Refusal.DeadNation, Refusal.NoNation, Refusal.AtWar, Refusal.NoEffect, Refusal.Alive]);
const COURSE_KINDS: ReadonlySet<number> = new Set([EventKind.WarDeclared, EventKind.PeaceSigned, EventKind.WarEnded]);
const DEATH_KINDS: ReadonlySet<number> = new Set([EventKind.NationEliminated, EventKind.NationAnnexed, EventKind.NationCollapsed]);

export interface TrackRun {
  /** The broken lines, each kind once (its first hour). */
  lines: string[];
  /** Each event passed over: [its number from 1, why]. */
  skipped: [number, number][];
  /** The hour the track ended (or the last stepped). */
  end: number;
  sim: Sim;
}

/**
 * Runs 1938h on `seed` to the track's end (or `hours`), checked hour by hour; held and realm each day. `meddle` acts on
 * the world before each hour, not by a command (a test of the checker itself: a command would end the track).
 */
export function historyTrack(seed: number = SEED_1938H, hours = Infinity, meddle?: (w: World) => void): TrackRun {
  useTags(tag);
  const sim = new Sim({ scenario: '1938h', seed, assets: assets1938(SIZE_1938.w) });
  const t = sim.world.track!;
  const own = seed === SEED_1938H;
  const due = new Set(t.ticks);
  const breaks = new Breaks();
  const skipped: [number, number][] = [];
  let before = membersOf(sim.world);
  let bonds = bondsOf(sim.world);
  const label = `seed ${seed}`;
  breaks.add(`${label} day 0`, worldBreaks(sim.world).filter((l) => !l.startsWith('held')));
  while (!t.ended && sim.tick < hours) {
    meddle?.(sim.world);
    sim.step(1, (w: World) => {
      const ev = w.out.events;
      const where = `${label} day ${Math.floor((w.tick - 1) / 24)}`;
      const dead = new Set<number>();
      for (let i = 0; i < ev.length; i += 6) if (DEATH_KINDS.has(ev[i + 1]!)) dead.add(ev[i + 2]!);
      for (let i = 0; i < ev.length; i += 6) {
        const [tick, kind, a, b] = [ev[i]!, ev[i + 1]!, ev[i + 2]!, ev[i + 3]!];
        if (kind === EventKind.TrackSkipped) {
          const why = ev[i + 5]!;
          skipped.push([b, why]);
          const e = t.events[b - 1]!;
          if (own || !BY_RULE.has(why)) breaks.add(where, [`skip: event ${b} (${e.date} ${e.kind}${e.note ? `, ${e.note}` : ''}) passed over, why ${why}`]);
        }
        if (COURSE_KINDS.has(kind) && !t.ended && !due.has(tick) && !dead.has(a) && !dead.has(b))
          breaks.add(where, [`course: ${kind === EventKind.WarDeclared ? 'war' : 'peace'} ${tag(a)} and ${tag(b)} (kind ${kind}) in an hour of no timeline event`]);
      }
      breaks.add(where, silentExits(w, before, bonds.overlord, ev));
      if (w.tick % 24 === 0) breaks.add(where, worldBreaks(w).filter((l) => !l.startsWith('held') || !heldByTimeline(w, l)));
      ev.length = 0;
      w.out.fires.length = 0;
      before = membersOf(w);
      bonds = bondsOf(w);
    });
  }
  return { lines: breaks.lines, skipped, end: sim.tick, sim };
}

/** Whether a `held` line ("held: K on O, n cells at peace") is of land the timeline occupies: an `occupy` by K of O's. */
function heldByTimeline(w: World, line: string): boolean {
  const m = /^held: (\S+) on (\S+),/.exec(line);
  if (!m) return false;
  return w.track!.events.some((e) => e.kind === 'occupy' && e.by === m[1] && e.of.includes(m[2]!));
}
