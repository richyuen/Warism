# Critic report, run 54 (full): after R52a–d (run 53's issues)

- **Mode: full.** I decided this from git before anything else (CRITIC_PROMPT, ADR-804). A focused run needs all
  three conditions. The first fails: the last report (run 53, `bcf13f19`, on `5f8ef9e8`) has no blocking issue and no
  score under its bar (naval 8 against 8, every first-group score at 7 or more). So this is the full run that ADR-804
  asks for after a clean focused one. The commits since are `7e626645` (R52a), `74f170d8` (R52b), `585e20a8` (R52c) and
  `8d7d02fe` (R52d). Together they change 6 files under `src/` (`git diff --stat 5f8ef9e8 HEAD -- src data public`:
  +79 −17: `landings.ts`, `server.ts`, `landingStatus.ts`, `voyageText.ts`, `protocol.ts`, `en.json`). Every dimension
  is scored afresh; nothing is carried.
- **Commit judged:** `8d7d02fe6083771f8bd4b7bcfc7f1470a3bc5a0f`, HEAD at the start, clean tree
  (`critic/c54_commit.txt`). **Date:** 2026-11-08.
- **Build:** `vite build --outDir critic/c54_dist`, exit 0 (`critic/c54_build.log`). Served by `vite preview` on
  127.0.0.1:**5354** and stopped at the end. Driven with Playwright Chromium at 1600 × 900, 390 × 844 and 844 × 390.
