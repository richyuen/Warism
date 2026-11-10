# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

> The ADRs before the last release tag are in `docs/history/`: `DECISIONS-<YYYY-MM>.md` (October) and
> `DECISIONS-<release tag>.md` from November on (ADR-805, ADR-918), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).


### ADR-925 · 2026-11-10 · accepted — The track's land: rings at the hour, a cession as land handed over (R62c)
- **Decision.** A `transfer` (to, from, ring) gives the land cells whose centre is inside the lon/lat ring and whose
  owner is one of `from` to `to`, owned and held (`setOwner`, `setController`), as `defect` hands land over: a
  `LandCeded` row for each nation that gave some, a capital in it moved (`relocateCapital`). An `occupy` (by, of,
  ring) sets the holder of those cells only. Rasterised at the event's hour by `forEachCellInRing`, the rule of
  `ownership.json`'s regions (one rule for the start's borders and history's), not baked: a ring is a few points and
  the map's size is the game's. Not through the editor's paint and its undo stack: an event is no edit. A ring that
  takes nothing is passed over (`TrackSkipped`, NoEffect).
- **Consequences.** `trackTerritory1938h.test.ts`. An occupation at peace stands (a probe: 127 of 127 cells held three
  days on); what ends one is the timeline's peace or transfer (R62f-i).

### ADR-924 · 2026-11-10 · accepted — The track's runner: its kinds, by tag, and a save of another timeline (R62b)
- **Context.** ADR-919 (amended) had every event go through `applyCommand`. Of R62b's kinds, a war of the timeline's
  sides has no command: `declareWar` and `forceWar` call in allies and guarantors and drop members by reach and bonds,
  so the sides would be the sim's, not history's; `forcePeace` settles on the score (no white peace); no command gives
  a guarantee; none adds a nation to a war that goes on.
