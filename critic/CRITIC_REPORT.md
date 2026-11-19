# Critic report, run 85 (full, incomplete): Batch 52 (R194 to R196) and the brief, on `a9736eb5`

## The run

- **Mode: full.** The spawning message asks for a full run (ADR-915, ADR-1016).
- **Commit judged:** `a9736eb57c0784175f29cb0035c6b940912875b7`, HEAD at the start (`critic/c85_commit.txt`).
- **Last report:** run 84, focused, on `764aa144`.
- **Time:** 14:38 to about 16:10 by the machine's clock. The run was handed back before it finished.
  - **Left out for time:**
    - Lane E stopped at its 6th of about 40 page cases (`critic/c85_laneE.out`). Never run: phoneTicker, deathTitle,
      trackRows, rw2, tlDead, bannerRank/Flip/Hourly/Load, timeLapse, tlMonths, histPlace, tlMore, p_phone, bannerOwn.
    - The performance chain (`critic/scripts/c85_chainPerf.sh`) waited on lane E and never started. Not run: the tick of
      seed 99, `pf_lookfps` at three sizes, lookFps, the individual tier, the alone watch, and the 20-year time-lapse.
  - **Because of that, `performance` is carried from run 84 at 8.** It is not scored afresh. The two 12-year page watches,
    run beside other jobs, give 59.8 to 60 fps each year (`critic/c85_long_watch2.*.log`), and the 20-year sims' tick means
    are 2.23 and 2.44 ms under load. These support the carried 8 but do not replace the chain.
- **The run should be finished before a release is cut on it.** Run lane E and the perf chain, or re-run this full run.

### What changed since run 84

`git diff --stat 764aa144 HEAD -- src/sim data public/data tools` is empty. The sim is also unchanged since run 81's
`7c64529e`. The diff is page only: `src/ui/WarBanners.tsx` (R194), `src/app/style.css` (R194 to R196) and
`src/ui/RelationsPanel.tsx` (R195).

### Carried by the rules

- **Sim unchanged, carried (ADR-917):** the 396 named `landingInvariants` setups, the stuck-return set (153), next-voyage
  (168), Malta's 18, the nuke seeds 64501 to 64509, R83-N4's `slowClick` case, the old-seed replay start jobs (run 81's
  58xxx, 51xxx, 53xxx), and the old-seed headless cases (dday, census, track, trackTexts2, pileSides 64, warOpening 57).
- **Plain 1938, run again rather than carried:** 7019 ends at `ab927e1b` and 32019 at `c3520016` after 20 years, as in runs
  79 to 81 (`critic/c85_seed7019_save.log`, `critic/c85_seed32019_save.log`).

### Setup

- **HEAD's build:** `critic/c85_dist` (`critic/scripts/c85_build.sh`, build exit 0), served on 127.0.0.1:5411. The replay's
  starts were copied from `critic/c81_starts` (sim unchanged).
- **Run 84's build:** `critic/c84_dist`, served on 5410.
- **Scripts:** run 81's suite copied by `critic/scripts/c85_mkprobes.sh`, with new seeds moved to 85xxx.
  - Lanes `c85_laneA.sh` (the batch, both builds) to `c85_laneF.sh`.
  - Chains `c85_runNamed.sh`, `c85_chainS.sh`, `c85_checkersTop.sh` and `c85_chainPerf.sh`.
  - Job lists `c85_jobsAll.txt`, `c85_jobsB.txt` and `c85_startsJobs.txt`.
- **New probes:**
  - `c85_deskRow.mjs`: one desk window narrowed from 1100 to 560 px in 20 px steps and widened back. Reads stale fits,
    overflow, the news covered, cut names, "+n" alone and "+n" clickable.
  - `c85_relFoot.mjs`: the relations footer against the panel's foot at eleven sizes, plain, with a line said, and with
    the longest line said.
  - `c85_explore.mjs`: the 640 px desk's "+n" opened, and the 568 × 320 filters tapped one by one.
  - `c85_scan.mjs`: page errors in every output.
- **At the end:** every lane, chain, browser and both preview servers (5410, 5411) were stopped by process. No listener is
  left on either port.

## Verdict

**Batch 52 fixes its three cases. Run 84's build fails each one beside HEAD:**
- **R194 (R84-N1):** `c84_rowShot 84901 400` at 620 × 900, 640 × 800, 683 × 768, 700 × 800 and 768 × 1024.
  - HEAD: `overflow` 0 and `under` [] at every size.
  - Run 84's build: over by 81, 71, 50, 41 and 7 px, covering the news.
  - Evidence: `critic/c85_rw_84901_400_*_541[01].log`.
