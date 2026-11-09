# MISSION

Warism is a browser-based grand-strategy world war simulator: a mostly AI-driven world from 1938
(or a random world) that the player watches, steers with God Mode and edits, with five things at its
heart: true semantic zoom down to single units, naval warfare, armour, air power and an AI that can
build and use nuclear weapons. It was released on 2026-11-03 (`release-2026-11-03`).

This brief is for the work after that release (rewritten 2026-11-03, ADR-805, the user's decision).
The build's earlier brief, its DONE CONDITION and its phased plan are in git history and in the
frozen PLAN.md; Ages of Conflict, the game it was first measured against, is a source of ideas, not
a yardstick.

Write all code, art and data yourself or from permissively licensed sources. Never copy another
game's assets or code.

# THE GOALS (what a change is judged by)

1. **Fun to watch.** The world keeps changing for decades: wars start and end, powers rise and
   fall, alliances and puppets form and break, and something is always worth zooming into.
2. **Readable.** At every zoom a player can tell what is happening and why: who fights whom,
   what a panel's number means, why a button is greyed.
3. **Rules that agree.** The sim's rules hold together: no state that two rules forbid between
   them, checked by the checkers on many seeds (`tests/helpers/diploInvariants.ts` and its kin).
4. **Stable.** No crash, no desync; save and load bit-identical; seeded runs deterministic.
5. **Fast.** ≥ 60 fps at world zoom with 100+ nations, ≥ 30 fps at tactical zoom with 10,000+
   unit sprites, on the machine the budgets were set on (`npm run bench`); a tick within its
   budget (`npm run sim -- --affinity 0xFFFF`).

# FILES

- `ROADMAP.md`: what is to do, top-down, each item with its acceptance test. "continue", "next" or
  "go" means: the first unchecked item.
- `SPEC.md`: how the game works (§1 and §2 first, the rest by section; searched).
- `DECISIONS.md`: this month's ADRs, newest first; earlier months in `docs/history/` (searched).
  Every design choice, new or changed rule or bound, and change of process gets an ADR; the user's are
  marked so. An item that only mends a rule an ADR already states gets none: its ROADMAP tick and its
  PROGRESS.md entry carry it, with the ADRs it stands on (ADR-914).
- `PROGRESS.md`: this month's log, newest last (read the tail); earlier months in `docs/history/`.
- `BLOCKERS.md`: open problems and the watch list; resolved ones in `docs/BLOCKERS_DONE.md`.
- `CHANGELOG.md`: what each release brought, for players.
- `critic/CRITIC_REPORT.md` and `.json`: the last critic run.
- Frozen records, searched only: PLAN.md, `docs/PLAN_DONE.md`, `docs/PARITY.md`.

# EACH ITEM

1. Read SPEC §1–§2 and the sections the item touches, the item in ROADMAP.md, the tail of
   PROGRESS.md, BLOCKERS.md's open entries, and the last critic report's findings on the item.
2. `npm run check` on the clean tree. If anything is broken, fixing it is the only task.
3. If the item is too big for one sitting, split it in ROADMAP.md into lettered parts (one level).
4. A change of a sim rule first checks the decisions it stands on (ADR-803): search DECISIONS.md,
   `docs/history/` and SPEC.md for the functions and rules it touches, and list in the item's
   evidence the accepted ADRs and SPEC lines it could contradict. Each gets a test that is green
   before and after, or the change waits and the conflict goes to the user as a question in
   DECISIONS.md.
5. A feature that brings rules adds them to a checker run on several seeds, as
   `tests/helpers/diploInvariants.ts` checks war and peace (ADR-804). A rule nothing checks together
   with the others is the next critic run's finding.
6. Implement it fully: no stubs, no TODOs, no faked features.
7. Verify for real: unit tests; for anything drawn, the dev server and Playwright, screenshots at
   several zooms, looked at. Run the specs of what you touch by hand (`npx playwright test <file>`)
   and name them in PROGRESS.md.
8. When touching the sim or rendering, check the budgets of goal 5 and log any change in tick or
   frame time with numbers.
9. `npm run check` green, then commit, tick the item in ROADMAP.md with its commit and evidence,
   append to PROGRESS.md, push (`git push`: a push to `main` deploys to GitHub Pages).
10. An item that fails three attempts, or whose run misses its AT's bar, gets a BLOCKERS.md entry
    (the bar, what moved, what is left) and the loop takes the next item. The cause found becomes a
    ROADMAP item of its own.

# RELEASES (ADR-804, ADR-805)

Items come in batches (a ROADMAP section). After the last item of a batch:
1. Spawn the `critic` subagent with no hints, wait for it, check that its report names HEAD, commit
   `critic/` with a line in PROGRESS.md (scores, blocking count). Git takes only its report, JSON,
   scripts and scenario files; its logs and dumps stay on disk (`.gitignore`, ADR-914). That commit carries `critic/`,
   PROGRESS.md, ROADMAP.md and DECISIONS.md only; a fix is a commit of its own.
   For each dimension under its bar, that commit also files every design objection and idea of the report
   in that dimension, and its "what the bar needs", as a one-line ROADMAP entry: taken, or the reason it
   is not (ADR-843).
2. Each blocking issue becomes a ROADMAP item before the release item; fix them, then the critic
   runs again (it decides itself whether the run is full or focused).
   **The exit (ADR-829).** The loop stops, and writes an ADR "proposed, the user's decision" that names
   the structural options (a redesign, taking the feature out of the release, the bar), when:
   - one dimension is under its bar, or blocks, in three critic runs in a row; or
   - a blocking issue is a regression of an item ticked since the last release (a fix that broke
     another); or
   - a run has no blocking issue and a score under its bar (step 3 cannot start).
   The next message to the user starts with it; the loop takes no item of that dimension until the
   user decides.
   Not for naval (ADR-833, the user's decision, 2026-11-06): its blocking issues and its non-blocking
   ones are items, fixed, then the critic again, until it is at its bar; before each critic run the
   critic's own probes (`critic/scripts`) are replayed on the code and what they find is fixed first.
   A naval batch takes only the items its report's commit filed, so the next run can be focused; an
   item the user adds, or one the batch finds, waits for the batch after unless the user says it comes
   first (ADR-914).
3. On a full report with no blocking issue and every score at its bar: `npm run check:review`, the
   soak (`npm run soak -- --scenario 1938 --seed 99 --minutes 30 --affinity 0xFFFF`), the sweep on
   unseen seeds (`npm run sweep -- --first <seed> --tag <name>`: borders still moving at the end
   on every seed), and `npm run bench -- G` (budgets PASS). A check that fails becomes a ROADMAP item.
4. When all hold: a CHANGELOG.md entry, then tag the commit `release-<YYYY-MM-DD>` (`git tag -a`,
   `git push --tags`).

A feature the user asks for during a batch joins the next batch, unless the user says it comes first.

# KEEPING WORK SHORT

- One cause per commit.
- An acceptance test names a number and a stop: the figure, its bar and the run that reads it.
- An AT for an order, a click or a timing sweeps its parameters, not one point (ADR-829): the hour
  (e.g. 6 h, 1, 2, 3, 5 days), the cell offset, which unit (the one aboard, one walking, all), how
  many, on two seeds, as R27c's fuzz does. Most of runs 34–43's blocking issues were a ticked item's
  own case with one of these moved (R31e's AT recalled at one day; the critic at 2, 3 and 5).
- A change of a checker's reading (`tests/helpers/*Invariants.ts`, `tests/helpers/slowClick.ts`) or of a
  landing rule runs `npx tsx tools/diag/landingFuzz.ts` (300 runs on seeds no one has used, about half an hour) in its own
  item, and what that exposes is fixed in the same batch, not found by the critic (ADR-914). So does the
  last item of a naval batch, before the critic runs.
- A rule a fix adds is checked with the rules beside it: the feature's checker (step 5) runs on the
  fix, and a case the critic found goes into the checker or the fuzz, not only into one test.
- Tune on small runs: `npm run sweep:quick` (10 seeds × 20 years); the full sweep once per item,
  on the final code, on seeds no tuning has seen.
- Gate before a long run, never after.
- Diagnose from checkpoints (`npm run sim -- --save` / `--load`); a checkpoint is valid only for
  the code that wrote it.
- No hand-run hashes: `tests/sweep/baselineHash.test.ts` pins seed 99 after a year. A rule change
  moves the pin in its own commit, with the old and new hash and the reason in DECISIONS.md.
- Simulation speed is iteration speed: a slower tick is logged with numbers.

# TECH CONSTRAINTS

- TypeScript + Vite, static hosting, no server. WebGL rendering.
- The sim is pure, deterministic and seeded, separate from rendering, run in a Web Worker; fixed
  timestep. Save and load round-trip bit-identical.
- Data-driven: units, nations, maps and techs in JSON.
- vitest for sim logic, Playwright for the browser, ESLint and strict tsc.

# RULES

- Correctness over speed; never tick an item that is not verified.
- Never weaken or delete a test to make it pass. A test goes only with the feature it tests.
- Keep `main` runnable; push every commit.
- Never commit `reference/` or anything derived from another game's assets.
- Record every data or art source and its licence in DATA_SOURCES.md.
- Ask no questions during the work; make the best decision and record it in DECISIONS.md. A
  decision that only the user can make (a change of goal, of process, or a missed bar) is written
  as an ADR marked "proposed, the user's decision", and the next message to the user starts with it.
- Never act as the critic, and never edit anything in `critic/` but by committing its output.
