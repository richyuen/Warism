# Critic report, run 65 (focused): Batches 18–19 (R66–R72) and run 64's findings

- **Mode: focused.** The spawning message did not ask for a full run ("Run the critic per CRITIC_PROMPT.md on the
  current HEAD"). Run 64 had no blocking issue and every score at its bar. This run scores afresh the dimensions the
  changed files touch and carries the rest from run 64.
- **Commit judged:** `5ee3e0350fbc2b3ee2ad484f9123e0c3c06b1c80`, HEAD at the start, on a clean tree
  (`critic/c65_commit.txt`).
- **What changed since run 64 (`a90c7f57`):** 49 commits, 39 files under `src/`, `data/` and `tools/`.
  - R70: run 64's findings (the phone line, the 8 May 1945 rows, the paused start's bar, `TRACK_AHEAD` 16).
  - R66: armies on the replay's fronts. Touches `operational.ts`, `layers.ts`, `combat.ts`, `territory.ts`,
    `playerOrders.ts`, `economic.ts` and `track.ts`.
  - R67: NATO and the Eastern Bloc, lasting blocs, deterrence and proxy aid (`strategic.ts`, `nuclear.ts`).
  - R68: a start from any year of the replay. The card's slider, `?year=&mode=`, `leaveTrack`, and the yearly starts
    built at deploy.
  - R69 and R71: the replay runs to 31 December 1975. They add regime change, rebels as nations, the timeline's bombs,
    and 14 post-war techs (`data/tech/postwar.json`, for every game).
  - R72: a faster tick (`findBattles`, `Track.held`) and the starts built from a bundle.
- **The sim changed** (`git diff --stat a90c7f57 HEAD -- src/sim data public/data` is not empty).
  - So run 61's bulk sets and Malta's 18 are due and re-run.
  - The plain 1938 runs are not carried either: the diff touches `src/sim/systems/` and `src/sim/ai/`.
- **Scored afresh:**
  - `diplomacyWarDepth`, `emergentDynamics`, `editorScenarios`, `statsHistory`, `uiUxPolish`, `performance`,
    `stability`, `naval` and `aiNukes`: their files changed or their sets were due.
  - `mapVisuals`: the new nations' flags and the 1953–75 maps.
  - `godMode`: `playerOrders.ts` and the God act from a year's start.
- **Carried, with evidence:**
  - `semanticZoom`: no file under `src/render` changed.
  - `tanks` and `aircraft`:
    - `combat.ts` changed in two ways. R72c is a speed-up. R66d's `holdsAt` window acts only while the track steers.
      Every named headless case is text-identical (below).
    - ADR-994's techs of 1955–70 give second- and third-generation tanks, jets and SAMs to every game. They are not
      judged here (left out for time; below).
- **Setup:**
  - Build: `vite build --outDir critic/c65_dist`, exit 0 (`critic/c65_build.log`).
  - The yearly starts: `npm run saves -- critic/c65_starts`, 38 years, 518 s while other jobs ran
    (`critic/c65_saves.log`), copied into the build. The ones in `public/` are gitignored and stale: they were built
    before R71 and stop at 1963.
  - Server: `vite preview` on 127.0.0.1:5365. Browser: Playwright Chromium at 1600 × 900, 390 × 844, 844 × 390,
    932 × 430, 1024 × 500 and 667 × 375.
  - Probes: `critic/scripts/c65_*`. Run 64's probes are copied, and those that clicked the old "World, 1938 —
    Historical" card now click the 1938 card and "Replay history".
  - New probes: `c65_x_replaycard`, `c65_x_lateworld`, `c65_x_trackend`, `c65_x_stage`, `c65_x_vietnam`,
    `c65_h_god70`, `c65_an_ainuke` (year starts), `c65_x_badyear`, `c65_x_badyearsave`, `c65_x_places`, and the
    headless `c65_freeburst.ts` (with `c65_freeburst.sh`), `c65_endhours.ts`, `c65_traits.ts`, `c65_landof.ts`,
    `c65_nukes75.ts`, `c65_cell.ts` and `c65_bulkcmp.sh`.
  - Chains: `c65_runNamed.sh`, `c65_chainBulk.sh`, `c65_suite.sh`, `c65_suite2.sh`, `c65_chainE.sh`, and
    `c65_chainP.sh` (performance, alone).
  - My preview and every browser and job I started are stopped.
- **Left out for time:**
  - the zoom, sea-battle and landing page probes, and seaBattlesLook (semanticZoom is carried; the naval figures come
    from the checkers);
  - the 12-year watches and the top-three census;
  - `npm run bench -- G`;
  - a paired timing of R72's claim against `fa16420b`. I matched R72's hashes, not its time;
  - a look at tanks and aircraft in a world after 1955 (the post-war techs);
  - run 64's new seeds: diploInvariants 36001/3/5, worldInvariants 36007, the track 36301/36303. New seeds 37xxx were
    run instead;
  - the God tab at 390 × 844, and the building overlay on starts other than a year's.

## Verdict

**One blocking issue, B1:** a start from a year that cannot be loaded lands on the title with no notice. If a saved
game exists, the title blames that healthy save and hides its Continue. This contradicts SPEC's "refused (the
title's notice)".

Every dimension is at its bar. `diplomacyWarDepth` and `editorScenarios` fall from 8 to 7, still at their bar of 7.