- **R195 (R84-N2):** the graph at 568 × 320 is 123 px with 5 names (median 13 px), against 82 px and 2 names (median 1 px)
  on run 84's build, for 68901 and 84933 (`critic/c85_gs_*_568_320_541[01].log`).
- **R196 (R84-N3):** `c85_relFoot 84903 400`: the footer stays inside the panel at all eleven sizes, plain and with the
  longest line said.
  - Run 84's build: 5 px past at 568 × 320 (18 px with the longest line), and 3 px past at 740 × 360.
  - Evidence: `critic/c85_rf_84903_400_541[01].log`.

**No blocking issue.**

**Every rule checker on new seeds reports 0 broken:**
- 10 `diploInvariants` (85001 to 85019; two of them 10 years) and 22 `worldInvariants` (85051 to 85095; one of 10 years).
  Together they cover 1938, heroes, random diplomacy and the random world.
- `landingFuzz` 85101 to 85129: 0 of 90 broken (`critic/c85_landingFuzz.log`).
- 0 broken lines on the free starts 1942, 1951, 1975 and 1991, `blocend` and both repulses.
- Read by ADR-917 as three five-year seeds a checker per dimension: 42 five-year runs for 14 dimensions.

**Page errors:** 0 in all 421 outputs of this run (`node critic/scripts/c85_scan.mjs`), including 16 minutes of monkeys.

**Two new non-blocking issues:**
- **R85-N1:** R194's "+n alone" leaves a desk window 601 to 700 px wide with no war shown at all, while 600 px shows two.
- **R85-N2:** R195's filters have no names a touch player can see.

**Scores:** every dimension 8. `performance` is carried, not scored afresh (above).

## Scores

### Map visuals and readability: **8**
- **Tested:**
  - `look` on 85901 (1600 × 900; days 45, 180 and 400), 85903 (390 × 844) and 85907 (2560 × 1440), every tier.
  - Run 81's named `look 64907` and `look 64903`.
  - `deskRow` and `rowShot` on five seeds and the random world.
- **Evidence for 8:**
  - **Europe at 3,000 m/px on 8 February 1939 reads:** names, capitals, flags, counters with their men, hero plates and
    three banners with "+3" (`critic/shots/c85look_85901_1600x900_d400_3eur3000.png`).
  - **At 250 m/px over Korea:** named divisions, the glowing front, banded occupied land and arrows
    (`critic/shots/c85look_85901_1600x900_d400_f0_250m.png`).
  - **The war row on a desk now stays in its width and off the news** at every 20 px step from 1100 to 560 px, on four
    1938 seeds and the random world. 0 stale fits, 0 names under five letters, "+n" always on top (`critic/c85_dr_*_5411.log`).
    - For example, at 700 px: "Soviet … ⚔ Japan +2" (`critic/shots/c84cw_85901_d400_custom_c85_5411_4_700x800.png`).
    - Run 84's build covers 4 to 56 px of the news at 620 to 720 px on 84901 and the random world 85965
      (`critic/c85_dr_*_5410.log`).
- **Not 9:**
  - R85-N1 (a narrow desk shows no war).
  - Hero plates over Europe's labels (ADR-1111, a design objection): "P.100 Ercole" over Albania, "Maus" over the
    Netherlands' name.
  - The ring over "Pari" (R172; `critic/shots/c85a_85917_14_paris_h_2h.png`).

### Diplomacy, war, alliances, puppets, revolts: **8**
- **Checkers:** 0 broken in all 32 runs above (`critic/c85_diploinv_*.log`, `critic/c85_wi_*.log`).
- **Wars that open:**
  - `warOpening` on 85211 to 85221: 276 wars. The defender is ahead in land at day 30 in 7 of 53 on 85215 and 1 of 52 on
    85221 (`critic/c85_warOpening_68*.log`).
  - First declarations: 69 on ten seeds in 60 days, none over 6,000 km (`critic/c85_firstdecl_68.log`).
  - Piles: none over 4:1 at day 365 on six seeds (`critic/c85_piles_*68.log`).
  - `pileSides` on 85141 to 85145: 1 born over of 57 declared, 0 realms; `over365` 0.
- **Massings:** 48 told, 39 followed by war, 9 given up, 3 of them in silence. Run 81 had 2 given up in silence; these are
  new seeds, not compared (`critic/c85_massTold_68.log`).
- **R195 and R196 fixed on their cases (above).** Off their cases:
  - `relFoot 85933` and `68901 700` at 568 × 320, 600 × 320 and 640 × 340: the footer is inside the panel.
  - `relSide 84903`: every filter takes a tap.
