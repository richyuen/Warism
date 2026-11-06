# Critic report, run 49 (focused): after R40, "a rising on an overrun overlord is a release; the sinking survives a save; one row for an hour's losses; hero counters at world zoom" and R40e

- **Mode: focused.** I decided this from git before anything else (CRITIC_PROMPT, ADR-804). All three conditions hold:
  - the last report (run 48, `7fda367b`, on `4ebaee76`) has a blocking issue (R48-B1) and a score under its bar
    (naval 7, bar 8);
  - both commits since `7fda367b` name a ROADMAP item that commit filed: `629423e7` "ROADMAP R40: …" and `5da444a8`
    "ROADMAP R40e: …" (R40 and its sub-items R40a–R40e were added to ROADMAP.md by `7fda367b`);
  - the last three reports were not all focused: run 48 was full (runs 47, 46 were focused).
- **Commit judged:** `5da444a8303e16dcbef0776acec9ae401f9d5d2e`, HEAD at the start (`critic/c49_commit.txt`).
  **Date:** 2026-11-06.
- **Rescored afresh:** diplomacy (blocked last run), naval (under its bar), and the dimensions the changed files touch
  (`git diff --stat 4ebaee76 HEAD`: `puppets.ts`, `landings.ts`, `world.ts` (save), `App.tsx`, `orderNewsText.ts`,
  `en.json`, `MapView.ts`, `counters.ts`): map visuals, UI/UX, stability, semantic zoom. **Carried:** emergent dynamics,
  God Mode, editor, stats and history, tanks, aircraft, AI nukes, and performance (the only change on its path is one
  scalar, the hero counter's scale, passed to `counters.draw`; no frame-rate run this time).
- **Build:** `vite build --outDir critic/c49_dist`, exit 0 (`critic/c49_build.log`). Served by `vite preview` on
  127.0.0.1:**5299** (stopped at the end), driven through Playwright Chromium at desk 1600 × 900, phone 390 × 844 and a
  landscape phone 844 × 390.
- **Runs.**
  - **Run 48's named cases**, re-run on HEAD: R48-B1 (diploInvariants 20429 random 10 years, the hourly trace
    `critic/scripts/c49_rise.ts`, the page `critic/scripts/c49_rise_page.mjs`); R48-N1 (`c48_far_save.ts` with and without
    SAVE, and a new `critic/scripts/c49_sunk_save.ts` that does a **real** `sim.save()` + `sim.load()` in the sinking
    hour, where run 48's copy only cleared the set by hand); R48-N2 (`critic/scripts/c49_lost.mjs`, desk, phone, landscape,
    and 6 divisions, now also clicking the merged row); R48-N3 (`critic/scripts/c49_hero.mjs` on run 48's 20471 with
    heroes, desk and phone); landingInvariants 19206, 19207, 19113, 18705, 19111; all of run 47's far and sinking cases
    (`c47_far.ts`, `c47_sunk.ts`); the other ten-year diplomacy seeds 20491, 20493, 20413, 20495; workerDeterminism 3517.
  - **New seeds:** diploInvariants ten years on 20601, 20603, 20605, 20607 (random), 20609 (heroes), 20611 (random world,
    5 years); a rising counter on 20681, 20683 (random), 20685 (scenario) and 20429 (`critic/scripts/c49_risecount.ts`);
    landingInvariants 20621–20635 and 20673, 20675 (one- and two-group pools); new far routes on 20661 (Tokyo→Shanghai),
    20665 (London→Bremen), 20667 (San Francisco→Tokyo); sinkings on 20669 and 20671 with and without a real save;
    worldInvariants 20637, 20639 (heroes); workerDeterminism 20641 (8760 h); page probes Z 20653, sea battles 20655 and
    20657, relations graph 20659 (random diplomacy), hero tags 20651 (3 years), UI and phone.

## Verdict

**R40 fixes R48-B1 and R48-N1 completely, and R48-N2 and R48-N3 in part. No checker reports a broken rule on any seed
of this run (11 ten-year diplomacy runs, 17 landing seeds, 2 world seeds, 2 worker seeds). There is no blocking issue.
Naval stays at 7 (bar 8): nothing new earns an 8. A player still meets a month-long two-division crossing with
no day count (R49-N5) and a cut loss row beside a panel (R49-N3).**