- **The rule checkers on new seeds:**
  - `landingInvariants` via `landingFuzz --seeds 15 --first 37101`: **0 of 90 runs broken**
    (`critic/c65_landingFuzz.log`, `.cache/landingFuzz/5ee3e035-37101/`).
  - diploInvariants, 5 years each, 0 broken: 37001 (1938), 37003 (random) and 37005 (1938, heroes)
    (`critic/c65_diploinv_370*.log`).
  - worldInvariants, every rule set, 5 years each, 0 broken: 37007, 37009 and 37011 (heroes) (`critic/c65_wi_370*.log`).
  - The track's checker, now to 31 December 1975: 0 broken lines on 1938, 37301 and 37303. Every watched nation is
    born, VIE (1954) among them (`critic/c65_track_*.log`).
  - `trackFronts` (R66) on new seed 37701: of 24 large land fronts, 21 have both sides near and 12 are engaged at the
    stage's hour. The bars are 2/3 and 9 (`critic/c65_tf_37701.log`).
- **All of run 64's findings are fixed on the probes that found them:**
  - R64-N1: the phone line now reads "12 Mar 1938: The Anschluss" whole, at 390 × 844 and 844 × 390;
  - R64-N3: "Czechoslovakia took land from Hungary" and "Yugoslavia took land from Hungary" are back;
  - the "Next" line: 0 blank in 1,077 samples at Max;
  - the paused start's bar says "Paused" from the first frame.
- **The replay to 1975 plays, and its starts are sound:**
  - the three years I started (1960, 1965, 1975) were at their date in 3.7–4.3 s, under load;
  - the 38 yearly starts I built on Windows have the same hashes as the deployed Linux build's `years.json`;
  - a 1965 start watched to 1977 ran at 58.4–60.2 fps;
  - the history it tells is the period's.
- **But the world it hands over at the end of 1975 is not the world of 1975:**
  - **R65-N2:** in the track's last hour India joins NATO, and NATO goes to war with Yugoslavia.
  - **R65-N1:** Japan and Italy keep their 1938 aggression and militarist traits to 1975. This is old: run 64's build
    shows it after 1953.
  - **R65-N3:** a free game opens with a burst of wars.
  - **R65-N5:** stale names.
- **Normandy is still painted on an empty coast (R65-N4):** no German army is in France in June 1944. The user's bar
  for R66 covers land fronts only, so this is execution under the design, not a broken rule.

## Scores

