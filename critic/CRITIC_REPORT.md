# Critic report, run 80 (full): Batch 47 (R167 to R173) and the whole brief, on `18c2b40a`

## The run

- **Mode: full.** The spawning message asks for a full run (ADR-1134, the user's decision; CRITIC_PROMPT, ADR-915).
- **Commit judged:** `18c2b40a360e646995dcc112635768e6afc4ab3e`, HEAD at the start (`critic/c80_commit.txt`).
- **Time:** 22:15 to about 23:50 by the machine's clock. The run was cut short at the spawner's call for the report.
- **Left out (stopped unfinished when the run was ended):**
  - Run 61's bulk landing sets: the 396 named `landingInvariants` setups finished and the stuck-return set ran 100 of 153.
    The 168 next-voyage runs and Malta's 18 were not run. These sets were due because `src/sim/ai/strategic.ts` changed (ADR-917/959).
  - The performance chain (`critic/scripts/c80_chainPerf.sh`) did not run. **Performance is carried from run 79, 8.**
  - The replay-start chain stopped part way: 45 of 45 start jobs ran, but the second list (`c80_jobsB.txt`) did not finish.
    `trackTexts2` (R171's check through `trackText`) and `pileSides 68` were not run.
  - `c80_fixups.sh` stopped after its first step. That leaves undone: the `h_interv` re-runs, the heroes-on re-runs of
    `a_god_nuke 64917` and `seaclick 64913`, R170 at 844 × 390, and HEAD's own re-runs of `phoneTicker 64903` and
    `deathTitle 7019 390 × 844`.
  - `afterTrack` 55601 and 37601: probe fault (its cache folder `critic/c80_atcache` was missing). The re-run was stopped.
  - The nuke seeds of run 79 on HEAD finished 2 of 5 (below).

### What changed since run 79

- **Sim:** `git diff --stat 79058a5a HEAD -- src/sim data public/data` gives `src/sim/ai/strategic.ts` (R167, `acrossSea`) and
  `data/scenarios/1938h/timeline.json` (R171's notes).
- **Page:**
  - `WarBanners.tsx` and `style.css`: R168 and R172.
  - `GroundInstances.ts` and `ProxyRenderer.ts`: R169.
  - `style.css` (`:has` rule): R170.
  - `game.tsx` and `RelationsPanel.tsx`: R173.
- **Plain 1938 hashes are unchanged:** 7019 ends at `ab927e1b`, 32019 at `c3520016` (`critic/c80_seed7019_save.log`,
  `critic/c80_seed32019_save.log`). The diff touches `src/sim/ai/`, so ADR-959's carry does not apply and the bulk sets
  were due.

### Setup

- HEAD built in `critic/c80_dist`, with the replay's starts built from HEAD (`critic/scripts/c80_build.sh`: build exit 0,
  saves exit 0 in 701 s), served on 127.0.0.1:5401. Run 79's build (`critic/c79_dist`) served on 5402.
- New seed family: 68xxx. Scripts: `critic/scripts/c80_*` (copied from run 79's with the seeds moved), plus new probes:
  - `c80_bannerNames.mjs` (R168 on every size)
  - `c80_menuPinch.mjs` (R173 with real CDP touches)
  - `c80_goto.mjs` ("Go to country")
  - `c80_bnSet.sh`, `c80_chainBulk.sh`, `c80_fixups.sh`, `c80_nukeSame.sh`, `c80_atxRerun.sh`
- Probe faults of mine:
  - Lane A ran run 79's build after HEAD into the same JSON names for `phoneTicker 64903` and `deathTitle` (HEAD's
    390 × 844 `deathTitle` is kept as `critic/c80_dt_7019_400_390x844_HEADfirst.json`).
  - Lane B's two `h_interv` runs began 2 minutes before the build's replay starts were in place.
- **At the end:** every chain, sim and browser of mine was stopped by process. Both preview servers (5401, 5402) were stopped
  by the processes holding their ports. The `vite preview` on 4174 is not mine and was left running. No worktree was made.

## Verdict

**One blocking issue: R80-B1.** R168 cut the war banners' names short on a phone, and they now read as 0 to 3 letters.
- At 390 × 844, every 1938 game opens with "J… & 2 ⚔ C… & 1".
- "China" shows 0 of 5 letters on day 400.
- Run 79's build shows "Japan" and "China" whole on the same case.

R79-B1 is fixed: `diploInvariants 64015 random 1825 --heroes` prints 0 broken, and so do ten new random-diplomacy seeds with
heroes. Every checker run on new seeds is 0 broken.

**Scores:** `uiUxPolish` 8 → **7**, held at the bar by R80-B1. Every other dimension stays at 8; performance is carried.

## Scores

### Map visuals and readability: 8 → **8**
- **Tested:**
  - `look` 68901 (1600 × 900), 68903 (phone) and 68907 (2560 × 1440), every tier and both looks.
  - Run 79's `look 64907` at 2560 × 1440 and `look 64903` on a phone.
  - `rw2` 64965 and 68965.
  - The banner probe at seven sizes.
- **Evidence for 8:**
  - **Europe at 3,000 m/px in February 1939 reads cleanly:** named nations, capitals, the Polish-Soviet front lit, counters
    with men, heroes' plates (`critic/shots/c80look_68901_1600x900_d400_3eur3000.png`).
  - **At 250 m/px on the Soviet-Romanian front:** named divisions, the glowing line, hatched occupation, arrows
    (`critic/shots/c80look_68901_1600x900_d400_f0_250m.png`).
  - **0 page errors on every `look`,** including run 79's 64907 at 2560 × 1440, where run 79 had the WebGL warning
    (`critic/c80_look.64907_2560_1440_120_500.log`).
  - **R168 on the desk:** the random world's banners each sit on one line, "Kagoshima ⚔ Chukotka Autonomous Okrug & 3"
    (`critic/shots/c80rw2_random_64965_end_world.png`).
- **Not 9:**
  - The phone's banner names (R80-B1; scored under UI).
  - Heroes' names heaped over Europe at the world's zoom (ADR-1111, Design objections).

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **8**
- **R79-B1 fixed (R167, ADR-1133):**
  - `diploInvariants 64015 random 1825 --heroes`: **0 broken** (`critic/c80_diploinv_64015rh.log`; run 79: 1 broken, lift).
  - Ten new seeds 68021 to 68039 (random diplomacy, heroes, five years): 0 broken each (`critic/c80_diploinv_680[23]*rh.log`).
  - `64011 random 3650 --heroes`: 0 broken.
- **Other checkers on new seeds:**
  - `diploInvariants` 68001 to 68019, in 1938, random diplomacy, heroes and the random world, two of them 10 years: 0 broken.
  - `worldInvariants` 68051 to 68061: 0 broken.
  - `landingFuzz --first 68101`: **0 of 90 broken** (`critic/c80_landingFuzz.log`).
- **Wars that open:**
  - `warOpening` 64211 to 64215 on HEAD repeats run 79's lines exactly (`critic/c80_wo_64.log`), so R167 does not move them.
  - New seeds 68211 to 68215: the defender ahead at day 30 in 12 of 70 (`critic/c80_warOpening_68.log`). New seeds, not
    compared.
- **First declarations:** 53 on ten seeds in 60 days, none over 6,000 km (`critic/c80_firstdecl_68.log`).
- **Piles:** at day 365, 0 of six seeds have a war over 4:1 (`critic/c80_piles_*68.log`).
- **Massings:**
  - 48 told, 43 followed by war, 1 given up in silence (`critic/c80_massTold_68.log`).
  - 32 wars followed a massing one day old that was never told, as in run 79's 28.
- **On the page:**
  - The peace button and its refusal at two sizes (`critic/c80_peacebtn.*.log`).
  - Ten wars' buttons in a phone panel (`critic/c80_manywars.*.log`).
  - The relations graph says each tie in words (`critic/c80_rg_relations.*.log`).
- **R173 (relations graph and the nation's menu):** fixed on its case.
  - HEAD: the menu closes when Relations is tapped, and a real two-finger CDP pinch zooms the graph from 1 to 4.5.
  - Run 79's build: the menu stays and the pinch does not zoom (`critic/c80mp_68931_390x844.json` against
    `critic/c80mp_68931_390x844_c79build.json`).
- **Not 9:**
  - R80-N1: on a phone, Relations opens under an open nation panel.
  - Alliances still join across the world for no reason a watcher sees (as in run 79).

### Emergent world dynamics: 8 → **8**
- **Two 12-year page watches** (`long_watch2` 68941 with heroes, 68943 plain): exit 0, 0 errors (`critic/c80_long_watch2.*.log`).
- **No runaway:** `topArea 68097` over 25 years ends with the Soviet Union at 22.4 %, then the United States 9.2 %, Canada
  7.1 % and Brazil 6.8 % (`critic/c80_toparea_68097.log`).
- **Twenty years with heroes on 68019** finished (`critic/c80_hero_68019_20.log`).
- **`farConquests`:** 27.5 capitals taken per 100 nations in two years, 8.6 of them far (`critic/c80_farc_68.log`).
- **Few-nation worlds:** 2, 3 and 60 nations live. Two of the three 3-nation worlds see no war in 6 years
  (`critic/c80_few3_68.log`).
- **Not 9:** as in run 79.

### God Mode: 8 → **8**
- **Strikes:** `a_god_nuke 68917` and run 79's 64917 put a hydrogen bomb on Paris. The alert names the toll, and the cloud
  stands in its ring (`critic/shots/c80a_64917_14_paris_h_2h.png`).
- **Tools:** `q_god_tools`, `undo2 41211`, `undo2y 51231`, `k_breakthrough 68979` and `fw2_forcewar 68935`: exit 0, 0 errors
  (`critic/c80_lane*.out`).
- **Not 9:** the ring still covers "Pari" (R172 kept it; same shot).

### Editor and scenarios: 8 → **8**
- **`x_editor 68443`** paints, undoes, exports and loads.
- **Bad files are refused** (`critic/c80_x_badfiles.log`).
- **The standoff file** loads (`os2_scen`); `g_editor 68921` gives warheads to Poland.
- **The replay's starts, built from HEAD:** 45 start jobs, all exit 0 except `afterTrack`'s two (probe fault, above). The
  free starts 1942 to 1991 on new seeds 68542 to 68611 ran clean (`critic/c80_free_*_free.log`).
- **The page's save** (`saveload_page 68937`) and Continue (`x_continue 68415`): exit 0.
- **Not 9:** as in run 79. A chosen file still disables the title's Start (`x_editor main`, as designed).

### Stats and history: 8 → **8**
- **History, the CSV and JSON exports, and `kwhist 68951`:** exit 0, 0 errors.
- **Track rows on the page:** "30 August 1940 The Second Vienna Award to Hungary" (`critic/c80tr_1940_1600x900.json`).
- **R171 not seen on the page:** no alliance-join row was in the track rows of 1940, 1941 or 1949. Its `trackText` check
  (`trackTexts2`) was left out. R171 is unjudged.
- **Not 9:** R171 unjudged.

### UI/UX and polish: 8 → **7** (R80-B1 blocking)
- **Fixed on their cases, run 79's build beside HEAD:**
  - **R170 (History on a phone):** `dirHand 59955 120 390 844 touch` taps "A major battle began near Elbląg" with
    `cutsAfterAct` 0. Run 79's build: "act failed … history-go", 2 cuts (`critic/c80_dirHand.*59955_120_390_844_touch.log`).
  - **R173 (above).**
  - **R172:** on 7019 day 400 at 390 × 844, HEAD opens one death sentence in full
    (`critic/c80_dt_7019_400_390x844_HEADfirst.json`). The run 79 arm overwrote the shot; not compared side by side.
- **Monkeys:** 0 page errors in 16 minutes at four sizes, never hung or gone (`critic/c80_monkey.*.log`).
- **Resize:** 0 chrome off the screen (`critic/c80_resize.68821_60.log`).
- **Why 7, the score's move:** R80-B1, the same case on both builds.
  - On HEAD the phone's war row, the one place a player reads who fights whom, gives "J… ⚔ C…" and "T… ⚔ Gr…".
  - Run 79's build gave "Japan ⚔ China" on the same seed and day.
  - Also R80-N1 (Relations under the panel) and R80-N2 ("Go to country" does not go).
- **What the bar needs back at 8:**
  - `node critic/scripts/c80_bannerNames.mjs 68901 400 390 844` and `… 68903 700 390 844` against HEAD's build show each
    of the four sides with at least 5 letters, or the whole name (now 0 to 3).
  - The 1600 × 900 random case (`SCEN=random … 64965 730 1600 900`) still shows every side whole.

### Performance: **8, carried** from run 79 (the chain was not run)

### Stability: 8 → **8**
- **0 page errors** in every lane probe (about 160 page runs) and 16 minutes of monkeys. The only console line is run 79's
  build in the control arm of `glSpot`.
- **R169 fixed:** `glSpot 64907 2560 1440 500 1043.43 273.0` on HEAD gives `"errors":[]`. Run 79's build gives `bufferSubData:
  buffer overflow` at 30 m/px (`critic/c80_glSpot.*.log`).
- **Determinism:** `workerDeterminism` 54059 ends at `ed05e7b5` on every arm, as in runs 76 to 79; 68059 at `1f66a0f1`
  on every arm.
- **Plain 1938's 20-year hashes** repeat run 79's.

### Semantic zoom to unit level: 8 → **8**
- **`z_zoom 68911`** runs from 6,000 to unit level (`critic/c80_z_zoom.68911.log`).
- **`markerPop` 68951 and 56951:** 0 leaps, 0 pops, p95 19 ms.
- **`heroPop`:** 0 jumps zooming on 56901 and 68905. 57905 gives 5, as in runs 77 and 79.
- **`markers` 56951:** at 1,800 m/px, 12 pairs touch and 1 is over 30 px, as in run 79.
- **Not 9:** as in run 79.

### Naval warfare: 8 → **8**
- **`landingFuzz`:** 0 of 90 on new seeds.
- **Bulk named `landingInvariants`, 396 setups:** 1 broken, `named_30041_3517_g1` with `slowClick`. That is the same one
  run 77 had (`critic/c80_li/`, `critic/c77_li/`).
- **Stuck-return:** 100 of 153 ran, 0 broken.
- **Sea battles:**
  - `seaBattles` 68061 (49), 68067 random (25), 68069 (63).
  - `seaBattlesLook`: 49 of 49 and 63 of 63 seen at their camera with 0 page errors (`critic/c80_sbl_*.log`).
- **Repulses:** told in words, 0 broken (`critic/c80_repulse_*.log`).
- **Not 9:** like flags in a civil war's sea battle (kept by R172).

### Tanks: 8 → **8**
- **`c_battle` 7781 and 68915:** exit 0.
- **`heroCeiling`:** 24 of 36 lives at or above the top decile (`critic/c80_heroCeiling3_681*.log`). Run 79 had 25 of 36.
- **`frontArrivals`:** Poland 94 % at the German front at day 60, China 94 % at the Japanese front.
- **Prague** falls on day 14 (`critic/c80_prague_68201.log`).

### Aircraft: 8 → **8**
- **`pl_planes 68925`:** 3,000 to 25 m/px in both looks (`critic/shots/c80pl_68925_GER_POL_5401_0250m_balls.png`).
- **`w_wing 68927`** and the build menus: exit 0.

### AI nuclear use: 8 → **8**
- **On the page:** `an_ainuke 64511` (run 79's save) tells the Soviet strike near Paris with its toll
  (`critic/shots/c80an_64511y13_0_z00600.png`). It is still a faint spot at 600 m/px (kept by R172).
- **Launches on new seeds over 22 years:** 68503 25, and 68501, 68505, 68507, 68509 0.
- **Run 79's seeds on HEAD (2 of 5 finished):** 64501 8 launches (run 79: 26), 64505 2 (run 79: 0).
  - The sim changed in `strategic.ts`, so these worlds diverge. One move each way; no score moves on it.

## Blocking issues

1. **R80-B1 (UI, phone; R168's regression): the war banners' names are cut to 0 to 3 letters on a phone.**
   - **The case:** `BASE=<HEAD build> node critic/scripts/c80_bannerNames.mjs 68901 400 390 844`.
     - HEAD: "Soviet Union" 7/12 letters, "Japan" 1/5, "Japan" 1/5, "China" 0/5
       (`critic/c80_bn_68901_400_390x844_5401.log`, `critic/shots/c80bn_1938_68901_d400_390x844_5401_row.png`).
     - Run 79's build on the same case: the names whole, "Soviet Union & ⚔ Japan &", with only the count clipped
       (`critic/shots/c80bn_1938_68901_d400_390x844_5402_row.png`).
   - **The same at the start of every phone game:** day 0 gives "J… & 2 ⚔ C… & 1" (`critic/shots/c80bn_1938_68901_d0_390x844_5401_row.png`).
   - **On another seed:** 68903 day 700 gives "Nationalist… ⚔ Por…" and "T… ⚔ Gr…" (`critic/shots/c80bn_1938_68903_d700_390x844_5401.png`).
   - **Where it holds:** at 844 × 390, 1024 × 768, 1280 × 720 and 1600 × 900, every name is whole. Opened ("+n"), the phone
     row shows them whole too.
   - **Why it blocks:** it contradicts R168's own claim, "a long name cut short past 11 rem". `.war-name` has `min-width: 0`
     in a squeezed flex row, so short names shrink to an ellipsis well under 11 rem. `warBannerRows1938`'s case runs only at
     1600 × 900.
   - **Fix:** on a phone, keep the name's width (for example `flex-shrink: 0` up to a minimum of about 4 to 5 em) and drop
     the score or the "& n" first. Or fit fewer banners in the closed row.
   - **Seen fixed when:** the probe above, and `… 68903 700 390 844`, show each side with at least 5 letters or the whole
     name, and the 1600 × 900 random case stays whole.

## Non-blocking issues (prioritised)

1. **R80-N1 (UI, phone): Relations opens under an open nation panel.**
   - `node critic/scripts/c80_menuPinch.mjs 68933 390 844`: 45 of 81 sample points of the graph are covered by the panel.
   - At 844 × 390 it is 81 of 81: the graph cannot be seen at all (`critic/shots/c80mp_68933_844x390_2_relations.png`).
   - R170 fixed this for History only.
   - **Seen fixed when:** `hiddenOf81` is 0 at both sizes.
2. **R80-N2 (UI): "Go to country" in a chip's menu selects the nation but does not move the camera.**
   - PLAN 7.175f says "selects it and flies there".
   - `node critic/scripts/c80_goto.mjs 68931`: the camera stays at (1024, 512) at 0.5, 2 and 4 s while the selection
     becomes Italy (`critic/c80_goto_68931.json`). Run 79's build is the same.
3. **Kept by R172, still seen:** the strike's ring over "Pari"; the AI's bomb a faint spot at 600 m/px; like flags in a
   civil war's sea battle.
4. **`slowClick`:** the named case 30041 3517 g1, the same line as run 77 (ADR-914).

## Run 79's cases re-run

| Run 79 case | Run 79 (`79058a5a`) | Run 80 (`18c2b40a`) | Evidence |
|---|---|---|---|
| R79-B1 `diploInvariants 64015 random 1825 --heroes` | 1 broken (lift) | **fixed**: 0 broken; ten new seeds 0 | `critic/c80_diploinv_64015rh.log` |
| R79-N1 `rw2 64965 730` (desk) | wrapped mid-phrase | **fixed** on the desk; on a phone the names are cut to 0 to 3 letters (R80-B1) | `critic/shots/c80rw2_random_64965_end_world.png` |
| R79-N2 `glSpot 64907 2560 1440 …` | 1 warning | **fixed**: `[]`; run 79's build still 1 | `critic/c80_glSpot.*.log` |
| R79-N3 `dirHand 59955 … touch` History act | act failed | **fixed**: `cutsAfterAct` 0 | `critic/c80_dirHand.*.log` |
| R79-N4 pact rows | named for another | not judged (`trackTexts2` left out; not on the page) | |
| 7019 and 32019, twenty years | `ab927e1b`, `c3520016` | the same | `critic/c80_seed*_save.log` |
| `workerDeterminism 54059` | `ed05e7b5` | the same | `critic/c80_wd_54059.log` |
| `warOpening` 64211 to 64215 | its lines | the same lines | `critic/c80_wo_64.log` |
| Named `landingInvariants` (bulk 396) | run 77: 1 broken (slowClick) | 1, the same file | `critic/c80_li/` |
| `markers 56951`, `heroPop 57905`, `markerPop` | 12 pairs; 5 jumps; 0 | the same | `critic/c80_markers.*`, `critic/c80_heroPop.*` |
| `an_ainuke 64511`, `a_god_nuke 64917`, `seaclick 64913` | faint spot, ring over the name, like flags | the same (run without heroes; the heroes re-run was left out) | `critic/shots/c80an_64511y13_0_z00600.png` |
| Malta's 18, next-voyage 168, the rest of stuck-return | carried in run 79 | left out (stopped) | |
| Performance chain | run 79's figures | not run, carried | |

## Design objections (none blocking)

- **ADR-1111:** heroes' names over Europe's counters at the world's zoom on a phone.

## Ideas from other games (not scored)

- **Ages of Conflict** and **Hearts of Iron IV** show a war's sides on a phone as flags alone, with the name on a tap. That
  would settle R80-B1 without cutting a name to one letter.

## Strengths (verified)

- **Four of the batch's six page fixes work on their own cases, run 79's build beside them:**
  - R169: the WebGL warning is gone.
  - R170: History is tappable on a phone.
  - R173: the menu closes, and the pinch zooms 1 → 4.5 where run 79's build stayed at 1.
  - R167: the lift break is gone on 11 random-diplomacy seeds with heroes.
- **Every rule checker on new seeds is 0 broken:** 20 `diploInvariants`, 6 `worldInvariants`, 90 `landingFuzz`. Plain
  1938's hashes are unchanged by R167.
