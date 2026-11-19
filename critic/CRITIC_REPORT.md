# Critic report, run 81 (full): Batch 48 (R174 to R176) and the whole brief, on `7c64529e`

## The run

- **Mode: full.** The spawning message asks for a full run (CRITIC_PROMPT, ADR-915).
- **Commit judged:** `7c64529ead48045bcc461060273b8a0cad8f26e4`, HEAD at the start (`critic/c81_commit.txt`).
- **Time:** 06:15 to about 08:55 by the machine's clock. Nothing of the brief was left out for time.
- **Carried, by the rules:**
  - **The sim is unchanged since run 80's commit.** `git diff --stat 18c2b40a HEAD -- src/sim data public/data tools` is empty.
    So the 396 named `landingInvariants` setups that run 80 finished are marked "sim unchanged, carried" (ADR-917).
  - **Run 80's left-outs on this same sim were run this time:**
    - all 153 stuck-return runs;
    - the 168 next-voyage runs;
    - Malta's 18;
    - the nuke seeds 64501 to 64509;
    - `trackTexts2` (R171);
    - `afterTrack` 55601 and 37601;
    - the heroes-on God and sea cases;
    - `dirHand` at 844 × 390;
    - the performance chain.

### What changed since run 80

- **Page only:**
  - `src/app/App.tsx`, `hud.ts`, `game.tsx` and `MapView.ts`: R175 (`relationsOver`) and R176 (`onGoToNation`, `capitalOf`).
  - `src/app/style.css` and `src/ui/WarBanners.tsx`: R174. A name of 8 letters or fewer gets `min-width: max-content`, a
    longer one `6ch`; the phone's closed row hides the score's figure.
- **Plain 1938's 20-year hashes are unchanged:** 7019 ends at `ab927e1b`, 32019 at `c3520016` (`critic/c81_seed7019_save.log`,
  `critic/c81_seed32019_save.log`), as in runs 79 and 80.

### Setup

- **Builds:**
  - HEAD built into `critic/c81_dist` (`critic/scripts/c81_build.sh`: build exit 0). The replay's yearly starts were copied
    from run 80's (`critic/c80_starts`), because the sim, data and tools are unchanged. Served on 127.0.0.1:5403.
  - Run 80's build (`critic/c80_dist`, `18c2b40a`) served on 5404 for the batch's own cases. No worktree was needed.
- **Scripts and seeds:** `critic/scripts/c81_*`. Run 80's scripts were copied by `c81_mkprobes.sh`, with the new seeds moved to
  69xxx; run 80's named cases keep their seeds.
- **New probes:**
  - `c81_bannerFit.mjs`: R174. Checks the row as a whole: overflow, overlaps inside a banner, squeezed swatches and swords,
    the "+n" button.
  - `c81_relOver.mjs`: R175. A's panel, then Relations, then B chosen outside the graph, then A again, then a node, then
    Relations closed.
  - `c81_goto2.mjs`: R176. The capital's screen point after the flight, and whether a panel covers it.
  - `c81_histOver.mjs`: R170 off its case, History and Relations over a nation panel at phone sizes.
  - `c81_moreClick.mjs`: whether "+n" can be clicked at desk sizes.
  - Lanes `c81_laneA.sh` (the batch) to `c81_laneE.sh`, `c81_chainBulk.sh`, `c81_chainPerf.sh`.
- **At the end:** every chain, sim and browser of mine was stopped. Both preview servers (5403, 5404) were stopped by the
  processes holding their ports. The `vite preview` on 4174 is not mine and was left running.

## Verdict

**Scores:** `uiUxPolish` stays at **7**, held at the bar by R81-B1. Every other dimension is at 8, performance among
them, scored afresh this time (run 80 carried it).


**R80-B1 is fixed.**
- On run 80's own cases every short name shows whole and every long name keeps 7 or more letters. For example, at 390 × 844
  on 68901 day 400: "Soviet Uni…", "Japan", "Japan", "China" (`critic/c81_bn_68901_400_390x844_5403.log`).
- Run 80's build on the same case gives "China" 0 letters (`critic/c81_bf_68901_400_390_844_1938_5404.log`).

**R80-N1 (R175) and R80-N2 (R176) are fixed on their cases.**

