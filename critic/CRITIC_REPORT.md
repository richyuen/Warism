# Critic report, run 64 (focused): R65a–c, run 63's findings

- **Mode: focused.** The spawning message did not ask for a full run ("Run the critic per CRITIC_PROMPT.md on the
  current HEAD"). Run 63 (full) had no blocking issue and every score at its bar. So this run scores afresh only the
  dimensions the changed files touch, and carries every other score from run 63.
- **Commit judged:** `a90c7f574101385a723b0858a2b17d86327f005a`, HEAD at the start, on a clean tree
  (`critic/c64_commit.txt`).
- **What changed since run 63 (`78b082b4`):** 13 commits.
  - Release paperwork and ADR-959's tools (sweep, bench, the track's sweep tests).
  - R65a–c, run 63's findings. Eight files under `src/` changed:
    - `App.tsx`, `trackShown.ts`, `style.css`: the "Next" line, the "Building the world…" overlay, the phone font;
    - `GodTab.tsx`, `GodToolbar.tsx`, `en.json`: the God tab's note and the bar's note;
    - `protocol.ts`, `server.ts`: the stats carry the next 8 named events;
    - `historyRows.ts`: a timeline transfer told by its note is not told again as land or a death.
  - **No file under `src/sim`, `data` or `public/data` changed** (`git diff --stat 78b082b4 HEAD -- src/sim data
    public/data` is empty).
    - Run 61's bulk sets (396 landing setups, 153 stuck returns, 168 next voyages) are marked "sim unchanged,
      carried" (ADR-917).
    - So are Malta's 18.
- **Scored afresh:**
  - `uiUxPolish`, `godMode`, `statsHistory`: their files changed.
  - `editorScenarios`: the overlay answers its grey started file.
- **Carried from run 63:** every other dimension. `mapVisuals` is carried too: the phone line's font is judged under UI.
- **Setup:**
  - Build: `vite build --outDir critic/c64_dist`, exit 0 (`critic/c64_build.log`).
  - Server: `vite preview` on 127.0.0.1:5364.
  - Browser: Playwright Chromium at 1600 × 900, 390 × 844, 844 × 390, 932 × 430, 1024 × 500 and 667 × 375.
  - Probes: `critic/scripts/c64_*`, run 63's copied and pointed at 5364.
    - New: `c64_x_building`, `c64_x_buildpause`, `c64_transfer.ts`.
    - Page suites: `c64_suite.sh` and `c64_suite2.sh`.
    - Checkers: `c64_checkers.sh`. Named headless cases: `c64_jobsNamed.txt` via `c64_runNamed.sh`.
  - A worktree of `78b082b4` was run for `c64_transfer.ts` alone, the case whose History rows differ by commit. It is
    removed, with its `node_modules` junction unlinked first.
  - My preview and every browser I started are stopped.
- **Left out for time** (each carried with its dimension):
  - the performance chain (lookFps, the year-20 fps, the tactical goal, touch, tick 99);
  - the zoom, sea-battle, landing and AI-nuke page probes, and seaBattlesLook 31501;
  - the 12-year watches, the top-three census and the dogpile count;
  - the AI-nuke worlds 34501 and the late-strike watches;
  - worldInvariants 33507/09/11 and track seeds 33301/33303/34301/34303. Their sim is unchanged, and new seeds were
    run instead;
  - `npm run bench -- G`.

## Verdict

**No blocking issue. Every dimension is at its bar (8).**

- **The rule checkers on new seeds:**
  - `landingInvariants` via `landingFuzz --seeds 15 --first 36101`: **1 of 90 runs broken, by `slowClick` alone**. That
    is under ADR-914's 5, so it is non-blocking (R64-N2) (`critic/c64_landingFuzz.log`,
    `.cache/landingFuzz/a90c7f57-36101/`).
  - diploInvariants, 5 years each, 0 broken: 36001 (1938), 36003 (random), 36005 (1938, heroes)
    (`critic/c64_diploinv_360*.log`).
  - worldInvariants, every rule set, 5 years each, 0 broken: 36007, 36009 and 36011 (heroes) (`critic/c64_wi_360*.log`).
  - The track's checker: 0 broken lines on its own seed 1938 and on new seeds 36301 and 36303 (`critic/c64_track_*.log`).
  - **No rule a checker reports is broken, apart from that one timing bound.**
