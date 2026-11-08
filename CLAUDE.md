# Warism

Follow `PROMPT.md`. It is the standing brief for this repo (rewritten 2026-11-03 for the work after
the release, ADR-805). Unless the user asks for something else, a request like "continue", "next" or
"go" means: the first unchecked item in `ROADMAP.md`, done as PROMPT.md's "EACH ITEM" says.

Exception: if asked to act as the critic, follow `CRITIC_PROMPT.md` instead. The critic is read-only
on source and writes only to `critic/`.

## State lives in files

There is no memory between sessions. Read:
- `ROADMAP.md`: what is to do, the item at hand.
- `SPEC.md`: §1 and §2, and the sections the item touches; search the rest.
- `PROGRESS.md`: this month's log; read the tail.
- `BLOCKERS.md`: the open entries and the watch list (resolved ones in `docs/BLOCKERS_DONE.md`, searched).
- `DECISIONS.md`: this month's ADRs, newest first; search the rest by number or rule name in
  `docs/history/DECISIONS-<YYYY-MM>.md`.
- `critic/CRITIC_REPORT.md`: the last critic run's findings on the item.

Frozen records, searched and never edited: `PLAN.md`, `docs/PLAN_DONE.md`, `docs/PARITY.md`,
`docs/history/`.

## Commands

- `npm run check`: the gate, sized to what changed since HEAD. It must pass before every commit.
  - Documents only (Markdown, `docs/`), or a clean tree it has passed: nothing to run.
  - Code: typecheck, lint, the unit tests whose imports reach a changed file (`vitest related`; all of
    them when something they stand on changed: `vitest.config.ts`, `tests/helpers/`, `data/`,
    `public/data/`, `tools/headless/`, `package.json`, the lock file), build, the e2e specs that
    changed (all when a helper or the config changed, or the pin of seed 99 moved, ADR-825), and the
    pinned hash of seed 99 when a sim input changed. A test red in a run is run again alone; red twice fails, unless it is on
    `tools/gate/knownRed.json` (machine-only reds, each with a BLOCKERS entry).
  - Run the whole unit suite by hand (`npm test`) when in doubt that the import graph covers a change.
  - Run the specs of what you touch by hand (`npx playwright test <file>`; a perf spec with
    `--project=perf --no-deps`). The pinned state hash of seed 99 after one year is
    `tests/sweep/baselineHash.test.ts`: a rule change updates the pin and logs it in DECISIONS.
- `npm run check:full`: every stage, whatever changed. `npm run check:review`: the same as a release
  check, each stage on its own, a failed test run again alone, resumable.
- `npx tsx tools/diag/replayCritic.ts [--at head|report|<commit>] [--new K] [--jobs P]`: the last critic run's
  headless jobs again, compared with its outputs; `--new K` runs each family on K new seeds (ADR-851).
- `npx tsx tools/diag/seaBattles.ts <seed> [scenario|random] [--years N]`: each sea battle with its place, sides,
  ships and a camera; `tools/diag/seaBattlesLook.ts <its json>` (a preview on 4173) checks each is drawn (ADR-852).
- `npx tsx tools/diag/landingRows.ts [grid|far|page|all]`: the landings bar's rows against the divisions' panels and
  their order news, hour by hour, on the critic's landing cases (ADR-856, ADR-879).
- `npx tsx tools/diag/diploInvariants.ts <seed> [scenario|random] [--heroes] [--world random]`: the
  rules of war and peace on one run, as `tests/unit/diploInvariants*.test.ts` check them (ADR-803).
- `npm run typecheck`: `src/`, `tools/` and `tests/` (a bare `tsc --noEmit -p .` checks nothing).
- Unit tests make each 1938 world after a file's first from a template, and load pure runs from
  `.cache/checkpoints/` (`tests/helpers/checkpoint.ts`; ADR-279). `NOTEMPLATES=1` builds every world.
- `npm run dev`: title screen at `/`; the 1938 world at `/?scenario=1938`, the toy world at
  `/?scenario=toy`; benches at `/bench.html?b=A|P|R`.
- `npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF`: a tick-time measurement
  (`--affinity` pins the run to the performance cores; `--profile` adds the tick by system).
- `npm run sim -- --scenario toy --seed 7 --years 10`: headless runner (`--save` / `--load`).
- `npm run sim -- --scenario random --nations 60 --seed 7 --years 1`: the random world (ADR-108).
- `npm run diag -- --seed 99 --at 5,12,20`: wars and great-power state dumps (`--load` a checkpoint).
- `npm run sweep` (10 seeds × 50 years, report in `docs/sweeps/`; `--first`, `--tag`) and
  `npm run sweep:quick` (10 × 20, report in `.cache/`).
- `npm run soak -- --scenario 1938 --seed 99 --minutes 30 --affinity 0xFFFF`.
- `npm run bench` (`-- G`: the game's frame budgets alone).
- `npm run data` / `npm run data -- --check`: data pipeline. `npm run data -- --previews`: only the
  title screen's scenario images; run it after a change of the 1938 ownership, nation colours or map
  assets.

## Hard rules

- Never commit `reference/` or anything derived from another game's assets.
- Never weaken or delete a test to make it pass; a test goes only with the feature it tests.
- Keep `main` runnable.
- Push every commit (`git push`, ADR-107). A push to `main` deploys the build to GitHub Pages
  (`.github/workflows/pages.yml`): https://richyuen.github.io/Warism/