**One new blocking issue: R81-B1.** On a phone held sideways, History opens under an open nation panel.
- At 844 × 390, 81 of 81 points of History's panel are covered; at 667 × 375 and 932 × 430, 63 of 81.
- `dirHand 59955 120 844 390 touch` fails its History act, as R79-N3 did at 390 × 844.
- This contradicts R170's claim, "on a phone History stands in the nation panel's place". `usePhone` and ADR-760 count
  844 × 390 as a phone.
- R175 now does this right for Relations at the same sizes (0 of 81 covered), so the two panels disagree.
- Run 80's build fails the same way: it is R170 left unfinished, not a new regression.

**Every rule checker on new seeds reports 0 broken:**
- 24 `diploInvariants` (20 on new seeds, 4 on named older ones);
- 8 `worldInvariants`;
- 90 `landingFuzz` (69101 to 69115);
- 153 stuck-return runs.

The next-voyage set's 3 breaks are all `slowClick`, a timing bound (ADR-914). They are the same 3 files that break in run
77's set. Re-run alone with `landingInvariants`, they are named `slowClick` (`critic/c81_li_nv_*.log`).

## Scores

### Map visuals and readability: 8 → **8**
- **Tested:**
  - `look` 69901 (1600 × 900, days 45, 180 and 400), 69903 (phone) and 69907 (2560 × 1440), every tier, both looks.
  - Run 80's `look 64907` at 2560 × 1440 and `look 64903` on a phone.
  - `glSpot 64907` at 2560 × 1440.
  - The banner row at twelve sizes.
- **Evidence for 8:**
  - **Europe at 3,000 m/px, 8 February 1939, reads cleanly:** named nations, capitals, the heroes' plates (TOG II, HMS Hood),
    planes over France, counters with their men (`critic/shots/c81look_69901_1600x900_d400_3eur3000.png`).
  - **At 250 m/px on the Japanese-Chinese front at Hengyang:** named divisions, the glowing front, hatched occupation, arrows
    (`critic/shots/c81look_69901_1600x900_d400_f0_250m.png`).
  - **0 page errors on every `look`** and on `glSpot 64907` (`critic/c81_glSpot.64907_2560_1440_500_1043.43_273.0.log`).
- **Not 9:**
  - The war row on small phones loses its colour swatches (R81-N1).
  - The strike's ring over "Pari" (kept by R172; `critic/shots/c81a_69917_14_paris_h_2h.png`).

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **8**
- **Checkers on new seeds, 0 broken each:**
  - `diploInvariants` 69001 to 69019 (1938, random diplomacy, heroes, the random world; two of 10 years) and 69021 to 69039
    (random diplomacy with heroes).
  - Run 79's 64015 and 64011 with heroes.
  - `worldInvariants` 69051 to 69065 (`critic/c81_diploinv_*.log`, `critic/c81_wi_*.log`).
- **Wars that open:**
  - `warOpening` 64211 to 64215 repeats run 80's lines exactly (`critic/c81_wo_64.log`).
  - New seeds 69211 to 69215: the defender ahead at day 30 in 3 of 48 on 69215 (`critic/c81_warOpening_68.log`, named for
    the old family by the copy; its seeds are 692xx).
- **First declarations:** 57 on ten seeds in 60 days, none over 6,000 km (`critic/c81_firstdecl_68.log`, seeds 698xx).
- **Massings:** 51 told, 46 followed by war, 5 given up. 2 were given up in silence (run 80: 1; new seeds, not compared)
  (`critic/c81_massTold_68.log`).
- **Piles:**
  - At day 365, 1 of six new seeds has a war over 4:1: Iraq against Saudi Arabia, 10:1, on 69153 with heroes
    (`critic/c81_piles_h68.log`). New seeds, not compared.
  - `pileSides 64` repeats run 80.
- **R175 (Relations over a nation panel), fixed on its case:**
  - HEAD: `menuPinch 68933` gives `hiddenOf81` 0 at 390 × 844 and at 844 × 390.
  - Run 80's build: 45 and 81 (`critic/c81_menuPinch_68933_*_540[34].log`).
  - The panel comes back when the graph closes with no choice (`critic/c81_relOver_*_5403.log`, step 8).