- **R48-B1 is fixed.** 20429 random to day 3650: 0 broken (`critic/c49_diploinv_20429r_10y.log`). At t13104 the events are
  `WarLeft DEI ENG`, `WarLeft DEI NOR`, `PuppetReleased DEI NED`. There is no `WarRejected` and no `PuppetRevolt`
  (`critic/c49_rise_20429.log`). History reads "Dutch East Indies was freed from Netherlands"
  (`critic/shots/c49rise_20429_history.png`). The four other ten-year seeds of run 48 and six new ones are also 0 broken.
- **R48-N1 is fixed.** With a real save and load in the sinking hour, all five 3517 cases and both new seeds tell
  the same news as without one. The set survives the load ("sunk before 1 after 1"; `critic/c49_sunksave_*.json`).
  The far case is told `TransportsSunk` at t273 in both arms (`critic/c49_far_save0.json`, `critic/c49_far_save1.json`).
- **R48-N2 in part.** The two losses are one row now ("2 divisions lost at sea with their transports: …"), and one click
  on it dismisses both. But beside a panel the ticker still shows only one order row, cut before the names
  ("…: Squar…" on desk; on the phone the second name is cut). The at-port division's "landing is over" row is hidden
  until that row is dismissed (`critic/shots/c49lost_desk_rows.png`, `critic/shots/c49lost_phone_rows.png`).
- **R48-N3 in part.** From 10,000 m/px the hero counters are the others' size. But below that they jump to twice the
  size in one step. At a Europe view (5,000–9,999 m/px) "P.100 Ercole" still covers the start of ITALY's name
  (`critic/shots/c49hero_desk_20651_08000.png`). On a phone it is 148 px of a 390-px screen
  (`critic/shots/c49hero_phone_20471_09999.png`).

## Scores