- **Runs.**
  - **Headless replay** of run 53's 18 jobs, plus one new seed per family:
    `tools/diag/replayCritic.ts --run 53 --new 1 --jobs 2 --out critic/c54_replay` (`critic/c54_replay/REPORT.md`).
  - **Headless, fresh seeds, 30 jobs** (`critic/scripts/c54_jobsAll.txt`; every one exited 0, `critic/c54_q_all.done`):
    - diploInvariants 24001–24011 (random, scenario, heroes, a random world);
    - landingInvariants 24021–24033;
    - worldInvariants 24051, 24053 (heroes), 24055 (ten years), 24057 (random world);
    - workerDeterminism 24059; seaBattles 24061; `landingRows all`;
    - far routes 24041, 24043, 24045;
    - staged repulses 24071, 24073, 24075; unstaged repulses 24081, 24083;
    - 7019 for 20 years (saved, `critic/c54_seed7019_y20.bin`) and a new world, 24099, for 25 years.
  - **Headless, second list** (`critic/scripts/c54_jobsB.txt`): 21099 and 20899 for 25 years (run 53's bar cases for
    emergent dynamics), and `critic/scripts/c54_heldby.ts` (below).
  - **Page, one at a time** (`critic/scripts/c54_suiteP.sh`, `c54_suiteP2.sh`):
    - run 53's "what the bar needs" and named cases first, then new seeds 24101–24143 for the whole brief;
    - 7019's year-20 save: AI nukes, History, the downloads; two 12-year watches at Max;
    - last, alone: the frame rate on 7019's year-20 save (`critic/scripts/c54_chain3.sh`).
  - **New probes:**
    - `critic/scripts/c54_dest2.ts`: one click's landing, headless, every 2–6 hours, with the sea battle its groups
      are in (`world.seaBattles`: the fleets, their ships, both sides' losses) and every foe fleet within 30 cells.
      It answers run 53's question on R53-N3: is the hold real?
    - `critic/scripts/c54_heldby.ts`: who `heldBy` names in an AI world. It found nothing: the AI's landings are not
      in `world.landings` (only `bindDivision`, the player's click, makes one), so `heldBy` reads only the player's.
    - `critic/scripts/c54_rw_random.mjs`: the random world and the toy world in the page, one year each at Max.
    - The Rome → Valletta click on eight new seeds, 24151–24175 (`critic/c54_lland_ita_malta_241*.json`).

## Verdict

**R52a–d do what they say on run 53's named cases. Every checker reports 0 broken on every seed. But the newest
feature has a new blocking issue: on the commonest outcome of run 53's own Malta case, the bar, the division's panel
and the ticker tell three different stories.**

- **Fixed, each on its run-53 case:**
  - **R53-N1:** the staged 23071 now ends "over: 1 landed, 2 thrown back", and 20861 ends "over: 1 landed, 2 thrown
    back" (run 53: "2 came ashore away from Bremerhaven" and "3 landed").
  - **R53-N2:** 20661 at h30 reads "turning back to Tokyo, Ōsaka: there in about a day". 22101 on day 3 names both
    ports still turning back, and Hiroshima's part reads "cancelled: back at Hiroshima".
  - **R53-N3:** 21105 reads "at sea: under attack by United Kingdom, held up", and the panel agrees. The hold is
    real: British fleet 1080 shells the Italian ships from 18.8 cells for 90 hours (0 British losses, 32 Italian).
  - **R53's small item:** 20861 at h120 reads "1 of 3 ashore; at sea: lands in about a day".
- **R54-B1 (blocking, new):** Italy's two-division landing from Rome to Valletta, the critic's named case since run
  50, is thrown back on 6 of the 11 seeds I ran (23105, 24151, 24153, 24155, 24159, 24171). On every one:
  - for 18–24 hours after the news "the landing was thrown back; the transports sail home and land it there", the
    bar reads "at sea: lands in about a day". The division's panel says both "At sea, bound for its landing" and,
    two lines below, "the landing was thrown back";
  - then the bar reads **"over: 2 thrown back"**. The ticker beside it reads "319: landed away from its target",
    "321: landed away from its target", and the panel reads "Landed". The divisions are ashore at Catania, neither
    home at Rome nor at Valletta.
  - Run 53, same seed and click: "over: its transports broke off; 2 came ashore away from Valletta", which agreed
    with the ticker. R52a's "once thrown back, stays so" turned an agreeing line into a contradicting one.

**Scores.** Naval goes from 8 to 7 for R54-B1. Everything else holds its run-53 score; each is re-earned below on
this run's own evidence.

## Scores

| Dimension | Run 53 | Run 54 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Re-earned on new seeds.** <ul><li>**The relations graph:** on 20887, 21129 and new 24129 at day 365, every name is whole and no label lies over another (`critic/shots/c54rg_20887_desk_d365.png`, `critic/shots/c54rg_24129_desk_d365.png`). On the phone (24131, day 730, random diplomacy) the names can be read (`critic/shots/c54rg_24131_phone_d730.png`).</li><li>**The random world** (24161, one year in the page) reads at the world zoom: nations named along their land, 15 whole names in the ranking, occupied land hatched (`critic/shots/c54rw_random_24161_end_world.png`).</li><li>**A 12-year world** (24141, heroes) reads at a glance: the USA across western Canada, France over West Africa, every chip and ticker row whole (`critic/shots/c54lwhon_24141_y12_world.png`).</li><li>**A sea battle** at 60 m/px: Romanian destroyers against a Soviet cruiser squadron off Constanța, with tracers and the battle ring (`critic/shots/c54sb_20885_60m_balls.png`).</li></ul> **Not 9:** <ul><li>The relations graph is a hairball at day 365: about 40 war lines meet on the United Kingdom (`critic/shots/c54rg_20887_desk_d365.png`), and 21–37 nations are left out.</li><li>A held landing's attacker is named but not linked on the map: on 21105 the battle marker is 14 cells from the transports, with nothing between them (`critic/shots/c54lh_ita_malta_21105_h60_1500m.png`).</li></ul> |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | **Rescored.** <ul><li>**0 broken on every run:** diploInvariants on 24001 (random), 24003 (scenario, heroes), 24005 (random world), 24007, 24009 (random, heroes) and 24011. Each runs ten years, except the random world's five (`critic/c54_diploinv_24*.log`). Also 0 broken on run 53's 23001, 23003 and 23005 again, and on new 60101, 60201 and 60301 (`critic/c54_replay/REPORT.md`).</li><li>Force war on 24135 matches the sim's ties (`critic/c54_fw2_24135.json`).</li><li>The 12-year watch on 24141 has 70–100 nations alive and real turns: the USA at war with the United Kingdom in year 8, France with the UK in year 12 (`critic/c54_lwhon_24141.json`).</li></ul> **Not 8, as in runs 51 and 53:** year-one wars are still dogpiles. At day 365: <ul><li>20887: "Germany +6 ⚔ United Kingdom +36" and "Nationalist Spain ⚔ Portugal +22" (`critic/shots/c54rg_20887_desk_d365.png`; run 53 the same);</li><li>new 24129: "United Kingdom +35 ⚔ Brazil" (`critic/shots/c54rg_24129_desk_d365.png`);</li><li>24141, year 2: "France +30 ⚔ Brazil +5" (`critic/c54_lwhon_24141.json`).</li></ul> **What the bar needs:** on 20887, 21129 and 24129, `node critic/scripts/c54_rg_relations.mjs <seed> 365 1600 900 desk '&heroes=on'` shows no war chip at day 365 with one side more than 4 times the other's count of nations. And diploInvariants stays at 0 broken on the runs above. |
| Emergent world dynamics over long runs | 7 | 7 | **Rescored.** <ul><li>**21099 (25 years) is the same world as run 51's:** hash `f971613c` on both builds, and an identical top-5 timeline (`critic/c54_top_21099.txt` against `critic/c51_top_21099.txt`). Denmark sits at 5.4 % for all 25 years.</li><li>**20899 is the same world as run 50's** (hash `bf870991`). Denmark is in the top 5 at 5.4–5.5 % for 17 of the 25 years (`critic/c54_top_20899.txt`).</li><li>**New 24099 (25 years):** the Soviet Union holds 27.3–31.9 % and Canada 12.1–13.4 % in every year. The first three places are the same nations in the same order for all 25 years (`critic/c54_top_24099.txt`). New seed, not compared.</li><li>**The page watches are livelier:** on 24141 the USA overtakes the Soviet Union by year 12 (22.5 M km² against 22.4 M), and France and Japan rise to third and fourth (`critic/shots/c54lwhon_24141_y12_world.png`).</li></ul> **What the bar needs:** as run 53 said, `node critic/scripts/c48_top.cjs` on `npm run sim -- --scenario 1938 --seed 21099 --years 25` and on seed 20899, with no top-5 holder within ±0.2 % of the same share for 20 or more years. And on 24099, the first three places are not the same three nations in the same order every year. |
| God Mode | 8 | 8 | **Rescored on new seeds.** <ul><li>**Nukes on 24117:** the H-bomb on Paris (3,329,000 civilians) shows its mushroom, its ring and an alert with "Go to", and the A-bomb follows on London (`critic/shots/c54a_24117_13_paris_h_strike.png`, `_15_london_a_strike.png`). The nuke charts draw (`_33_chart_*.png`).</li><li>**Tools on 24119:** Revolt makes "Free Saxony broke away from Germany", and Spawn makes "Free Greater Poland Voivodeship was set up on land of Poland". Found and Raze are each told in the ticker (`critic/c54_q_24119.json`).</li><li>**Breakthrough at war** on new 24123 reads "God opened a breakthrough for Germany near Berlin". Fighting follows: engaged 0 → 4 → 19 → 49 by day 7 (`critic/c54_kw_24123.json`). On 21151 the same row is in History and in the CSV (`critic/c54_kwh_21151.json`, `critic/shots/c54kwh_21151_history.png`).</li><li>At peace, Breakthrough is refused (`critic/c54_k_20879.json`).</li><li>No page error.</li></ul> **Not 9:** the corridor is still not drawn (ADR-864; see Design objections). |
| Editor and scenarios | 7 | 7 | **Rescored.** On G 24121, fleets and a Polish bomber are placed, and a fleet at Berlin is refused ("Not done: no water of a sea is near the place."). The scenario exports and loads as placed: 89 German, 76 British and 50 Polish forces and 10 warheads. It plays, with sea battles on day 1 (`critic/c54_g_24121.json`). The probe's day-60 mark timed out, as in runs 48–53: that is the probe, not the game. **Not 8:** <ul><li>The run-26 scenario is still refused: "Could not load: it was made by an older version of Warism, and this one cannot start it" (`critic/c54_os2_c54.json`).</li><li>The editor's nation list is still one flat list of 100+ names (`critic/c54_g_24121.json` `editorText`).</li></ul> **What the bar needs:** as run 53 said, `node critic/scripts/c54_os2_scen.mjs critic/c26_critic_standoff.warsim-scenario c54` loads the file, or says what it changed to load it. And a typed filter narrows the editor's nation list (`c54_g_editor.mjs 24121`). |
| Stats and history | 8 | 8 | **Rescored on HEAD's own 7019 year-20 save** (hash `6a8590fe`, the same as runs 39–53). <ul><li>History opens in 121 ms with 3,714 events of 28 kinds (`critic/c54_hi_7019.json`).</li><li>The CSV has 3,716 lines and the JSON 37,142 (`critic/c54_dl_7019.json`, `critic/c54_dl_7019.csv`).</li><li>The Breakthrough row names its place in History, the CSV and the JSON (God Mode row).</li><li>The nuke charts draw (`critic/shots/c54a_24117_33_chart_*.png`).</li></ul> **Not 9:** <ul><li>There is no "my wars only" filter.</li><li>History's first rows on 7019 repeat a pair: "25 December 1957 A major battle began near Tangier" and "The major battle near Tangier was won by Germany", twice on one day, then once more on the 26th (`critic/c54_hi_7019.json` `firstRows`).</li></ul> |
| UI/UX and polish | 7 | 7 | **Rescored.** **Better, each on run 53's case:** <ul><li>**R53-N2:** 20661 at h30 reads "turning back to Tokyo, Ōsaka: there in about a day" (`critic/shots/c54tb_jap_cancel_20661_h30.png`). 22101 on day 3 names Tokyo and Ōsaka, with Hiroshima's part "cancelled: back at Hiroshima" (`critic/shots/c54lbar_jap_sh3_land_22101_844_d3.png`). New 24101 (three ports) reads "cancelled: 2 back at Tokyo, Ōsaka, 1 stopped where they stood" (`critic/c54_tb_jap_cancel3_24101.json`).</li><li>**R53-N3:** the held row and the panels name the attacker (Naval row).</li><li>20861 at h120 reads "1 of 3 ashore; at sea: lands in about a day" (`critic/c54_lh_jap_sh3_20861.json`).</li><li>The landscape phone's bar keeps its Cancel button and four division lines on screen and topmost (`critic/c54_lbox_eng_br4_21103_844x390.json`).</li><li>On a touch screen, a tap shows the landing's mark, at 59–60 fps (`critic/c54_tm_touch.json`).</li><li>No page error in any c54 probe.</li></ul> **Not 8:** <ul><li>**R54-B1** (below): the bar, the panel and the ticker disagree on the commonest Malta outcome. One panel says two opposite things at once (`critic/shots/c54lh_ita_malta_23105_h174_1500m.png`).</li><li>Small, unchanged since run 53: on 22105, day 2, two division lines drop their days ("Marching to Portsmouth to board transports") while the third keeps them (`critic/c54_lbar_eng_br3_phone_22105_390.json`).</li></ul> **What the bar needs:** R54-B1's cases (Naval row) read as one story in the bar, the panel and the ticker. And on 22105 (`node critic/scripts/c54_lbar.mjs 22105 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3_phone 390 844 14 4`), every division line gives its days on day 2. |
| Performance | 7 | 7 | **Rescored, alone, at the end, on the same save as runs 50–53** (7019's year 20 is the same world: hash `6a8590fe`). <ul><li>3,000 / 1,200 / 600 m/px: 58.8–60.2 fps in both looks.</li><li>**120 m/px: 33.2–38.7 fps** (run 51: 31.0–39.6).</li><li>30 m/px: 38.7–48.0 (run 51: 40.1–47.3) (`critic/c54_pf_7019.json`, `critic/c54_pf_lookfps.log`).</li><li>The two 12-year watches at Max: 59.9–60 fps every year, the longest gap 83 ms, 0 frames over 500 ms (`critic/c54_lwhon_24141.json`, `critic/c54_lwplain_24143.json`).</li><li>Touch: 59.5–60 fps with and without a selection (`critic/c54_tm_touch.json`).</li><li>Headless 7019 for 20 years: 3.59 ms a tick, with 7–8 other jobs running (not a clean figure; run 53: 3.32 with two beside it).</li></ul> **Not 8:** the unit zooms on a late world still run at 33–48 fps, the same as run 51 within noise. **What the bar needs:** as run 53 said: `node critic/scripts/c54_pf_lookfps.mjs 7019 critic/c54_seed7019_y20.bin`, alone, at 45 fps or more at 120 m/px in both looks. |
| Stability | 8 | 8 | **Re-earned on new seeds.** <ul><li>**Save and load in the page (24137, new):** saved at t4800 (hash 3845193331) and run 200 days: 3951874301. Loaded twice and run 200 days each time: 3951874301 both times (`critic/c54_sl_plain_24137.json`).</li><li>**Long worlds keep their hashes:** 7019's 20-year hash is `6a8590fe`, as in runs 39–53 (`critic/c54_seed7019_save.log`). 21099 and 20899 end on the same hashes as in runs 51 and 50.</li><li>**workerDeterminism:** 24059 ends `437ada37` on every arm. 23059 is the same as in run 53, and new 60401 ends `4895a8ec` on every arm (`critic/c54_wd_24059.log`, the replay).</li><li>**worldInvariants:** 0 broken on 24051, 24053 (heroes), 24055 (ten years) and 24057 (random world). Also 0 on 23051 and 60501, ten years each, in the replay.</li><li>**The two 12-year watches at Max:** 0 page errors and 0 frames over 500 ms (`critic/c54_lwhon_24141.json`, `critic/c54_lwplain_24143.json`).</li><li>Of 77 c54 JSONs, none has a page error. Two have a `fatal`, and both come from the probe: the editor's day-60 wait and the refused run-26 file.</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Re-earned on new seeds.** <ul><li>**Z 24111:** one camera from 6,000 to 3 m/px in 18 steps. Elements appear from 1,573 m/px (7,962). Individuals appear at 28 m/px (13,836) and number 4,428 at 3 m/px, with no error (`critic/c54_z_24111.json`).</li><li>At 11.6 m/px: German and Polish balls with helmets, rifles and tracers, and planes overhead (`critic/shots/c54z_24111_14.png`). At 1,000 m/px: divisions, fronts and the hatched contested ground (`critic/shots/c54z_24111_04.png`).</li><li>**PHZ 24133:** on the phone from 30,000 to 25 m/px, with no overflow at any tier (`critic/c54_phz_24133.json`).</li><li>**The sea battle at R46's camera** (20885 t107) is drawn with 24 / 22 / 16 elements at 250 / 60 / 25 m/px in Balls, as in run 53 (`critic/c54_sb_20885.json`).</li></ul> |
| Naval warfare (needs 8) | 8 | **7** | **Down, for R54-B1, shown on the same case on both builds.** <ul><li>**23105**, Rome → Valletta, two divisions, in the page:<ul><li>**Run 53** (`5f8ef9e8`, `critic/c53_lland_ita_malta_23105.json`): "over: its transports broke off; 2 came ashore away from Valletta", the same as the ticker's last two rows.</li><li>**HEAD** (`critic/c54_lland_ita_malta_23105.json`, `critic/c54_lhold_23105_b.log`): "over: **2 thrown back**", beside the ticker's "319: landed away from its target" and "321: landed away from its target", and 319's panel "Landed" (`critic/shots/c54lh_ita_malta_23105_h186_1500m.png`).</li></ul></li><li>**Before the end, on both builds** (h162–h180): after the news "the landing was thrown back; the transports sail home and land it there", the bar reads "at sea: lands in about a day". 319's panel says "At sea, bound for its landing", with the throw-back news two lines below it (`critic/shots/c54lh_ita_malta_23105_h174_1500m.png`).</li><li>**It is the commonest outcome.** On new 24151, 24153, 24155, 24159 and 24171, the same click is thrown back, reads "at sea: lands in about a day" for 18–24 h, and ends "over: 2 thrown back" beside two "broke off; came ashore away" rows. 24157, 24173 and 24175 end "broke off; 2 came ashore away from Valletta" with no throw-back (`critic/c54_lland_ita_malta_241*.json`). So 6 of the 11 Malta clicks I ran (21105, 23105, 24105, 24151–24175) end this way.</li></ul> **Fixed and better (run 53's cases):** <ul><li>**R53-N1:** the staged 23071 ends "over: 1 landed, 2 thrown back", and so does 20861 (run 53: "2 came ashore away from Bremerhaven" and "3 landed"; `critic/c54_replay/REPORT.md`). The same on new staged 24071 and 24073 (`critic/c54_repulse_24071.json`, `_24073.json`).</li><li>**R53-N3:** the hold is real, and now named. `critic/scripts/c54_dest2.ts` on 21105: from t63 to t153, transport group 1195 is in one sea battle with British fleet 1080 (10 ships, 18.8 cells off) and Italian fleet 1179. Britain loses 0 ships and Italy 32 (`critic/c54_dest2_21105.json`). The row reads "under attack by United Kingdom, held up", and so do both panels (`critic/shots/c54lh_ita_malta_21105_h60_250m.png`). The same on new 24105 at h60 and h90.</li><li>22103's two divisions: "over: its transports were sunk; 2 never sailed". On new 24103 (three): "3 never sailed", and the news says the same (`critic/c54_lland_ger_norwich3_24103.json`).</li><li>Landings that go right: on 23109 and new 24107, England's three land at Bremerhaven, "over: 3 landed" at h144. On 24045, four land at t141–142 (`critic/c54_far_24045_eng_bremen4.json`).</li><li>Checkers: landingInvariants 0 broken on 24021–24033. `landingRows all`: 0 broken on 108 cases and 19,905 hours (`critic/c54_lrows_all.log`). seaBattles 24061: 76 sea battles in 3 years.</li></ul> **What the bar needs:** `SHOTAT=162,168,174,180,186 node critic/scripts/c54_lhold.mjs 23105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200`, and `c54_lland.mjs` with the same arguments (240 h) on 24151, 24153, 24155, 24159 and 24171. It must show:<ul><li>From the throw-back hour on, the bar and the panel say the landing was thrown back ("thrown back: sailing home", not "lands in about a day").</li><li>At the end, the bar, the panel and the ticker agree. Either "thrown back" with where they came ashore ("2 thrown back; came ashore near Catania"), or "broke off; came ashore away", but not one in the bar and the other in the ticker.</li><li>`landingRows` has a case that would have caught it.</li></ul> |
| Tanks (needs 8) | 8 | 8 | **Re-earned on a new seed.** C 24115, Germany against Poland, day 5: armoured divisions 40 and 42 are labelled at 250 m/px. At 15 m/px, live, their tank balls have treads and guns, with infantry balls and tracers among them (`critic/shots/c54c_24115_arm_15m_live_1.png`). The shots go down to 10 m/px (`_arm_0010m.png`), with the same element counts as run 51's 21115 (`critic/c54_c_24115.json`). No error. |
| Aircraft (needs 8) | 8 | 8 | **Re-earned on new seeds.** <ul><li>**W 24127:** a fighter ordered to strike toward Warsaw is followed. At 3,000 m/px it flies with its mark in 56 of 61 samples, is never shown without one, and stays a median 32 px from its sorties. At ×5 it has its mark in 61 of 61 (`critic/c54_w_24127.json`; run 51: 56/61, 60/61).</li><li>**PL 24125:** planes in hour 2, marked from 3,000 m/px (42 marks) to 25 m/px, in both looks (`critic/c54_pl_planes.24125_GER_POL_5354.log`).</li><li>**Air war is told:** on 24141 in year 12, "Italy and Philippines fought in the air this month" and "Soviet Union's air force struck United States this month: 6,331 men, guns and vehicles lost" (`critic/shots/c54lwhon_24141_y12_world.png`).</li><li>worldInvariants (air included): 0 broken.</li></ul> |
| AI nuclear use (needs 8) | 8 | 8 | **Rescored on HEAD's own 7019 year-20 save.** The game pauses on two AI strikes: China on the USA near Belfast (54,000 civilians), and China on Iceland near Höfn with a hydrogen bomb (8,000). Each has its alert, "Go to" and ticker row (`critic/c54_an_7019y20.json`, `critic/shots/c54an_7019y20_0_goto.png`). It is the same world as in runs 39–53 (the same hash), so this shows the rule still holds, not a new strength. |

## Blocking issues

1. **R54-B1 (naval, rules agree; UI): a thrown-back landing tells three stories, on 6 of 11 Rome → Valletta clicks.**
   - **The case** (page, unstaged, the player's own click; run 53's named Malta case on a seed run 53 also ran):
     `SHOTAT=162,168,174,180,186 node critic/scripts/c54_lhold.mjs 23105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200`.
     - **h162:** the ticker says "319: thrown back, sails home". The order news reads "Infantry division 319: the landing
       was thrown back; the transports sail home and land it there."
     - **h168–h180:** the bar reads "Valletta from Rome · at sea: lands in about a day". 319's panel reads "Status:
       At sea, bound for its landing", and two lines below, in the same panel, "the landing was thrown back; the
       transports sail home and land it there" (`critic/shots/c54lh_ita_malta_23105_h174_1500m.png`).
     - **h186:** the bar reads **"over: 2 thrown back"**. The ticker reads "319: landed away from its target" and
       "321: landed away from its target". 319's panel reads "Landed" and "its transports broke off; it came ashore
       away from its target". Both divisions are ashore near Catania, on Sicily: not home at Rome, and not at Valletta
       (`critic/shots/c54lh_ita_malta_23105_h186_1500m.png`).
   - **Not one seed's luck:** the same on new 24151, 24153, 24155, 24159 and 24171
     (`critic/c54_lland_ita_malta_241*.json`, each "thrownAt" h156–162, "over: 2 thrown back" at h180–186).
   - **What is judged** is the execution, not ADR-871's choice of words ("over: 2 thrown back" alone is what it
     chose). Three facts: (a) 18–24 h of "lands in about a day" after the throw-back news, on both builds; (b) one
     panel saying "At sea, bound for its landing" two lines above "the landing was thrown back"; (c) 321 is told
     "thrown back" only by the bar's count, never in the ticker or its panel.
   - **Why blocking:** it contradicts what the batch claims. ADR-871 says a thrown-back division "stays so" and the
     outcome "says it". ADR-866 counts "each division by where it ended". Here the throw-back is not in the row for
     the day it lasts, and the row's end contradicts the ticker beside it. That is the same class as run 52's
     R52-B1, on the commonest outcome of the critic's longest-standing landing case. On run 53's build the same seed
     ended in agreement ("broke off; 2 came ashore away from Valletta"). R52a's sticky `repulsed` turned it into a
     contradiction. `landingRows` (108 cases, 0 broken) and landingInvariants do not see it.
   - **What happens, from the traces:** the repulse (`LandingRepulsed`) names 319 and sends the group home
     (`sailHome`), but the landing stays `sailing`, so the row keeps its voyage hours. The group then breaks off and
     lands on the nearest own coast, and the worker posts `FormationLanded` "away" news for both, which the sticky
     `repulsed` (R52a) and R52d's "all aboard" now override in the bar only. 321 is never told "thrown back" in the
     ticker at all.
   - **Fix:** one account in all three places.
     - From the repulse, the row (and the panels of those aboard) says "thrown back: sailing home"; the landing
       leaves `sailing` or the row stops reading voyage hours.
     - At the end, say both facts in the bar ("2 thrown back; came ashore near Catania"), or let the break-off
       news name the throw-back. Post a "thrown back" row for each division R52d counts, not only the one the
       event names.
     - Add the Rome → Valletta case (23105 or 24151) to `landingRows`, with a check that the row, the panel and the
       last order news of each division agree.

## Non-blocking issues (prioritised)

1. **R54-N1 (code reading, not shown): `heldBy` searches any engaged formation at war, of any kind, at any distance.**
   `landings.ts` `heldBy` takes the nearest formation with `engaged === 1` whose nation is at war with the lander:
   a land division in a battle ashore counts as much as the fleet shooting at the transports. On every case I ran
   it named the right nation (United Kingdom, on 21105, 23105, 24105, 22107). With two foes at war, it can name the
   one whose army is fighting nearer the coast rather than the one whose fleet holds the transports. My AI-world probe
   (`critic/scripts/c54_heldby.ts`) found no landing to test: the AI's landings never enter `world.landings`. **Fix:**
   name the nation of a foe fleet in the same sea battle (`world.seaBattles`, as `c54_dest2.ts` reads it).
2. **Small:**
   - On 22105, day 2, two division lines drop their days (UI row).
   - History's first rows on 7019 repeat the Tangier begin/won pair three times in two days (Stats row).
   - On the phone, the nation panel's 16 "Build" buttons sit below the screen inside its scroll
     (`critic/c54_p.json`, `actions`: panel 139–1289 px of 844), as in earlier runs.
3. **Carried, unchanged (each re-checked this run):**
   - the run-26 scenario is refused;
   - the editor's nation list is flat;
   - Denmark is frozen (21099, 20899) and 24099's first three places never change;
   - year-one dogpiles (20887, 24129);
   - the unit zooms' frame rate on a late world (Performance row).

## Run 53's cases re-run

| Run 53 case | `5f8ef9e8` (run 53) | HEAD `8d7d02fe` | Evidence |
|---|---|---|---|
| **R53-N1** staged 20861 (`c53_repulse.ts`) | "over: 3 landed" beside two "thrown back" | **"over: 1 landed, 2 thrown back"** | `critic/c54_replay/c53_repulse_20861.json` |
| **R53-N1** staged 23071 | "over: 1 landed, 2 came ashore away from Bremerhaven" | **"over: 1 landed, 2 thrown back"** | `critic/c54_replay/c53_repulse_23071.json` |
| **R53-N1** unstaged 23081 (AI, 3 y) | 7 thrown back, 5 ashore within 1 h | the same (no AI rule changed) | `critic/c54_replay/REPORT.md` |
| **R53-N2** 20661 cancel at h26, h30 | "turning back to Tokyo" | **"turning back to Tokyo, Ōsaka: there in about a day"** | `critic/shots/c54tb_jap_cancel_20661_h30.png` |
| **R53-N2** 22101 day 3 (landscape) | "turning back to Tokyo" | **"turning back to Tokyo, Ōsaka"**; Hiroshima "cancelled: back at Hiroshima" | `critic/shots/c54lbar_jap_sh3_land_22101_844_d3.png` |
| **R53-N3** 21105 h60 | "under attack, held up", panel silent | **"under attack by United Kingdom, held up"**, the panel the same; the fight is real (0 / 32 ships lost) | `critic/shots/c54lh_ita_malta_21105_h60_250m.png`, `critic/c54_dest2_21105.json` |
| Small: 20861 h121–h130, one ashore | "at sea: lands in about a day" | **"1 of 3 ashore; at sea: …"**, then "2 of 3 ashore" | `critic/c54_lh_jap_sh3_20861.json` |
| Small: 22105 day 2 line without days | two lines | the same | `critic/c54_lbar_eng_br3_phone_22105_390.json` |
| 22103, 3517, 20861 (R52-B1, N2) | "never sailed"; "2 landed, 1 never sailed"; "3 landed" | the same | `critic/c54_lland_ger_norwich_22103.json`, `critic/shots/c54lost_desk_rows.png`, `critic/c54_lland_jap_sh3_20861.json` |
| 21105 Malta end | "broke off; 2 came ashore away from Valletta" | the same (no throw-back on this seed) | `critic/c54_lland_ita_malta_21105.json` |
| **23105** Malta end | "broke off; 2 came ashore away from Valletta" | **"2 thrown back"**, against the ticker (R54-B1) | `critic/c54_lland_ita_malta_23105.json` |
| 23109 England → Bremerhaven | "over: 3 landed" | the same, at h144 | `critic/c54_lland_eng_br3_23109.json` |
| 21151 Breakthrough row, History, CSV | "for Germany near Berlin" | the same | `critic/c54_kwh_21151.json` |
| 20879 Breakthrough at peace | refused | refused | `critic/c54_k_20879.json` |
| 21103 landscape box | Cancel and 4 lines on screen, topmost | the same | `critic/c54_lbox_eng_br4_21103_844x390.json` |
| Sea balls 20885 t107 | 24 / 22 / 16 | 24 / 22 / 16 | `critic/c54_sb_20885.json` |
| Relations 20887, 21129 at day 365 | dogpiles | the same | `critic/shots/c54rg_20887_desk_d365.png`, `critic/shots/c54rg_21129_desk_d365.png` |
| Run-26 scenario file | refused | refused | `critic/c54_os2_c54.json` |
| 21099, 20899 over 25 years | Denmark frozen (run 51, run 50) | the same worlds, the same hashes | `critic/c54_top_21099.txt`, `critic/c54_top_20899.txt` |
| Frame rate on 7019's year-20 save | 31–47 fps at the unit zooms (run 51) | see Performance | `critic/c54_pf_lookfps.log` |
| Run 53's 18 headless jobs + 11 new seeds (replay) | — | **15 the same, 3 differ, 0 failed.** The three that differ: seaBattles 23061 only in an echoed path (the same 61 battles), and the two staged repulses, by R52a/R52d as their ADRs say. All 11 new seeds exit 0, and every checker among them reads 0 broken | `critic/c54_replay/REPORT.md` |

**Checkers on fresh seeds (this run).** None reports a broken rule:
- diploInvariants 24001–24011 (6 runs): 0 broken;
- landingInvariants 24021–24033 (7): 0 broken;
- worldInvariants 24051, 24053, 24055 (ten years), 24057: 0 broken;
- workerDeterminism 24059: the same on every arm;
- `landingRows all`: 108 cases, 0 broken;
- seaBattles 24061: 76 battles.

## Design objections (none blocking, no score lowered)

- **ADR-759 / SPEC §7.1: a cancel hands the army to the AI at once.** On 20661 the row reads "cancelled: back at
  Tokyo, Ōsaka" at h48, while 365's panel already reads "At sea with the AI's landing (not one of yours)"
  (`critic/c54_tb_jap_cancel_20661.json`, h48–h60). The words are true, but the player's cancel is undone within a
  day. An option to keep a played nation's divisions where the player left them is still wanted.
- **ADR-864: the Breakthrough corridor is not drawn.** The row says where; the map still shows nothing of the
  10-day corridor that is the tool's whole effect.
- **ADR-873: no mark joins a held landing to its attacker.** The fight is real but 14–19 cells off, beyond what a
  player connects to the transports. A line or a ring on the transports while held would make "held up" visible.

## Ideas from other games (not scored)

- Hearts of Iron's naval invasion has one status line from start to end ("Invasion failed: forces returned to
  port"). The panel, the order and the log say the same.
- Europa Universalis' message log has a "my wars only" filter.

## Strengths (verified)

- **Run 53's three findings are fixed, each on its own case, without new checker failures.** 20661 and 22101 name
  every port turning back. 21105 names the United Kingdom, and the fight behind that name is real (0 British against
  32 Italian ships lost over 90 hours). The staged 23071 reads "1 landed, 2 thrown back".
- **Long runs are solid.** Two 12-year watches at Max held 59.9–60 fps with no frame over 500 ms and no page error.
  7019, 21099 and 20899 end on the same hashes as the runs that first made them, and save and load in the page gives
  the same hash twice.
