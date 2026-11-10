# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

> The ADRs before the last release tag are in `docs/history/`: `DECISIONS-<YYYY-MM>.md` (October) and
> `DECISIONS-<release tag>.md` from November on (ADR-805, ADR-918), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).


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
    in DATA_SOURCES.md) whose events become ordinary commands at their hour, so they are logged, saved and replay
    like any command (SPEC §2.6). Territory by lon/lat rings, as the 1938 ownership is drawn (`ownership.json`).
  - "Deterministic": the scenario's seed is fixed and not offered on its form; a run is the same each time.
  - **Reseed at the end (the user's, 2026-11-10):** when the track ends, on 27 July 1953 or early at the first
    intervention, the world takes a second seed and every RNG stream is derived again from it (§2.6), so the free
    world after the track differs from run to run while the track itself does not. The second seed is rolled by
    the new-game form at the start (random once a visit, as the seed is; `?after=` in the URL) and kept in the
    state, so the reseed is part of the run and replays and loads like the rest.
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