| Dimension | Run 48 | Run 49 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | **Rescored (MapView, counters).** <ul><li>**Better:** at a world view (24,738 m/px on 20471, 1 January 1940) the hero tags are the size of other counters, 55 × 14 px, not run 48's 110 × 28 (`critic/c49_hero_desk_20471.json`, `critic/shots/c49hero_desk_20471_30000.png`).</li><li>**Not 8:** below 10,000 m/px the tags are twice the size again. At 8,000 m/px in 1940 (20651) "P.100 Ercole" covers ITALY's name and "T-42" covers part of TURKEY (`critic/shots/c49hero_desk_20651_08000.png`).</li><li>Carried: the ranking cuts "French Equatorial…", and the relations graph overprints its labels.</li></ul> |
| Diplomacy, war, alliance, puppet, revolt depth | 6 | **7** | **Rescored. Up: R48-B1 fixed.** <ul><li>0 broken on all 11 ten-year runs: run 48's 20429, 20491, 20493 (random) and 20413, 20495 (scenario), and new seeds 20601, 20603, 20605, 20607 (random) and 20609 (heroes). 20611 (random world, 5 years) is also 0 broken (`critic/c49_diploinv_*.log`).</li><li>The new branch is rare and reads true. Over 4 seeds (`critic/c49_risecount_*.log`), 4 risings all came with their war (DEI, AEF and AOF on 20683; DEI on 20685), and 2 were freed: 20429's DEI (refused `Overrun`) and 20681's Sweden from Italy, day 1127 (refused `Truce`; a puppet made by a peace is still in that peace's truce).</li><li>The relations graph on 20659 (random diplomacy) matches the sim on day 0 with no error (`critic/c49_rg_20659_desk.json`).</li></ul> **Not 8:** <ul><li>R49-N2: the ticker tells "Dutch East Indies left its war with United Kingdom / Norway" but not why. The release row is in History only (`PuppetReleased` is not a ticker kind, while `PuppetRevolt` is) (`critic/shots/c49rise_20429_history.png`).</li><li>A freed rising and a loyal puppet's release read alike ("was freed from"); see Design objections.</li></ul> |
| Emergent world dynamics over long runs | 7 | 7 | Carried. Not touched by the diff. |
| God Mode | 7 | 7 | Carried. |
| Editor and scenarios | 7 | 7 | Carried. |
| Stats and history | 7 | 7 | Carried. The History row for R40a was checked in passing: "was freed from" under the type "Puppet released" (`critic/shots/c49rise_20429_history.png`). |
| UI/UX and polish | 7 | 7 | **Rescored (App, orderNewsText, en.json).** **Better:** <ul><li>R48-N2's two rows are now one ("2 divisions lost at sea with their transports: Square infantry division 364, Square infantry division 365.").</li><li>One click dismisses both, and the at-port row shows next (`critic/c49_lost_desk.json` `rowsBeforeClick` / `rowsAfterClick`).</li><li>Six divisions merge the at-port row too ("2 divisions: the transports of their landing were sunk…", `critic/c49_lost_desk6.json`).</li><li>No page error in any c49 page JSON.</li></ul> **Not 8:** <ul><li>R49-N3: beside a panel the merged row is still cut before the names on desk, phone and landscape phone. The at-port division's row is not on the screen until that row is dismissed (`critic/shots/c49lost_desk_rows.png`, `_phone_rows.png`, `_land_rows.png`).</li><li>"their landing … its port": the plural row is half singular (`order.transportsSunkMany`).</li><li>Carried: R39-N2, R39-N3, R40-N2, R32-N3.</li></ul> |
| Performance | 7 | 7 | Carried. The diff's only change on the drawing path is the hero counter's scale, one number. Not measured this run. |
| Stability | 7 | 7 | **Rescored (world save).** <ul><li>R48-N1 fixed: a real save and load in the sinking hour changes nothing the player is told, on 7 cases on 3 seeds (`critic/c49_sunksave_*.json`, `critic/c49_far_save1.json`).</li><li>workerDeterminism: 3517 at 2190 h ends `7e113d94` on every arm, as in runs 46–48. New seed 20641 at 8760 h ends `ff44b2c5` on every arm (`critic/c49_wd_*.log`).</li><li>worldInvariants 20637 and 20639 (heroes): 0 broken.</li><li>landingInvariants: 0 broken on all 17 seeds, 19206 and 19207 included (`critic/c49_li_*.log`).</li><li>No page error in any c49 page JSON (18 page runs).</li></ul> **Not 8:** both of run 48's reasons are gone, but this focused run ran no long page watch. The 8 needs a full run's 12-year watches and save/load in the page on the new build. |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Re-earned on new seeds.** <ul><li>Z 20653: one camera from 6,000 to 3 m/px in 18 steps, with elements from 1,573 m/px, 13,826 individuals at 28 m/px, 4,427 at 3 m/px, and no error (`critic/c49_z_20653.json`).</li><li>Sea battle 20655 (Germany against Romania, Baltic, day 29): the ring and both labelled groups at 600 and 150 m/px (`critic/shots/c49sc_20655_click.png`, `_150m.png`).</li></ul> **Seam found (R49-N1):** hero counters double in size between 10,001 and 9,999 m/px, with no blend (55 × 14 → 110 × 28 px, `critic/c49_hero_desk_20471.json`; `critic/shots/c49hero_desk_20471_10001.png` against `_09999.png`). Every other counter keeps its size there, so this is one element's seam. Not enough alone to drop the 8. |
| Naval warfare (needs 8) | 7 | **7** | **Rescored.** **Better:** <ul><li>R48-N1 fixed (above). R48-N2 in part.</li><li>R47-N4 / R39e: landingInvariants 19206 and 19207 are 0 broken. This is under ADR-835's new `stuck` (a stall is no ground gained, the user's decision). Its notes say what the old rule saw: 19206's 367 waited 46.0 days in a gathering landing, 3.5 with no ground (`critic/c49_li_19206_jap.log`).</li><li>All 15 new landing seeds are 0 broken, the one- and two-group pools included.</li><li>All of run 47's sinkings tell what they told on `4ebaee76` (`critic/c49_sunk_3517_*.json`).</li><li>New routes: London→Bremen (20665), two divisions ashore in 5.8 days. San Francisco→Tokyo (20667): repulsed at Tokyo at t548 (`LandingRepulsed`), then home, ashore in Alaska at t871 (`critic/c49_far_2066*.json`).</li></ul> **Not 8:** nothing new in this run earns an 8 (a score above 7 needs explicit evidence). The fixes remove run 48's two reasons, but they add no new strength. The execution problems a player meets: <ul><li>R49-N3: the cut loss row beside a panel (UI row above).</li><li>R49-N5: a two-division click from Tokyo to Shanghai (20661) took 26.3 days. Both groups were at Tokyo by t74, but the landing waited 21 days for its second division, which marched 22 cells at about one a day (`critic/c49_far_20661_jap_sh.json` trace). R39e's "one click lands together" makes this the rule's own result. Still, the player watches a 5-day crossing take a month, and the click does not say for how long.</li><li>For the record, not as a defect: R49-N4. The checker's notes on new seed 20621 say "364 made landing 3 at Weihai, 18 days to its water; by Rizhao 10 (within R38d's gate)" (`critic/c49_li_20621_jap.log`), as 18705 does (Lianyungang 20, Shanghai 7). That is R38d's rule within its gate (ADR-835) and the builder's open R41, reproduced, not a new fault.</li></ul> |
| Tanks (needs 8) | 8 | 8 | Carried. |
| Aircraft (needs 8) | 8 | 8 | Carried. |
| AI nuclear use (needs 8) | 8 | 8 | Carried. |