- **Not 9:**
  - R81-N4: a nation chosen again from outside the graph gets no panel.
  - Alliances still join across the world for no reason a watcher sees (as in runs 79 and 80).

### Emergent world dynamics: 8 → **8**
- **Two 12-year page watches** (`long_watch2` 69941 with heroes, 69943 plain): exit 0, `ok []`
  (`critic/c81_long_watch2.*.log`).
- **No runaway:** `topArea 69097` over 25 years ends with the Soviet Union at 17.3 %, then France 14.3 %, the United States
  11.1 %, Britain 8.8 % and Brazil 8.3 %. The top three changed 5 times (`critic/c81_toparea_69097.log`).
- **Twenty years with heroes** on 69019 and on 7019: finished, with 12 heroes alive at the end (`critic/c81_hero_69019_20.log`,
  `critic/c81_hero_7019_20.log`).
- **`farConquests`:** 25.1 capitals taken per 100 nations in two years, 7.8 of them far (`critic/c81_farc_68.log`).
  Run 80: 27.5 and 8.6; new seeds, not compared.
- **Few-nation worlds:**
  - 2, 3 and 60 nations live.
  - The three 2-nation worlds see no war in 6 years (`critic/c81_few2_68.log`), as in earlier runs.
- **Not 9:** as in run 80. Two-nation worlds stay at peace for 6 years.

### God Mode: 8 → **8**
- **Strikes:** `a_god_nuke 69917`, run 80's 64917, and 64917 with heroes on put a hydrogen bomb on Paris. The alert names the
  toll: "3,329,000 civilians killed; 47,440 men and 162 guns lost". The cloud stands in its ring
  (`critic/shots/c81a_69917_14_paris_h_2h.png`).