- **All of run 63's named findings are fixed on the probes that found them:**
  - R63-N1: 266 → 4 blank samples of 1,088;
  - R63-N2: the God tab warns;
  - the Manchukuo triple is gone.
  - Of the small items, these are fixed too: the bar's grey note, the grey started world and the ~10 px phone line.
- **The fixes bring two new, smaller faults:**
  - **R64-N1 (UI):** the phone line is now cut after a few letters of the event.
  - **R64-N3 (stats):** R65c's hour window hides two unrelated land rows on 8 May 1945.
- **Also met, non-blocking:**
  - **R64-N2 (naval):** one `slowClick` in 90 new runs.
- **Everything named and headless is text-identical to run 63:**
  - 10 landing cases, two traces, three diploInvariants and two seaBattles;
  - workerDeterminism 32059 `cf5a4a7f`;
  - 7019 and 32019 at year 20, `99caf939` and `4702acef`.

## Scores

| Dimension | Run 63 | Run 64 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Carried** (run 63, full). No map drawing changed. The phone line's font is judged under UI (R64-N1). An old fault seen again: the ranking's Land figure has no unit (`critic/shots/c64a_36117_13_paris_h_strike.png`). |
| Diplomacy, war, alliance, puppet, revolt depth | 8 | 8 | **Carried.** No sim file changed. Seen again: <ul><li>diploInvariants 36001/36003/36005 and run 63's 33501/33503/33505 at 0, the latter text-identical to run 63 (`critic/c64_diploinv_*.log`);</li><li>worldInvariants on three new seeds at 0;</li><li>after 1953 the Soviet Union declares war on Norway on 29 July 1953, on 1938, 36301 and 36303 (`critic/c64_track_*.log`).</li></ul> |
| Emergent world dynamics | 8 | 8 | **Carried.** The sim is unchanged, and 7019 and 32019 end their 20 years at run 63's hashes (`critic/c64_seed*_save.log`). |
| God Mode | 8 | 8 | **Scored afresh.** <ul><li>**R63-N2 fixed:** on 1938h, Germany's God tab opens with the red note "Any God Mode act ends the replay of history." at its head, at 1600 × 900 and 390 × 844 (`critic/shots/c64hgt_1600x900_tab.png`, `critic/shots/c64hgt_390x844_tab.png`, `critic/c64_hgt_*_god-world-ai.json`).</li><li>The bar's note is red and reads "Any God Mode act…", no longer as if it were the map tools' alone (`critic/shots/c64hgt_1600x900_box.png`).</li><li>A click on "World AI" ends the track that hour and is told in the ticker. `c64_h_god`: an editor opened with no edit and God Mode opened with no act leave it running; a revolt ends it (`critic/c64_hg.json`, as run 63's).</li><li>New seeds:<ul><li>H-bomb on Paris (36117): mushroom, ring, the alert with "Go to", 3,329,000 civilians, the same figures as runs 61 and 63 (`critic/shots/c64a_36117_13_paris_h_strike.png`);</li><li>Revolt, Spawn, Found and Raze, each told (`critic/c64_q_god_tools.36119.log`);</li><li>Breakthrough 36151: in the ticker, History, the CSV and the JSON (`critic/c64_kwhist.36151.log`).</li></ul></li></ul> **Not 9 (old):** <ul><li>With "World AI" scrolled into view, the tab's head note is out of sight. The bar's red note now covers this.</li><li>God's tools still reach only the selected side, and there is no undo.</li></ul> |
| Editor and scenarios | 8 | 8 | **Scored afresh.** <ul><li>**The grey started world is answered:** "Building the world…" stands over the map from the first frame to the first stats (`node critic/scripts/c64_x_building.mjs`, every 100 ms):<ul><li>file 32443: 0.95 → 2.68 s, stats at 2.82 s;</li><li>1938 desk 1.14 → 3.04 s; 1938 phone 1.11 → 2.87 s;</li><li>1938h 1.10 → 2.84 s; random 1.05 → 2.39 s.</li></ul> It never stands with stats present, it goes when the nations are drawn (one ~150 ms sample beside a nation), and the toy world shows none (`critic/c64_xb_{1938_desk,1938_phone,1938h_desk,random,toy,file32443}.json`, `critic/shots/c64xb_1938_phone_on.png`, `critic/shots/c64xb_1938_phone_off.png`).</li><li>**Editor 32443 by mouse:** brush `[1,1,1]`, undo `[19,19,19]`, redo, export 591,613 bytes (as runs 61–63), then load and start. The painted cells are Germany's (`critic/c64_x_editor.32443.log`).</li><li>R61-N2 holds: with a file chosen, the main Start is disabled with its reason (`critic/c64_x_editor.32441.log`).</li><li>Bad files are refused (`critic/c64_x_badfiles.log`).</li></ul> **Not 9 (old):** `VIE` defined and never born (`critic/c64_track_*.log`). |
| Stats and history | 8 | 8 | **Scored afresh.** <ul><li>**The Manchukuo triple is fixed:** the watch's 18 August 1945 reads "Puyi abdicates: Manchukuo's army gone" and "Manchukuo and Mengjiang dissolved: China in name", with no "was destroyed" (`critic/c64_hw_desk.json`, sample 29; run 63's had all three).</li><li>**Over the whole track** (`npx tsx critic/scripts/c64_transfer.ts` on both commits, `critic/c64_transfer_diff.txt`), R65c drops 61 History rows: 10 deaths and 51 land rows.<ul><li>Each of the 10 deaths is still told once: POL, NED, NOR, YUG and GRE by their "annexed by" rows; GER by "The Reich ends…"; RSI by "The north freed: the Italian Social Republic ends"; MAN and MEN by their note.</li><li>The weakest is Vichy, told only as "France freed: the Provisional Government" (`critic/c64_transfer_head.log`).</li><li>49 of the 51 land rows are the transfers' own; 2 are not (R64-N3).</li></ul></li><li>**On plain worlds nothing moved:** History on the year-20 saves opens in 152 ms with "3129 of 3129 events" (32019). The CSV is 3,130 lines, byte-identical to run 63's (`critic/c64_hi_32019.json`, `critic/c64_hi_7019.json`, `critic/c64_dl_32019.csv`).</li><li>Ticker order on 31211 h114 and the 667 × 375 war list on 31201 are byte-identical to run 63's (`critic/c64_wt_ITA_31211_h114.json`, `critic/c64_mw_31201_GER_667x375.json`).</li></ul> **Not 9:** <ul><li>R64-N3.</li><li>History still has "Slovakia was annexed by Czechoslovakia" and "Slovakia was destroyed" in the same hour of 8 May 1945. The ticker merges the two; History does not (both commits).</li><li>"0 civilians killed" beside large military losses (old).</li></ul> |
| UI/UX and polish | 8 | 8 | **Scored afresh.** <ul><li>**R63-N1 fixed:** `node critic/scripts/c64_h_blank.mjs 120 1600 900 99`, 1,088 samples, 1938 → March 1943 at Max. The line is missing in **4 (0.4 %)**, against 266 (24.5 %) on run 63, and is never past. The 4 are one run of 0.4 s in April 1941, when more than 9 named events fall within a second (`critic/c64_hb_1600x900_s99.json`).</li><li>The 15-year watch: 0 of 57 samples before 1953 lack a line (run 63: 17 of 56), at 59–60.5 fps (`critic/c64_hw_desk.json`).</li><li>Greece in 6-hour steps: 0 of 17 blank (run 63: 2) (`critic/c64_hn_greece.json`).</li><li>Reads right after a pause: 0 blank in 5 tries (run 63: 3) (`critic/c64_hpb.json`).</li><li>The bar's note is red.</li><li>The building overlay (above). Pressing the bar's pause during the build leaves the game paused, and the bar says so (`critic/c64_xbp_1600x900_p1.json`).</li><li>The panel's × works at 844 × 390, 932 × 430, 1024 × 500 and 667 × 375, byte-identical to run 63 (`critic/c64_xcb_21103_*.json`). At 390 × 844, new here, the landing order replaces the panel with the landings bar, so there is no × to press.</li><li>Keys work (`critic/c64_x_keys.36423.log`). The take-control and God notes show at both sizes (`critic/c64_hi_*.json`).</li><li>Save and Continue give the same hash as an unbroken game:<ul><li>mid-track (`critic/c64_hc_400_120.json`);</li><li>plain 36415 (`critic/c64_xc_36415_GER.json`);</li><li>one hash for three seeds of the track's URL (`critic/c64_hseed.json`).</li></ul></li><li>0 page errors.</li></ul> **Not 9:** <ul><li>R64-N1.</li><li>During the build, a paused start's bar says "Pause" (running) for ~2 s, then "Resume · Paused" (`critic/shots/c64xbp_1600x900_p1_before.png`).</li></ul> |
| Performance | 8 | 8 | **Carried.** The perf chain was not run; the sim is unchanged. Seen in passing: the 15-year track watch at Max held 59.0–60.5 fps (`critic/c64_hw_desk.json`). |
| Stability | 8 | 8 | **Carried**, with run 63's named determinism cases re-run and identical: <ul><li>7019 `99caf939` and 32019 `4702acef` at 20 years;</li><li>workerDeterminism 32059 `cf5a4a7f` on every arm (`critic/c64_wd_32059.log`).</li></ul> 0 page errors in every page probe. |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Carried.** |
| Naval warfare (needs 8) | 8 | 8 | **Carried.** <ul><li>Run 63's 7 named landingInvariants cases, R61-SC's three and the two R60 traces are text-identical (`critic/c64_li_*.log`, `critic/c64_nvtrace_*.log`).</li><li>seaBattles 32061 and 32063 give 75 and 87, as before.</li><li>landingFuzz on new seeds: 1 `slowClick` in 90, under the bar of 5 (R64-N2).</li></ul> |
| Tanks (needs 8) | 8 | 8 | **Carried.** |
| Aircraft (needs 8) | 8 | 8 | **Carried.** |
| AI nuclear use (needs 8) | 8 | 8 | **Carried.** The track's AI strikes nothing until 1953, and nothing in the 365 days after it on 1938, 36301 and 36303 (`critic/c64_track_*.log`). |

