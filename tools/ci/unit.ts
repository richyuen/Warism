import { readFileSync } from 'node:fs';
import path from 'node:path';
import { knownRed, splitKnown, unitRedTwice } from '../gate/review';

/**
 * The nightly run's unit tests (ADR-805): the whole suite, a red file run again alone, as the
 * gate's unit stage. Red twice fails the job, except a test on `tools/ci/runnerRed.json` (a budget
 * of time set on the development PC) or on the gate's own list of known reds: those are printed as
 * warnings on the run's page, so a budget missed by far is still seen.
 */

const LIST = path.resolve(import.meta.dirname, 'runnerRed.json');

function runnerRed(): string[] {
  return (JSON.parse(readFileSync(LIST, 'utf8')) as { tests: { id: string }[] }).tests.map((t) => t.id);
}

const red = unitRedTwice();
const { known, unknown } = splitKnown(red, [...runnerRed(), ...knownRed()]);
for (const t of known) console.log(`::warning title=Runner-speed red (tools/ci/runnerRed.json)::${t}`);
for (const t of unknown) console.log(`::error title=Unit test red twice::${t}`);
console.log(`ci unit: ${unknown.length === 0 ? 'green' : 'RED'} (${known.length} on the lists, ${unknown.length} not)`);
process.exitCode = unknown.length === 0 ? 0 : 1;
