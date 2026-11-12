import { expect } from 'vitest';
import { arsenals, historyTrack } from './historyTrack';

/**
 * One of the historical track's other seeds (ADR-950): its broken lines printed as warnings, `WARNING historyTrack`,
 * each one found at a release check a ROADMAP item; it fails only if the track does not run to its end. A file a
 * seed, so the five run side by side (ADR-959).
 */
export function warnTrack(seed: number): void {
  const run = historyTrack(seed);
  expect(run.sim.world.track!.ended).toBe(true);
  // R69f (ADR-989): at the track's end the arsenals are history's, whatever the seed (a rule, not the luck of one).
  expect(arsenals(run.sim.world)).toEqual(['CCP', 'ENG', 'FRA', 'SOV', 'USA']);
  for (const l of run.lines) process.stderr.write(`WARNING historyTrack (not a gate failure; ADR-950): ${l}\n`);
}