- **Tools:** `q_god_tools 69919`, `undo2 41211`, `undo2y 51231`, `k_breakthrough 69979`, `fw2_forcewar 69935`,
  `godpeace` and `god42`: exit 0, 0 page errors (`critic/c81_lane*.out`, a scan at the end of every one of this run's 318 JSON outputs: 0 with an error).
- **Breakthrough:** told in the ticker, History, the CSV and the JSON (`critic/c81_kwhist.69951.log`).
- **Not 9:** the ring still covers "Pari".

### Editor and scenarios: 8 → **8**
- **`x_editor 69443`:** paints, undoes, exports (591,883 bytes) and loads back (`critic/c81_x_editor.69443.log`).
- **Bad files are refused** (`critic/c81_x_badfiles.log`). The standoff file loads (`os2_scen`).
- **The replay's starts:** 45 start jobs and 14 named jobs, all exit 0 except three named `landingInvariants` cases
  (30041 g1, 51101 g1, 53125 g2). Those exit 1 for `slowClick`, the same lines as run 80; 27037 exits 0. Details:
  - The free starts 1942 to 1991 on new seeds 69542 to 69611 ran with 0 broken lines.
  - `afterTrack` 55601 and 37601 ran this time (`critic/c81_atx_*.log`).
  - `oldsave 1975` loads run 79's start.
  - `saveload 1942 god` gives the same hash on both arms.
- **The page's save** (`saveload_page 69937`) and Continue (`x_continue 69415`): exit 0.
- **Not 9:** as in run 80.

### Stats and history: 8 → **8**
- **R171 judged now (left out in run 80): fixed.**
  - `trackTexts2` runs each alliance-join row through the game's `trackText`. It gives "The Tripartite Pact: Romania",
    "The Tripartite Pact: Hungary" and "Comecon: Albania" (`critic/c81_trackTexts2.log`).
  - R79-N4's "Romania joins the Anti-Comintern Pact" under the Tripartite Pact is gone.
- **On the page:** track rows of 1940, 1941 and 1949, for example "30 August 1940 The Second Vienna Award to Hungary"
  (`critic/c81_trackRows.1940_365.log`).
- **History, the CSV and JSON exports, and `kwhist 69951`:** exit 0, 0 errors.
- **Not 9:** 65 of 168 track rows are still bare notes with no verb, for example "Stanley taken" or "Okinawa returned to
  Japan" (`critic/c81_trackTexts2.log`: told 62, as it is 41, bare 65).

### UI/UX and polish: 7 → **7** (R81-B1 blocking)
- **Fixed on their cases, run 80's build beside HEAD:**
  - **R174:** the four named cases now show every side whole, or 7 or more letters with the ellipsis (table below).
    - On the random world at 390 × 844, run 80's build gave "Alaska" 2 letters; HEAD gives it whole.
    - Opened ("+n"), every name is whole at 390 × 844 and 360 × 740.
  - **R175:** above.
  - **R176:** `goto 68931` on HEAD ends at (1095, 344.5) at scale 20.9, Rome, by 2 s. Run 80's build stays at (1024, 512) at 0.79
    (`critic/c81_goto_68931_540[34].log`).
    - On the desk, all 8 chips plus 12 more on day 700 land with the capital at the view's centre and on open map
      (`critic/c81g2_68931_1600x900_d0.json`, `critic/c81_goto2_69931_1600x900_700_5403.log`).
- **Monkeys:** 0 page errors in 16 minutes at four sizes; never hung or gone (`critic/c81_monkey.*.log`).
- **Resize:** 0 chrome off the screen (`critic/c81_resize.69821_60.log`).
- **Why 7, the score not moving back to 8:**
  - **R81-B1:** History is unreachable behind a nation panel on a sideways phone. It is the defect R170 claims fixed "on a
    phone", and R175 fixed it for Relations alone.
  - **R81-N1:** on phones 375 px wide or less, R174 keeps short names whole by squeezing the colour swatches to 0 px. At
    320 px the swords and the skull are drawn over "& 2" and "& 1".
  - **R81-N2:** "Go to country" on a phone puts the capital under the newly opened panel in 11 of 27 flights. That is every
    flight at 360 × 740, where no clear room is left.
  - **R81-N3:** at 1024 × 768 on the desk, the war row's "+n" lies under the legend and cannot be clicked.
- **What the bar needs back at 8:**
  - `node critic/scripts/c81_histOver.mjs 68901 60 844 390 GER` (and at 667 × 375 and 932 × 430) against HEAD's build
    shows `history-btn.hiddenOf81` 0 and `historyGoTapped` true.
  - `dirHand 59955 120 844 390 touch` ends its History act with no "act failed".
  - The portrait case `dirHand 59955 120 390 844 touch` stays as it is now ("A major battle began near Elbląg",
    `cutsAfterAct` 0).

### Performance: 8 (carried) → **8** (scored afresh; the chain was run this time)
- **The tick of seed 99, five years:**
  - Plain: 1.834 ms mean, hash `ca4700f1` (`critic/c81_tick99.log`). Run 79: 1.818 ms, the same hash.
  - With heroes: 1.639 ms (`critic/c81_tick99h.log`). Run 79: 1.617 ms.
- **Frames on 7019's year-20 world, at the battle spot, 3,000 to 30 m/px in both looks** (`critic/c81_pf_lookfps*.log`):

  | Size | Least mean fps | Highest p95 | Worst frame | Run 79 |
  |---|---|---|---|---|
  | 1600 × 900 | 59.3 | 18.3 ms | 111 ms | 59.6, 18.2, 116 |
  | 2560 × 1440 | 59.4 | 18.2 ms | 121 ms | 59.5, 18.4, 126 |
  | 3840 × 2160 | 59.4 | 18.2 ms | 122 ms | 59.5, 19.1, 119 |

- **With heroes:** the probe found no battle spot on this run's heroes save (probe fault, `critic/c81_pf_lookfps_h.log`). On
  run 79's heroes save it gives a least mean of 57.8 fps and p95 18.1 ms (`critic/c81_pf_lookfps_h79save.log`; run 79:
  59.4, 18.2).
- **`lookFps 7019`:** forced 59.2 to 59.8 frames/s at every tier, and a draw of 1 to 2.2 ms (`critic/c81_lookfps.log`), as
  in run 79.
- **The individual tier `x_indfps 64111`:** 59.5 to 60 fps, p95 16.8 ms (`critic/c81_xi.log`).
- **A 12-year watch on the page alone (`long_watch2 64945`, heroes):** 58.6 to 60 fps each year, `ok []`
  (`critic/c81_lw_64945_alone.log`).
