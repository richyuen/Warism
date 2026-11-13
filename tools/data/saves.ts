/**
 * `npm run saves` (ROADMAP R72a, ADR-1001): `replaySaves.ts` bundled by esbuild and run by node, not run under tsx.
 * tsx compiles with `keepNames`, which wraps every function the sim makes in a call that names it: a closure made in
 * a hot loop (`Track.held`'s, each pair of formations each hour) paid it at each call, about a quarter of the 1938h
 * replay's build. The game's own build (Vite) and the unit tests (vitest) keep no names; this runs the same code as
 * they do. The results are the same bit for bit (each year's hash).
 *
 * The bundle is written in `.cache/saves/`, two levels under the root, as the earth's assets are found from the
 * bundle's place (`tools/headless/assets.ts`: `import.meta.dirname` + `../../public/data/earth`).
 *
 * Usage: npm run saves [-- <out dir> [last year]] (as `replaySaves.ts`).
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { buildSync } from 'esbuild';

const root = path.resolve(import.meta.dirname, '../..');
const outfile = path.join(root, '.cache/saves/replaySaves.mjs');
buildSync({
  entryPoints: [path.join(root, 'tools/data/replaySaves.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: `node${process.versions.node}`,
  keepNames: false,
  logLevel: 'warning',
  outfile,
});
const run = spawnSync(process.execPath, [outfile, ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(run.status ?? 1);
