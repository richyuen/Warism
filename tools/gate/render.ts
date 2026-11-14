/**
 * How the browser suite's pages draw (ADR-1029, the user's decision): on the machine's GPU when it
 * has one to give, on SwiftShader (the CPU) otherwise.
 *
 * On Windows the pages take the GPU through ANGLE's Direct3D 11 (`GPU_ARGS`); elsewhere (a cloud
 * container, CI: no GPU) they keep SwiftShader. `E2E_RENDER=software` keeps SwiftShader here too.
 * On the GPU the whole chromium suite took 8.7 min at 8 workers, where SwiftShader at 4 took about
 * 40 min a chunk of 20 spec files (2026-11-13): SwiftShader starves its neighbours of CPU, which is
 * why it is held to 4 workers.
 *
 * A test whose measure is SwiftShader's picture (its pixels or its frame times) carries the tag
 * `@swiftshader` and runs on the `swiftshader` project, as do the perf specs.
 */
import { availableParallelism } from 'node:os';

export const GPU = process.env['E2E_RENDER'] !== 'software' && process.platform === 'win32';

/** Chromium's switches for the GPU (headless Chromium draws on SwiftShader without them). */
export const GPU_ARGS = ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'];

/** Half the cores: at most 8 on the GPU, at most 4 on SwiftShader (PLAN 1.42f: 4 timed UI specs out on a 4-core machine). */
export function e2eWorkers(): number {
  return Math.max(1, Math.min(GPU ? 8 : 4, Math.floor(availableParallelism() / 2)));
}

/** The projects of the browser suite but perf, as `npx playwright test` takes them. */
export const SUITE = '--project=chromium --project=swiftshader';