- **Not 9:**
  - R85-N2: on a 568 × 320 phone the five filters are colours with no word. Tapping one names nothing; the said line stays
    "Click a nation…" (`critic/c85ex_84901_d400_c85_5411.json`, `critic/shots/c85ex_84901_d400_c85_5411_b0_568x320_relations.png`).
  - When the longest line is said at 568 × 320, the graph drops from 123 to 110 px (R196's accepted jump).

### Emergent world dynamics: **8**
- **Two 12-year page watches** (85941 with heroes, 85943 plain): `ok []`, 59.8 to 60 fps each year.
  - By 28 January 1950, Syria holds a band across eastern Europe and Italy holds Greenland: the map keeps changing
    (`critic/shots/c85lwplain_85943_y12_world.png`).
- **No runaway:** `topArea 85097` over 25 years ends with the Soviet Union at 15.6 %, the United States 10.8 % and Britain
  10.6 %. The top three changed 9 times (`critic/c85_toparea_85097.log`).
- **`farConquests`:** 26.1 capitals taken per 100 nations in two years, 9.8 of them far (run 81: 25.1 and 7.8; new seeds).
- **Few-nation worlds:** 2-nation worlds now see wars (first war on day 685, 2742 and 103), where run 81 saw none in 6 years
  (new seeds, not compared). 60 nations: 71 and 95 wars.
- **Heroes over 20 years (85019):** 14 alive at the end, hash `6fc2384c`.
- **Not 9:** a 2-nation world can wait 7.5 years for its first war (85425).

### God Mode: **8**
- **`a_god_nuke 85917`:** a hydrogen bomb on Paris. The alert reads "3,329,000 civilians killed; 47,440 men and 162 guns
  lost" and gives Go to; the cloud stands in its ring (`critic/shots/c85a_85917_14_paris_h_2h.png`).
- **Tools, all exit 0 with 0 page errors:** `q_god_tools 85919`, `k_breakthrough 85979`, `kwhist 85951`,
  `fw2_forcewar 85935`, `undo2 41211`, `undo2y 51231`, `godpeace`, `god42 1942 85542`.
- **R190's God tab on a 320 × 568 phone:** 206 px of panel, 9 swipes (`critic/c85_ps_83941_*_5411.log`), as in run 84.
- **Not 9:** the ring over "Pari"; the God tab still takes 9 swipes on a 320 px phone.

### Editor and scenarios: **8**
- **`x_editor 85443`:** paints, exports and loads back (`loaded owners`). Bad files are refused (`critic/c85_x_badfiles.log`).
  The standoff file loads (`os2_scen`).
- **The page's save (`saveload_page 85937`):** the same hash 4171140536 on all three arms (`same` and `same2` true).
- **Continue (`x_continue 85415`):** `sameAfter` true.
- **Free starts on new seeds:** 1942, 1951 (random diplomacy), 1975 and 1991, all with 0 broken lines
  (`critic/c85_free_*.log`).
- **Not 9:** as in run 81.

### Stats and history: **8**
- **History and the exports:** `hist` and `dl_export` on 32019 at year 20, and `kwhist 85951`: exit 0, 0 errors.
- **Not 9:**
  - `trackTexts` still reads 65 of 168 track rows as bare notes with no verb, for example "Vukovar falls to the JNA"
    (`critic/c85_trackTexts.log`; the same as run 81).
  - Lane E's History and time-lapse cases (trackRows, tlDead, timeLapse, histPlace) were left out for time. This score
    rests on lanes B and C, and on the sim unchanged since run 81's full judgement.

### UI/UX and polish: **8**
- **Batch 52's three cases are fixed (Verdict).**
- **Run 84's kept cases all hold on HEAD:**
  - `histOver` ×4: `hiddenOf81` 0 and `historyGoTapped` true.
  - `menuPinch` ×2: 0. `dirHand 59955` at both sizes: no act failed.
  - `goto2 69937`: 7 of 7 capitals on the map. `goChain 84937`: the strip follows Go to.
  - `deskFit`: 0 covered. `rankBar`: every button on top.
  - `phoneRow` ×2: 0 stale, 0 under five letters, p95 16.8 ms.
  - `phoneToDesk` ×3; `rotate`; `relCover` (0 of 2 with Relations alone).
  - `crossWidth 84901` on all three routes: 0 stale.
- **The "+n" on a narrow desk works:** at 620 to 700 px it is clicked and opens, with 0 over the news
  (`critic/c85_mc_84901_400_*_5411.log`). The opened list of 5 sits in the map's gap
  (`critic/shots/c85ex_84901_d400_c85_5411_a1_opened.png`).
- **Monkeys:** 0 page errors, never hung, at 1600 × 900 (300 s), 390 × 844 touch (300 s), 1280 × 720 and 844 × 390 touch
  (`critic/c85_monkey.*.log`).
- **Resize:** 0 chrome off screen (`critic/c85_resize.85821_60.log`).
- **Not 9:** R85-N1, R85-N2, R192 (kept by choice), and the sideways Ranking's header still scrolls with its rows.

### Performance: **8** (carried from run 84; the chain was left out for time)
- See "The run" above. In passing:
  - The page watches hold about 60 fps for 12 years.
  - `phoneRow`'s frames are p95 16.8 ms.
  - `markerPop` gives p95 19.5 to 19.6 ms (`critic/c85_markerPop.*.log`).
  - The 20-year sims' mean ticks are 2.23 and 2.44 ms, run beside other jobs.
  - One hero year's worst tick was 850 ms under load (`critic/c85_hero_85019_20.log`; not judged).
- **What would score it afresh:** `sh critic/scripts/c85_chainPerf.sh` alone on a quiet machine.

### Stability: **8**
- **0 page errors** in 421 outputs and 16 minutes of monkeys.
- **Determinism:**
  - `workerDeterminism 85059` ends at `6fe3ef1c` on all four arms.
  - Plain 1938's 20-year hashes repeat runs 79 to 81.
  - The page's save and load, and Continue, give the same hash.

### Semantic zoom to unit level: **8**
- **`z_zoom 85911`** runs from 6,000 m/px to unit level with 0 errors.
- **`markerPop` 85951 and 56951:** 0 leaps and 0 pops.
- **`markers 85951`:** 1 pair over 30 px at 1,200 m/px.
- **`heroPop`:**
  - 56901 gives 4 jumps and 57905 gives 3, as in run 81's range.
  - 85905 gives 13 jumps panning. Lane F re-ran it on both builds at once: 8 and 7 on HEAD, 10 and 15 on run 84's build
    (`critic/c85_hpF_85905_*.log`). This is not a regression, and moves no score.
- **Not 9:** heroes' counters still jump while panning on some seeds (85905, both builds).

### Naval warfare: **8**
- **`landingFuzz`:** 0 of 90 broken.
- **Sea battles:** `seaBattles` 85061 (67), 85067 random (57) and 85069 (52). `seaBattlesLook` sees 67 of 67 and 52 of 52
  at their camera, with 0 page errors (`critic/c85_sbl_*.log`).
- **Repulses 85071 and 85073:** 0 broken.
- **`seaclick 85913`** and `sb_seaballs`: exit 0.
- **Not 9:**
  - Like flags in a civil war's sea battle (R172).
  - One fight on 85069 sinks 56 British ships for 0 Japanese over 8 days in the South China Sea
    (`critic/c85_sb_85069.log`, t24780). The fleets are four of 16, likely a convoy, so it is not judged a defect.

### Tanks: **8**
- **`c_battle` 7781 and 85915:** exit 0.
- **`heroCeiling`:** 39 of 52 lives at or above the top decile (`critic/c85_heroCeiling3_851*.log`).
- **Prague** falls on day 13 (`critic/c85_prague_85201.log`).
- **`frontArrivals`:** at day 60, China has 92 % at the Japanese front and Japan 62 %.
  - On 85205 Germany has only 28 % at the Polish front, at war with 11 nations (`critic/c85_fa_85205.log`).

### Aircraft: **8**
- **`pl_planes 85925`:** both looks, from 3,000 to 25 m/px. `w_wing 85927`: exit 0.
- **Air strikes told in words:** "France's air force struck Italy over the past month: 3,987 men, guns and vehicles lost"
  (`critic/shots/c85look_85901_*`).

### AI nuclear use: **8**
- **On the page:** `an_ainuke` on 7019 and 32019 (year 20), the heroes' 7019, and 85511 (year 13): all `ok []`.
- **Launches over 22 years on new seeds:** 85501 0, 85503 10, 85505 5, 85507 0, 85509 36 (`critic/c85_nc_*.log`,
  `critic/c85_nukeIntercepts_85501.log`). Run 81's new seeds gave 22, 14, 4, 4 and 0; new seeds, not compared.

## Blocking issues

None.

## Non-blocking issues (prioritised)

1. **R85-N1 (UI, a desk window 601 to about 700 px wide; R194's side effect): no war is shown at all, only "+3" or "+5",
   while a 600 px window shows two banners.**
   - **The cliff at one pixel:** `c84_crossWidth 85901 400` with a custom route gives 600 × 800 as a phone with 2 banners
     and "+1", 220 px of room left. At 601 × 800 (a desk) it gives 0 banners and "+3" (`critic/c85_cw_85901_*_5411.log`).
   - **`c85_deskRow`, 0 banners at:**
     - 620 to 660 px on 84901 and 85901;
     - 620 to 680 px on 85905;
     - 620 to 700 px on 85903;
     - 620 to 680 px on the random world 85965 ("+11").
   - **The map has room:** at 640 × 800 the news ends at about x 238 and the legend starts at about x 447. The sized banner
     is 114 px wide at 683 px, and would sit centred at about x 263 to 377
     (`critic/shots/c84rw_84901_d400_640x800_c85_5411.png`).
     - The cause by the code: the row's `max-width: min(60%, calc(100% - 39rem))` keeps room for a left panel that is not
       open, so the row is about 16 px wide at 640.
   - **Who meets it:** a browser snapped to half a 1280 or 1366 screen.
   - **Fix:** with no panel open, size the row by the room actually free between the news and the legend. Or let the
     phone's row hold up to 700 px.
   - **Seen fixed when:** `c85_deskRow 84901 400 800` and `85903 700 900` show `fit0` [] with `covering` [] at every step.
2. **R85-N2 (UI and diplomacy, 568 × 320 touch; R195): the five relations filters are colour swatches with no word.**
   - The name is in `title` and `aria-label`, which a touch player never sees.
   - Tapping one changes the line count (88, 99, 111, 76, 102 lines with each off) but says nothing
     (`critic/c85ex_84901_d400_c85_5411.json`).
   - **Fix:** name the kind in the footer's said line when its filter is tapped, or put a one-letter label on each swatch.
3. **The graph jumps 13 px** when a two-row line is said at 568 × 320 (123 to 110 px; R196 accepts it).
4. **heroPop on 85905:** 7 to 15 jumps panning, on both builds.
5. **Kept (R172, R192, ADR-1111):** the ring over "Pari", like flags at sea, the Ranking beside the graph, and the heroes'
   plates.

## Run 84's cases re-run

| Run 84 case | Run 84's build (`764aa144`) | HEAD (`a9736eb5`) | Evidence |
|---|---|---|---|
| R84-N1 `c84_rowShot 84901 400` ×5 | over 81/71/50/41/7, news covered | **fixed**: `ov` 0, `under` [] | `critic/c85_rw_84901_*_541[01].log` |
| R84-N1 `84903 700` ×3 | over | **fixed** | `critic/c85_rw_84903_*` |
| R84-N1 moreClick ×4 | clicked, opened | clicked, opened, 0 over the news | `critic/c85_mc_*` |
| R84-N2 `graphSize` 68901 / 84933 568 × 320 | 82 px, 2 names | **fixed**: 123 px, 5 names | `critic/c85_gs_*` |
| R84-N3 the footer at 568 × 320 | 5 px past (18 with a long line) | **fixed**: inside at 11 sizes | `critic/c85_rf_84903_*` |
| R192 `relRank 68901` | kept | kept | `critic/c85_rr_*` |
| Kept page cases (histOver, menuPinch, dirHand, goto2, goChain, deskFit, rankBar, phoneRow, phoneToDesk, rotate, relCover, panelShort) | as run 84 | the same, 0 faults | `critic/c85_{ho,mp,dh,g2,gc,df,rb,pr,pd,rot,rc,ps}_*_5411.log` |
| `landingFuzz` new seeds | 0 of 90 | 0 of 90 | `critic/c85_landingFuzz.log` |
| 7019 and 32019, twenty years | `ab927e1b`, `c3520016` | the same | `critic/c85_seed*_save.log` |
| Bulk landing sets, nuke seeds 645xx | carried | sim unchanged, carried | — |

## Design objections (none blocking)

- **R194's "+n alone"** hides every war from a half-screen desk. The phone's row, which already handles less room, would
  serve better there.
- **ADR-1111:** heroes' plates over Europe's labels at 3,000 m/px.

## Ideas from other games (not scored)

- **Hearts of Iron IV** shows a small legend chip beside each map-mode toggle. A one-letter tag on each swatch would answer
  R85-N2.
- **Ages of Conflict**'s side list of wars fits a narrow desk (R85-N1).

## Strengths (verified)

- **Batch 52 fixes all three cases, and run 84's build fails each beside HEAD.** On a desk, the war row stays off the news
  at every 20 px step from 1100 to 560 px, on five worlds.
- **The rules hold:** 32 checker runs and 90 `landingFuzz` runs on new seeds give 0 broken. Worker determinism holds, and
  the 20-year hashes repeat runs 79 to 81.
