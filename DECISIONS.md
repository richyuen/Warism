# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

> The ADRs before the last release tag are in `docs/history/`: `DECISIONS-<YYYY-MM>.md` (October) and
> `DECISIONS-<release tag>.md` from November on (ADR-805, ADR-918), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).

### ADR-958 · 2026-11-11 · accepted (the user's decision) — After release-2026-11-11: armies on the replay's fronts, Cold War blocs, a start from any date, the replay past 1953
- **Context.** Critic run 63's design objections: the replay's battles of 1942–44 are moved by its stages with no
  armies there (SPEC §7.7, ADR-935), and the world after 1953 forgets the blocs at once (54 wars in two years on the own
  seed). The user's ideas (2026-11-11): do something about the empty fronts; extend the replay; model the Cold War in
  the sim; replace "World, 1938" and "World, 1938 — Historical" by a timeline slider, a start from any point of the
  replay, continuing it or free.
- **Decision** (the user: "that order looks good, and let's include 4"), in this order after Batch 17:
  1. **Armies on the replay's fronts (R66).** The script decides each front's outcome; the armies stand on the
     fronts at each stage and fight there. Where they can be made strong enough to win the stage's outcome by the
     fighting without ill effects on the rest of the replay (`historyMatch1938h`'s and `historyTrack1938h`'s bars
     kept), they should; otherwise the stage moves the line as now (the user's "middle ground").
  2. **Cold War blocs in the sim (R67):** lasting blocs under the strongest powers, war between their leaders held
     back by deterrence, rivalry by proxies; a rule of every game, not the track's.
  3. **A start from any date of the replay (R68):** the timeline slider in place of the two 1938 cards; continue the
     replay or free from there.
  4. **The replay past 1953 (R69).**
- Each is split into lettered parts with their ATs when it is started (ROADMAP's rule).

### ADR-959 · 2026-11-11 · accepted (the user's decision) — The release made shorter; the replay to 1962
- **Context.** release-2026-11-11 took about 5½ hours after the last item: the critic's full run about 1 h 50 m
  (about 720 bulk landing runs re-run because only the track's files had changed), `check:review` 2 h 20 m (its sweep
  stage 22 m, the historical track's six seeds one after another), the soak 30 m, the sweep 32 m, `bench -- G` over
  10 m (most of it the software rasteriser, reported, never judged). The user asked for trade-offs and took the four
  that lose little or nothing (2026-11-11: "Let's do your 1-4").
- **Decision.**
  1. `historyTrack1938h`'s five other seeds a file each (`tests/sweep/historyTrack1938hSeed1-5.test.ts`,
     `tests/helpers/historyTrackWarn.ts`), so they run side by side: the six together 4 m 05 s (22 m before).
  2. `npm run bench -- G --gpu-only` at a release: the GPU's budgets judged as before, the software rasteriser's last
     figures and pictures kept and marked with their date: 31 s with the build (over 10 m before).
  3. No soak of its own at a release: the sweep takes the soak's checks on its way (`tools/sweep/reload.ts`): every
     10 years, the first in year 1 to 10 by the seed, the world saved gzipped, loaded into a fresh sim of another
     seed and saved again to the same bytes; the loaded twin and the world 30 days side by side to one hash, the run
     going on with the loaded one; a NaN or an infinity looked for each year's end; any break fails the sweep. Ten
     seeds and 50 loads where the soak had one seed and 5. Checked: green on a 3-year run; red with the twin nudged a
     tick before the bytes' check, and again after it (the hashes 30 days on). The soak of its own still runs
     every night (`.github/workflows/nightly.yml`, green 2026-11-08 to 11).
  4. The critic carries a bulk set of plain 1938 runs when its two 20-year saves end at the last report's hashes and
     the diff touches nothing under `src/sim/systems/`, `src/sim/ai/`, `src/sim/nav/`, nor `tick.ts` or `sim.ts`
     (`CRITIC_PROMPT.md`).
- **Not taken** (they lose coverage): no full critic run, or one every other release; the e2e beside the critic (the
  CPU shared, timing specs and the critic's measures upset); only the changed e2e specs (the last release's
  `orderRowsTap1938` red was found only so).
- **Also decided:** R69's replay runs to 1962 for now (the user's "let's try 1962").