- **Run 79's 7019 year-20 save** loads and runs a year at 1.81 ms a tick (`critic/c81_loadold_7019.log`).
- **The time-lapse of 20 years** plays with 0 errors (`critic/c81_tm_lapse20.log`).
- **Not 9:** the worst single frame at the battle spot is still 111 to 122 ms at every size, as in run 79.

### Stability: 8 → **8**
- **0 page errors** in every lane probe (about 200 page runs, every JSON scanned) and in 16 minutes of monkeys.
- **Determinism:**
  - `workerDeterminism` 54059 ends at `ed05e7b5` on every arm, as in runs 76 to 80.
  - 69059 ends at `0786f6e8` on every arm.
- **Plain 1938's 20-year hashes** repeat runs 79 and 80. The heroes run of 7019 ends at `c0532e57`.
- **R169's spot:** `glSpot 64907 2560 1440` gives `"errors":[]`.

### Semantic zoom to unit level: 8 → **8**
- **`z_zoom 69911`** runs from 6,000 m/px to unit level (`critic/c81_z_zoom.69911.log`).
- **`markerPop` 69951 and 56951:** 0 leaps, 0 pops, p95 19.5 ms.
- **`markers 56951`:** at 1,800 m/px, 12 pairs touch and 1 is over 30 px, as in run 80 exactly.
- **`heroPop`:** panning on 56901 gives 4 jumps, then 1 on a second run (run 80: 0). It gives 1 on 57905 (run 80: 5) and 2 on
  69905.
  - Run 80's build beside it on 56901 gives 9 (`critic/c81_heroPop.c80build_56901_400_head.log`,
    `critic/c81_heroPop.again_56901_400_head.log`). The same case varies from 0 to 9 on one build, so this is the probe's
    timing. No score moves on it.
- **Not 9:** as in run 80.

### Naval warfare: 8 → **8**
- **`landingFuzz` from 69101:** 0 of 90 broken (`critic/c81_landingFuzz.log`).
- **Stuck-return, all 153 (run 80 ran 100):** 0 broken, longest still spell 0.0 days (`critic/c81_sr.log`).
- **Next-voyage, 168 (left out in run 80):**
  - 165 with 0 broken. The 3 with one break (30041 g1, 31157 g1, 31175 g1) are each `slowClick`
    (`critic/c81_li_nv_*.log`), and the same 3 files break in run 77's set
    (`critic/c81_nv/`, `critic/c77_nv/`).
  - One told wait was 11.9 days off: 31175 division 366 waited 18.9 days against the 7 days told.
- **Malta's 18 on the page:** all 18 end told in words.
  - 12 end "2 thrown back; came ashore near Catania".
  - 6 end "its transports broke off; 2 came ashore near Palermo, away from Valletta" (`critic/c81_malta.log`).
- **Named `landingInvariants`:** 30041 g1, 51101 g1 and 53125 g2 each with `slowClick`; 27037 0. The same as run 80.
- **Sea battles:**
  - `seaBattles` 69061 (67), 69067 random (43), 69069 (55).
  - `seaBattlesLook` on this run's fights: 67 of 67 and 55 of 55 seen at their camera, 0 page errors (`critic/c81_sbl_*.log`).
- **Repulses:** told in words, 0 broken (`critic/c81_repulse_69071.log`, `critic/c81_repulse_69073.log`).
- **Not 9:** like flags in a civil war's sea battle (kept by R172).

### Tanks: 8 → **8**
- **`c_battle` 7781 and 69915:** exit 0.
- **`heroCeiling`:** 28 of 49 lives at or above the top decile (`critic/c81_heroCeiling3_691*.log`). Run 80 had 24 of 36; new
  seeds.
- **`frontArrivals`:** at day 60, Poland has 76 % at the German front at day 59, then 39 % with 61 % marching. China has 92 %
  at the Japanese front (`critic/c81_fa_*.log`).
- **Prague** falls on day 17 (`critic/c81_prague_69201.log`).

### Aircraft: 8 → **8**
- **`pl_planes 69925`:** 3,000 to 25 m/px in both looks (`critic/shots/c81pl_69925_GER_POL_5403_0025m_classic.png`).
- **`w_wing 69927`** and the build menus: exit 0. The air-strike ticker row reads in words
  ("Soviet Union's air force struck Germany over the past month: 15,451 men, guns and vehicles lost").

