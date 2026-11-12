import { it } from 'vitest';
import { warnTrack } from '../helpers/historyTrackWarn';

// ROADMAP R62k (ADR-947, ADR-950): the historical track's checker on seed 4, a warning of what it finds (ADR-959: a
// file a seed, run side by side).
it('seed 4: a warning of what the checker finds, the track run to its end', () => warnTrack(4), 1_800_000);
