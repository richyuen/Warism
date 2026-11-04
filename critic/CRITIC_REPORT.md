# Critic report, run 33 (full) — after R20

- **Mode: full.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). The first condition of a focused run
  holds (run 32 has a blocking issue, R32-B1, and naval under its bar) and the third holds (runs 30–32: focused, full,
  full). The second fails: the one commit since run 32's report, `937fd085` (R20), changes `src/`, and R20 was not filed
  by the report's commit — `git show --stat 88fb814e` touches `PROGRESS.md` and `critic/` only; the ROADMAP line R20 was
  added by `937fd085` itself. So every dimension is scored afresh; none carried.
- **Commit judged:** `937fd085bdbfddde489ad489c7e688d93b7dbc42` (HEAD at the start, `critic/c33_commit.txt`).
  **Date:** 2026-11-04.
- **What changed since run 32** (`git diff --stat e7437a57 HEAD -- src`: 6 files): a player's order over the sea onto the
  ground of a nation outside its wars is refused (`RejectReason.Neutral`, 15); the day start's march home emits
  `FormationSentHome` (71) and a formation of the player's so moved gets a row below the ticker (ADR-826).
- **Build:** `vite build --outDir critic/c33_dist`, exit 0 (`critic/c33_build.log`), served by `vite preview` on
  127.0.0.1:**5299**. Chromium through Playwright, headless; desk 1600 × 900, phone 390 × 844 (touch, DPR 2).
- **Baseline:** run 32's own files (`critic/c32_*`, commit `e7437a57`). R20 says "pin unmoved". **Verified:** all 15
  headless 20-year runs of run 32's seeds (`c31_ho.ts`, ten seeds heroes off, five heroes on) are identical to run 32's
  JSON to the last hash once wall times are stripped; the year-20 save of 7019 made on HEAD is byte-identical to run 32's
  (`cmp critic/c33_seed7019_y20.bin critic/c32_seed7019_y20.bin`); workerDeterminism 3517 gives `7e113d94` on all four
  arms, as in run 32 (`critic/c33_wd_3517.log`). So every seeded world without a player's sea order is run 32's world,
  and every page case of run 32 can be compared one to one. Of the 55 `c33_` JSONs with a `c32_` twin, 39 are identical
  once shots and timings are stripped; of the other 16, nine differ only in live samples taken on the page's own clock
  (a tick or a sortie count at a sample, a title-screen random seed, boot time, frame rates; `critic/c33_twindiff.log`,
  `critic/scripts/c33_twins.cjs`, `critic/c33_twins.log`), and seven are: the landing cases R20 changes (LH, LP Calais) or
  stops earlier (LP Shanghai, 25 days not 40), the probes' wall-clock waits (G and OS2 time out the same way, their
  error logs differ; DF samples a day earlier), and the headless 7019 run, whose counts differ only by the new event
  `FormationSentHome` (its save is byte-identical).
