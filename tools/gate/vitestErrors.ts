/**
 * The gate's reporter for its vitest runs (ROADMAP R231, ADR-1160): the errors vitest caught outside the tests, written
 * as JSON to the file the environment names (`ERRORS_ENV`).
 *
 * vitest fails a run for such an error (a rejection nothing handled, an exception out of a timer, a worker lost) and
 * hands it to its reporters at the run's end; its JSON reporter, whose report the gate reads, leaves it out. This
 * one writes what the gate reads of each (`RunError`); `errorRed` in `review.ts` makes the red ids of them.
 *
 * It is loaded by vitest's own process: nothing here but the file's writing. The gate names the file for each run
 * (`vitest` in `review.ts`); with no file named (a run by hand) nothing is written.
 */
import { writeFileSync } from 'node:fs';
import type { Reporter, SerializedError } from 'vitest/node';

/** The variable that names the file of a run's errors (a full path). */
export const ERRORS_ENV = 'GATE_VITEST_ERRORS';

/** An error of a run outside its tests: what the gate reads of it. */
export interface RunError {
  /** What vitest calls it: 'Unhandled Rejection', 'Uncaught Exception', 'Unhandled Error' (its pool's), … */
  type?: string;
  message?: string;
  /** Its cause's message: the pool's error of a lost worker names the file there. */
  cause?: string;
  /** The test file whose worker it came from (a full path), where vitest knows it. */
  path?: string;
  /** The test that was running then, where one was. */
  test?: string;
}

const text = (v: unknown): string | undefined => (v === undefined || v === null ? undefined : String(v));

export default class GateErrors implements Reporter {
  onTestRunEnd(_modules: unknown, errors: ReadonlyArray<SerializedError>): void {
    const out = process.env[ERRORS_ENV];
    if (!out) return;
    // What is not known of an error is left out of the file as it is written.
    const list: { [K in keyof RunError]: string | undefined }[] = errors.map((e) => ({
      type: text(e['type']),
      message: text(e.message),
      cause: text((e.cause as { message?: unknown } | undefined)?.message),
      path: text(e['VITEST_TEST_PATH']),
      test: text(e['VITEST_TEST_NAME']),
    }));
    writeFileSync(out, JSON.stringify(list, null, 1));
  }
}