- **Decision.** The kinds a command stands for go through `applyCommand` (annex, puppet, release, alliance join or
  leave; a join to a leader with no alliance makes one). A war of given sides (each leader's puppets with it), a join,
  a white peace (score set to 0, then the sim's `makePeace`: each keeps its own, a truce) and a guarantee are done in
  `src/sim/track.ts` with the war's and the alliances' own parts, with the rows a declaration has (`WarDeclared`,
  `WarJoined` with `JoinedBy.track`, `GuaranteeLapsed`). No command kind is added for the track: the player's API does
  not grow. Events name nations by tag, wars by two of their nations, an alliance by its leader, resolved at the
  event's hour. Each event due by the hour runs in file order right after the hour's commands (`step`), not when
  commands are applied while paused. One refused is passed over: `TrackSkipped` (its first nation, its number, why).
- **A save of another timeline.** The section `world.track` keeps the timeline's hash (canonical, key-sorted: not the
  file's bytes or line ends). A save whose hash is another's is loaded and the track ends at the next hour with a
  `TrackEnded` row (`TrackEnd.timelineChanged`); it does not throw. The timeline will change with R62f-i, each a push
  that deploys: a throw would leave every player's Continue unloadable; ending the track keeps the game, and says why.
- **Its records.** The timeline is validated with every data file by `data-schemas.test.ts` (not by `npm run data --
  --check`, which bakes; R62b's wording amended): date order, after the start, tags of the base's and its own tables.
  The track's own nations are `unborn` (state) until R62d: not in the dead list sent to the UI, so not offered to revive.
- **Consequences.** `trackRunner1938h.test.ts`, the data-schemas case. Plain 1938 has no track: its pin unmoved.

### ADR-923 · 2026-11-10 · accepted — 1938h hidden until its first period (R62a)
- **Context.** R62a's AT asked the title screen to list "1938 — Historical". With no timeline yet, the world it opens
  is plain 1938 under another name, and a push to `main` deploys.
- **Decision.** `hidden` in its `scenario.json` until R62f replays 1938-39; it opens by `?scenario=1938h` only.
  `scenario1938h.test.ts` asserts it hidden; R62f removes both.
- **Consequences.** R62a's AT amended (ROADMAP); no player meets a "Historical" world that is not one (PROMPT rule 6).

### ADR-922 · 2026-11-10 · accepted — History marks the rows that follow one of their hour (R60e)
- **Context.** Critic run 61, R61-N5: on 32019's 2 December 1957 History read "United States made peace with Free San
  Salvador", "Free San Salvador was annexed by United States", "Free San Salvador was destroyed": one hour (t174600),
  logged in that order and shown cause first (ADR-865), but in a list read newest first the peace stood above, "made
  after the nation was gone". Run 51 asked cause first (a release above its "left its war" rows); run 61 read it
  backwards. Both readings come from one list with two directions: newest first by hour, cause first within it.
- **Decision.** ADR-865's order stays. A row that follows the row above in its hour and names a nation the rows it
  follows name (`followsAbove`, `src/shared/history.ts`) is drawn under it: "↳" in the dates' column, its title "The same
  hour, following the row above". Rows of one hour naming no nation in common head their own group. The CSV and JSON are
  unchanged.
- **Not taken.** Reversing each hour (run 51's finding again); merging a peace with its annexation into one row as the
  ticker does (`tickerRows`): the type filter and the exports count each event.
- **Consequences.** `historyHourOrder` (the critic's hour: war, joined; peace, annexed, destroyed), `history1938` (the
  guarantors' rows under Germany's declaration, in the page).

### ADR-921 · 2026-11-10 · accepted — Those a voyage left at the port board first at the next (R59b)
- **Context.** Critic run 60, R60-N2: on 31127 (setup 15101, one group of 25,200 men) 272 reached Cardiff at t423 while
  the group was out, and was told "next voyage, about 4 days". The group came back at t510; 270 and 271, which reached
  the port after it, boarded first by id (two of about 12,200 each fill it), and 272 was left again, sailing at t626,
  8.5 days after its figure.
- **Decision.** At the sail hour a landing's divisions at its port board in `boardOrder`: those its voyages left first
  (`Landing.left`: the tick each stood at the port while the landing was at sea, or stayed there with no room as it
  sailed), the first left first, then the rest, each by id. `noRoom` and R57b's "room for all" check (ADR-909) use the
  same order. A division aboard or out of the landing leaves `left`. Saved as an optional section `world.landingLeft`
  (landing, division, tick), absent while empty, so older saves load and seed 99's pin, with no player landing, holds.
- **Stands on (ADR-803).** ADR-909 (a next voyage's room check, first fit as at the sail hour: the same order on both)
  and R37a/R38e's `NextVoyage` telling (unchanged); R44a's ready hour and R56a's due (unchanged: which divisions are
  waited for is not touched, only the order of those present). Player landings only.
- **Checker (ADR-804).** `landingInvariants`' `leftAgain`: at a sail hour, one that stood at the port while its landing
  was at sea, ashore again while one that did not boarded with room it would fit. Red on 31127 before (t510, 272 for
  270 and 271), 0 after.
- **Consequences.** 272 boards at t510 and its landing is over by t567.

### ADR-920 · 2026-11-10 · accepted (the user's decision) — No critic run before the historical track is built; Batch 14 before it
- **Context.** The user asked for the historical track (ADR-919) while Batch 14 (R59, R60: runs 60 and 61's
  non-blocking findings) was open, and said no critic run is to come before the track is implemented, the order of
  the two batches left to the loop.
- **Decision.** Batch 14 is done first (small items, already filed), then Batch 15 (R62, the historical track).
  Batch 14's end skips its critic run (PROMPT.md "Releases" step 1); the next critic run comes after Batch 15's last
  item and covers both batches, then the release as PROMPT.md says.
- **Consequences.** One critic run and one release for Batches 14 and 15. A user-asked feature joining a batch ahead
  of its critic run is the exception this ADR names, not a new rule.

### ADR-919 · 2026-11-10 · accepted (the user's decision) — The historical track: 1938–1953 replayed as history went
- **Context.** SPEC §1 named "historical railroading" a non-goal: the 1938 start was plausible and history then
  diverged freely. The user asked for a deterministic replay of history, as accurate as the sim allows, and answered
  the design's questions (2026-11-10).
- **Decision (the user's).**
  1. **What:** the real history of 1938–1953 played out in the sim from the 1938 start, the same track every run
     (not a playback of a recorded game).
  2. **How hard:** events and steered AI. Wars, peaces and their terms, annexations, puppets, releases, alliances,
     guarantees, transfers of territory and new nations fire on their dates; the AI's own war and peace choices,
     pacts, coalitions and rival drift are off while the track runs, and its offensives are aimed at each war's
     historical objectives. The fighting is still the sim's: a front may reach its objective days or weeks off
     history.
  3. **Span:** to the Korean armistice (27 July 1953), through the occupation of Germany and Japan, the two
     Germanies, the partition of India, Israel, the Chinese civil war and Korea; then the world runs free under the
     usual rules.
  4. **Nuclear weapons:** Hiroshima and Nagasaki are scripted; the AI's own nuclear decision is off until the track
     ends.
  5. **Intervention ends the track:** the first God Mode act, editor edit or taking of a nation stops it; the
     world is free from then on, and the History says so.
  6. **Entry:** a listed scenario of its own, "1938 — Historical", beside 1938 and Random; plain 1938 is unchanged.
- **Decision (the loop's, within the above).**
  - The track is data: a dated timeline (`data/scenarios/1938h/timeline.json`, our own summary of public history,
    in DATA_SOURCES.md). Its runner, a system right after the hour's commands, applies each due event through
    `applyCommand`, **not** through the command log (amended 2026-11-10, the advisor's review: the log is saved, hashed
    input, and a replay that fed logged track events would apply them twice). A run is reproduced by the timeline and
    the track's saved state (next event, running, the second seed, the timeline's hash), the log staying the player's
    input alone, which is how an intervention is told (R62j). Territory by lon/lat rings, as the 1938 ownership is
    drawn (`ownership.json`).
  - `1938h` is a scenario id of its own built from 1938's files, its new nations appended after 1938's 103 so every
    id of plain 1938 holds and its pin does not move (R62a).
  - "Deterministic": the scenario's seed is fixed and not offered on its form; a run is the same each time.
  - **Reseed at the end (the user's, 2026-11-10):** when the track ends, on 27 July 1953 or early at the first
    intervention, the world takes a second seed and every RNG stream is derived again from it (§2.6), so the free
    world after the track differs from run to run while the track itself does not. The second seed is rolled by
    the new-game form at the start (random once a visit, as the seed is; `?after=` in the URL) and kept in the
    state, so the reseed is part of the run and replays and loads like the rest. Two runs that differ only in it are equal in every
    section but the track's own until the end (the second seed is in that section from the start).
  - **How the land is matched:** by the scenario's own data, never by the shared rules. Borders that changed by
    treaty (Munich, the partitions, Vichy, the post-war borders) are transfers on their date and match by
    construction; land that changed by fighting is reached by steering: each war phase's objectives, dates and the
    historical arrivals of forces (formations placed, buffs for a phase) in the timeline, tuned by period
    (R62c–f) against `historyMatch`. No rule of plain 1938 or the random world changes for the track (ADR-803).
    A period whose bar steering cannot reach is a BLOCKERS entry and a question to the user, not a rule change.
  - Built as Batch 15 (R62, lettered parts) after Batch 14 (ADR-920).
- **Consequences.** SPEC §1's non-goal is narrowed: plain 1938 and the random world still diverge freely; the
  historical scenario does not until the track ends. SPEC §7.7 holds the design. The seed-99 pin of plain 1938 must
  not move for the track's sake beyond a state section it adds (logged in its own commit if so). Its rules join a
  checker run on several seeds (ADR-804).

### ADR-918 · 2026-11-10 · accepted (the user's decision) — The logs rotated at each release tag; the watch list and the diag tools out of the files read
- **Context.** Ten days of November made DECISIONS.md 279 KB (136 ADRs) and PROGRESS.md 206 KB: the month was too
  long a unit for files each session is told to read. BLOCKERS.md's watch list (550 of its 655 lines, mostly from
  October) was read with its open entries. The user asked what the files loaded for context could lose.
- **Decision.**
  1. DECISIONS.md and PROGRESS.md hold what came after the last release tag. In the tag's commit the rest moves to
     `docs/history/DECISIONS-<tag>.md` and `PROGRESS-<tag>.md`, as the batch's items move to `ROADMAP-<tag>.md`
     (PROMPT.md "Releases" step 4). November up to `release-2026-11-10` moved now; October's monthly files stay.
  2. The watch list moved to `docs/BLOCKERS_WATCH.md`, searched, not read.
  3. The `tools/diag/` commands moved from CLAUDE.md to `docs/TOOLS.md`.
- **Consequences.** A session reads a few KB of state instead of ~500 KB; an older ADR or log entry is found by
  search (`grep -rn "ADR-623 " DECISIONS.md docs/history/`), as ADR-805 already asked.