### AI nuclear use: 8 → **8**
- **On the page:** `an_ainuke` on 7019 and 32019 (year 20), the heroes' 7019 and 69511 (year 13): exit 0, `ok []`.
- **Launches over 22 years on new seeds:** 69501 22, 69503 14, 69505 4, 69507 4, 69509 0.
- **Run 79's seeds on HEAD:**
  - 64501 gives 8 and 64505 gives 2, as run 80 found (the sim is unchanged).
  - 64503 gives 7, 64507 0 and 64509 5 (`critic/c81_nc_645*.log`, `critic/c81_nukeIntercepts_64501.log`).
  - Run 79 had 26, 7, 0, 3 and 10 on a different sim (R167). No score moves on it.

## Blocking issues

1. **R81-B1 (UI, sideways phone; R170 unfinished): History opens under an open nation panel at 844 × 390, 667 × 375 and
   932 × 430.**
   - **The case:** `BASE=<HEAD build> node critic/scripts/c81_histOver.mjs 68901 60 844 390 GER`.
     - Germany's panel is open, then History is tapped.
     - History's button lights, but 81 of 81 points of its panel are covered by Germany's panel, and its first row cannot be
       tapped (`historyGoTapped` false).
     - Evidence: `critic/c81ho_68901_d60_844x390_GER_5403.json` and `critic/shots/c81ho_68901_d60_844x390_GER_5403_history-btn.png`.
   - **At the other sideways sizes:** 667 × 375 and 932 × 430 give 63 of 81.
   - **The same, by a second route:** `dirHand 59955 120 844 390 touch` ends "act failed … history-go"
     (`critic/c81_dirHand.59955_120_844_390_touch.log`, `critic/shots/c81dh_59955_844x390_history.png`).
   - **Where it holds:** at 390 × 844 the same `dirHand` taps "A major battle began near Elbląg" with `cutsAfterAct` 0.
   - **Why it blocks:** it contradicts R170's ticked claim, "on a phone History stands in the nation panel's place". ADR-760
     and `usePhone` count a sideways phone as a phone.
     - Relations at the same three sizes now shows 0 of 81 covered (R175), so the two buttons beside each other in the bar
       behave differently.
     - Run 80's build fails the same way (`critic/c81ho_68901_d60_844x390_GER_5404.json`), so this is not a new regression.
       R170's own case and spec ran upright only.
   - **Fix:** apply R170's give-way to the sideways-phone query too (`max-height: 500px`), as R175 does for Relations.
   - **Seen fixed when:**
     - The probe above shows `history-btn.hiddenOf81` 0 and `historyGoTapped` true at 844 × 390, 667 × 375 and 932 × 430.
     - `dirHand 59955 120 844 390 touch` has no "act failed".
     - The upright case stays as it is.

## Non-blocking issues (prioritised)