## Blocking issues

None. Every rule checker run (diploInvariants on 11 ten-year seeds, landingInvariants on 17 seeds, worldInvariants on 2,
workerDeterminism on 2) reports 0 broken, and no case of run 48 is worse.

Naval is still 7 against a bar of 8, so no release. Under ADR-804 the next run may be focused. After a clean focused
run, a full one must follow before a release.

## Non-blocking issues (prioritised)

1. **R49-N4 (naval, the builder's open R41, reproduced on a new seed).** Within R38d's 20-cell gate, a lone landing is
   taken to a far port's free group by rule (ADR-835), though a call to the nearer port lands sooner:
   - 20621 t526: Weihai 18 days, Rizhao 10;
   - 18705 t784: Lianyungang 20, Shanghai 7.

   Both are from the checker's notes (`critic/c49_li_20621_jap.log`, `critic/c49_li_18705_jap.log`). This is the
   recorded rule and an open item, not a new fault, so it lowers no score. **Fix:** ROADMAP R41 (one port for a click
   first, then drop the gate).
2. **R49-N3 (UI).** The merged loss row is still cut beside a panel:
   - desk: "2 divisions lost at sea with their transports: Squar…";
   - phone and landscape phone: the second name is cut;
   - the at-port division's "landing is over" row is not on the screen while that row stands.

   Evidence: `critic/shots/c49lost_desk_rows.png`, `critic/shots/c49lost_phone_rows.png`,
   `critic/shots/c49lost_land_rows.png`. **Fix:** let an order row wrap to two lines beside a panel, or show the
   count with the names in its tooltip, and show more than the last order row.
3. **R49-N1 (zoom, map).** Hero counters jump from 1× to 2× at 10,000 m/px with no blend, and stay 2× at a Europe view,
   where they still cover nation names. "P.100 Ercole" is 148 px wide; on a phone that is 38 % of the screen.
   Evidence: `critic/shots/c49hero_desk_20471_10001.png` against `_09999.png`, `critic/shots/c49hero_desk_20651_08000.png`,
   `critic/shots/c49hero_phone_20471_09999.png`. **Fix:** blend the scale over a range (for example 1× at 10,000 to 2×
   at 3,000 m/px), and size it by screen width as well as metres per pixel.
4. **R49-N2 (diplomacy readability).** The ticker tells a freed rising's effect, "Dutch East Indies left its war with
   United Kingdom" and "…with Norway", without its cause. "Was freed from Netherlands" is in History only, because
   `PuppetReleased` is not a ticker kind (`src/shared/history.ts`, `PuppetRevolt` is). Evidence:
   `critic/shots/c49rise_20429_history.png`, where the ticker at the bottom left has the two "left its war" rows.
   **Fix:** tick `PuppetReleased`, or at least the release that ends a rising.
5. **R49-N5 (naval feel).** Tokyo→Shanghai with two divisions (20661) took 26 days, 21 of them waiting at the port for a
   marching sibling (`critic/c49_far_20661_jap_sh.json`). This is the design (R39e). The player needs the wait told in
   days at the click, as the sibling wait elsewhere is.
6. `order.transportsSunkMany` mixes number: "the transports of their landing were sunk, and no others can come to its
   port" (`critic/c49_lost_desk6.json`).
7. Carried, unchanged: R44-N3, R46-N5, R37-N3, R37-N4, R32-N3, R40-N2, R39-N2, R39-N3, R36-N3, R32-N2, R31-N1, R31-N6,
   R32-N5, R39-N4; the ranking cutting long names; the relations graph's overprinted labels.

## Run 48's cases re-run

| Run 48 case | `4ebaee76` (run 48) | HEAD `5da444a8` | Evidence |
|---|---|---|---|
| **R48-B1** diploInvariants 20429 random 3650 | 1 broken: `rise` DEI/NED day 546 | **fixed:** 0 broken | `critic/c49_diploinv_20429r_10y.log` |
| R48-B1 trace t13104 | `PuppetRevolt`, `WarRejected DEI NED` | `WarLeft` ×2, `PuppetReleased DEI NED`, no `WarRejected` | `critic/c49_rise_20429.log` |
| R48-B1 page | "Dutch East Indies rose against Netherlands", no war | History "was freed from Netherlands"; ticker shows only the two "left its war" rows (R49-N2) | `critic/c49_rise_page.json`, `critic/shots/c49rise_20429_history.png` |
| Ten-year 20491, 20493 (random), 20413, 20495 (scenario) | 0 broken | 0 broken | `critic/c49_diploinv_*_10y.log` |
| **R48-N1** far case with save | no `TransportsSunk` after the load | **fixed:** `TransportsSunk` at t273 with and without the save | `critic/c49_far_save0.json`, `critic/c49_far_save1.json` |
| **R48-N1** case B (n3k2) with save | `855 refused 366 reason 6` | **fixed:** `855 transportsSunk 366`, after a real save and load | `critic/c49_sunksave_3517_n3k2.json` |
| **R48-N2** two lost at sea, beside a panel | one order row, cut, 364 not on screen | one merged row naming both, but still cut before the names (R49-N3); one click dismisses both | `critic/c49_lost_desk.json`, `critic/shots/c49lost_desk_rows.png` |
| **R48-N3** hero tags at world zoom | 110 × 28 tags over Europe | 55 × 14 from 10,000 m/px; 2× below (R49-N1) | `critic/c49_hero_desk_20471.json` |
| **R47-N4 / R39e** landingInvariants 19206, 19207 | 1 broken each (`stuck`) | 0 broken under ADR-835's `stuck` (367: 46.0 days gathering, 3.5 without ground, in the notes) | `critic/c49_li_19206_jap.log`, `critic/c49_li_19207_jap.log` |
| 19113, 18705, 19111 | 0 broken | 0 broken (18705: one `farPort` note within the gate, R49-N4) | `critic/c49_li_19113_eng.log`, `critic/c49_li_18705_jap.log`, `critic/c49_li_19111_jap.log` |
| Run 47's far cases (USA Chicago→Norwich, Moscow→Cyprus/Gotland, Königsberg→Norwich) | as reported in run 48 | identical: the same events and landing hours as run 48's `c48_far_*.json` on all four (Gotland lands at t1104; Königsberg ashore at t150) | `critic/c49_far_usachi_eng.json`, `critic/c49_far_sov*.json`, `critic/c49_far_gerkon_eng.json` |
| Run 47's sinkings n3k1, n3k2, n4k2, n5k3, n2k0 and both partials | `transportsSunk` / `lostAtSea` | the same news, hour for hour | `critic/c49_sunk_3517_*.json` |
| workerDeterminism 3517 (2190 h) | `7e113d94` | `7e113d94` on every arm | `critic/c49_wd_3517_2190.log` |

## Design objections (none blocking, no score lowered)

- **ADR-834 tells two different events with one row.** A disloyal puppet whose rising is refused (its overlord
  overrun, or a truce) and a loyal puppet let go above autonomy 90 both read "X was freed from Y". The first is a
  beaten overlord losing a subject. The second is a peaceful parting. A player reading History cannot tell them
  apart. For the first, "broke free from" would keep ADR-834's law and tell the truth.
- **ADR-835's `stuck` lets a 46-day gathering pass,** because a sibling on the march gains ground. Nothing hides it
  (the notes print it), and a planted stall is still caught. But the player's experience is the 46 days, and no rule
  now bounds it.

## Ideas from other games (not scored)

- Hearts of Iron fades unit counters' size with zoom over a range, never in one step: R49-N1's fix.
- Europa Universalis words an independence won from a collapsed overlord differently from a subject released by
  treaty: the design objection above.

## Strengths (verified)

- **R40 is precise and holds.** Every one of run 48's cases moved only where R40 meant it to. The worker hash of 3517 is
  unchanged at `7e113d94`. 11 ten-year diplomacy runs, 17 landing seeds and 2 world seeds are 0 broken
  (`critic/c49_diploinv_*_10y.log`, `critic/c49_li_*.log`, `critic/c49_wi_*.log`).
- **The save fix is real, not a test artefact.** A true `sim.save()` + `sim.load()` in the sinking hour gives the same
  news, hour for hour, on 7 cases on 3 seeds (`critic/c49_sunksave_*.json`).
