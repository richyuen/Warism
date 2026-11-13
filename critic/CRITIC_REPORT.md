# Critic report, run 66 (focused): Batch 20 (R73–R75) and run 65's findings

- **Mode: focused.** The spawning message did not ask for a full run ("Run the critic per CRITIC_PROMPT.md on the
  current HEAD"). Run 65 had one blocking issue (B1) and two dimensions at 7. This run scores afresh the dimensions run
  65 blocked on or the changed files touch, and carries the rest.
- **Commit judged:** `a0880be619551c9f53473ebe4f5ff469a2d69d97`, HEAD at the start, on a clean tree
  (`critic/c66_commit.txt`).
- **What changed since run 65 (`5ee3e035`):** 16 commits, 18 files under `src/`, `data/` and `tools/`.
  - R73: B1, a refused start told by its year (`gameUrl.ts`, `game.tsx`, `main.tsx`, `TitleScreen.tsx`).
  - R74a–h: run 65's non-blocking findings. The pause chosen in the build; the card per year; post-war names, capitals
    and regimes (`timeline.json`, `track.ts`); arrivals at Stalingrad and Normandy; the Next line; the sea's reach
    (`strategic.ts`, a rule of every game, the pin moved); the 1969 air hold (`air.ts`, `airCombat.ts`, `world.ts`).
  - R75a–c: a historical focus after the track (`focusAfterTrack`, `strategic.ts`); the card's great powers
    (`replaySaves.ts`); the Soviet income buff to 1991 (timeline).
- **The sim changed** (`git diff --stat 5ee3e035 HEAD -- src/sim data public/data` is not empty).
  - Run 61's bulk sets and Malta's 18 are due and re-run.
  - Plain 1938 is not carried: the diff touches `src/sim/ai/` and `src/sim/systems/`, and ADR-1011 moves the pin.
- **Scored afresh:**
  - `diplomacyWarDepth`, `editorScenarios`: at 7 in run 65 (their bar of 7; B1 was on `editorScenarios`), and touched.
  - `mapVisuals`, `emergentDynamics`, `statsHistory`, `uiUxPolish`, `godMode`: their files or the track changed.
  - `naval`, `aircraft`, `aiNukes`, `stability`, `performance`: `strategic.ts`, `air.ts`, `airCombat.ts`, and a
    rule of every game.
- **Carried, with evidence:**
  - `semanticZoom`: no file under `src/render` changed.
  - `tanks`: `combat.ts` and the land systems did not change. Every game is another world (the pin moved), but no
    tank rule did.
- **Setup:**
  - Build: `vite build --outDir critic/c66_dist`, exit 0 (`critic/c66_build.log`).
  - The yearly starts: `npm run saves -- critic/c66_starts`, 38 years, 404 s (`critic/c66_saves.log`), copied into
    the build.
  - Server: `vite preview` on 127.0.0.1:5366. Browser: Playwright Chromium at 1600 × 900, 390 × 844, 844 × 390,
    932 × 430, 1024 × 500 and 667 × 375.
  - Probes: `critic/scripts/c66_*`, run 65's copied (`c65_` → `c66_`, port 5366). New: `c66_x_badyear2.mjs`,
    `c66_x_slider.mjs`, `c66_air69.ts`, `c66_greats.ts`, `c66_afterTrack.ts` (afterTrack with its cache in
    `critic/c66_atcache`: the builder's `.cache/afterTrack_376*.sav.gz` were made before R75c), `c66_tagidx.ts`,
    `c66_cmpnamed.sh`, `c66_cmpjson.mjs`; the aircraft probes of run 63 as `c66_pl_planes.mjs`, `c66_w_wing.mjs`.
  - Chains: `c66_build.sh`, `c66_runNamed.sh` (`c66_jobsNamed.txt`), `c66_runExtra.sh` (`c66_jobsExtra.txt`),
    `c66_afterStarts.sh`, `c66_pages.sh`, `c66_pages2.sh` (run 65's `c66_suite.sh`, `c66_suite2.sh`,
    `c66_chainE.sh`), `c66_chainBulk.sh`, `c66_chainP.sh` (performance, alone, last).
  - Writes outside `critic/` by tools at their defaults: `trackFronts` wrote `.cache/trackFronts_37701.json` and
    `_38701.json`; the named list's own `afterTrack 38601` wrote `.cache/afterTrack_38601.sav.gz` before I stopped
    it (a HEAD world, not stale). `landingFuzz` logs to `.cache/landingFuzz/a0880be6-38101/` as always.
  - My preview and every browser and job I started are stopped. **A mistake of mine:** my last clean-up matched
    "chromium" in command lines and also stopped three `msedgewebview2.exe` processes and an `msedge.exe` crashpad
    handler that were not mine (an app's WebView on this machine). Nothing of the repo was touched by it.
- **Left out for time:** the zoom, sea-battle and landing page probes and seaBattlesLook (semanticZoom is carried); the 12-year watches and the top-three census; `npm run bench -- G`; a measure of R66-N3's effect on wars (only the set of great powers was read); the God tab at 390 × 844; run 65's `h_blank 120`, `x_building` and the free 1975 watch (`lateworld 1975 free`), not re-run.

## Verdict

**No blocking issue.** B1 is fixed on both of run 65's probes and on a new one at two sizes.

`diplomacyWarDepth` and `editorScenarios` rise from 7 to 8. Every dimension is at 8.

- **The rule checkers on new seeds:**
  - `landingInvariants` via `landingFuzz --seeds 15 --first 38101`: **0 of 90 runs broken**
    (`critic/c66_landingFuzz.log`).
  - diploInvariants, 5 years each, 0 broken: new 38001 (1938), 38003 (random), 38005 (1938, heroes); run 65's
    37001/3/5 and run 64's 33501/3/5 also 0 (`critic/c66_diploinv_*.log`).
  - worldInvariants, every rule set, 5 years each, 0 broken: new 38007, 38009, 38011 (heroes); run 65's 37007,
    37009, 37011 and run 64's 36009, 36011 also 0 (`critic/c66_wi_*.log`).
  - The track's checker to 31 December 1975: 0 broken lines on 1938, 38301, 38303, 37301, 37303
    (`critic/c66_track_*.log`).
  - `trackFronts` (R66's bar: 9 large land fronts engaged at the stage's hour): 10 of 23 on the replay's own seed
    1938, 10 of 24 on 37701 (run 65: 12), 9 of 24 on new 38701 (`critic/c66_tf_*.log`).
- **Run 65's findings are fixed on the probes that found them:** B1, R65-N1, N2, N3, N5, N6, N7 and the small ones.
  R65-N4 (D-Day and Stalingrad) is answered in part: armies stand at both now, but D-Day is still not fought after
  its hour, and the Stalingrad stage itself has no German army (R66-N4).
- **New, non-blocking:**
  - **R66-N1:** the focus after the track (R75a) also damps a game whose replay ends in 1938–41. A replay left on its
    first day declares 19 and 19 wars in its first year, where the same plain 1938 world declares 32 and 28.
  - **R66-N2:** in "Play free" at a later year, the card shows 1938's description and the replay's fixed-seed note.
  - **R66-N3:** the sea reach (R74h) keys on the sim's `greatPowers`, which leaves the United States out of plain
    1938's first year and Japan out of years 1–3.
  - **R66-N5, N6:** small findings on the card (after a refused start; Spain as a great power in 1941–49).

## Scores

| Dimension | Run 65 | Run 66 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Scored afresh.** <ul><li>R65-N5's names and seats are fixed on the 1975 start: Newfoundland's land is Canada's, Tuva's is the Soviet Union's, "Bonn" is a city and West Germany's seat, Madrid is Spain's, and "Sudan" is ranked 9th (`critic/c66_pl_1975.json`, `critic/shots/c66pl_1975_bonn.png`, `critic/shots/c66pl_1975_madrid.png`, `critic/shots/c66rc_1960_replay_1600x900_start.png`). In `c66_landof.ts 1975`, NFL, TAN, BEA and MAN own 0 cells (`critic/c66_landof_1975.log`).</li><li>Normandy on 7 June 1944: the American, British and Canadian divisions on the beachhead and German divisions about it, legible at 600 m/px (`critic/shots/c66st_normandy_d6.png`). Stalingrad, 21 November 1942: the German armies west of the city, the Soviet fronts on the Don and south of it (`critic/shots/c66st_uranus_d1.png`).</li><li>The year previews read as their year: 1960's Africa still mostly colonial, 1975's independent (`critic/shots/c66rc_1960_replay_1600x900_card.png`, `critic/shots/c66rc_1975_free_1600x900_card.png`).</li></ul> **Not 9:** <ul><li>The ranking's Land figure still has no unit (old).</li></ul> |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | **8** | **Scored afresh. Up from 7, on the same seeds as run 65.** <ul><li>**R65-N2 fixed.** `c66_endhours.ts` on 999, 5151, 6161 and 31337, from the 1975 start built at HEAD: no join of NATO (9) or the Eastern Bloc (8), and no war declared in the end hours. The joins there found new pacts, ids 10–13 (`critic/c66_endhours_*.log`; every join on the four seeds is to ids 10–14, decoded by `critic/scripts/c66_tagidx.ts`). Run 65, same seeds: India joined 9 in the end hour on all four (`critic/c65_endhours_*.log`). On the page: India "founded a Defensive Pact" with Afghanistan, and no war in the end hour (`critic/c66_te_1975.json`).</li><li>**The blocs hold for 10 years:** SOV 8/8 and USA 14/14 members kept at the end of each year on 37601, 37603, 38601 and 1938 (`critic/c66_atx_*.log`; afterTrack counts members kept, not joiners, so later joins are not read here). Each leader aids many nations (USA 227–266 months, SOV 166–198).</li><li>**R65-N1 fixed:** the 1975 start has Japan at aggression 10 with the pacifist, industrial and democratic traits (4114), and Italy at 15 (`critic/c66_traits.log`). No JAP or ITA declaration in the first 30 days of the free starts from 1954, 1963 or 1975 on 5151 and 6161 (`critic/c66_fb_*.log`). No JAP-USA war in 10 years on 37601 or 37603 (run 65: JAP-USA in year 2 on 37601).</li><li>Every checker passes (above).</li></ul> **Not 9:** <ul><li>R66-N1: the focus damps the AI's wars after an intervention in 1938–41 too.</li><li>R66-N3: the sea reach keys on a measure that leaves the United States and Japan out.</li><li>People's China's army falls from 637k to 8k in the first year after the track: it attacks India, then the United States and the Soviet Union declare on it (`critic/c66_atx_37601.log`; run 65's 37601 had the same fall, 526k to 51k).</li></ul> |
| Emergent world dynamics | 8 | 8 | **Scored afresh.** <ul><li>**R65-N3 fixed:** the first 30 days of a free start from 1975 have 5 and 9 declarations (5151, 6161; run 65: 14 and 26), and its first year 71 and 59 (run 65: 93 and 88). Per living nation (154) the first month runs at 0.48 and 0.98 times plain 1938's. From 1963: 4 and 3 in 30 days (run 65: 13 and 9), 35 and 35 in the year (60 and 65). Plain 1938 on the same seeds: 7 and 6, 32 and 28 (`critic/c66_fb_*.log` against `critic/c65_fb_*.log`).</li><li>After the track's own end: 65, 66 and 64 declarations in the first year on 1938, 38301 and 38303 (run 65: 83–98). They ease to 10–31 a year by years 4–10 (`critic/c66_track_*.log`, `critic/c66_atx_*.log`).</li><li>A 1965 start watched to 1977 at Max: Biafra, Zhenbao, the Khmer Rouge, Dhofar on their dates. In July 1976 the free world has its own wars, among them the Soviet Union against People's China (`critic/c66_lw_1965replay_4242.json`).</li></ul> **Not 9:** <ul><li>R66-N1 (below): a replay left in 1938 has 60–68 % of plain 1938's declarations in its first year.</li></ul> |
| God Mode | 8 | 8 | **Scored afresh (light).** <ul><li>Run 65's God cases match: the tools on 36119, the God tab on 1938h and Breakthrough 36151 are identical. The H-bomb on Paris on 36117 differs only in the title's random seed field (`critic/c66_q_36119.json`, `critic/c66_hgt_1600x900_god-world-ai.json`, `critic/c66_kwh_36151.json`, `critic/c66_a_36117.json`).</li><li>From a 1970 start, a revolt ends the track and is told: "3 January 1970 Free Saxony broke away from East Germany … History's course ended at your first intervention" (`critic/c66_hg70.json`).</li></ul> **Not 9 (old):** God's tools reach only the selected side; there is no undo. R66-N1 makes a God act in 1938–41 quiet the world for three years. |
| Editor and scenarios | 7 | **8** | **Scored afresh. Up from 7, on run 65's probes.** <ul><li>**B1 fixed.** `c66_x_badyear.mjs`: 1961's bytes served for 1960, a 404, and `year=1977` each land on `?failed=start&year=Y`, with "The world of 1 January Y could not be loaded: this site has not built it, or it is not whole. Choose another year." (`critic/c66_by.json`, `critic/shots/c66by_wrongbytes.png`). `c66_x_badyearsave.mjs`: the saved game's card is untouched and Continue is there (`continueButton: 1`, `critic/c66_bys.json`).</li><li>New probe `c66_x_badyear2.mjs`, at 1600 × 900 and 390 × 844: the notice for replay 404, free 404, a year not built and wrong bytes, and with a saved game. Continue is kept and continues the save (`critic/c66_by2.json`, `critic/shots/c66by2_1600x900_withSave.png`).</li><li>**R65-N6 fixed.** The card's map, heading, nations and great powers follow the year: 1960 101, 1965 128, 1975 154, 1946 94 (`critic/c66_rc_*.json`). By keys (End, ←, Home, →) and by a mouse drag at both sizes, the thumb's label, date, count, powers and preview move together (`critic/c66_slider.json`, `critic/shots/c66sl_390x844_drag.png`).</li><li>The starts open at their date: 1960 in 3.96 s, 1965 (phone) 3.56 s, 1975 free 3.47 s.</li><li>The editor (32443): painted, undone, redone, exported (591,613 bytes, as runs 61–65), loaded with Germany's cells `[1,1,1]` (`critic/c66_x_editor.32443.rerun.log`). Bad files are refused (`critic/c66_x_badfiles.log`).</li></ul> **Not 9:** R66-N2, the card in "Play free" at a later year, and R66-N5. |
| Stats and history | 8 | 8 | **Scored afresh.** <ul><li>History from the 1975 start, on 2 January 1976: "2466 of 2466 events", opened in 159 ms. The end row is told and the new pacts follow it (`critic/c66_te_1975.json`).</li><li>The year-20 saves: 32019 has 3,475 events and a CSV of 3,477 lines; 7019 has 3,939 events. Other worlds than run 65's (ADR-1011's pin) (`critic/c66_hi_*.json`, `critic/c66_dl_32019.json`).</li><li>The ranking reads "Sudan" from 1956 (R65-N5).</li></ul> **Not 9:** <ul><li>"0 civilians killed" (old).</li><li>R66-N6: the card's "Great powers" puts Spain in 1941–49 and leaves China out in 1941–43.</li></ul> |
| UI/UX and polish | 8 | 8 | **Scored afresh.** <ul><li>**R65-N7 fixed:** Resume pressed during "Building the world…" on `?paused=1` holds. `afterClick` "1 January 1938" running, `after3s` "3 January 1938" running (`critic/c66_xbp_1600x900_p1.json`).</li><li>**The desktop Next line is whole:** "Next, 1 January 1960: Cameroon independent" on one row at 1600 × 900 (`critic/shots/c66rc_1960_replay_1600x900_start.png`). The phone line is as run 65 ("12 Mar 1938: The Anschluss", scrollWidth = clientWidth; `critic/c66_hp_*.json`).</li><li>The × at five sizes, the keys, the war list at 667 × 375 and the ticker order match run 65 (`critic/c66_xcb_*`, `critic/c66_xk.json`, `critic/c66_mw_31201_GER_667x375.json`, `critic/c66_wt_ITA_31211_h114.json`). Greece's Next line: 0 blank of 17.</li><li>0 page errors.</li></ul> **Not 9:** R66-N2 (the card contradicts itself in "Play free") and R66-N5. |
| Performance | 8 | 8 | **Scored afresh, alone and last** (`critic/scripts/c66_chainP.sh`, 06:57–07:09, after every other job; `critic/c66_pf.status`). <ul><li>**Tick, seed 99, 5 years, pinned:** mean 2.10 ms (run 65: 2.26 ms); year 1 3.20 ms against the 6.5 ms budget. Year 1's hash is `aa59b1ab`, ADR-1011's new pin (`critic/c66_tick99.log`). The sea-reach rule costs nothing seen.</li><li>**The replay's tick** (1938h, 5 years, pinned): mean 1.70 ms (run 65: 1.68); its heaviest year, 1942, 2.82 ms, p95 7.7 (`critic/c66_tick1938h.log`).</li><li>**The year-20 world of 7019** at Max: 3,000–600 m/px 58.3–60.2 fps; 120 m/px 53.6–56.3 (run 65: 51.8–56.1); 30 m/px 53.1–56.5 (`critic/c66_pf_7019.json`). `lookFps`, a draw forced each frame: 58.5–60 frames/s at every zoom, a draw 0.8–3.2 ms (`critic/c66_lookfps.log`).</li><li>**The tactical goal:** 59.9 fps at 28 m/px with 12,378 individual figures, Max (p95 16.7 ms) (`critic/c66_xi.log`). Touch 59.5 fps (`critic/c66_tm_touch.alone.log`).</li><li>Beside other jobs: the 1965–77 replay at 58.9–60.5 fps; the track's 15-year watch to 1954 at 58.6–60.2 fps, 0 of 63 samples with a blank Next line, 0 frames over 500 ms (`critic/c66_lw_1965replay_4242.json`, `critic/c66_hw_desk.json`).</li></ul>**Not 9:** 120 m/px over the late world still dips to 53.6 fps. |
| Stability | 8 | 8 | **Scored afresh.** <ul><li>**The yearly starts are the same world on two machines:** the 38 hashes, counts and great powers of my `npm run saves` on Windows equal the deployed site's `years.json` (`critic/c66_starts/years.json` against `critic/c66_deployed_years.json`, fetched from the Pages site; 38 of 38).</li><li>workerDeterminism 32059: `6c0b4082` on every arm. A new hash, as the pin moved (`critic/c66_wd_32059.log`).</li><li>The named headless cases are text-identical to run 65's, seconds stripped: 11 of 12 landing cases (36105's one `slowClick` among them), both next-voyage traces, diploInvariants 33501/3/5 and 37001/3/5, worldInvariants 36009/11 and 37007/9/11. The landing case 203997 has one more click reckoned, and its break is the same `slowClick` (`critic/scripts/c66_cmpnamed.sh`). R64-N3's transfer rows on 8 May 1945 are as run 65's (`critic/c66_transfer_head.log`).</li><li>Malta's 18 are identical to run 65's, line for line (`critic/c66_malta.log`).</li><li>Run 61's bulk sets, due again, against run 65's, text for text: 366 of 396 landing setups identical (the 30 others differ in notes and click counts; the one break is 30041 3517 g1's `slowClick`, as before), 153 of 153 stuck returns identical, and 162 of 168 next voyages identical (`critic/c66_liab_named_cmp.txt`, `critic/c66_sr_cmp.txt`, `critic/c66_nv_cmp.txt`).</li><li>0 page errors.</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Carried** (no render file changed). Seen in passing: Vietnam 1968 at 4,000 → 25 m/px, identical to run 65 (`critic/c66_vn_1968.json`); Normandy at 3,000 → 40 m/px (`critic/shots/c66st_normandy_*.png`). |
| Naval warfare (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>landingFuzz: 0 of 90 on new seeds 38101–38129.</li><li>Run 65's named landing cases: 11 of 12 text-identical, R64-N2's 36105 with its one `slowClick` among them (`critic/c66_li_36105_3517_g2_od8.log`).</li><li>seaBattles 32061: 79 battles (run 65: 75); 32063r (1938, random diplomacy): 57 battles (run 65: 87), and 95 sinkings out of battle (21). 90 of them are Japan's: at war with Germany, its fleets fight in the Baltic from day 340 (14 battles) and lose about 135 ships to strikes and shore fire on days 454–497, at a few points off Norway and in the Baltic. The losses stop when the fleets are gone, so it is no loop; a far fleet left under the enemy's air for a month (`critic/c66_sb_32063r.json`). Other worlds (the pin moved).</li><li>Malta's 18 are identical to run 65's.</li><li>Run 61's 396 landing setups: 366 text-identical to run 65's, 1 break (30041 3517 g1's known `slowClick`). The 153 stuck returns are identical. The 168 next voyages: 162 identical; the 6 others differ by a telling of "next voyage in about 11–13 days" for a division that never sails, before and after. 116 tellings (run 65: 120), the same two landing breaks (30041 and 31157 3517 g1).</li><li>On the replay: "30 December 1975 South Africa and Cuba fought at sea: South Africa lost 0 ships, Cuba 8 ships" (`critic/c66_te_1975.json`).</li></ul> |
| Tanks (needs 8) | 8 | 8 | **Carried.** No tank rule changed (`combat.ts`, `operational.ts` untouched). Seen in passing: the divisions of both sides at Normandy and west of Stalingrad, read at their tier (`critic/shots/c66st_normandy_d6.png`, `critic/shots/c66st_uranus_d1.png`). |
| Aircraft (needs 8) | 8 | 8 | **Scored afresh** (`air.ts`, `airCombat.ts`: `airFoes` in place of `atWar`). <ul><li>`airFoes` equals `atWar` in any world without a track (`world.ts`).</li><li>Run 63's aircraft probes (the last run that scored aircraft) on HEAD: PL 35125 is identical apart from the port (`critic/c66_pl_planes.35125_GER_POL_5366.log`). W 35127: the followed fighter is marked in 56 of 61 samples at 3,000 m/px (median 32 px, as run 63) and in 60 of 60 at ×5; at 250 m/px 36 of 58 (run 63: 37 of 59), median 68 px (94) (`critic/c66_w_wing.35127.log`).</li><li>**R74h's air hold, headless from the 1969 start:** CCP and SOV are at war 193 days (2 March to 11 September). Their sorties aloft are 5 and 4 on the first day, then 0 and 0 at every monthly sample, with no AirWar or AirRaids row between them. The United States' monthly raids on Vietnam go on (2,418 men, guns and vehicles in December) (`critic/scripts/c66_air69.ts`, `critic/c66_air69.log`).</li><li>worldInvariants' air rules: 0 broken on 6 seeds.</li></ul> **Not 9 (old):** at 250 m/px the followed fighter's mark is up to 1,220 px from its sorties. |
| AI nuclear use (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>Detonations over 22 years of plain 1938 on run 65's seeds 37501, 37503 and 37507: 6, 19 and 8, with 0, 0 and 1 interceptions (run 65: 21, 6 and 10; other worlds, ADR-1011's rule) (`critic/c66_nc/*.log`). The AI's nuclear use stays a rare, late event of every world.</li><li>After the track: 2 detonations in the year on 37301 (run 65: 7), 0 on 1938, 38301 and 38303 (`critic/c66_track_*.log`).</li><li>The 1975 arsenals the replay hands over: USA 55, SOV 26, ENG 24, FRA 10, CCP 4; the Soviet stockpile is over Britain's now (R75c; run 65: SOV 13) (`critic/c66_nukes75_6161.log`).</li><li>Run 65's page strike (free 1975, after 6161: People's China on Ulan Bator, 10 July 1975) is gone: no detonation in 400 days on the page (`critic/c66_an_y1975.json`). Headless, People's China launches its 4 warheads at one place on 6–10 October 1975 and all 4 are intercepted (`critic/c66_nukes75_6161.log`). </li><li>**A page strike, new case:** a free game from 1954 (after 6161) pauses on "Soviet Union struck India with an atomic bomb near New Delhi: 147,000 civilians killed; 5,600 men and 20 guns lost", with "Go to" at the burst, on 9 May 1954. The headless run strikes the same day at the same point, (1463.18, 430.06) (`critic/c66_an_y1954.json`, `critic/shots/c66an_y1954_0_goto.png`, `critic/c66_nukes54_6161.log`).</li></ul> **Not 9:** the burst is a smudge at 937 m/px (old); four launches at one target in five days, all lost, is not a reasoned use. |

## Blocking issues

None.

- B1 is fixed (above).
- The rule checkers: `landingInvariants` 0 of 90 on new seeds. diploInvariants (3 new, 6 named), worldInvariants (3 new,
  5 named), the track's checker (5 seeds) and `trackFronts` (2 seeds): no rule broken, every bar met.
- 0 page errors.

## Non-blocking issues (prioritised)

1. **R66-N1 (diplomacy, emergent; new, R75a): the focus after the track damps a game whose replay ends in 1938–41.**
   - `focusAfterTrack` applies to every end of the track: its date, an intervention, or a free start (ADR-1009). It
     was made for the 38 years of held declarations at a late end (R65-N3). At an early end there is nothing held, yet
     the AI makes 40 % of its declarations, rising to all over three years.
   - **The same world, with and without it:** the replay left at 1 January 1938 (a God act, an edit or a nation taken on day 1;
     "Play free" at 1938 starts the plain scenario, with no track) is plain 1938's world on the same seed. Its first declarations fall on the same
     days: on 5151, TUR>BUL on day 3 and IRN>AFG on day 13 in both.
     - 5151: plain 1938 declares 32 wars in the year (7 in 30 days); left on day 1, 19 (4).
     - 6161: 28 (6); left on day 1, 19 (3).
     - Lost on 5151: SOV>ROM day 4, ITA>YUG day 6, JAP>ROM day 9, SOV>TUR day 18 (`npx tsx
       critic/scripts/c66_freeburst.ts 0 5151` against `... 1938 5151`; `critic/c66_fb_0_*.log`, `critic/c66_fb_1938_*.log`).
   - Left at 1939 or 1941: 20, 24, 15 and 17 declarations in the year; the 1941 start declares 0 and 2 in its first 30
     days (`critic/c66_fb_1939_*.log`, `critic/c66_fb_1941_*.log`; new, not compared).
   - What a player sees: a God act or a nation taken in the replay's 1938 quiets the coming war for three years. R75a's
     own words are "keeps the alignment history gave it". In 1938–41, history's alignment is the Axis at war.
   - **Fix:** scale the focus by what the track held back, e.g. the years since 1945 or the bloc era. Or apply it only
     to an end after the war (by its date, or a start from 1946 on).
   - **Seen fixed when:** `c66_freeburst.ts 1938 5151` and `1938 6161` declare within ±10 % of `c66_freeburst.ts 0
     5151` and `0 6161`, while `1975 5151/6161` keep their quiet first month (≤ 1.2 × plain 1938's per nation).
2. **R66-N2 (UI, editor and scenarios; new, R74b): the card in "Play free" at a later year contradicts itself.**
   - With the slider at 1975 and "Play free" chosen, the heading reads "World, 1975" and the map, nations and powers are
     1975's. But the description is 1938's: "The world on the eve of the Second World War."
   - Beside it, under "Play free", the panel says "A replay of history: the same world every game, with no seed or option
     to choose. Taking a nation, a God Mode act or an editor edit ends the replay…" (`critic/shots/c66rc_1975_free_1600x900_card.png`;
     at 390 × 844 at 1960, `critic/shots/c66sl_390x844_drag.png`).
   - The cause: `TitleScreen.tsx` takes the description from `history && replay ? replay.info : own`, while the heading
     and form take `replayed` (`history || year > 1938`).
   - **Fix:** a description of a free game from a year ("The world of 1 January 1975, played from there on its own
     course"); the fixed-seed note only under "Replay history".
3. **R66-N3 (diplomacy; new, R74h): the sea reach keys on a measure that leaves out the powers it names.**
   - ADR-1011: "great powers across any sea, as before (ADR-670's case: the United States and the Soviet Union)". Its
     test is the sim's `greatPowers`, the six strongest by `strengths`. ADR-1012 already found that this measure leaves
     the United States and Britain out of 1938.
   - In plain 1938 on 7019, `greatPowers` is SOV CHI ITA FRA JAP GER on day 0, then SOV ITA ENG CHI GER FRA at year 1.
     The United States is out until year 2, and Japan is out in years 1–3 (`npx tsx critic/scripts/c66_greats.ts 7019 3`,
     printed in the run).
   - So in those years the United States and Japan land only within 4,000 km of their transports: no Pacific crossing.
     Republican China, by the same measure, may land anywhere.
   - The effect on wars is not measured here.
   - **Fix:** the card's `cardPowers` measure (strength, income, warheads), or the top ten by income, for the reach.
     Or key it on the transports' lift and the navy rather than rank.
4. **R66-N4 (the replay, R74g; R65-N4 answered in part): D-Day's beachhead is still given, not fought, and Stalingrad's
   own stage has no German army.**
   - Not blocking: on the replay's own seed, the only world a player sees (`trackFronts 1938`, `critic/c66_tf_1938.log`),
     R74g's bar holds. Uranus: 9 against 6 engaged at the hour, both engaged in 27 of 28 samples, 7k and 16k lost.
     D-Day: 4 against 6 at the hour. Its 23 large land fronts: 10 engaged at the stage's hour (bar 9).
   - **D-Day** (`trackFronts` on 1938, 37701 and 38701 alike): "ENG of VIC, held by GER: 51 cells, 0 taken in the window; attacker
     6 f 75k (4 engaged), of 0k lost 0k; defender 8 f 81k (6 engaged), of 82k lost 1k; both engaged 0 of 28 samples".
     - The armies are there and touch at the hour, which is R74g's bar (`critic/shots/c66st_normandy_d6.png`).
     - But in the week after, neither side is engaged in any sample. The Allies lose no men. The 51 cells are handed
       over at the hour.
   - **"Stalingrad and Nalchik" (31 October 1942):** attacker 0 formations, 0 of 28 samples on 1938, 37701 and 38701
     (run 65 on 37701: 1 formation, 3k). The Sixth Army's arrival is dated 1 November, the day after the stage. Uranus is fought on 1938 and 37701
     (7 against 4 engaged, 4 of 28 samples) but not on new seed 38701 (0 and 0 engaged at the hour, 35 formations and 24
     near).
   - **Fix:** the arrivals a few days before their stage (the Sixth Army by 25 October). For D-Day, the beachhead taken
     by the landed divisions over the window rather than handed over at the hour.
   - **Seen fixed when:** `trackFronts` on 1938, 37701 and 38701 with Stalingrad's stage both engaged at its hour, Uranus
     both engaged at its hour on all three, and D-Day both engaged in at least a third of its 28 samples.
5. **R66-N5 (UI; new, R73): after a refused start the card no longer shows the year it names.**
   - The notice reads "The world of 1 January 1960 could not be loaded…". But the slider is back at 1938, the date reads
     "1 January 1938", and the mode is "Play free" though the start asked for "Replay history" (`critic/c66_by2.json`:
     slider 1938, date "1 January 1938" in all ten cases).
   - At 390 × 844 with a saved game, the notice is below the fold (top 920 px of 844).
   - **Fix:** open the card at the year and mode refused, the notice in view.
6. **R66-N6 (stats, card; new, R75b): the card's great powers name Spain for 1941–49.**
   - `years.json`'s `powers` (`cardPowers`): Spain (SPN, the renamed Nationalist Spain) is 7th in 1941–43, 6th in 1944,
     7th in 1945 above China, and in the list to 1949. China is missing in 1941–43 and 1945 (`critic/c66_starts/years.json`).
   - A neutral Spain worn out by its war (ADR-1008's own words) reads as one of the great powers of the Second World War.
   - **Fix:** weigh a nation at war more, or cap a measure of strength from a standing army at peace.
7. **Small:**
   - The arsenals the replay hands over in 1975 are SOV 26, USA 55, ENG 24, FRA 10, CCP 4 (run 65: SOV 13). People's
     China, in a free 1975 after 6161, launches its four warheads at one place over five days in October; all four are
     intercepted (`critic/c66_nukes75_6161.log`).
   - **Old, carried:**
     - the ranking's Land unit and "0 civilians killed";
     - R61-SC's three `slowClick` breaks and R64-N2's 36105;
     - Malta never taken (18 of 18 as run 65).

## Run 65's cases re-run

| Run 65 case | Run 65 (`5ee3e035`) | Run 66 (`a0880be6`) | Evidence |
|---|---|---|---|
| B1 `c65_x_badyear` (3 cases) | `?failed=save`, no notice | **fixed**: `?failed=start&year=Y`, a notice naming the year in each | `critic/c66_by.json` |
| B1 `c65_x_badyearsave` | the save blamed, Continue gone | **fixed**: the save's card untouched, Continue 1 | `critic/c66_bys.json` |
| R65-N1 `freeburst` 1954/1963/1975 × 5151/6161; traits 1975 | JAP>KOR in 6 of 6; JAP 85, ITA 80 | **fixed**: no JAP or ITA declaration in 30 days; JAP 10, ITA 15 | `critic/c66_fb_*.log`, `critic/c66_traits.log` |
| R65-N2 `c65_endhours` 999/5151/6161/31337 | India joins NATO in the end hour on all four | **fixed**: no join of 8 or 9, no declaration in the end hours | `critic/c66_endhours_*.log` |
| R65-N3 first 30 days of free 1963/1975; year after the track | 13/9 and 14/26; 83–98 | 4/3 and 5/9; 64–66 | `critic/c66_fb_*.log`, `critic/c66_track_*.log` |
| R65-N4 `x_stage normandy`, `uranus`; `trackFronts` 37701 | no army near; D-Day 0/0 | armies on both sides, engaged at the hour (D-Day 4/6, Uranus 7/4); D-Day not fought after the hour; Stalingrad's stage without Germans (R66-N4) | `critic/c66_st_*.json`, `critic/c66_tf_37701.log` |
| R65-N5 `landof 1975`, places | NFL, TAN, BEA alive; Gießen; Burgos | **fixed**: 0 cells each; Bonn; Madrid; Sudan | `critic/c66_landof_1975.log`, `critic/c66_pl_1975.json` |
| R65-N6 `x_replaycard` 1960/1965/1975 | 1938's map and 102 | **fixed**: 1960 101, 1965 128, 1975 154, each its map | `critic/c66_rc_*.json` |
| R65-N7 `x_buildpause 1600 900 1` | Resume undone | **fixed**: running after 3 s | `critic/c66_xbp_1600x900_p1.json` |
| Small: the desktop Next line | "Cameroon ind…" | whole | `critic/shots/c66rc_1960_replay_1600x900_start.png` |
| Small: Sino-Soviet air war of 1969 | 27 Soviet aircraft lost in July | **fixed**: no air fight in the hold | `critic/c66_air69.log` |
| Small: the 1975 H-bomb near Ulan Bator (after 6161) | 10 July 1975, on the page and headless | no detonation in 400 days on the page; headless, 4 CCP launches all intercepted in October | `critic/c66_an_y1975.json`, `critic/c66_nukes75_6161.log` |
| afterTrack 37601, 37603 (own cache) | 97/70 declared in year 1; JAP-USA in year 2 on 37601 | 64/70; no JAP-USA; blocs whole 10 years | `critic/c66_atx_*.log` |
| Named landing ×12, nvtraces ×2, diploInvariants 33501/3/5, 37001/3/5, worldInvariants 36009/11, 37007/9/11 | as run 64 | text-identical but 203997 (one click more, same break); all 0 broken | `critic/scripts/c66_cmpnamed.sh` |
| seaBattles 32061, 32063r | 75, 87 | 79, 57 (another world; sinkings out of battle 95, run 65: 21: Japan's fleets lost in the Baltic, see naval) | `critic/c66_sb_*.log` |
| workerDeterminism 32059 | `cf5a4a7f` every arm | `6c0b4082` every arm | `critic/c66_wd_32059.log` |
| 7019 / 32019, 20 years | `6f3905d6`, `9239b548` | `970a8195`, `a6398fdb` (from year 1: ADR-1011's rule) | `critic/c66_seed*_save.log` |
| Run 65's page suites (God, UI, editor, stats) | — | identical where the world is (q_36119, godtab, kwh, keys, continue, closeblock ×5, war list, ticker); the rest differ by the world or the card's new rows | `critic/scripts/c66_cmpjson.mjs` |
| Malta's 18 (due) | 18 not taken | identical | `critic/c66_malta.log` |
| Run 61's bulk sets (due) | 396/153/168 identical to run 63 | **366 of 396** landing setups identical (one break, 30041 g1, as before); **153 of 153** stuck returns; **162 of 168** next voyages (6 differ by an unsailed telling) | `critic/c66_liab_named_cmp.txt`, `critic/c66_sr_cmp.txt`, `critic/c66_nv_cmp.txt` |
| Perf chain | see run 65 | tick 99 2.10 ms (2.26), replay 1.70 (1.68), 120 m/px 53.6–56.3 (51.8–56.1), lookFps 58.5–60, figures 59.9 fps | `critic/c66_pf.status` |

## Design objections (none blocking, no score lowered)

- Canada, Australia and South Africa are still Britain's puppets in 1975 (`npx tsx critic/scripts/c66_landof.ts 1975 CAN
  AST SAF`: overlord ENG), so Canada is in no NATO. ADR-17 and the R67b note ("Canada a dominion of Britain's") decide
  it. A free 1975 game starts with three sovereign states as Britain's puppets.
- The Allied divisions on D-Day are set ashore by the timeline at hour 23 of 5 June, not landed by the sea (ADR-1010).
  It reads well at 3,000 m/px. At 120 m/px there is no crossing to watch.
- The Soviet income buff runs to 26 December 1991, past the track's end and into every free game from a late year. On
  four seeds the Soviet Union does not run away in the ten years after (2.6–2.9M men, behind the United States).

## Ideas from other games (not scored)

- Hearts of Iron IV ties its historical focus to the date and the nation's state, not to the moment the script stops.
  An Axis focus in 1939 is to fight, not to wait (R66-N1).
- Civilization's era screens: the card could say in one line what a later year's world is about ("1960: the Cold War;
  Africa's independences"), in place of 1938's line (R66-N2).

## Strengths (verified)

- **The batch fixed what it was asked to fix, on the critic's own probes.** All seven of run 65's non-blocking findings
  and B1 read fixed on the same seeds and cases: the end hours on four seeds, the free bursts on six, the names on the
  1975 start, the card at four years, the pause in the build (table above).
- **The replay's starts are the same world everywhere.** 38 of 38 yearly starts built here hash, count and rank their
  great powers as the deployed Linux build does (`critic/c66_starts/years.json`, `critic/c66_deployed_years.json`).