1. **R81-N1 (UI, small phones; R174's side effect): the war row's colour swatches are squeezed to 0 px, and at 320 px the glyphs overlap.**
   - **The case:** `DPR=2 node critic/scripts/c81_bannerFit.mjs 68901 0 360 740`. "Japan" and "China" lose their swatches
     (0 px), so the row no longer ties a side to its map colour (`critic/shots/c81bf_1938_68901_d0_360x740_5403_row.png`).
   - **The same on other seeds:**
     - 69903 day 700 at 360 × 740: Germany and France lose theirs (`critic/shots/c81bf_1938_69903_d700_360x740_5403_row.png`).
     - At 375 × 667 the swatches are 0.2 to 3.9 px.
   - **At 320 × 568:** the swords are drawn 6 to 8 px over "& 2", and the skull 2 to 3 px over "& 1"
     (`critic/shots/c81bf_1938_68901_d400_320x568_5403_row.png`, `critic/c81_bf_*_320_568_*.log`).
   - **Where it holds:** in 1938, 0 faults at 390, 412 and 430 wide. On the random world at 390 × 844 the swatch of
     "Alaska" is 1.6 px (`critic/c81_bf_64965_730_390_844_random_5403.log`).
   - **Fix:** give `.chip-swatch` and `.war-swords` `flex-shrink: 0`, and let the long name give way instead.
   - **Seen fixed when:** `c81_bannerFit` at 360 × 740 and 320 × 568 on these cases reports no swatch under 6 px and no
     overlap.
2. **R81-N2 (UI, phone; R176): "Go to country" puts the capital under the newly opened panel in 11 of 27 phone flights.**
   - `node critic/scripts/c81_goto2.mjs 68931 390 844`: from Britain's panel, the flights to France and Egypt end with
     Paris and Cairo under their own nation's panel (`capTop` `panel-puppets` and `panel-wars`;
     `critic/shots/c81g2_68931_390x844_d0_ENG_0.png`).
   - On 69931 day 700: France and the Soviet Union (`critic/c81_goto2_69931_390x844_700_5403.log`).
   - **At 360 × 740, 7 of 7:** `c81_goto2.mjs 69937 360 740 400 ITA,USA,ENG`. The capital is put at the view's centre,
     (180, 370), under the new panel each time (`critic/shots/c81g2_69937_360x740_d400_5403_ITA_0.png`). There
     `showPlaceClear` finds no point with 60 px clear about it, and falls back to the centre.
   - **Why not blocking:** the camera does fly to the capital, and the capital shows when the panel is closed. But
     R176's "clear of the panels" holds on the desk and at 844 × 390 only.
   - **The cause, by the code:** `onGoToNation` measures the clear map (`showPlaceClear`) at once after `onSelectNation`.
     That is against the old, shorter panel, before the new one is drawn.
   - Desk and 844 × 390: 28 of 28 clear.
3. **R81-N3 (UI, desk 1024 × 768): the war row's "+n" lies under the legend and cannot be clicked.**
   - The row also lies over the ticker's second row.
   - `node critic/scripts/c81_moreClick.mjs 68901 400 1024 768`: Playwright's click is refused, "map-legend intercepts
     pointer events", so the row cannot be opened (`critic/shots/c81mc_68901_d400_1024x768.png`).
   - Run 80's build is the same.
   - At 1152 × 864, 1280 × 800 and 1366 × 768 the click works.
4. **R81-N4 (UI, phone; R175): a nation chosen again from outside the graph shows no panel.**
   - `node critic/scripts/c81_relOver.mjs 68933 390 844`: Germany's panel, then Relations, then Italy chosen (Italy's panel
     shows), then Germany chosen again. Germany is selected with no panel, because `relationsOver` still names it (step 4).
   - The same on 69933 (the Soviet Union), 69935 (the United States, 360 × 740) and at 844 × 390.
5. **At 844 × 390, choosing a node in the graph covers the whole graph (81 of 81) with that nation's panel**
   (`critic/c81_relOver_68933_844x390_5403.log`, step 5). R175 specifies "a node tapped, its panel shown", so this is scored
   as designed. A player on a sideways phone must close the panel to see the graph again.
6. **Kept by R172, still seen:**
   - the strike's ring over "Pari";
   - the AI's bomb on Paris is a faint spot at 600 m/px (`critic/shots/c81an_64511y13_0_z00600.png`);
   - like flags in a civil war's sea battle (`critic/shots/c81sc_64913_150m.png`).
7. **`slowClick`:** the named cases 30041 g1, 51101 g1 and 53125 g2, the same lines as run 80 (ADR-914). 0 of 90 on new seeds.

## Run 80's cases re-run