| Dimension | Run 64 | Run 65 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Scored afresh.** <ul><li>The 1960, 1966, 1969 and 1976 world and Europe maps read cleanly. The new states have their flags and labels, the Vietnam War's lines read at 1,000 m/px, and the US divisions sort into rows at 250 m/px (`critic/shots/c65rc_1960_replay_1600x900_start.png`, `critic/shots/c65lw_1965replay_4242_15_world.png`, `critic/shots/c65lw_1965replay_4242_03_europe.png`, `critic/shots/c65vn_1968_1000.png`, `critic/shots/c65vn_1968_250.png`).</li><li>The AI's H-bomb near Ulan Bator: the alert, "Go to", and the burst among the chips (`critic/shots/c65an_y1975_6161_0_goto.png`).</li></ul> **Not 9:** <ul><li>The labels of 1966 read "Gießen" for West Germany's capital and "Burgos" for Spain's, and "Anglo-Egyptian Sudan" ranks 9th in 1975 (R65-N5; `critic/shots/c65lw_1965replay_4242_03_europe.png`).</li><li>The ranking's Land figure has no unit (old).</li></ul> |
| Diplomacy, war, alliance, puppet, revolt depth | 8 | **7** | **Scored afresh. At its bar of 7.** <ul><li>Every checker passes:<ul><li>diploInvariants 3 new and 3 named at 0; the named ones are text-identical to run 64's;</li><li>worldInvariants 3 new and 2 named at 0;</li><li>the track to 1975 at 0 broken lines on 3 seeds.</li></ul></li><li>The blocs hold as R67 claims. On new seeds 37601 and 37603 both stay whole (SOV 8/8; USA 14/14 and 15/15), and the days with their leaders on opposite sides of a war are 0. Each leader aids many nations: SOV 247 and 298 months, USA 192 and 238 (R67e's bar is 3 nations). The aid is told in History as "Cold War aid" (`critic/c65_at_376*.log`).</li></ul> **Why 7, not 8:** R65-N2, the blocs at the handover. They are new in this batch (R67b), so run 64's build, whose track ended in 1953 with no NATO, has no such case. <ul><li>In the hour the track ends, India joins the North Atlantic Treaty.<ul><li>On the page with after=999: "31 December 1975 India joined the North Atlantic Treaty". With it, Greece declares war on Yugoslavia, and the United States, France, Italy, Turkey and West Germany join on Greece's side. The next day Austria joins the Eastern Bloc and Kuwait joins NATO (`critic/c65_te_1975.json`, `critic/shots/c65te_1975_relations.png`).</li><li>The ids decode by afterTrack's own listing (9 = NATO, 8 = the Eastern Bloc). India joins 9 in the end hour on all four `c65_endhours.ts` seeds. Iran (5151, 31337) and Pakistan (6161) join 9 within two days (`critic/c65_endhours_*.log`).</li></ul></li></ul> **Seen, but not moving the score:** R65-N1 (Japan and Italy at their 1938 aggression) is old. Run 64's build has Japan declare on South Korea on 17 August 1953, the year after its track, on 36303, and Italy on Yugoslavia on 36301 (`critic/c64_track_36303.log`, `critic/c64_track_36301.log`). |
| Emergent world dynamics | 8 | 8 | **Scored afresh.** <ul><li>The replay to 1975 is a world worth watching. A 1965 start watched to 1977 at Max (48 quarterly samples) has Konfrontasi end in 1966, Biafra from July 1967 to January 1970, the Sino-Soviet clash of 1969 and the coups on their dates, and its chips change each year (`critic/c65_lw_1965replay_4242.json`, `critic/c65_lw1.log`).</li><li>A free 1975 world watched to 1981 keeps its wars changing (`critic/c65_lw2.log`).</li><li>Plain 1938 is unchanged to the end of 1954: 7019 and 32019 match run 64's hash in each of years 1–17, then part in year 18. That is 1955, the first year of ADR-994's post-war techs (`critic/c65_seed*_save.log`).</li></ul> **Not 9:** <ul><li>R65-N3: a free start from 1975 declares 14 and 26 wars in its first 30 days (two seeds). Plain 1938 declares 7 and 6. In the year after the track's end there are 86, 88, 98, 97 and 83 declarations among 162 nations (`critic/c65_track_*.log`, `critic/c65_at_*.log`). Plain 1938's first year has 31 and 28 among 102; run 64's track ended in 1953 with 33–40 among 99 (`critic/c64_track_*.log`). It is another world and another date, so this moves no score.</li><li>Wars across the world with no reason: "Republic of China captured Albania's capital" (10 July 1975), Poland against Australia, and Japan against Chile (`critic/c65_an_y1975_6161.json`, `critic/c65_lw2.log`).</li></ul> |
| God Mode | 8 | 8 | **Scored afresh (light).** <ul><li>Run 64's God cases are byte-identical: the tools on 36119, the God tab on 1938h, and Breakthrough 36151. The H-bomb on Paris gives the same figures (`critic/c65_q_36119.json`, `critic/c65_hgt_1600x900_god-world-ai.json`, `critic/c65_kwh_36151.json`, `critic/c65_a_36117.json`).</li><li>From a 1970 start (replay), opening the editor or God Mode keeps the track. A revolt ends it in that hour and is told: "3 January 1970 Free Saxony broke away from East Germany … History's course ended at your first intervention" (`critic/c65_hg70.json`).</li></ul> **Not 9 (old):** God's tools reach only the selected side; there is no undo. |
| Editor and scenarios | 8 | **7** | **Scored afresh. At its bar of 7.** <ul><li>**A start from a year (R68):** 1960 replay, 1965 replay (phone) and 1975 free each open at their 1 January in 3.7–4.3 s, under load. The replay shows its "Next" line; the free game says "History's course left at the start of your game" (`critic/c65_rc_*.json`).</li><li>"Building the world…" stands over a 1960 start from 1.2 s to 3.5 s. The tick goes 0 → 192,840 under it, and 1938 never shows with stats (`critic/c65_xb_y1960.json`).</li><li>Refusals work: 1961's bytes served as 1960's ("not the world built", by hash), a 404, and a year not built (1977) all land on `?failed=save` with no world run (`critic/c65_by.json`).</li><li>Editor 32443 by mouse: brush, undo `[19,19,19]`, redo, export 591,613 bytes (as runs 61–64). Loaded and started, the painted cells are Germany's `[1,1,1]` (`critic/c65_x_editor.32443.rerun.log`). The first run read `[0,0,0]` because my probe's 2 s wait ended inside "Building the world…" under load; the overlay was up (`critic/shots/c65xe_32443_loaded.png`).</li><li>Bad files are refused (`critic/c65_x_badfiles.log`).</li></ul> **Why 7, not 8** (a new feature; run 64's build has no start from a year): <ul><li>**B1:** the refused start is not told. With no saved game the title says nothing (`critic/shots/c65by_wrongbytes.png`). With one, it says that saved game "could not be loaded … Start a new game" and removes its Continue (`critic/c65_bys.json`, `critic/shots/c65bys_after.png`).</li><li>R65-N6: the card does not show the year chosen. The preview stays 1938's map and "Nations" stays 102 at 1960, 1965 and 1975 (`critic/shots/c65rc_1960_replay_1600x900_card.png`).</li></ul> **What 8 needs:** `node critic/scripts/c65_x_badyear.mjs` and `c65_x_badyearsave.mjs` showing a notice that names the year's start, with the saved game's Continue still there; `c65_x_replaycard.mjs 1960 replay` showing 1960's map and nation count. |
| Stats and history | 8 | 8 | **Scored afresh.** <ul><li>**R64-N3 fixed:** at 00:00 on 8 May 1945 the transfer's own rows are hidden, and Czechoslovakia's and Yugoslavia's land from Hungary are shown (`critic/c65_transfer_head.log` against `critic/c64_transfer_head.log`).</li><li>History from a 1975 start, 2 January 1976: "2479 of 2479 events", opened in 292 ms. The end row is "History's course ended on its last day…", with same-day rows under it (`critic/c65_te_1975.json`, `critic/shots/c65te_1975_history.png`).</li><li>The year-20 saves: 32019 has 3,111 events and a CSV of 3,112 lines; 7019 has 3,280 events. They differ from run 64 because of the techs of 1955 (above) (`critic/c65_hi_*.json`, `critic/c65_dl_32019.csv`).</li></ul> **Not 9:** <ul><li>R65-N5: "Anglo-Egyptian Sudan" in the ranking from 1956 to 1975. "Newfoundland", "Tannu Tuva" and "British East Africa" are listed as living nations in 1976.</li><li>"0 civilians killed" (old).</li></ul> |
| UI/UX and polish | 8 | 8 | **Scored afresh.** <ul><li>**R64-N1 fixed:** the phone line reads "12 Mar 1938: The Anschluss" on two rows, whole (scrollWidth 150 = clientWidth 150), at 390 × 844 and 844 × 390 (`critic/c65_hp_*.json`, `critic/shots/c65hp_390x844_bar.png`).</li><li>**R63/R64's blank line fixed for good:** `c65_h_blank 120 1600 900 99` finds 0 blank in 1,077 samples (run 64: 4). The Greece steps and the pause reads are 0 blank too (`critic/c65_hb_1600x900_s99.json`, `critic/c65_hn_greece.json`, `critic/c65_hpb.json`).</li><li>The paused start's bar says "1 January 1938 · Paused" from the first frame (`critic/c65_xbp_1600x900_p1.json`).</li><li>The × at four sizes, keys, the war list at 667 × 375 and the ticker order are byte-identical to run 64's.</li><li>0 page errors in every probe.</li></ul> **Not 9:** <ul><li>R65-N7: Resume pressed during the build is undone at the first stats.</li><li>R65-N6, the card.</li><li>The desktop line cuts long notes ("Cameroon ind…"; full text on hover).</li></ul> |
| Performance | 8 | 8 | **Scored afresh, after every other job** (`critic/scripts/c65_chainP.sh`, 21:29–21:42; `critic/c65_pf.status`). It was not quite alone: its first stage (`c65_pf_lookfps`, 21:29–21:32) overlapped the failing next-voyage queue's last seconds and two file comparisons of mine. The next-voyage set was re-run after the chain. <ul><li>**Tick, seed 99, 5 years, pinned:** mean 2.2602 ms and hash `6471c3a5`, as run 63's 2.2463 ms on the same hash. Year 1 is 3.11 ms against the 6.5 ms budget (`critic/c65_tick99.log`). R72's speed-up does not show on plain 1938; its target was the replay.</li><li>**The replay's tick** (1938h, 5 years, pinned): mean 1.68 ms; its heaviest year (1942) 3.02 ms, p95 9.4 (`critic/c65_tick1938h.log`).</li><li>**The new year-20 world of 7019** (the techs of 1955 make it another world), at Max: 3,000–600 m/px 58.8–60.2 fps; 120 m/px 51.8–56.1; 30 m/px 54.0–57.0 (`critic/c65_pf_7019.json`). `lookFps`, a draw forced each frame: 59.7–60 frames/s at every zoom, a draw 0.8–2.1 ms (`critic/c65_lookfps.log`).</li><li>**The tactical goal:** 60 fps at 28 m/px with 14,212 individual figures, and 60 at Max with 11,759 (p95 16.7 ms) (`critic/c65_xi.log`).</li><li>Touch 59.6 fps (`critic/c65_tm_touch.alone.log`).</li><li>Beside other jobs: the track's 15-year watch at 58.8–60.3 fps; the 1965–77 replay at 58.4–60.2; free 1975–81 at 59.4–60.1. No frame over 500 ms in any (`critic/c65_hw_desk.json`, `critic/c65_lw_*.json`).</li></ul> **Not 9:** <ul><li>120 m/px over the late world dips to 51.8 fps.</li><li>After the track's end the world runs slower at Max: 16–44 s a quarter against 4–8 s in the replay's 1960s (measured beside other jobs, `critic/c65_lw1.log`; not measured alone).</li><li>R72's claim (the starts built in 0.63 of their time) is not checked by a paired run here. The 38 hashes are checked.</li></ul> |
| Stability | 8 | 8 | **Scored afresh.** <ul><li>**The yearly starts are the same world on two machines:** the 38 hashes of my `npm run saves` on Windows equal the deployed site's `years.json`, built on the Linux runner (`critic/c65_starts/years.json` against `https://richyuen.github.io/Warism/data/scenarios/1938h/start/years.json`).</li><li>The page's free 1975 game (after 6161) and the headless one strike Ulan Bator on 10 July 1975 at the same cell, (1637.5, 303.5) (`critic/c65_an_y1975_6161.json`, `critic/c65_nukes75_6161.log`).</li><li>workerDeterminism 32059 gives `cf5a4a7f` on every arm, as runs 61–64 (`critic/c65_wd_32059.log`).</li><li>Run 61's bulk sets, due again, match run 63's text for text: 396 of 396 landing setups and 153 of 153 stuck returns (`critic/c65_liab_named_cmp.txt`, `critic/c65_sr_cmp.txt`). The 168 next voyages match too, 168 of 168: 120 tellings, and the same two landing breaks, 30041 and 31157 3517 g1 (`critic/c65_nv_cmp.txt`).</li><li>Plain 1938 has the same hash each year to 1954 on 7019 and 32019; seed 99's 5 years give `6471c3a5`, as run 63's.</li><li>0 page errors.</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Carried** (no render file changed). Seen in passing: Vietnam 1968 at 4,000 → 25 m/px (`critic/shots/c65vn_1968_*.png`). |
| Naval warfare (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>landingFuzz: 0 of 90 on new seeds.</li><li>Run 63's ten named landing cases and the two traces are text-identical.</li><li>R64-N2's case 36105 is text-identical: one `slowClick`, the known tail (`critic/c65_li_36105_3517_g2_od8.log`).</li><li>seaBattles 32061 and 32063r give 75 and 87, as before.</li><li>Malta's 18 are identical to run 63's (`critic/c65_malta.log`).</li><li>Run 61's 396 landing setups and 153 stuck returns are text-identical to run 63's. The one landing break in the named set is 30041 3517 g1, as in run 63 (`critic/c65_liab_named_cmp.txt`).</li><li>The 168 next-voyage runs are text-identical to run 63's: 120 tellings of "next voyage in about N days", every one as true as run 63 found them (`critic/c65_nv_cmp.txt`).</li></ul> |
| Tanks (needs 8) | 8 | 8 | **Carried.** <ul><li>`combat.ts` changed by R72c's speed-up and by R66d's window, which acts only under the track. Its plain results stand: the hashes are identical to 1954, and the sea battles and workerDeterminism are identical.</li><li>The post-war tank techs (ADR-994, every game from 1955) are not judged; that was left out for time.</li><li>Seen in passing: "111 tanks lost" in the 1975 H-bomb; heavy armoured divisions in Vietnam's rows (`critic/shots/c65vn_1968_250.png`).</li></ul> |
| Aircraft (needs 8) | 8 | 8 | **Carried**, as tanks. <ul><li>The jet and SAM techs are not judged.</li><li>Seen in passing: the monthly air rows of 1965–75 ("United Kingdom and People's China fought in the air this month: United Kingdom lost 12 aircraft, People's China 24") (`critic/c65_an_y1975_6161.json`).</li></ul> |
| AI nuclear use (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>**A page strike:** in a free game from 1975 (after 6161) the page pauses on "People's China struck Mongolia with a hydrogen bomb near Ulan Bator: 16,000 civilians killed; 46,749 men, 179 guns and 111 tanks lost", with "Go to" (`critic/c65_an_y1975_6161.json`, `critic/shots/c65an_y1975_6161_0_goto.png`).</li><li>The arsenals the replay hands over in 1975 are history's: USA 55, ENG 24, SOV 13, FRA 10, CCP 4 (`critic/c65_nukes75_6161.log`).</li><li>Detonations over 22 years on new seeds 37501, 37503 and 37507: 21, 6 and 10, with 4, 0 and 1 interceptions (`critic/c65_nc/*.log`; new seeds, not compared).</li><li>After the track: 7 detonations in a year on 37301, 0 on 1938 (`critic/c65_track_*.log`).</li></ul> **Not 9:** the burst is a smudge at 937 m/px (old). |

## Blocking issues

1. **B1 (editor and scenarios, R68b): a start from a year that cannot be loaded is not told. With a saved game, the
   title blames that save instead.**
   - SPEC §7.7 says: "A year not built, or of another state format, is refused (the title's notice,
     `?failed=save`)".
   - Probe: `node critic/scripts/c65_x_badyear.mjs` (`critic/c65_by.json`). Three cases:
     - 1961's bytes served for 1960 (refused: "not the world built", hash 4284076941 against 3029944841);
     - a 404;
     - `year=1977` (never built).
   - In each, the page goes to `/?failed=save` and the title shows nothing; the reason is only in the console
     (`critic/shots/c65by_wrongbytes.png`).
   - Probe: `node critic/scripts/c65_x_badyearsave.mjs` (`critic/c65_bys.json`, `critic/shots/c65bys_after.png`).
     - Play plain 1938 five days and go to the main menu, so a saved game exists.
     - Then open a 1960 start whose file is missing.
     - The title's Saved game card now reads "This saved game could not be loaded: it is not whole, or it was made by
       an older version of Warism. Start a new game.", and its Continue button is gone (`continueButton: 0`).
     - The player's own save is fine; only the replay's start failed.
   - The cause: `TitleScreen.tsx` shows `saveFailed`'s text only inside the saved-game card, in place of Continue.
     `?failed=save` is shared by the player's save and the replay's starts.
   - **Fix:** its own `?failed=start&year=` and a notice of its own on the 1938 card ("The world of 1 January 1960
     could not be loaded"). Leave the saved game's card alone.
   - **Not blocking any more when:** both probes show a notice naming the year, and with a saved game its Continue
     stays.

The rule checkers:

- `landingInvariants` on 90 new runs: 0 broken.
- diploInvariants (3 new, 3 named), worldInvariants (3 new, 2 named), the track's checker (3 seeds, to 1975) and
  `trackFronts` (new seed 37701): no rule broken, every bar met.
- 0 page errors.

## Non-blocking issues (prioritised)

1. **R65-N1 (diplomacy, the world after the replay; old, newly found): post-war Japan and Italy are still the Axis.**
   - Run 64's build has it too: Japan declares on South Korea on 17 August 1953, the year after its track ended
     (`critic/c64_track_36303.log`). So it moves no score, but it is the first thing a free game from a late year
     does.
   - In the built 1975 start, Japan has aggression 85 and Italy 80, with the militarist, naval-tradition and
     expansionist traits (`traits=69`). Those are their 1938 values (`critic/c65_traits.log`). Italy is renamed "the
     Italian Republic" in 1946, but the rename is only a label. West Germany is 10 and the United States 15.
   - The timeline's 62 `regime` events (R71a) never touch Japan, Italy or Spain (65, "Nationalist Spain").
   - What a player sees:
     - Japan declares war on South Korea within 3–19 days in **6 of 6** free starts from 1954, 1963 and 1975
       (`npx tsx critic/scripts/c65_freeburst.ts <year> <after>`, `critic/c65_fb_{1954,1963,1975}_{5151,6161}.log`).
     - Japan is at war with the United States in the second year after the track, on both new seeds; on 37603
       Britain joins it too (`npx tsx tools/diag/afterTrack.ts 37601 10`, `critic/c65_at_37601.log`,
       `critic/c65_at_37603.log`).
     - Italy declares on Yugoslavia, Austria or Libya in its first month in 5 of 6 late free starts.
   - **Fix:** `regime` events for Japan (1947 constitution), Italy (1946) and West Germany at its birth, and Spain
     after 1939 (and in 1975). Or reset a defeated Axis nation's aggression and traits at its occupation's end.
   - **Seen fixed when:** `c65_freeburst.ts` from 1954, 1963 and 1975 on two seeds has no JAP>KOR in the first 30
     days; `afterTrack` 37601 and 37603 with no JAP-USA pair in 10 years; `c65_traits.ts 1975 JAP ITA` with aggression
     at a post-war democracy's level.
2. **R65-N2 (diplomacy, R67's blocs at the handover): India joins NATO and NATO fights Yugoslavia in the track's
   last hour.**
   - On the page (`node critic/scripts/c65_x_trackend.mjs 1975`, after=999), History reads as follows
     (`critic/c65_te_1975.json`, `critic/shots/c65te_1975_relations.png`):
     - "31 December 1975 India joined the North Atlantic Treaty";
     - "Greece declared war on Yugoslavia", with the United States, France, Italy, Turkey and West Germany joining on
       Greece's side;
     - "Jordan founded a Defensive Pact", which the United Arab Republic joins;
     - on 1 January: "Austria joined the Eastern Bloc", "Kuwait joined the North Atlantic Treaty", and "Mexico
       founded a Coalition", which Cuba joins.
   - `c65_endhours.ts` with after 999, 5151, 6161 and 31337 finds India joining alliance 9 in the end hour on all four
     (`critic/c65_endhours_*.log`). The script prints the alliance id as a tag; afterTrack's own listing decodes it:
     9 is NATO, 8 the Eastern Bloc. Iran (5151, 31337) and Pakistan (6161) join 9 within two days.
   - afterTrack has India in NATO a day after the end on 37603 and on the track's own seed. The latter loaded the
     builder's cached `.cache/afterTrack_1938.sav.gz`. It gives the same 86 declarations and the same first wars as
     my own run of the track to 1975 (`critic/c65_track_1938.log`).
   - The rule R67c-d claims (the leaders never at war, both blocs whole) holds. But the blocs the replay hands over
     take in neutral India and Austria at once. That is not 1976's world, and the first thing the free world does is a
     NATO war on non-aligned Yugoslavia.
   - **Fix:** while the blocs stand, admit to a bloc only nations its leader would (no neutral of the replay's, none
     across the other bloc's sphere). Or hold the strategic AI's joins and declarations for a settling month after the
     end.
   - **What 8 needs:** `c65_endhours.ts` on four seeds with no join of a bloc by a nation outside it at the end, and
     no war declared in the end hour.
3. **R65-N3 (emergent): a free game from a late year opens with a burst of wars.**
   - Free from 1975: 14 and 26 declarations in the first 30 days, and 93 and 88 in the year (`c65_fb_1975_*.log`).
   - From 1963: 13 and 9 in the first 30 days, 60 and 65 in the year.
   - Plain 1938: 7 and 6 in the first 30 days, 31 and 28 in the year.
   - Per living nation (157 in 1975, 102 in 1938) the first month runs at 1.4–2.6 times plain 1938's rate.
   - After the track's natural end: 86, 88, 98, 97 and 83 declarations in the first year among 162 nations
     (`critic/c65_track_*.log`, `critic/c65_at_*.log`). Run 64's track, ending in 1953, gave 33–40 among 99.
   - The replay holds the AI's own declarations for 38 years, and they come all at once.
   - The burst settles: on 37603 the declarations run 83, 45, 30, then 14–25 a year in years 5–10, with 4–14 wars
     running (`critic/c65_at_37603.log`).
4. **R65-N4 (the replay, R66): D-Day and Stalingrad are still painted on empty land.**
   - Normandy, 1 June 1944 at 3,000 m/px: there is no German formation in France and no Allied army in Britain, apart
     from one 44k chip at sea.
   - Normandy, 2–8 June at 600 m/px: no chip on either side. On 6 June the beachhead appears as a drawn box from the
     Cotentin to Le Havre (`node critic/scripts/c65_x_stage.mjs normandy 1944 1944-06-01 1020.6 291.6 7`,
     `critic/shots/c65st_normandy_3000.png`, `critic/shots/c65st_normandy_d5.png`, `critic/shots/c65st_normandy_d7.png`).
   - `trackFronts` on new seed 37701 agrees: "1944-06-06 ENG of VIC, held by GER: 51 cells … attacker 0 f 0k …
     defender 0 f 0k … D-Day: the Normandy beachhead" (`critic/c65_tf_37701.log`).
   - Stalingrad, 24–31 December 1942: the Soviet armies stand 300 km north. At 600 m/px the city has no formation of
     either side (`critic/shots/c65st_uranus_3000.png`, `critic/shots/c65st_uranus_d4.png`). `trackFronts` 37701
     counts Uranus as 94k against 36k men near, 0 engaged.
   - R66's bar (the user's, ADR-969) covers land fronts, and the 1943–44 Eastern stages are fought: Kursk 27 of 28
     samples engaged, 132k Axis lost; the Dnieper 215k (`critic/c65_tf_37701.log`). But ROADMAP's R66 names
     "Stalingrad, Normandy" as its examples, and both are what a viewer would look at first.
5. **R65-N5 (stats and map): the 1956–75 world keeps names and capitals that history changed.**
   - "Anglo-Egyptian Sudan" is released in 1956 and never renamed. It ranks 9th through 1975, and the war chips read
     "Anglo-Egyptian Sudan ⚔ Kenya" (`critic/shots/c65lw_1965replay_4242_15_world.png`, `critic/c65_lw1.log`).
   - **Newfoundland** (2,360 cells, a British puppet) and **Tannu Tuva** (941 cells, a Soviet puppet) are separate
     nations in 1975. History joined them to Canada in 1949 and to the Soviet Union in 1944
     (`critic/c65_landof_1975.log`, `critic/shots/c65pl_1975_newfoundland.png`, `critic/shots/c65pl_1975_tuva.png`).
   - British East Africa lives on with 4 cells.
   - West Germany's capital is labelled "Gießen": `nations.json` says Bonn, and the seat is the nearest city on the
     map. Spain's capital stays "Burgos" to 1975, and the nation stays "Nationalist Spain"
     (`critic/shots/c65lw_1965replay_4242_03_europe.png`).
   - Free worlds revive "Manchukuo" in 1979 (`critic/c65_lw2.log`).
   - **Fix:** `rename` SUD with its release; `annex` or `transfer` for NFL (1949) and TAN (1944); a `capital` event for
     Spain (Madrid, 1939) and a city at Bonn.
6. **R65-N6 (UI, editor and scenarios, R68c): the card does not show the year it starts.**
   - With the slider at 1960, 1965 or 1975 the preview is 1938's map (`data/scenarios/1938/preview.png`). "Nations"
     reads 102, and the heading reads "World, 1938". Only "Start date: 1 January 1960" changes
     (`critic/c65_rc_*.json`, `critic/shots/c65rc_1960_replay_1600x900_card.png`,
     `critic/shots/c65rc_1965_replay_390x844_card.png`).
   - The thumb has no label. On a phone the 38 years share about 270 px of track, about 7 px a year.
   - My probe set the slider by script, so the drag itself was not judged.
   - **Fix:** a preview per year (`npm run data -- --previews` at deploy beside the starts), the nation count from
     `years.json`, and the year on the thumb.
7. **R65-N7 (UI, new, from R70c): Resume pressed during the build is undone.**
   - On `?paused=1` the bar says "Paused" from the first frame (fixed). But a press of Resume during "Building the
     world…" makes the bar say "1 January 1938" (running), and 3 s later it is "Paused" again.
   - Probe: `node critic/scripts/c65_x_buildpause.mjs 1600 900 1`, `critic/c65_xbp_1600x900_p1.json` (`afterClick`
     against `after3s`).
   - **Fix:** keep the player's choice made during the build, or disable the button until the world is built.
8. **Small:**
   - The desktop line cuts long notes ("Next, 1 January 1960: Cameroon ind…"; `critic/shots/c65rc_1960_replay_1600x900_start.png`).
   - "Republic of China captured Albania's capital" (10 July 1975, free, after 6161), and Poland against Australia:
     wars with no way to reach.
   - The Sino-Soviet clash of March 1969 becomes a months-long air war (the Soviet Union lost 27 aircraft, China 0 in
     July 1969; `critic/c65_lw_1965replay_4242.json`).
   - **Old, carried:**
     - the ranking's Land unit and "0 civilians killed";
     - R61-SC's three `slowClick` breaks and R64-N2's 36105 (text-identical);
     - Malta never taken (18 of 18 as run 63).

## Run 64's cases re-run

| Run 64 case | Run 64 (`a90c7f57`) | Run 65 (`5ee3e035`) | Evidence |
|---|---|---|---|
| R64-N1 `h_phone 390 844`, `844 390` | "Next, 12 March 1938: The An…" cut, 11 px | **fixed**: "12 Mar 1938: The Anschluss" on two rows, scrollWidth = clientWidth (150) | `critic/c65_hp_*.json`, `critic/shots/c65hp_390x844_bar.png` |
| R64-N3 `c64_transfer.ts` | CZS and YUG from HUN hidden on 8 May 1945 | **fixed**: both shown, the transfer's own rows hidden. The rest of the diff is R66's changed track | `critic/c65_transfer_head.log` |
| R64-N2 landingInvariants 36105 3517 g2 od8 | 1 `slowClick` | text-identical | `critic/c65_li_36105_3517_g2_od8.log` |
| `h_blank 120 1600 900 99` | 4 blank of 1,088 | **0 of 1,077**, never past (reached January 1942 under load, run 64 March 1943) | `critic/c65_hb_1600x900_s99.json` |
| Paused start's bar (`x_buildpause 1600 900 1`) | "Pause" during the build | **fixed**: "Paused" from the first frame; a Resume pressed in the build is now undone (R65-N7) | `critic/c65_xbp_1600x900_p1.json` |
| Slovakia's "annexed" and "destroyed" in one hour | both | left by R70c (History is the whole log) | — |
| `h_next` Greece, `h_pauseblank` | 0 blank | 0 of 17, 0 of 5; the dates differ by R66's track | `critic/c65_hn_greece.json`, `critic/c65_hpb.json` |
| `h_godtab`, `h_god`, `h_interv` ×2, `h_seed` | notes; the track ends and is told; one hash for three URLs | the same (godtab byte-identical; the track's hashes differ by R66) | `critic/c65_hgt_*.json`, `critic/c65_hg.json`, `critic/c65_hi_*.json`, `critic/c65_hseed.json` |
| `h_continue 400 120` | same hash | same hash | `critic/c65_hc_400_120.json` |
| `h_watch` desk, 15 years at Max | 0 of 57 blank, 59–60.5 fps | 0 of 62 pre-1954 samples blank, 58.8–60.3 fps, longest gap 100 ms, 0 over 500 ms | `critic/c65_hw_desk.json` |
| 31211 h114 ticker; 31201 at 667 × 375; closeblock 21103 ×5 sizes; keys 36423; continue 36415 | as run 63 | byte-identical | `critic/c65_wt_*`, `critic/c65_mw_*`, `critic/c65_xcb_*`, `critic/c65_xk.json`, `critic/c65_xc_36415_GER.json` |
| Editor 32443, 32441; bad files | paint kept, 591,613 bytes | the same (32443 on a re-run with the probe waiting for the build) | `critic/c65_x_editor.*.rerun.log`, `critic/c65_x_badfiles.log` |
| God tools 36119, H-bomb 36117, Breakthrough 36151 | told; 3,329,000 civilians | byte-identical | `critic/c65_q_36119.json`, `critic/c65_a_36117.json`, `critic/c65_kwh_36151.json` |
| History and CSV on the year-20 saves | 3,129 events, 3,130 lines (32019) | 3,111 events, 3,112 lines; the world differs from 1955 (techs) | `critic/c65_hi_32019.json`, `critic/c65_dl_32019.csv` |
| 7019 / 32019, 20 years | `99caf939`, `4702acef` | `6f3905d6`, `9239b548`: the same hash each year 1–17, apart from year 18 (1955, ADR-994's first techs) | `critic/c65_seed*_save.log` |
| Named landingInvariants ×10, nvtraces ×2 | as run 61 | text-identical (bar the seconds) | `critic/c65_li_*.log`, `critic/c65_nvtrace_*.log` |
| diploInvariants 33501/3/5, worldInvariants 36009/36011 | 0 | 0, text-identical | `critic/c65_diploinv_335*.log`, `critic/c65_wi_360*.log` |
| seaBattles 32061, 32063r; workerDeterminism 32059 | 75, 87; `cf5a4a7f` | the same | `critic/c65_sb_*.log`, `critic/c65_wd_32059.log` |
| Track checker 1938 (365 free days) | 0 broken; Soviet war on Norway 29 July 1953 | 0 broken to 31 December 1975; VIE born; 86 wars declared in the year after | `critic/c65_track_1938.log` |
| Malta's 18 (due: the sim changed) | run 63: 18 not taken | identical to run 63's line for line | `critic/c65_malta.log` |
| Run 61's bulk sets (due) | run 63: 395 of 396 identical; 153 identical; 168 true | **396 of 396 landing setups and 153 of 153 stuck returns text-identical to run 63's**; the 168 next voyages are text-identical too (120 tellings, the same two landing breaks); the first try failed on a missing copy of `c63_nvtrue.ts` and was re-run |  `critic/c65_li/`, `critic/c65_sr/`, `critic/c65_nv/` |
| worldInvariants 33507, track 33301 etc., perf chain of run 63 | carried | worldInvariants and the track on new seeds instead; perf chain re-run (above) | — |

## Design objections (none blocking, no score lowered)

- Run 63's "the track's fronts are painted, not fought" is now answered for the large Eastern land fronts of 1943–44,
  but not for landings or Stalingrad (R65-N4). The user's bar (ADR-969) counts land fronts only. A viewer judges by
  D-Day.
- The blocs are lasting by rule (ADR-981), yet any nation may join them (R65-N2). A bloc that a neutral joins in an
  hour does not read as the Cold War.
- The same history every game; a free start from a year is the only branch. With R65-N1 and R65-N3, the branch opens
  with an Axis Japan and a burst of wars.

## Ideas from other games (not scored)

- Hearts of Iron IV's "historical focus" for the AI after the scripted years: the AI keeps the alignment of its
  history for a while after the script ends, instead of choosing afresh in the first hour.
- Paradox's bookmarks show each start's map and its great powers on the start screen: a picture per year would answer
  R65-N6.

## Strengths (verified)

- **The replay's starts are the same world everywhere.** The 38 yearly starts built here on Windows hash the same as
  the deployed site's, built on the Linux runner. A free 1975 game strikes Ulan Bator on 10 July 1975 at the same cell
  on the page and headless (`critic/c65_starts/years.json`, `critic/c65_an_y1975_6161.json`,
  `critic/c65_nukes75_6161.log`).
- **The 1953–75 replay is history on its dates, and it plays.**
  - From a 1965 start: Konfrontasi ends in 1966, then come Biafra (July 1967 – January 1970), Zhenbao, Nasser's
    death and Sadat, and Lon Nol.
  - The track checker is clean on 3 seeds.
  - The 1943–44 Eastern stages are fought: 27 of 28 samples engaged at Kursk and the Dnieper on a new seed
    (`critic/c65_lw1.log`, `critic/c65_tf_37701.log`).
