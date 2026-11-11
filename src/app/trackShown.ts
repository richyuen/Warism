import { dateOfTick, type SimDate } from '../shared/calendar';
import type { TrackNext } from '../shared/protocol';

/**
 * The historical track's line under the date (ROADMAP R64f, R65a): the first named event, of the stats' next and the
 * ones after it, whose hour is not behind the shown hour. The stats come once a second and the date every frame, so at
 * the fastest speed the line moves on to the next event at its hour; none is shown only when all the stats carry are
 * past (more than `TRACK_AHEAD` + 1 events within a second).
 */
export function nextShown(next: TrackNext | undefined, tick: number, startDay: number): { note: string; date: SimDate } | undefined {
  if (!next) return undefined;
  const shown = [next, ...next.ahead].find((e) => e.tick >= tick);
  return shown ? { note: shown.note, date: dateOfTick(startDay, shown.tick) } : undefined;
}
