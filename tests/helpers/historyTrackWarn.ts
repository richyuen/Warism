import { expect } from 'vitest';
import { historyTrack } from './historyTrack';

/**
 * One of the historical track's other seeds (ADR-950): its broken lines printed as warnings, `WARNING historyTrack`,
 * each one found at a release check a ROADMAP item; it fails only if the track does not run to its end. A file a
 * seed, so the five run side by side (ADR-959).
 */
export function warnTrack(seed: number): void {
  const run = historyTrack(seed);
  expect(run.sim.world.track!.ended).toBe(true);
  for (const l of run.lines) process.stderr.write(`WARNING historyTrack (not a gate failure; ADR-950): ${l}\n`);
}
