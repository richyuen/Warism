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

### ADR-960 · 2026-11-11 · accepted — The "Next" line moves on at Max (R65a, R63-N1)
- **Cause** (critic run 63, `c63_h_blank.mjs`): R64f hides the line while its event's hour is behind the shown hour,
  and the stats that name the next come once a second; at Max the line was blank from each event's hour to the next
  stats, 24.5 % of the samples.
- **Rule:** the stats carry the next named event and up to `TRACK_AHEAD` (8) after it (`TrackNext.ahead`,
  `src/worker/server.ts`); the line shows the first whose hour is not behind the shown one (`nextShown`,
  `src/app/trackShown.ts`); none only when all are past.
- **Measured:** the probe at Max for 120 s (1938 to July 1943): the line in 1,089 of 1,092 samples (99.7 %; 75.5 %
  before), never past, at most 2 blank in a row. `tests/e2e/trackView1938h.spec.ts` "at Max…" now asks ≥ 95 % present
  (red on the code before: 0.77); `tests/unit/trackShown.test.ts`.

### ADR-961 · 2026-11-11 · accepted — The God tab says it ends the replay (R65b, R63-N2)
- **Cause** (critic run 63, `c63_h_godtab.mjs`): the nation's God tab, about 40 controls, said nothing; the Take
  control note was scrolled out, and the bar's "Any act here ends the replay of history." stood under "Map tools", read
  as those tools' alone. One tick of "World AI" ended the replay.
- **Rule:** the God tab has the note at its head while the track runs (`god-tab-ends-track`), and the bar and the tab
  say "Any God Mode act ends the replay of history." (`track.anyGodAct`); the editor keeps "Any act here…".
- **Measured:** `tests/e2e/trackView1938h.spec.ts` ("what ends the replay…"): Germany's God tab's note in view at
  1400 × 800, gone with the replay's end.

### ADR-962 · 2026-11-11 · accepted — Run 63's small findings (R65c)
- **The bar's note red** (`.god-tools-hint.panel-warn`): `.god-tools-hint`'s grey, later in `style.css`, took the
  `panel-warn` red; now red as the panels'.
- **The track's line on a phone:** 0.72 em of the bar was 8.8 px at 390 × 844, 844 × 390 and 667 × 375; 11 px there
  (`max-width: 600px` or `max-height: 500px`), in the same 150 px (the bar does not move; a long name is cut sooner).
- **Manchukuo's triple** (18 August 1945: "Manchukuo was destroyed", "Mengjiang was destroyed", and the note
  "Manchukuo and Mengjiang dissolved: China in name"): a timeline transfer told by its note is not told again as the
  land handed over (its hour) or as a nation it took from destroyed (the hour after) (`transferTold`,
  `src/worker/historyRows.ts`; History and ticker). The note kept, not the game's rows: on the own seed it also
  covers "France freed: the Provisional Government" (Vichy), "The north freed: the Italian Social Republic ends",
  "Xinjiang joins" and "Tibet annexed", whose notes say more than "… was destroyed". The sim unchanged.
- **The grey world at a start:** not a file's alone. Plain 1938 shows the map with no nations for 2.0 s, a file 2.1 s
  (the world built in the worker; its stats are sent at once when it is). "Building the world…" stands over the map
  until the first stats (not in the toy world, which has none).
- **Measured:** `tests/unit/historyTransferTold1938h.test.ts` (red on the rows' code before);
  `tests/e2e/worldBuilding1938.spec.ts` (the notice in every sample with the map drawn and no stats, gone with them);
  the font and the colour by a probe at four sizes and a shot.

### ADR-963 · 2026-11-11 · accepted — A told transfer hides only its own rows (R70a, R64-N3)
- **Cause** (critic run 64, `c64_transfer.ts`): ADR-962's `transferTold` hid any `LandCeded` whose giver a told
  transfer took from, in its hour or the next: on 8 May 1945 "Carpatho-Ukraine, Soviet in fact" (Hungary's land to the
  Soviet Union, 00:00) hid "Czechoslovakia took land from Hungary" and "Yugoslavia took land from Hungary" (01:00).
- **Rule:** a land row is hidden only when its giver and receiver are the transfer's and it is of the transfer's own
  hour; a nation's end, in that hour or the next, as before.
- **Measured:** `c64_transfer.ts` shows both rows again; `tests/unit/historyTransferTold1938h.test.ts` gains the case
  (red on the code before).

### ADR-964 · 2026-11-11 · accepted — The track's line on a phone: short, on two rows (R70b, R64-N1)
- **Cause** (critic run 64, `c64_h_phone.mjs`): ADR-962's 11 px in the same 150 px held ~29 characters, 21 of them
  "Next, 12 March 1938: ": "The An…" (the notes' median is 46 characters; a phone has no hover for the tooltip).
- **Rule:** on a phone (`PHONE_QUERY`) the line reads "12 Mar 1938: The Anschluss" (`bar.trackNextShort`,
  `monthShort.*`) on two rows of a fixed height (the bar does not change its height with the note); the tooltip whole.
- **Measured:** the probe at 390 × 844 and 844 × 390: "12 Mar 1938: The Anschluss" whole (150 of 150 px); "1 Jan 1938:
  Japan's occupation: North China" whole on two rows; `tests/e2e/trackView1938h.spec.ts` asks the line whole at both
  sizes and ≥ 11 px on a phone; the bar's and the phone's layout specs green.