| Run 80 case | Run 80 (`18c2b40a`) | Run 81 (`7c64529e`) | Evidence |
|---|---|---|---|
| R80-B1 `bannerNames 68901 400 390 844` | Japan 1/5, China 0/5 | **fixed**: all whole, "Soviet Union" 10 of 12 | `critic/c81_bn_68901_400_390x844_5403.log` |
| R80-B1 `68901 0 390 844` | "J… & 2 ⚔ C… & 1" | **fixed**: Japan, China whole | `critic/c81_bn_68901_0_390x844_5403.log` |
| R80-B1 `68903 700 390 844` | "T… ⚔ Gr…" | **fixed**: Turkey, Greece whole | `critic/c81_bn_68903_700_390x844_5403.log` |
| R80-B1 random 64965 730 at 1600 × 900 | whole | whole | `critic/c81_bf_64965_730_1600_900_random_5403.log` |
| R80-N1 `menuPinch 68933` 390 × 844 / 844 × 390 | 45 / 81 of 81 | **fixed**: 0 / 0 (run 80's build 45 / 81) | `critic/c81_menuPinch_68933_*` |
| R80-N2 `goto 68931` | camera unmoved | **fixed**: flies to Rome's view | `critic/c81_goto_68931_540[34].log` |
| R171 `trackTexts2` | not run | **fixed**: "The Tripartite Pact: Romania" | `critic/c81_trackTexts2.log` |
| 7019 and 32019, twenty years | `ab927e1b`, `c3520016` | the same | `critic/c81_seed*_save.log` |
| `workerDeterminism 54059` | `ed05e7b5` | the same | `critic/c81_wd_54059.log` |
| `warOpening` 64211 to 64215 | its lines | the same lines | `critic/c81_wo_64.log` |
| Named `landingInvariants` 396 | 1 broken (slowClick) | sim unchanged, carried | `critic/c80_li/` |
| Stuck-return | 100 of 153, 0 broken | 153 of 153, 0 broken | `critic/c81_sr.log` |
| Next-voyage 168, Malta 18 | not run | 3 broken (the same as run 77's); 18 of 18 told | `critic/c81_nv/`, `critic/c81_malta.log` |
| `markers 56951` | 12 pairs, 1 over 30 | the same | `critic/c81_markers.56951*.log` |
| `heroPop` 56901 / 57905 | 0 / 5 jumps | 4 then 1 / 1; run 80's build 9 on 56901 (probe timing) | `critic/c81_heroPop.*.log` |
| `an_ainuke 64511` | faint spot at 600 m/px | the same | `critic/shots/c81an_64511y13_0_z00600.png` |
| `phoneTicker 64903`, `deathTitle 7019` (three sizes) | HEAD's arms left out | exit 0, 0 errors | `critic/c81_phoneTicker.64903_200.log`, `critic/c81_deathTitle.7019_*.log` |
| `x_editor main` | Start disabled by a chosen file (as designed) | the same | `critic/c81_x_editor.main_69441.log` |
| `glSpot 64907 2560 1440` | `[]` | `[]` | `critic/c81_glSpot.*.log` |
| `a_god_nuke 64917` (with heroes), `seaclick 64913` | ring over the name, like flags | the same | `critic/shots/c81a_64917*` |
| `dirHand 59955 … 844 390 touch` | not run | **act failed** (R81-B1); run 80's build the same | `critic/c81_dirHand.*844_390*.log` |
| Nuke seeds 64501 to 64509 | 2 of 5: 8, 2 | 8, 7, 2, 0, 5 | `critic/c81_nc_645*.log` |
| `afterTrack` 55601, 37601 | probe fault | ran: 0 days with blocs' leaders apart | `critic/c81_atx_*.log` |
| Performance chain | not run (carried from run 79) | run: run 79's figures held (above) | `critic/c81_pf.status` |

## Design objections (none blocking)

- **R175's "until a nation is chosen":** on a sideways phone, choosing any node hides the whole graph under that node's panel
  (non-blocking issue 5). A graph that stays beside the panel, or a panel drawn short over the graph, would keep the thing
  the player opened in view.
- **ADR-1111:** heroes' names over Europe's counters at the world's zoom on a phone (as in run 80).

## Ideas from other games (not scored)

- **Hearts of Iron IV** keeps a side's flag even when its name is cut. Keeping the swatch (R81-N1) is the same idea.
- **Ages of Conflict** shows its war list as a scrolling panel, not a fixed row. A desk row that scrolls would settle R81-N3
  at 1024 px.

## Strengths (verified)

- **All three of the batch's fixes work on their cases, run 80's build beside them:**
  - R174: China goes from 0 letters to whole, and the random world's "Alaska" from 2 letters to whole.
  - R175: 45 and 81 points covered become 0 and 0.
  - R176: the camera moves from (1024, 512) to Rome. With R171 judged fixed, every named case of run 80 but R81-B1's class
    is closed.
- **Every rule checker is clean on new seeds.** 24 `diploInvariants`, 8 `worldInvariants`, 90 `landingFuzz` and 153
  stuck-return runs give 0 broken. The determinism and the 20-year hashes repeat run 80's.
