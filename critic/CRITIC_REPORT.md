# Critic report, run 71 (focused): Batch 29 (R85a–f), on `df93b4c2`

- **Mode: focused.** The spawning message asks for no full run (CRITIC_PROMPT, ADR-915).
- **Commit judged:** `df93b4c2a3099c802b7bd518218fd68450c5ccaa`, HEAD at the start (`critic/c71_commit.txt`). The tree had
  three untracked evidence PNGs under `docs/evidence/7.132/` (not the critic's).
- **The last report:** run 70, focused, on `b6bd706b`. One blocking issue (R70-B2); diplomacy 7, every other dimension 8.
- **What changed since:** 7 commits (one of them run 70's report); 22 files outside `critic/`:
  - `src/sim/ai/economic.ts`, `ai/strategic.ts` (R85e), `systems/war.ts`, `track.ts`, `wars.ts` (R85b);
  - `src/worker/historyRows.ts`, `src/shared/history.ts`, `src/ui/i18n/en.json` (R85c, R85f);
  - `data/scenarios/1938/nations.json` (R85d); `tests/helpers/diploInvariants.ts` (R85a).
- **Scored afresh:**
  - diplomacy (under the bar in run 70, and blocked on);
  - the dimensions the batch's files touch: map visuals (R85d), emergent dynamics (R85b, R85e), God Mode (R85b, R85c),
    stats (R85c, R85f), UI/UX (R85c's notes and card), stability (`War.scoreFrom`, new in the save), naval (R85e orders
    transport groups in `economic.ts`).
  - Carried from run 70 (and run 69), marked "carried": editor, performance, semantic zoom, tanks, aircraft, AI nukes.
- **Due because the sim changed:** `git diff --stat b6bd706b HEAD -- src/sim data public/data` is not empty and touches
  `src/sim/ai/` and `src/sim/systems/`. So plain 1938 is not carried, and run 61's bulk sets and Malta's 18 are due.
  The 20-year saves end at new hashes (7019 `ab2bda3e`, 32019 `cfec21a0`); the builder's pin moved for the Congo colour
  alone (R85d's "Mended" note in DECISIONS), so the hashes cannot show whether play moved. The figures that can
  show it are the same as run 70's line for line (`farConquests`, `firstdecl`, `piles`, Diplomacy): plain 1938's play did
  not move.
- **Left out for time** (each a case of run 70's table not re-run, and why it moves nothing):
  - Nothing of run 61's bulk sets or Malta's 18: all were run (Naval).
  - run 70's page suites not tied to the batch: `c70_heroorder` (R84k), `c70_heroes60`, `c70_r83` (same URL, same
    world), `c70_undo2 51211`/`c70_undo2y 53231` (one seed each of the two re-run), `sbl 39061`, and the 1990 replay's
    full `c70_ev91` stops (only 3 January 1992 re-run). Their dimensions are carried or rest on the cases run.
  - headless: `nukecount 53503`, `farConquests 1975` (53161–9), `piles` on 53139–47, `endhours`, `successorPurse
    53601`, `fewNationWars 3 39401` (51401, 53401 and the new 54401 run instead), `seaBattles 53061`, and R69-N3's
    names on 27 December 1991 (Egypt, Sri Lanka, Benin, Myanmar; Zaire was seen on 31 December 1975).
  - the performance chain (frames). One tick measure of seed 99 was run alone at the end (Performance).
- **Setup.**
  - Build: `vite build --outDir critic/c71_dist`, exit 0. Starts: `npm run saves -- critic/c71_starts`, 54 years, copied
    into the build (`critic/scripts/c71_build.sh`).
  - Served by `vite preview` on 127.0.0.1:5371; Playwright Chromium at 1600 × 900 and 390 × 844.
  - Run 70's probes copied as `c71_*` (port 5371, `critic/c71_starts`). New seed family: 54xxx.
  - Chains: `c71_runNamed.sh` (`c71_jobs.txt`, then landingFuzz `--seeds 15 --first 54101`), `c71_chainS.sh`
    (`c71_startsJobs.txt`), `c71_chain3.sh` (`c71_jobs3.txt`), `c71_chain4.sh` (`c71_jobs4.txt`), `c71_pages.sh`,
    `c71_pages2.sh` (with Malta's 18), `c71_chainBulk.sh`.
  - New probes:
    - `c71_godpeace.mjs`: a God Mode "Make peace" in the replay, and how History and the ticker tell it;
    - `c71_warlong.ts`: every war standing as the track ends, followed to its peace (score, `scoreFrom`, land held and
      owned);
    - `c71_takescore.mjs`: the war banners' score a player reads after Take control in a WWII year;
    - `c71_menloss.ts`: the armies and losses of the war's sides in the days after the end;
    - `c71_saveload.ts`: a save made after the end, loaded and stepped beside the original;
    - `c71_landless.ts`: R85e's landless sea powers in each built year; `c71_fewwhy.ts`: why a small world has no war;
    - `c71_god42b.mjs`: `c70_god42` with the camera set (France); `c71_lab.py`: L*a*b* of a pixel of a shot.
- **Incidents, disclosed:**
  - `c71_warlong`'s first two runs had a wrong date formula (1910/1911) and followed only the wars with `scoreFrom`.
    Both were fixed and re-run (`critic/c71_warlong_1942god.log`, `critic/c71_warlong_1943free.log` are the re-runs);
    `owned` counts every cell of each side, so a peace's gain includes land from other wars of the same nations.
  - `c71_takescore`'s first two runs read a wrong selector (`war-chips`); the 1942 Germany case was re-run with the war
    banners' selector for 240 days (`critic/c71_ts_1942_GER_240_1600x900.json`).
  - `c71_god42`'s war-chip read finds nothing (run 70's selector); the wars are read from the logs and the shots.
  - My first `c71_nv.sh` ran without `c71_nvtrue.ts` (not copied): 168 runs of "module not found", read as 0. The probe
    was copied and the set re-run; the figures given are the re-run's.
  - My first `c71_afterTrack.ts 37601` failed at its end on a missing cache folder (`critic/c71_atcache`); it was
    re-run.
- **Writes outside `critic/` by tools at their defaults:** `npm run sim` to `.cache/runs/*.json`; `landingFuzz` to
  `.cache/landingFuzz/`.

## Verdict

**No blocking issue.** R70-B2 is fixed on its own case, and the bloc rule holds on two new seeds whose games see Russia's
bloc end (on 54611, in the very hour of R70-B2's shape: Russia pays aid and its alliance is dissolved at 1994-01-01T01, and the
rule, read hour by hour, breaks 0 times). Run 70's four
non-blocking issues are fixed, and its design objection (R84e ending the Second World War) is taken as R85b and works:
0 peaces in the first hour of a 1941, 1942 (God act and Take control), 1943 and 1944 game, and of the 1966 replay with a
God act.

**Scores that move:**
- **Diplomacy, 7 → 8:** R70-B2 fixed, every checker 0 broken on new seeds, and R85b keeps the replay's wars.

**What a player will meet first (non-blocking):**
- **R71-N1:** a God Mode "Make peace" in the replay is told in History as "…made peace with … as history's course ended".
  The player made it; and under R85b that war would not have ended with the track.
- **R71-N2:** a war the track's end lets go on gets a ceiling of 100 − its `scoreFrom` for the side ahead, and the full
  range for the side behind. In the 1942 replay after a God act, Germany's banner on the Soviet Union stops at "War
  score 39" from 1 April to 29 August 1942 while Germany takes European Russia; on three seeds the war ends at exactly 39.

**The rule checkers on new seeds:**
- diploInvariants, 0 broken: 54001 (1938), 54003 (random diplomacy), 54005 (heroes), 54007 and 54011 (random world),
  five years each.
- worldInvariants, every rule set, 0 broken: 54051, 54053 (heroes), 54055 and 54061 (random world), 54057 (random
  diplomacy).
- `c71_free.ts` (the checkers' hourly and daily rules on games from built years), 0 broken lines on:
  - one year each: 1941 54541, 1942 54542, 1943 54543, 1944 54544 (heroes), 1951 54551, 1966 54566 (random diplomacy);
  - two years: 1975 51501 (run 70's);
  - five years: 1991 51507 (run 70's), 54611 and 54612. Russia's alliance (SOV2) is gone by the end of 1994 in all three.
- The track checker (`c64_track.ts`) to 1991 and two free years: 0 broken lines on 1938 and the new 54301.
- `heldAtEnd 54311`: 0 held lines. `heldfree 1946 51515 3`: 0 pairs at hour 1 and each year.
- `landingInvariants` via `landingFuzz --seeds 15 --first 54101`: 0 of 90 runs broken (`critic/c71_landingFuzz.log`; run 70: 1 of 90).
- `landingRows all`: 115 cases, 20,321 hours, 0 broken (`critic/c71_lrows_all.log`).
- `workerDeterminism 54059`: `459be807` on every arm.

## Scores

### Map visuals and readability: 8 → **8** (scored afresh)

**What I tested:** the 1938 replay at 3,000 and 8,000 m/px over central Africa (`c71_ev91 1938`), the 1990 replay on
3 January 1992 over Europe, and the pixel colours of the Congo shot (`critic/scripts/c71_lab.py`).

**Evidence for 8:**
- **R70-N2 fixed.** Belgian Congo reads (216,120,32) on the page: L* 60.0, against run 70's 26. Its name and the lakes on
  its eastern border read clearly (`critic/shots/c71ev_1938_1938-01-02_congo_3000m.png`, `critic/c71_congo_lab.txt`).
  ΔE on the page from the land labelled French Equatorial Africa 97.0, Angola 73.7 and British East Africa 47.2, and from
  the unlabelled red land to its south-east 39.2.
- Europe on 3 January 1992 has every state distinct, Ukraine, Belarus, Moldova and the Baltics included
  (`critic/shots/c71ev_1990_1992-01-03_europe_3000m.png`).

**Not 9:**
- **The earlier maps' close pairs**, which the builder's bar on those maps (ΔE ≥ 15) allows: France and French West
  Africa 16.1 and China and Manchukuo 17.7 on 1 January 1938, as in run 70.
- **One new pair under 30 from R85d:** Zaire and the FNLA on the 1975-12-30 map, ΔE 19.3; run 70's map had none
  (`critic/c71_neighbourColours_1938.log` line 21 against `critic/c70_neighbourColours_maps.log` line 21).
  - On the page, two oranges side by side, told apart by the border line and the FNLA's label
    (`critic/shots/c71ev_1975_1975-12-31_angola_3000m.png`).
  - It is above the builder's 15 by 4.3, and the 1991 end's world has 0 of 385 pairs under 30.
- **R71-N5 (old, not from this batch): the cities keep their 1938 names to 1991** (ADR-18's 1938 names).
  - On 31 December 1975, South Korea's capital reads "Keijō", the Japanese colonial name; its tooltip says "Keijō,
    South Korea" (`critic/shots/c71ev_1975_1975-12-31_korea_1500m.png`).
  - North Korea's capital reads "Heijō", People's China's "Peiping", and Zaire's "Léopoldville"
    (`critic/shots/c71ev_1975_1975-12-31_china_4000m.png`, `…_angola_3000m.png`).
  - ADR-18 chose 1938's names for the 1938 map; the replay to 1991 renames nations (R84d) but no city.

### Diplomacy, war, alliance, puppet, revolt depth: 7 → **8** (scored afresh; moved up)

**Run 70's bar, case by case (met):**
- **R70-B2 fixed:** `c71_free.ts 1991 51507 1825 free -` gives 0 broken lines (run 70: 2 bloc lines)
  (`critic/c71_free_1991_51507_free.log`).
  - The fix is in the checker (the blocs at the hour's start), so 0 on 51507 is by construction. On HEAD's world the
    1993-09-01 hour no longer dissolves Russia's alliance (`critic/c71_aidhour_51507.log`: two blocs before and after,
    with `BlocAid` rows at T01).
  - So the rule was judged on two games I did not pick, 54611 and 54612, five years each. In both, Russia's alliance
    (SOV2) is gone by the end of 1994, and 0 lines are broken
    (`critic/c71_free_1991_54611_free.log`, `critic/c71_free_1991_54612_free.log`).
  - `c71_blocend.ts 54611 1825` reads the rule hour by hour and finds the hour: at 1994-01-01T01 Russia pays aid to
    Somalia, the NPF and Tunisia, then Mongolia leaves and Russia's alliance is dissolved; the blocs go from two to one.
    0 bloc lines are broken in five years (`critic/c71_blocend_54611.log`). That is R70-B2's case on a seed I did not
    pick, judged as R85a says.
- **Run 70's objection, taken as R85b (ADR-1067), works as specified:**

  | Case (`c71_freewar.ts`) | Run 70 (`b6bd706b`) | Run 71 (`df93b4c2`) |
  |---|---|---|
  | 1942 replay, God act | 4 peaces in hour 1; occupied 23,648 → 473 | 0 peaces; 7 wars at day 30; occupied 22,045 at day 30 |
  | 1942 replay, Take control | 4 peaces; 169 German formations in Soviet land at peace | 0 peaces; 22,151 occupied at day 30 |
  | 1943 free | 5 of 5 wars end | 0 end; 6 wars at day 30 |
  | 1944 free | 6 of 6 end | 0 end; 11 wars at day 30 |
  | 1941 free | JAP-CHI and GER-ENG end | 0 end; 5 wars at day 30 |
  | 1966 replay, God act | 3 of 3 end | 0 end in hour 1 |

  Logs: `critic/c71_freewar_*.log`. On the page, the 1942 Eastern Front is still hatched an hour after a revolt in Brazil
  (`critic/shots/c71g42_1942_replay_53542_0before_east.png` against `…_1after_east.png`). Lebanon's war, held to 2000,
  still ends white at the 1991 end (`critic/c71_endleb_999.log`, `critic/c71_endleb_53283.log`: `PeaceSigned ISR LEB`
  at 1991-12-31T00).
- **The wars go on to real ends** (`critic/scripts/c71_warlong.ts`, every war followed):
  - 1942 God act, three seeds (53542, 54601, 54602): Germany beats the Soviet Union between 2 September and 1 October 1942
    at 39, and the land Germany owns grows by 30,800–42,000 cells (the 11,043 cells the hold had kept among them). Japan
    makes China a puppet between 14 March and 20 April 1943 (`critic/c71_warlong_1942god*.log`).
  - 1943 free, three seeds (53543, 54603, 54604): the Soviet Union wins between 26 May and 8 August 1943 at −90 to −100;
    Japan puppets China in August or September 1943; Japan and the Allies end in 1944 (`critic/c71_warlong_1943free*.log`).
  - Japan v China ends at 100 with China a puppet in all 8 runs from 1942–44 (God act, Take control, free); in the 1941
    free game it has not ended after 365 days (`critic/c71_warlong_1941free.log`).
  - 1944 free: the Soviet Union wins in May 1944 at −91; Italy, at war with Germany, wins at 86
    (`critic/c71_warlong_1944free.log`). Korea from 1951 free ends in 38 days at −100 (`critic/c71_warlong_1951free.log`).
- **The save keeps the new field:** a 1942 God-act game and a 1943 free game, saved at hour 24, loaded and stepped 30 days
  beside the original: the same hash at every check, `scoreFrom` the same (`critic/c71_saveload_*.log`).
- **R82d and R82f held, the same as run 70 line for line:**
  - `farConquests 0` on 6161/41161–41167 and on 53161–53169: the same capitals, 9.2 far per 100 nations; France takes
    Brazil's capital on none (`critic/c71_farc_0_*.log`, identical to `critic/c70_farc_0_*.log` but for timings);
  - first-60-day declarations over 6,000 km: 0 of 96 (39821–39839) and 0 of 87 (53821–53839) (`critic/c71_firstdecl*.log`);
  - `piles 365` on 39139–47 and 51139–47: none over 4:1, identical to run 70 (`critic/c71_piles_p*.log`); `pileSides 365
    51141 51143 51145`: 0 over 4:1 by realm at day 365 (`critic/c71_pileSides_51.log`).
  - These identical figures also show plain 1938's play unchanged by the batch (R85e has no landless power in 1938).

**Why 8, not 9:**
- **R71-N2 (non-blocking): a kept war's score has a ceiling of 100 − `scoreFrom` for the side ahead.**
  - The cause: `war.ts:679` clamps the raw score to ±100 and then takes `scoreFrom` away. Every war's raw score is
    clamped, so what R85b adds is the ceiling and its asymmetry. The side ahead as the track ends can gain at most
    100 − `scoreFrom`; the side behind keeps the full range.
  - What it puts out of reach (by the code; the thresholds were not all seen in play):
    - PUPPET_SCORE (90) for a side ahead by more than 10: Germany (61) can never make the Soviet Union a puppet by score;
    - PEACE_ACCEPT_SCORE (25) for a side ahead by more than 75: not seen (the largest `scoreFrom` in my logs is 74, GER v
      SOV in 1944, a ceiling of 26).
  - Seen:
    - 1942: GER v SOV has `scoreFrom` 61. Its score reaches 39 by day 90 and stays there to the peace on all three seeds,
      while Germany's hold of Soviet land grows from 24,838 to 41,228 cells (`critic/c71_warlong_1942god_54601.log`).
    - Japan v China (`scoreFrom` 32) sits at 68 for 200 days while its hold grows from 7,702 to 12,427 cells
      (`critic/c71_warlong_1942god.log`).
    - On the page, Germany taken by Take control: "War score 39" on its Soviet banner at day 90, 120, 150, 180, 210 and
      240, the fill at 69.5 % (`critic/c71_ts_1942_GER_240_1600x900.json`). By 29 August Germany holds 7.37M km², up
      from 3.23M (`critic/shots/c71ts_1942_GER_240_1600x900_2war.png`).
    - The side behind has the whole range: in 1943 the Soviet side reaches −100 when the raw score is −41
      (`critic/c71_warlong_1943free.log`).
  - SPEC §7.7 says the score is "counted from" the end's; it does not say that the side ahead is capped. Judged as
    unspecified.
  - Not a finding: Germany's peace at 39 makes the 11,043 cells the hold had kept German, as all occupied land goes to a
    winner at 10 or more. SPEC says "its occupations kept", so that is the design.
- **Small worlds** (emergent, below).

### Emergent world dynamics: 8 → **8** (scored afresh)

**Evidence for 8:**
- **R70-N3 fixed by its AT** (`fewNationWars 3 <seed> 6 10`):
  - 53401–53406: a war on 6 of 6, 25 wars (run 70: 3 of 6, 9 wars) (`critic/c71_few3_53.log`);
  - 51401: 6 of 6, 26 wars (`critic/c71_few3_51.log`);
  - new 54401: 6 of 6, 16 wars; four nations, 54411: 6 of 6, 33 wars (`critic/c71_few3_54.log`, `critic/c71_few4_54.log`).
- **60-nation random worlds, five years:** seeds 7, 8, 9 give 111, 100 and 97 wars, as ADR-1068 states; the new
  54431–54433 give 109, 73 and 91 (`critic/c71_few60_*.log`).
- **R85e touches no replay year:** `c71_landless.ts` finds no landless sea power in 1938 or any start from 1946 to 1991
  (`critic/c71_landless_*.log`).
- **The Second World War, kept by R85b, has outcomes worth watching** (diplomacy, above), and they differ by the year
  left: Germany wins in the East from 1942, the Soviet Union from 1943 and 1944.

**Not 9:**
- **R71-N3: two-nation worlds.** `fewNationWars 2 54421 6 10` gives 3 of 6 worlds with no war in ten years
  (`critic/c71_few2_54.log`).
  - The two nations share a land border in each (`critic/c71_fewwhy_2_54421.log`, `…_54425.log`, `…_54426.log`). So
    R85e's rule does not reach them.
  - 54421 has aggressions 59 and 20 and strengths of 1.8 to 1; the treasuries grow from 68k and 38k to 256k and 161k
    by day 1,000, unspent.
  - The form allows 2 nations (`RANDOM_NATIONS.min`). New seeds, not compared with run 70's commit.
- **The year left decides the war** (observation, not filed). The replay's starts hand over armies that swing year to
  year: Germany 1.17M men and the Soviet Union 727k on 1 January 1942; 630k and 2.75M on 1 January 1943
  (`critic/c71_men0_*.log`, `critic/c71_menloss_*.log`). Every 1942 seed goes Germany's way, every 1943 seed the Soviet
  Union's.

### God Mode: 8 → **8** (scored afresh)

**Evidence for 8:**
- **R70-N1 fixed on the page.** The God bar, the God tab and Take control each say that the frozen wars go on and that
  one held past 1991 ends in a white peace, at 1600 × 900 and 390 × 844 (`critic/c71_hgt_1600x900_god-world-ai.json`,
  `critic/shots/c71hgt_390x844_tab.png`).
- **A God act in the 1942 replay keeps the war** (Diplomacy, above).
- **Undo:** `c71_undo2.mjs 41211`: 0 px for nuke, revolt, nation, city and raze undone. `c71_undo2y.mjs 51231` (1983):
  0 px for four acts and the hash back on all five.
  - The nuke's figure moved from run 70's 0 to 10,010 px. They are the war banners' row: after Undo the God bar shows
    the line "Undone: the world as it was on 1 January 1983", which lifts the banners about 19 px.
  - Run 70's shot had the same line but no banners, because its 1983 free start ended those wars in hour 1. Under R85b
    they go on (`critic/shots/crop_c70u2y_51231_nuke_2undone_bottom.png` against `…c71u2y…_bottom.png`).
  - The map is the same: run 70's and run 71's "before" shots differ by 0 px, and every pixel that differs lies in the
    banners' row (`critic/c71_undo2_pix.txt`).

**Not 9, R71-N1:**
- In the 1942 replay, Japan's God tab, "Peace" on its war with the United States. History then reads:
  - "1 January 1942 Japan made peace with United States as history's course ended";
  - then "History's course ended at your first intervention…".
- The same with Germany and the Soviet Union at 390 × 844: "Germany made peace with Soviet Union as history's course
  ended" (`critic/shots/c71gp_1942_GER_SovietUnion_390x844_2history.png`, `critic/c71_gp_1942_*.json`).
- The cause: `endPeace` (`src/worker/historyRows.ts`) tells any peace followed by `TrackEnded` in the same hour as the
  end's, and `applyPendingCommands` signs the God act's peace and then ends the track in that hour (`tick.ts:512`).
- Two things are wrong with the row. The peace was the player's act, not history's end. And under R85b the track's end
  does not end GER-SOV at all.
- SPEC has no sentence on this row (R85c's wording is in `en.json` and ROADMAP only), so it is judged as unspecified:
  a wrong row, non-blocking.

### Editor and scenarios: 8 (carried from run 70)

No file of the editor changed. Its note (`track.anyAct`) has R85c's wording.

### Stats and history: 8 → **8** (scored afresh)

**Evidence for 8:**
- **R70-N4 fixed:** "1 January 1992 Yugoslavia's air force struck Croatia over the past month: 2,096 men…" now reads as
  December's, after "31 December 1991 Yugoslavia made peace with Croatia as history's course ended"
  (`critic/shots/c71ev_1990_1992-01-03_europe_3000m.png`, `critic/c71_ev_1990_999.json`).
- **R70-N1's rows fixed:** the 1991 end's peaces read "…as history's course ended" (Somalia, Sierra Leone, Croatia, the
  same shot).

**Not 9:** R71-N1 (God Mode, above): a player's peace is told as the end's.

### UI/UX and polish: 8 → **8** (scored afresh)

**Evidence for 8:**
- R85c's notes are on screen, not only in a title: Take control's note is a visible paragraph at 390 × 844
  (`critic/shots/c71hgt_390x844_tab.png`).
- The free year's card says the wars go on (`critic/shots/c71rc_1943_free_1600x900_card.png`,
  `critic/shots/c71rc_1975_free_390x844_card.png`).
- 0 page errors in every page probe.

**Not 9 (small, non-blocking, R71-N4):**
- At 390 × 844 with Germany selected and God Mode on, the same red note of four lines stands three times on one screen:
  under Take control, at the top of the God tab and in the map tools (`critic/shots/c71hgt_390x844_tab.png`).
- "one history holds past 1991 ends in a white peace" (the card) and "one it holds past 1991…" (the notes) read as a
  garden path, and they are shown on every year's card, though only a start from 1983 or later has such a war.
- At 390 × 844 the war banners float over History's list and hide a row (`c71gp_1942_GER_SovietUnion_390x844_2history.png`).
  Not compared with run 70's commit.

### Performance: 8 (carried from run 70)

No file of the tick's systems changed beyond R85b's few lines and R85e's monthly test. The seed-99 tick for 5 years, run
alone after every other job with the preview stopped: 2.340 ms mean against run 70's 2.322 (+0.8 %), year 1 at the pin
`ae4ce317` (`critic/c71_tick99.log`). Frames were not measured (left out for time).

### Stability: 8 → **8** (scored afresh)

- **`workerDeterminism 54059`:** `459be807` on every arm (`critic/c71_wd_54059.log`).
- **The new save field:** `c71_saveload.ts` 1942 God and 1943 free: equal hashes over 30 days after a load.
- **The 20-year runs complete:** 7019 `ab2bda3e`, 32019 `cfec21a0`.
- **Undo** gives the hash back on 1938 and 1983 worlds (God Mode).
- **0 page errors** in every probe.

### Semantic zoom to unit level: 8 (carried from run 69)

### Naval warfare: 8 → **8** (scored afresh)

R85e makes a landless sea power at peace order a transport group (`economic.ts`).
- **landingFuzz `--seeds 15 --first 54101`:** 0 of 90 runs broken, `slowClick` included (`critic/c71_landingFuzz.log`).
- **`landingRows all`:** 115 cases, 0 broken (`critic/c71_lrows_all.log`).
- **Run 61's bulk sets, due since run 70 and run this time** (`critic/scripts/c71_chainBulk.sh`), against run 69's:
  - 396 named landing setups (`c71_liab.sh named`): 394 with 0 broken; the 2 breaks are the named `slowClick` cases
    27037 15101 g2 and 30041 3517 g1, as run 69 (`critic/c71_liab_named.log` against `critic/c69_liab_named.log`);
  - 153 stuck-return runs (`c71_sr.sh`): 0 returning-still spells on any; the checker breaks only 27037 15101 g2, as run
    69 (`critic/c71_sr.log`);
  - 168 next-voyage runs (`c71_nv.sh`): all 168 logs identical to run 69's but for timings; the same 3 broken (30041, 31157 and 31175, 3517 g1)
    (`critic/c71_nv_cmp.txt`).
  - The named setups' logs: 394 of 396 identical to run 69's; the 2 others differ only in a note's "days with no ground
    gained" (0.8 → 0.9, 1.3 → 1.4) and one landing's length (2.0 → 1.7 days), each with 0 broken.
    (`critic/c71_liab_named_cmp.txt`, `critic/c71_sr_cmp.txt`: 153 of 153 identical).
- **Malta's 18** (`critic/scripts/c71_malta.sh`): every seed as run 69's, row for row. 11 thrown back near Catania and 7
  with their transports broken off near Palermo; none held at Valletta (`critic/c71_malta.log` against
  `critic/c69_malta.log`).
- **The named `slowClick` cases** are as run 70: 30041 3517 g1 (13.0 days against 5.9), 27037 15101 g2 (8.2 against
  1.2), 51101 3517 g1 (13.8 against 6.7) and 53125 15101 g2 (9.5 against 2.4) (`critic/c71_li_*.log`).
- No 1938h year has a landless sea power, so the rule acts only in random worlds, where it brings the three-nation
  worlds to war (Emergent).

### Tanks: 8 (carried from run 69)

### Aircraft: 8 (carried from run 69)

R85f changes only the air rows' words (Stats).

### AI nuclear use: 8 (carried from run 69)

In passing: `nukeIntercepts 53501` over 22 years has 5 missile launches, as run 70 (`critic/c71_nukeIntercepts_53501.log`).

## Blocking issues

None.

## Non-blocking issues (prioritised)

1. **R71-N1 (God Mode, stats): a God "Make peace" in the replay is told as the track's end's peace.**
   - **The case:** `node critic/scripts/c71_godpeace.mjs 1942 JAP 'United States'` and `… 1942 GER 'Soviet Union' 390 844`.
     History reads "Japan made peace with United States as history's course ended"
     (`critic/c71_gp_1942_JAP_UnitedStates_1600x900.json`, `critic/shots/c71gp_1942_GER_SovietUnion_390x844_2history.png`).
   - **The cause:** `endPeace` takes any `PeaceSigned` followed by `TrackEnded` in the hour. A God act's peace is signed
     in the hour the act ends the track.
   - **Seen fixed when** the same probe's row reads "Japan made peace with United States" (or one that names the player's
     act), and a peace the end signs (Lebanon, 1991) still reads "…as history's course ended".
2. **R71-N2 (diplomacy): a war kept by R85b has a score ceiling of 100 − `scoreFrom` for the side ahead.**
   - **The case:** `npx tsx critic/scripts/c71_warlong.ts 1942 54601 god 730`: GER v SOV at 39 from day 90 to its
     peace; `node critic/scripts/c71_takescore.mjs 1942 GER 240`: "War score 39" from April to August.
   - **The cause:** `war.ts:679`, `clamp(clamp(raw) − scoreFrom)`. PUPPET_SCORE is out of reach for a side ahead by more
     than 10, PEACE_ACCEPT_SCORE for one ahead by more than 75 (by the code).
   - **Seen fixed when** the score follows the front past 100 − `scoreFrom` (for example `clamp(raw − scoreFrom)` with the
     raw score unclamped), or SPEC states the ceiling and the banner shows it.
3. **R71-N3 (emergent): two-nation worlds with no war.** `fewNationWars 2 54421 6 10`: 3 of 6 with no war in ten years,
   neighbours on land each time. Seen fixed when a war is on at least 5 of 6.
4. **R71-N4 (UI, small):** the R85c note three times on a phone screen; the card's "one history holds past 1991…" on
   every year; the war banners over History at 390 × 844.
5. **R71-N5 (map, old): 1938's city names to 1991.** "Keijō, South Korea", "Peiping" and "Léopoldville" on
   31 December 1975 (`critic/shots/c71ev_1975_1975-12-31_korea_1500m.png`). Seen fixed when a city renamed in the
   timeline's years (Seoul 1945, Beijing 1949, Kinshasa 1966) reads its name of the day in the replay and in a free game
   started after it.
6. **`slowClick` (ADR-914):** the four named cases as run 70 (30041 3517 g1, 27037 15101 g2, 51101 3517 g1, 53125
   15101 g2; `critic/c71_li_*.log`). landingFuzz on 54101–54129: 0 of 90.

## Run 70's cases re-run

| Run 70 case | Run 70 (`b6bd706b`) | Run 71 (`df93b4c2`) | Evidence |
|---|---|---|---|
| R70-B2 `free 1991 51507 1825` | 2 bloc lines | **fixed**: 0; and 0 on new 54611, 54612 (Russia's bloc gone in 1994) | `critic/c71_free_1991_*_free.log` |
| R70-B2 `aidhour 51507 1993-09-01` | aid, then Russia's alliance dissolved in the hour | the hour has aid and no dissolution (another world: the starts were rebuilt on HEAD) | `critic/c71_aidhour_51507.log` |
| R70-N1 God bar, Take control, card | no word of the wars | **fixed**: all three say the frozen wars go on | `critic/c71_hgt_*.json`, `critic/shots/c71rc_*` |
| R70-N1 the end's peace rows | ordinary peace rows | **fixed**: "…as history's course ended"; but see R71-N1 | `critic/c71_ev_1990_999.json` |
| R70-N2 Belgian Congo | L* 26 | **fixed**: L* 60.0 | `critic/c71_congo_lab.txt` |
| R70-N3 `fewNationWars 3 53401` | 3 of 6, 9 wars | **fixed**: 6 of 6, 25 wars | `critic/c71_few3_53.log` |
| R69-N5 `fewNationWars 3 51401` | 5 of 6, 13 wars | 6 of 6, 26 wars | `critic/c71_few3_51.log` |
| R70-N4 air row after a peace | "this month" | **fixed**: "over the past month" | `critic/shots/c71ev_1990_1992-01-03_europe_3000m.png` |
| Objection: R84e ends WWII (`freewar` 1941–44, 1966) | 2–6 wars end in hour 1 | **taken (R85b)**: 0 end in hour 1 | `critic/c71_freewar_*.log` |
| `g42 1942 replay 53542` on the page | the Eastern Front gone | the front still hatched | `critic/shots/c71g42_1942_replay_53542_1after_east.png` |
| `endleb 999`, `53283` | white peace at the end | the same | `critic/c71_endleb_*.log` |
| `heldfree 1946 51515 3` | 0 | 0 | `critic/c71_heldfree_1946.log` |
| `free 1975 51501 730` | 0 | 0 | `critic/c71_free_1975_51501_free.log` |
| `undo2 41211`, `undo2y 51231` | 0 px every act | 0 px but the 1983 nuke: 10,010 px, the war banners' row lifted by the Undo line (the wars now go on); the map 0 px | `critic/c71_undo2_pix.txt` |
| `slowClick` named (30041, 27037, 51101, 53125) | broken | the same four, the same figures | `critic/c71_li_*.log` |
| `landingRows all` | 0 broken | 0 broken (115 cases) | `critic/c71_lrows_all.log` |
| Track checker 1938 (and a new seed) | 0 (53301) | 0 (54301) | `critic/c71_track_*.log` |
| `heldAtEnd` (new seed) | 0 (53311) | 0 (54311) | `critic/c71_heldAtEnd_54311.log` |
| 7019, 32019, 20 years | `505a4102`, `cb474a57` | `ab2bda3e`, `cfec21a0` (the pin moved for a colour) | `critic/c71_seed*_save.log` |
| Run 61's 396 landing setups (due; left out in run 70) | (run 69) 2 broken: 27037 15101 g2, 30041 3517 g1 | the same 2 | `critic/c71_liab_named.log` |
| Run 61's 153 stuck returns | (run 69) 0 spells; 1 checker break (27037) | the same | `critic/c71_sr.log` |
| Run 61's 168 next voyages | (run 69) 3 broken (30041, 31157, 31175, 3517 g1) | 168 of 168 identical; the same 3 | `critic/c71_nv.log` |
| Malta's 18 (due; left out in run 70) | (run 69) 11 thrown back, 7 broke off | the same, row for row | `critic/c71_malta.log` |
| landingFuzz (new seeds) | 1 of 90 `slowClick` (53101–) | 0 of 90 (54101–) | `critic/c71_landingFuzz.log` |
| R82d `farConquests 0` (two sets) | 9.2 far per 100; France takes Brazil 0 of 10 | identical | `critic/c71_farc_0_*.log` |
| R82d `firstdecl 60` | 0 of 96; 0 of 87 | 0 of 96; 0 of 87 | `critic/c71_firstdecl*.log` |
| R82f `piles 365` 39139–47, 51139–47 | none over 4:1 | identical | `critic/c71_piles_p*.log` |
| `successorPurse 999` | none disbands | identical | `critic/c71_successorPurse_999.log` |
| `workerDeterminism` (new seed) | `8abd99a9` (53059) | `459be807` on every arm (54059) | `critic/c71_wd_54059.log` |
| `fewNationWars 60` 7, 8, 9 (ADR-1068's figures) | — | 111, 100, 97 wars | `critic/c71_few60_7.log` |
| R70-B2's shape on a new seed (`c71_blocend 54611`) | — | aid and dissolution in one hour (1994-01-01T01); 0 lines | `critic/c71_blocend_54611.log` |
| `loadold`: run 70's 7019 year-20 save on HEAD | loads, runs a year | loads, runs a year (`8f6597c2`) | `critic/c71_loadold_7019.log` |
| Run 70's 1942 start (no `scoreFrom`) left by a God act on HEAD | — | 0 peaces; the wars kept with `scoreFrom` | `critic/c71_warlong_oldstart_1942god.log` |
| diploInvariants 33501, 51001, 53001; worldInvariants 36009, 51051, 37009 (R69-B3's) | 0 | 0 | `critic/c71_diploinv_*.log`, `critic/c71_wi_*.log` |
| `free 1962 51513 heroes=on`, `free 1946 51515 diplomacy=random` | 0, 0 | 0, 0 | `critic/c71_free_19*_free.log` |
| `free 1983 51505 730` | 0 | 0 | `critic/c71_free_1983_51505_free.log` |
| `afterTrack 37601` (R69-N4's Tajikistan) | no successor but Russia among the greats; 293 declared in 10 years | identical | `critic/c71_atx_37601.log` |
| `heldAtEnd 53311` | 0 | 0 | `critic/c71_heldAtEnd_53311.log` |
| `nukeIntercepts 53501` | 5 launches in 22 years | 5 launches | `critic/c71_nukeIntercepts_53501.log` |
| `workerDeterminism 53059` | `8abd99a9` every arm | `2d4a84c2` every arm (the pin moved for a colour) | `critic/c71_wd_53059.log` |
| Tick, seed 99, 5 years, alone | 2.322 ms mean | 2.340 ms mean (+0.8 %); year 1 `ae4ce317`, the pin | `critic/c71_tick99.log` |

## Design objections (none blocking, no score lowered)

- **ADR-1060 still empties occupied France in the hour the replay is left**, while R85b now keeps the war with Britain.
  - In the 1941 replay, one revolt in Brazil gives the German zone of France back to Vichy: Paris and the Channel coast
    turn from hatched grey to Vichy blue (`critic/shots/c71g42_1941_replay_53541_0before_france.png` against
    `…_1after_france.png`). Vichy France's land goes from 2,564,185 to 2,842,023 km².
  - Headless, a 1941 free start leaves Germany's 146 formations, 1.11M men, standing in Vichy France at peace after hour
    1; in 1942 and 1943 the 1,388–2,302 cells go back too (`critic/c71_freewar_1941free.log`, `…_1942god.log`,
    `…_1943.log`).
  - ADR-1060 decided this ("every cell held by a nation at peace with its owner goes back"). With R85b keeping the war
    on Britain, Germany loses the coast it fights from. The alternative: count an occupation the timeline set up by
    armistice (France 1940, Indochina 1940–41) as the occupier's, as R85b counts the war's.
- **Carried:** R82f counted by realm (ADR-1042); R84g's successors with few formations (run 70).

## Ideas from other games (not scored)

- **Hearts of Iron IV** shows war score's parts (occupied land, battles, the capital) beside the bar. A banner that said
  "39 (from 61 at the replay's end)" would explain R71-N2 even before it is fixed.

## Strengths (verified)

- **R85b turns the replay's main use into a game:** leaving it during the Second World War now keeps the war, and the
  war ends on the field. Germany wins in the East from 1942 (3 of 3 seeds), the Soviet Union from 1943 (3 of 3) and 1944,
  and Japan takes China in all 8 runs from 1942–44 (`critic/c71_warlong_*.log`); the save and load of these games is
  exact.
- **Every run 70 issue is fixed on run 70's own case**, and the checkers (diplo, world, track, held, worker determinism) are 0
  broken on 21 new-seed runs, and landingFuzz on 90.