- **Runs:** 34 headless jobs six at a time (`critic/scripts/c33_jobs1.txt`, `critic/c33_jobs.log`, every one exit 0);
  page suites A, B, C (`critic/scripts/c33_suite{A,B,C}.sh`, every probe exit 0); the landing cases in the page
  (`critic/scripts/c33_lpq.sh`); new probes: `c33_nr_neutralrow.mjs` (a refused landing by real clicks, desk and
  phone), `c33_shm_mass.mjs` (rows for divisions sent home), `c33_pm.ts` (a peace made while a sea or land order is on
  its way), `c33_ps.ts` (a refusal's reason at a bombed port), `c33_lmchk.ts` (the land rule at peace); a 30-year run of
  new seed 9419; a quiet ten-year page watch (6151) with nothing else running.

## Verdict

**R32-B1 is fixed as specified.** A player's landing on the coast of a nation outside its wars is now refused at the
click, with a reason, on every case of run 32 (Britain → Calais, Britain → Bergen, the USA → Calais), while the same
order at war goes (Britain at war with France lands at Calais in the page; Japan lands at Shanghai), and a division set
home across the sea is told by a row. **No blocking issue.**

**Naval warfare stays at 7, under its bar of 8**, now for the edges of the same feature rather than one defect:
an order given at war is carried out after the peace — a division still ashore at the peace boards 17 days later, sails
15 days to the former enemy's coast, lands there and is set home across the sea the next day — where the land march, in
the same situation, stops at the border with "the way ahead became the ground of a nation outside its wars" (R33-N1);
a refusal at a bombed-shut port says "it stands at no port of its nation" to a division standing in Portsmouth (R33-N2);
one click's divisions still land 16 days apart (R32-N1); and the refusal R20 adds is readable only as a row cut at
"it would land on t…", under a tooltip that had just promised "Your selected forces go by sea" (R33-N3). Every other
dimension holds at its bar; none rises.

## Scores

| Dimension | Run 32 | Run 33 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | rescored on the same world: R18's blocks clear at 60 m/px on 1212 and new seed 8123 (`critic/c33_sk_8123.json`); hero labels at world zoom still sit over unrelated land (`critic/shots/c33lwhon_3517_y10_world.png`: "Sovetsky Soyuz" over the Sahara, "TOG II" over Arabia). Not 8: R31-N1 unchanged (`critic/c33_hf_5521_desk_d0_0.json`: 2 of 12 counters under the Ranking panel) |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | rescored: diploInvariants 0 broken on five new seeds (8123 heroes, 8431 random diplomacy, 8807 random world, 8573, 8999 heroes); worldInvariants 0 broken (8123 heroes 20 y, 8431 random 20 y, 8807 random world 5 y, 8233 heroes+navy 20 y, 9311 random air 20 y, 8677 bankrupt 20 y); heroWaits 8125 0 broken. FW2 2207 and BT 5113 phone identical to run 32. Not 8: run 30's list (bond exit, guarantees, refused peace untold) untouched; the land and sea orders still disagree after a peace (R33-N1, counted under naval) |
| Emergent world dynamics over long runs | 7 | 7 | rescored: the same world as run 32 (15 of 15 `ho` runs identical), so its figures stand; new seed 9419 over 30 years: 98 → 92 nations (16 of those alive at year 30 founded during the run), the lead passing from the Soviet Union (31.7 % at year 5) to the United States (26.6 % at year 30), 18 nuclear bursts by four powers in seven years (`critic/c33_headless_9419.json`). Not 8: no default in AI play (0 on new seed 8123 × 20 y, `critic/c33_def_8123.json`), sea heroes die every few months (R32-N5, unchanged by construction) |
| God Mode | 7 | 7 | rescored: Q tools on new seed 8807 (revolt, spawn nation, city, raze) and A (God's nuke) on 8999 run as on run 32's seeds; K, K2, K3 identical; traits on the phone identical. Not 8: a trait's effect still shown nowhere (R32-N2) |
| Editor and scenarios | 7 | 7 | rescored: G 4877 places fleets, the bomb budget and wings as in run 32; the probe's 900 s wait times out as in runs 29–32 (wall-clock probe; its marks differ from run 32's because the page runs on its own clock, not because the build changed). Old scenario still refused (design objection, run 32) |
| Stats and history | 7 | 7 | rescored: History of 7019's year-20 save: 3,714 events, opens in 134 ms, 29 kinds; CSV whole. Not 8: a jump home across the sea leaves no History row (`critic/c33_shm_ten.json`: "3 of 3 events" after ten divisions were set home; no kind for it) |
| UI/UX and polish | 7 | 7 | rescored: R33-N3 (below): a refused order closes the formation panel on a real click, so R20's reason is read only in a row cut at 272 px (`critic/shots/c33nr_eng_calais_desk_click.png`), and the row's click dismisses it without opening the panel (`..._row.png`); the tooltip promises the voyage (`..._hover.png`). U, P, RG, HS and the phone cases identical to run 32. Not 8: R31-N6 (graph's first tap after a drag, `critic/c33_rgt_4111.json`) and R32-N3 unchanged |
| Performance | 7 | 7 | rescored: quiet ten-year watch of 6151 with nothing else running, 59.9–60 fps every year, longest gap 83 ms, 293 s for ten years, no page error (run 32: the same fps, 83 ms, 290 s; `critic/c33_lw_6151.json`, `critic/c32_lwquiet_6151.json`); the watch of 3517 with heroes, beside nothing heavier than one 30-year headless run: 59.9–60 fps every year, longest gap 83 ms, 302 s for ten years (run 32, beside six sims: 59.8–60 fps, 117 ms, 420 s; `critic/c33_lwhon_3517.json`); PF on 7019's year-20 save: 60 fps at 3,000, 1,200 and 600 m/px, 35–48 fps at 120 and 30 m/px (run 32: 25–41), p95 frame ≤ 18.4 ms throughout (`critic/c33_pf_7019.json`). Not 8: no phone-class device measured |
| Stability | 7 | 7 | rescored: no page error in any probe (suites A–C, landing cases, new probes); 34 headless jobs, none crashed; determinism above (save byte-identical, worker four arms equal, a save at the first hour aboard reloads to the same hash `1306977546`, `critic/c33_lh_3517.json`) |
| Semantic zoom to unit level (needs 8) | 8 | 8 | rescored: Z on new seed 8123 (elements from 1,573 m/px, men from 28 m/px, `critic/c33_z_8123.json`), PHZ on a phone on new seed 8233 (six tiers 30,000 → 25 m/px, no horizontal overflow, a tap at 25 m/px opens the division in contact, `critic/c33_phz_8233.json`), Z 3517 and PHZ 2671 identical to run 32 |
| Naval warfare (needs 8) | 7 | **7** | R32-B1 fixed (Calais: run 32 `critic/c32_lh_3517.json` landed t74, at London t98 → run 33 `critic/c33_lh_3517.json` refused `Neutral` at t2; Bergen and USA → Calais refused the same, `critic/c33_lh2_eng_bergen2.log`, `critic/c33_lh2_usa_calais.log`); at war a landing goes (`critic/c33_lp_eng_calais_war.json` landed h66, `critic/c33_lp_jap_shanghai.json`); navy and heroes rules 0 broken over 20 years on new seed 8233. **Not 8**: R33-N1, R33-N2, R33-N3, R32-N1 (below) |
| Tanks (needs 8) | 8 | 8 | rescored: C on new seed 8573, German armoured divisions in contact with the Poles at 15 m/px, every tank drawn, live frames (`critic/shots/c33c_8573_arm_15m_live_1.png`); C 6421 and 7019 identical |
| Aircraft (needs 8) | 8 | 8 | rescored: W on 7019 and new seed 8431 (the fighter followed, marks on 56 and 57 of 62 samples, none missing a mark while flying); air rules 0 broken over 20 years on new seed 9311 (random diplomacy, heroes) |
| AI nuclear use (needs 8) | 8 | 8 | rescored: on 7019's year-20 save the same two strikes as run 32 ("China struck United States with an atomic bomb near Belfast: 54,000 civilians killed", then a hydrogen bomb on Iceland), each alerted with Go to; on 6299's year-18 save two strikes on British India (`critic/shots/c33an_6299y18c32_0_goto.png`); new seed 9419: 18 bursts by four powers in 30 years. A readability note: the second 6299 alert reads "near Larkana: 0 civilians killed; 10,212 men and 32 guns lost" |

## R20, case by case

| Case | Result | Evidence |
|---|---|---|
| LH (headless, run 32's case), 3517, Britain played, three divisions by London to Calais, one to Belfast | the three refused `MoveRejected 15` (Neutral) at t2; Belfast sails and lands at t59 and is not sent home | `critic/c33_lh_3517.json` |
| LH2, Britain to Bergen (run 32's cell 1054.5, 203.5) | refused 15 at t2 (run 32: landed t135, jumped to London t193) | `critic/c33_lh2_eng_bergen2.log`, `critic/c32_lh2_eng_bergen.log` |
| LH2, USA to Calais | refused 15 at t2 (run 32: 17 days at sea, landed t730, at the US spawn t745) | `critic/c33_lh2_usa_calais.log` |
| LH2, Netherlands to Java (its own colony, no transports) | refused 6 (NoTransports) as in run 32: `Neutral` does not shadow its own ground | `critic/c33_lh2_ned_java.log` |
| LP (page, probe's API selection), Britain to Calais at peace; the USA to Calais | no voyage; the row "Infantry division 274: not done: it would land on t…" | `critic/shots/c33lp_eng_calais_click.png` |
| LP, Britain at war with France (God's war) to Calais | the first division boards at Portsmouth, lands at Calais h66 and fights there (destroyed by h210); the other two follow and are ashore by h210; the war goes on (Italy joins) | `critic/c33_lp_eng_calais_war.json`, `critic/shots/c33lp_eng_calais_war_h66.png` |
| LP, Japan to Shanghai (at war) | lands h123 and h510 (one click, two landings 16 days apart: R32-N1 unchanged) | `critic/c33_lp_jap_shanghai.json` |
| NR desk (real clicks), Britain, division 274 to Calais | before the click the tooltip says "France / Your selected forces go by sea: they board transports at a port"; after it the formation panel is gone (the nation panel stands in its place), the row is cut; a click on the row flies to the division and removes the row, no panel opens | `critic/shots/c33nr_eng_calais_desk_hover.png`, `..._click.png`, `..._row.png`, `critic/c33_nr_eng_calais_desk.json` |
| NR desk, the land refusal for comparison (Sweden to Copenhagen) | the same panel-closing and cut row ("…no way by land that keeps off the ground of nations outside its wars"): older behaviour, shared | `critic/c33_nr_swe_cph_desk.json` |
| NR desk, an accepted landing for comparison (Japan to Shanghai) | the panel stays open | `critic/c33_nr_jap_shanghai_desk.json` |
| NR phone (selection by the API: a tap on the counter selected nothing) | the row nearly whole at 376 px, cut at "outside its w…"; the panel closed | `critic/shots/c33nr_eng_calais_phone_click.png` |
| SHM, ten British divisions put on France's ground by God (as the spec does with one), a day start | all ten at London ("99.9k" stack, army 230,840 → 330,750); **one** row shown beside the open panel (by design: "beside a panel the last only"), cut; a click on it shows the next (division 1476); the hud keeps four (`src/app/hud.ts` 24, `ORDER_NEWS_KEPT = 4`), so by that constant six of ten are never told; History "3 of 3 events", none of them the jump | `critic/c33_shm_ten.json`, `critic/shots/c33shm_ten_after.png`, `critic/shots/c33shm_ten_history.png` |
| PM, Japan → Shanghai, God's peace 12 h after the first boarded (t14) | the one at sea lands on China's ground t123; the other, still ashore at the peace, boards at t430 and lands on China's ground at t510; no `FormationSentHome` in 25 days; both then walk north-west over China's ground (whether as the march home or by Japan's AI: not traced) | `critic/c33_pm_jap_sea.json` |
| PM, Japan at war with the Netherlands → Java, peace at t15 | the one at sea lands t407, sent home t457 (decided, ADR-826); **the other boards at t431, 17 days after the peace, lands on Java t781 and is set home across the sea at t817** | `critic/c33_pm_japned_sea.json` |
| PM, the same with peace 24 h after a landing | the landed division set home at the next day start (decided, ADR-169/826) | `critic/c33_pm_japned_landed.json` |
| PM land, Germany at war with France, two divisions ordered to Reims, peace at t20 | they march to the border and are stopped there: `MoveRejected 4` (Barred, "the way ahead became the ground of a nation outside its wars") at t143 and t167 | `critic/c33_pm_gerfra_land.json` |
| PM land, Germany → Warsaw, peace at t30 | marches on into Poland only after Poland joins Germany's alliance and fights beside it (`foreignTo` false from t156) | `critic/c33_lmchk.log` |
| PS, Britain at war with France, the three for Calais (headless) | each marches 2–4 days to Portsmouth under French air strikes and is refused 5, "it stands at no port of its nation", at Portsmouth: the port's damage is 0.63–0.9, `portShut` true | `critic/c33_ps.log`, `critic/c33_pm_eng_sea.json` |

## Run 32's cases re-run

Since the pin did not move (above), every case of run 32 that gives no sea order is the same world; each was re-run on
HEAD anyway and compared to its run-32 JSON.

| Run 32 case | On HEAD (`937fd085`) | Evidence |
|---|---|---|
| R32-B1 (LP / LH / LH2 Calais, Bergen, USA) | **Fixed**: refused `Neutral` at the click; at war it goes (table above) | `critic/c33_lh_3517.json`, `critic/c33_lh2_*.log`, `critic/c33_lp_*.json` |
| R32-N1 (one click's divisions land apart) | **Unchanged**: Japan's two land h123 and h510 | `critic/c33_lp_jap_shanghai.json` |
| R32-N2 (trait descriptions hover-only) | **Unchanged** (TR phone identical) | `critic/c33_tr_phone.json` |
| R32-N3 (refusal toasts cut) | **Unchanged**, and now carries R20's own reason (R33-N3) | `critic/shots/c33nr_eng_calais_desk_click.png` |
| R32-N4: R31-N1 (Japan's heroes under the Ranking panel, HF 5521 desk) | **Unchanged**: the same 2 of 12 counters unreached | `critic/c33_hf_5521_desk_d0_0.json` |
| R32-N4: HF 7019 d730 desk, HF/HFT phone 5521, HT phone | identical to run 32 | `critic/c33_hf_7019_desk_d730_0.json`, `critic/c33_hf_5521_phone_d0_0.json`, `critic/c33_hft_5521.json`, `critic/c33_ht_phone.json` |
| R32-N4: RGT (graph's first tap after a drag) | **Unchanged**: tap 1 opens nothing, tap 2 opens Syria | `critic/c33_rgt_4111.json` |
| R32-N4: HS 3739, HS 3517 (a hero hides the fleets under it) | **Unchanged** | `critic/c33_hs_3739.json`, `critic/c33_hs_3517.json` |
| R32-N4: no default in AI play; DF 7019 Poland −800 | **Unchanged**: 0 defaults on new seed 8123 × 20 y; DF the same course (Lithuania taken day 55) | `critic/c33_def_8123.json`, `critic/c33_df_7019_pol.json` |
| R32-N5 (sea heroes die more) | **Unchanged** (the five heroes-on runs identical) | `critic/c33_ho_on_*.json` |
| HO, ten seeds × 20 years off, five on | identical to run 32 | `critic/c33_ho_*.json` |
| HWP 4637 (Richelieu "returns in 21 days") | identical | `critic/c33_hwp_4637_fra.json` |
| A 4219, Q 6421, K/K2/K3 2203, Z 3517, C 6421/7019, PHZ 2671 | identical | `critic/c33_a_4219.json` … `critic/c33_phz_2671.json` |
| AN 7019 year 20 | the same two strikes, alerted | `critic/c33_an_7019y20.json` |
| AN 6299 year 18 | run 32's probe met none, but it started on 30 December 1947 (`startDate`) from the file named `_y18` (cause not traced). On HEAD the same file starts 28 December 1955 and meets two strikes on British India within 400 days, each alerted. Same world: not a change of the build | `critic/c32_an_6299y18.json`, `critic/c33_an_6299y18c32.json` |
| HI / DL / PF on 7019 year 20 | 3,714 events, 134 ms; CSV whole; 60 fps | `critic/c33_hi_7019_c32save.json`, `critic/c33_pf_7019.json` |
| SK 1212 (R18's blocks) | identical; new seed 8123 the same (closest pairs 0.14 cells, separate blocks) | `critic/c33_sk_1212.json`, `critic/c33_sk_8123.json` |
| G 4877, OS2 (run 25's scenario) | as run 32 (G's wall-clock wait times out; the old scenario is refused) | `critic/c33_g_4877.json`, `critic/c33_os2_c25.json` |
| SB, PL, P, U, RG, BT, FW2, TR, W 7019 | identical | `critic/c33_sb_7019.json`, `critic/c33_p.json`, `critic/c33_u_1600_5557.json`, `critic/c33_rg_4111_desk.json`, `critic/c33_bt_5113_phone.json`, `critic/c33_fw2_2207.json`, `critic/c33_w_7019.json` |
| LW with heroes (3517, ten years) | 59.9–60 fps, longest gap 83 ms (run 32: 117 ms with six sims beside it) | `critic/c33_lwhon_3517.json` |

## Blocking issues

None.

## Non-blocking issues (prioritised)

1. **R33-N1. An order over the sea given at war is carried out after the peace; the land march is stopped.** Japan at
   war with the Netherlands orders two divisions to Java; God makes peace at t15, when one is at sea. That one landing and
   being set home is ADR-826's decided case. The other, still ashore at the peace, **boards at t431 — 17 days after the
   peace — sails 15 days, lands on Dutch Java at t781, and is set home across the sea at t817** (`FormationSentHome`,
   jump (1631.5, 632.5) → (1819, 385.3); `critic/c33_pm_japned_sea.json`). Japan → Shanghai the same: one boards at t430
   and lands on China's ground at t510 after a peace at t14 (`critic/c33_pm_jap_sea.json`). In the same situation by
   land, Germany's divisions ordered to Reims at war with France are stopped at the border after the peace,
   `MoveRejected 4`, "the way ahead became the ground of a nation outside its wars" (`critic/c33_pm_gerfra_land.json`).
   R20's commit says the sea order is refused "as a march by land there is"; after a peace it is not. ADR-826 decides
   only "a peace made while a convoy is at sea". **Fix:** re-check the landing's holder at boarding (and while the
   division walks to its port), as the march re-checks its way, and cancel with `Neutral` told.
2. **R33-N2. A refusal at a port bombed shut gives the wrong reason.** Britain at war with France: three divisions for
   Calais march 2–4 days to Portsmouth under French air strikes and are each refused with reason 5, "it stands at no port
   of its nation", standing at Portsmouth — Britain's port, its damage 0.63 → 0.9, `portShut` true (`critic/c33_ps.log`,
   `critic/scripts/c33_ps.ts`). The order was accepted at the click; the player learns days later something untrue.
   **Fix:** a reason of its own ("its port is bombed shut"), or send the division on to the next open port.
3. **R33-N3. R20's refusal is readable only as a cut row, under a tooltip that promised the voyage.** Hovering Calais with
   a British division selected says "Your selected forces go by sea: they board transports at a port"; the click is
   refused, the formation panel closes (the nation panel takes its place), and the reason is a row cut at "it would land
   on t…" at 272 px, whose title is "Show the formation"; clicking it removes it without opening the panel
   (`critic/shots/c33nr_eng_calais_desk_hover.png`, `..._click.png`, `..._row.png`). The spec (`landingNeutral1938.spec.ts`)
   asserts the panel's notice after `player.click`; a real click on the same cell closed the panel in both probes (sea
   and land). The land refusal behaves the same (R32-N3). **Fix:**
   keep the formation panel open on a refusal with the reason in it; let the by-sea line of the tooltip say when the
   landing is a neutral's ground.
4. **R33-N4. Ten divisions set home at once are told by one row; six are never told; History has none.** (`critic/c33_shm_ten.json`)
   With a panel open the ticker shows the last order row only; by `ORDER_NEWS_KEPT = 4` (`src/app/hud.ts` 24) the hud keeps four. The new seed 9419 sets AI
   divisions home across the sea 255 times in 30 years (`critic/c33_headless_9419.json`, `ev.FormationSentHome`), none
   of which reaches the player or History.
5. **R32-N1** (one click, two landings 16 days apart), **R32-N2**, **R31-N1**, **R31-N6**, **R31-N3/no default in AI play**,
   **R32-N5** — unchanged, by construction (same world) and by re-run (table above).

## Design objections (none blocking, no score lowered)

- An ally's coast is refused with "a nation outside its wars": Britain cannot land in France while the Anglo-French
  Entente lists France under ALLIES in the same screen (`critic/shots/c33nr_eng_calais_desk_click.png`). The rule is
  the land march's (`foreignTo` ignores alliances at peace); the wording reads wrong for an ally.
- ADR-826 keeps the jump home across the sea. On new seed 9419 the AI's divisions are set home that way 255 times in
  30 years (up to 32 a year); a watcher sees them vanish from foreign ground and appear at a capital.
- Run 32's objections stand (save format 2 refuses older scenario files).

## Ideas from other games (not scored)

- Hearts of Iron's naval invasion plan shows, before execution, whether the target coast is reachable and why not; an
  order line drawn red with the reason on hover would replace the promise-then-refusal of R33-N3.
- Europa Universalis cancels an army's move when the war that allowed it ends and leaves it where it stands, with a
  message; a cancelled embarkation (R33-N1) would read the same way.

## Notes

- Quiet ten-year watch: `critic/c33_lw_6151.json` (log `critic/c33_lwquiet.log`), run after every queue and suite had ended.
- The phone NR case's tap on the division's counter selected nothing (`critic/c33_nr_eng_calais_phone.json`,
  `panelOpen: false`); the probe then selected by the API. Not filed: the probe's screen point is computed for DPR 1.
- `c33_lp_eng_bergen.json` hovered water (its cell is not Bergen's land); the headless case at run 32's cell is used.
- `c33_ps.ts` and `c33_pm.ts` give the player's orders through `sim.command` with `nation` and `escort`, as the page does.

## Strengths, verified

- **The fix is exact and leaves the rest alone:** the three run-32 cases are refused at the click with their own reason,
  the at-war landings still go, a colony's own refusal reason is unchanged, and fifteen 20-year worlds, a year-20 save
  and the worker's four arms are bit-identical to run 32 (`critic/c33_ho_*.json`, `critic/c33_seed7019_y20.bin`,
  `critic/c33_wd_3517.log`).
- **The rules agree where the checkers look:** 0 broken on five new diploInvariants seeds and six new worldInvariants
  runs of up to 20 years (random diplomacy, random world, bankrupt nations, heroes and navy, air), and heroWaits 8125.