## Blocking issues

None.

- `landingInvariants` on 90 new runs: 1 `slowClick` (1.1 %), under ADR-914's 5.
- diploInvariants (3 new, 3 named), worldInvariants (3 new) and the track's checker (3 seeds): 0 broken.
- 0 page errors.

## Non-blocking issues (prioritised)

1. **R64-N1 (UI, phone, new, from R65c's fix): the track's line shows only a few letters of the event.**
   - Probe: `node critic/scripts/c64_h_phone.mjs 390 844` (and 844 390). The line is 11 px in the same 150 px.
     - It now reads "Next, 12 March 1938: The An…" (scrollWidth 175 against 150).
     - Run 63 showed "Next, 12 March 1938: The Anschluss" whole at 8.8 px (scrollWidth 150).
     - Evidence: `critic/c64_hp_390x844.json` against `critic/c63_hp_390x844.json`; crops
       `critic/shots/c64hp_390x844_bar_crop.png` and `critic/shots/c64hp_c63_390x844_bar_crop.png`.
   - The prefix "Next, 12 March 1938: " takes 21 of the ~29 characters that fit, so a note shows about 8 letters.
     - The notes of the watch are 46 characters at the median.
     - The full text is only in a tooltip, which a phone cannot hover.
   - **Fix:** on a phone, drop "Next," and use a short date ("12 Mar 1938: …"), or let the line take two rows. Or open
     the full note on a tap.
2. **R64-N3 (stats, track, new, from R65c's fix): two unrelated land rows are hidden on 8 May 1945.**
   - Probe: `npx tsx critic/scripts/c64_transfer.ts`, on HEAD against `78b082b4` (`critic/c64_transfer_diff.txt`).
   - What happens:
     - At 00:00 "Carpatho-Ukraine, Soviet in fact" moves land from Hungary to the Soviet Union.
     - At 01:00 the timeline's `born` events restore Czechoslovakia (from GER, SLO, HUN) and Yugoslavia (from GER,
       CRO, HUN, BUL).
   - What History shows:
     - Their German, Slovak, Croat and Bulgarian land rows are told.
     - "Czechoslovakia took land from Hungary" and "Yugoslavia took land from Hungary" are not.
   - The cause: `transferTold` matches any `LandCeded` whose giver was a transfer's `from`, in that hour or the next.
     It does not check the receiver (`src/worker/historyRows.ts`, `transferTold`).
   - **Fix:** match the row's receiver to the transfer's `to` as well, and keep the hour after only for
     `NationEliminated`.
3. **R64-N2 (naval, new seed): one `slowClick`.**
   - Probe: `npx tsx tools/diag/landingInvariants.ts 36105 3517 120 36105 30 2 8`. t185's click of 366 got ashore after
     13.0 days, against a best way of 4.2 (`critic/c64_lf_36105_3517_g2_od8.log`).
   - 366 spent 4.0 days in a gathering landing, 3.4 of them with no ground gained.
   - No sim file changed since run 63, which had 0 of 90 on other seeds. This is the known `slowClick` tail (R61-SC) met
     on a new seed, not a regression.
4. **Small:**
   - The "Next" line still drops for ~0.4 s when more than 9 named events fall within a second (April 1941,
     `critic/c64_hb_1600x900_s99.json`, samples 496–499).
   - During the build, a paused start's bar says "Pause".
   - History's "annexed" and "destroyed" pair in one hour (Slovakia, 8 May 1945).
   - **Old, carried:**
     - `VIE`, the ranking's Land unit, "0 civilians killed", no late AI strike after year 20;
     - R61-SC's three `slowClick` breaks (text-identical);
     - Malta never taken;
     - alliances that ignore the map (32415) and the phone's panel over the corridor (30307). Neither was re-run.

## Run 63's cases re-run

| Run 63 case | Run 63 (`78b082b4`) | Run 64 (`a90c7f57`) | Evidence |
|---|---|---|---|
| R63-N1 `c63_h_blank 120 1600 900 99` | no line in 266 of 1,084 (24.5 %), runs up to 18 | **fixed**: 4 of 1,088 (0.4 %), longest run 4; 0 past | `critic/c64_hb_1600x900_s99.json` |
| R63-N1 watch after pauses (`h_watch … desk`) | 17 of 56 pre-1953 samples without a line | **fixed**: 0 of 57 | `critic/c64_hw_desk.json` |
| `h_pauseblank` | blank in 3 of 5 | 0 of 5 | `critic/c64_hpb.json` |
| `h_next` Greece, 6-hour steps | 2 blank steps | 0 | `critic/c64_hn_greece.json` |
| R63-N2 `c63_h_godtab 1600 900 god-world-ai` | no note in the tab | **fixed**: the red note at the tab's head at both sizes; the bar reads "Any God Mode act…" in red | `critic/shots/c64hgt_*_tab.png` |
| Manchukuo triple, 18 August 1945 | three rows | **fixed**: one note; 61 rows fewer over the track, no death untold; 2 land rows hidden wrongly (R64-N3) | `critic/c64_hw_desk.json` (29), `critic/c64_transfer_diff.txt` |
| The bar's note grey | grey | **fixed**: red | `critic/shots/c64hgt_1600x900_box.png` |
| Grey started file (32443) | grey map 2–3 s, nothing said | **fixed**: "Building the world…" until the stats (0.95–2.68 s) | `critic/c64_xb_file32443.json` |
| Phone line `h_phone 390 844`, `844 390` | ~10 px, whole | 11 px in a 13 px box, **cut** (R64-N1) | `critic/c64_hp_*.json` |
| `h_interv` 1600 × 900, 390 × 844; `h_god`; `h_seed` | notes; the track ends and is told; one hash for three URLs | the same | `critic/c64_hi_*.json`, `critic/c64_hg.json`, `critic/c64_hseed.json` |
| Save and Continue mid-track (400 + 120 days) | same hash | same hash (`sameAfter`). Its `?after=` seed is drawn anew each game, so the hash is not run 63's | `critic/c64_hc_400_120.json` |
| 31211 h114 ticker order; 31201 at 667 × 375 | as run 62 | byte-identical | `critic/c64_wt_ITA_31211_h114.json`, `critic/c64_mw_31201_GER_667x375.json` |
| R61-N1 closeblock 21103 at 4 sizes | fixed | byte-identical | `critic/c64_xcb_21103_*.json` |
| R61-N2 / R61-N3 editor 32441, bad files; editor 32443 | fixed; paint kept, 591,613 bytes | the same | `critic/c64_x_editor.*.log`, `critic/c64_x_badfiles.log` |
| History and CSV on the year-20 saves | 3,129 events; 3,130 lines | the same, CSV byte-identical | `critic/c64_hi_32019.json`, `critic/c64_dl_32019.csv` |
| 7019 / 32019, 20 years | `99caf939`, `4702acef` | the same | `critic/c64_seed*_save.log` |
| Named landingInvariants ×7, R61-SC ×3, nvtraces ×2 | as run 61 | text-identical | `critic/c64_li_*.log`, `critic/c64_nvtrace_*.log` |
| diploInvariants 33501/3/5 | 0 | 0, text-identical | `critic/c64_diploinv_335*.log` |
| seaBattles 32061, 32063r; workerDeterminism 32059 | 75, 87; `cf5a4a7f` | the same | `critic/c64_sb_*.log`, `critic/c64_wd_32059.log` |
| Track checker 1938 | 0 broken | 0 broken (365 free days this run, 730 before, so the hashes are not comparable) | `critic/c64_track_1938.log` |
| worldInvariants 33507/9/11, track 33301/33303/34301/34303, seaBattlesLook 31501, Malta's 18, run 61's bulk sets, perf chain | as run 63 | **not run**: the bulk sets as "sim unchanged, carried" (ADR-917), the rest left out for time | — |

## Design objections (none blocking, no score lowered)

- Run 63's, unchanged:
  - the track's 1942–44 fronts are painted, not fought (SPEC §7.7);
  - the world forgets the blocs after 1953: the Soviet Union declares war on Norway on 29 July 1953 on every seed run
    (`critic/c64_track_*.log`);
  - the same history every game.
- A note at the head of a tab of ~40 controls is still a weak guard for a one-click, fifteen-year loss. ADR-952 chose
  notes over a confirm; the bar's red sentence now does most of the work.

## Ideas from other games (not scored)

- Paradox games show the next events as a short list under the date that opens on a tap. On a phone that would answer
  R64-N1 better than any font size.

## Strengths (verified)

- **The batch fixed each of run 63's findings on the probe that found it, and the numbers show it:**
  - the blank line fell from 24.5 % to 0.4 % at Max, and to 0 in the watch, the Greece steps and the pause reads;
  - the God tab warns at both sizes;
  - the track's History lost 61 doubled rows without losing a death.
- **Starting a world now says what is happening.** The overlay came and went cleanly on six starts (plain, phone,
  track, random, a file, and none on the toy). It never stood over a world whose stats had come
  (`critic/c64_xb_{1938_desk,1938_phone,1938h_desk,random,toy,file32443}.json`).
