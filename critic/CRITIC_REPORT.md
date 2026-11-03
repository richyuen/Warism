# Critic report, run 27 (focused)

- **Mode: focused.** Decided from git before anything else (CRITIC_PROMPT, ADR-804): run 26 had a blocking issue
  (R26-B1) and a score under its bar (diplomacy 6); every commit since run 26's `33c84306` is either a PLAN task that run
  26's commit filed (`675408e7` "Critic run 26 ...; PLAN 7.191, 7.192" → `223cfcdf` PLAN 7.191, `60d1ef05` PLAN 7.192)
  or changes nothing under `src/`, `data/`, `public/` (`89170c03` ADR-803, `15b7b08b` ADR-804); run 26's JSON has no
  `mode`, so it counts as full. Scored afresh: **Diplomacy** (under bar, blocking), and what the diff touches:
  `war.ts`, `puppets.ts`, `alliances.ts` (Emergent dynamics, Stability, God Mode), `standing.ts`, `NationMenu.tsx`,
  `ActionsTab.tsx`, `App.tsx`, `en.json` (UI/UX), `history.ts`, `sound.ts` (Stats and history). **Carried** from run 26:
  Map visuals, Editor, Performance, Semantic zoom, Naval, Tanks, Aircraft, AI nukes. A clean focused run is to be
  followed by a full run (the DONE CONDITION needs a full run with no blocking issue).
- **Commit:** `15b7b08b127551faeb7b503fdc9ee0b4a1fd9e78` (HEAD at the start, `critic/c27_commit.txt`).
- **Date:** 2026-11-02.
- **Build:** `vite build --outDir critic/c27_dist`, exit 0 (`critic/c27_build.log`), served by `vite preview` on
  127.0.0.1:**5299**; run 26's build (`critic/c26_dist`, `33c84306`) on **5298** for before/after. Run 26's commit in
  `critic/wt` for the headless before/after (junction removed before `git worktree remove`). Chromium through
  Playwright, headless, 1400 × 800 / 1600 × 900; 390 × 844 for the phone probe.
- Every path below was made in this run (`c27`) unless it names `c26`. Scripts: `critic/scripts/c27_*` (run 26's
  re-run probes copied with the ports and labels changed; new: `c27_bx.ts`, `c27_or.ts`, `c27_or1.ts`, `c27_or2.ts`,
  `c27_rj.ts`, `c27_al.ts`, `c27_rv.mjs`, `c27_ppr.mjs`). JSON comparison of every re-run probe: `critic/c27_cmp.txt`.

## Verdict

**R26-B1 is fixed, cleanly, and R25-B1 stays closed.** A puppet's Force war on its overlord, an ally's on its ally and a
puppet's revolt now go through: Manchukuo and Albania leave their overlords' wars (`WarLeft` rows), break the bond and
declare, headless and in the page; God's revolt makes "Manchukuo rose against Japan" and a war of independence; refusals
for `Beside` fall from 52–78 % of puppet / ally days to **0 on all 4 seeds**. Poland's war on France (no bond) is still
refused 3 of 3 in the page and 3 of 3 headless, and the AI world is **bit-identical** to run 26's (7019 × 20 years: 20 of
20 yearly hashes equal; 4 seeds × 365 days identical). Run 26's non-blocking 1–3 (ticker, the bond hidden by "Fights
beside you", "Propose alliance" live where refused) are fixed and visible. Diplomacy goes back to **7**.

What the new door opened, found by trying **all 1,602 bonded Force wars** on 4 seeds × 3 days: 1,592 clean wars, 9
legitimate `Overrun` refusals, and **one** that leaves a nation on both sides of the Soviet Union's wars for 60+ days
(non-blocking 2; the builder's own ADR-803 checker, sampling 6 a kind, reports 0 broken on the same seed and days). And
the exit sets no truce: an hour after Germany's Force war on Italy took it out of the Polish war with every cell back,
its declaration on Poland is accepted, from a clean border (non-blocking 1). No
blocking issue in this focused run.

## Scores

| Dimension | Run 26 | Run 27 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | carried |
| Diplomacy, war, alliance, puppet, revolt depth | 6 | **7** | rescored |
| Emergent world dynamics over long runs | 7 | 7 | rescored |
| God Mode | 7 | 7 | rescored |
| Editor and scenarios | 7 | 7 | carried |
| Stats and history | 7 | 7 | rescored |
| UI/UX and polish | 7 | 7 | rescored |
| Performance | 7 | 7 | carried |
| Stability | 7 | 7 | rescored |
| Semantic zoom to unit level (needs 8) | 8 | 8 | carried |
| Naval warfare (needs 8) | 8 | 8 | carried |
| Tanks (needs 8) | 8 | 8 | carried |
| Aircraft (needs 8) | 8 | 8 | carried |
| AI nuclear use (needs 8) | 8 | 8 | carried |

**One score moves: Diplomacy 6 → 7**, because R26-B1's cases now pass on the same seeds and days where they failed on
run 26's build (table below), with run 26's non-blocking 1–3 fixed and R25-B1 still closed. Not 8: nothing here shows
diplomacy deeper than AoC's; guarantees still only shrink (non-blocking 5) and the bond's exit resets a front with no
truce (non-blocking 1).

## Run 26's cases re-run

| Run 26 case | On HEAD | Evidence |
|---|---|---|
| **R26-B1, PR: Manchukuo / Albania Force war on the overlord (7019, day 30), headless, both commits** | **Fixed.** HEAD: `WarLeft MAN CHI`, `WarLeft MAN REP`, `WarLeft MAN LIT`, `PuppetReleased`, `BondsBroken`, `WarDeclared MAN JAP`; free, at war with Japan. Albania the same (left the Spanish Republic's and Lithuania's wars, declared on Italy). Run 26's commit, same run: `WarRejected`, still a puppet. | `critic/c27_pr_head_7019_{MAN,ALB}.json` against `critic/c27_pr_c26_7019_{MAN,ALB}.json` |
| **R26-B1, PR: God's revolt (loyalty 0, autonomy 60)** | **Fixed.** `PuppetRevolt MAN JAP`, three `WarLeft`, `WarDeclared MAN JAP`: a war of independence against Japan and Mengjiang. Run 26's commit: `PuppetRevolt` then `WarRejected`, the rebel free and still fighting beside Japan. | same files, `revolt` |
| **R26-B1, PZ: how often a puppet's / ally's Force war is refused for Beside, 4 seeds × 365 days** | **Fixed: 0 of 16,320 / 14,658 / 15,686 / 15,118 puppet-days and 0 of 10,153 / 10,623 / 9,588 / 7,786 allied-pair days** (run 26: 73 / 78 / 59 / 76 % and 66 / 65 / 54 / 52 %). What is left is `Subject` (the bond `forceWar` breaks) and `Truce`. | `critic/c27_pz_{7019,2207,5113,9241}.json` against `critic/c26_pz_*.json` |
| **R26-B1, PP in the page: playing Manchukuo, both builds** | **Fixed.** HEAD: Japan's menu "Your overlord · fights beside you", **Force war** live, Propose alliance greyed; after it: "Manchukuo left its war with China / Spanish Republic / Lithuania", "broke its puppet bond with Japan", "declared war on Japan"; Japan "At war / Offer peace". Run 26's build (5298), same day: "Fights beside you", "Declare war" greyed. Albania on Italy: the same on HEAD. | `critic/shots/c27pp_head_7019_MAN_menu_before.png`, `critic/shots/c27pp_head_7019_MAN_menu_after.png`, `critic/shots/c27pp_c26_7019_MAN_menu_before.png`, `critic/c27_pp_head_7019_ALB.json` |
| **R26-B1, FW2 (2207): Albania's war on Italy** | **Fixed.** Italy "Your overlord · fights beside you", "Force war" (run 26: greyed, the probe's `fatal`). Both cases now run. | `critic/c27_fw2_2207.json` against `critic/c26_fw2_2207.json`, `critic/shots/c27fw_2207_B_menu.png` |
| **R25-B1, EXIT (Poland on France, day 45, 3 seeds) and ES2 in the page** | **Still closed.** EXIT identical to run 26 (refused, Poland in its war, the hold unchanged); ES2 3 of 3: France "Fights beside you", "Declare war" greyed with the reason as its title. | `critic/c27_exit_head_{7019,2531,8467}.json` (identical), `critic/shots/c27es2_head_7019_d10_framenu.png` |
| **COBEL: Germany Force-wars its ally Italy at day 61, both at war with Poland** | **Now allowed, as R26-B1's fix asked:** `WarLeft GER POL`, `WarDeclared GER ITA`; Germany out of the Polish war, every held cell back both ways (Poland's 250 German, Germany's 133 Polish). Run 26: refused. See non-blocking 1. | `critic/c27_cobel_head_GER_ITA_POL.json` against `critic/c26_cobel_head_GER_ITA_POL.json` |
| **ES (playing Germany, Force war on Italy at day 61)** | Italy's menu "**Allied · fights beside you**" (run 26: "Fights beside you"); after it the ticker reads "Germany left its war with Poland", "broke its alliance with Italy", "declared war on Italy"; Poland "Neutral", its land unhatched. | `critic/shots/c27es_head_7019_d61_itamenu.png`, `critic/shots/c27es_head_7019_d61_polmenu_after.png` |
| **Non-blocking 1: the ticker tells neither a war left nor a revolt** | **Fixed.** Watching 7019, God's revolt of Manchukuo: "1 February 1938 Manchukuo rose against Japan", three "left its war with …", "declared war on Japan" in the ticker. | `critic/shots/c27rv_head_7019_MAN_watch_ticker.png`, `critic/c27_rv_head_7019_MAN_watch.json` |
| **Non-blocking 2: "Fights beside you" hides the bond** | **Fixed.** "Your overlord · fights beside you", "Allied · fights beside you". | shots above |
| **Non-blocking 3: "Propose alliance" live to one's overlord or a partner** | **Fixed, nearly everywhere.** Greyed to Japan from Manchukuo, to France from Poland. Against the sim's own verdict on 7019 (≈1,450 sampled pairs a day, days 30 and 120): 996 + 1,016 greyed and refused, 452 + 438 live and accepted, **0** greyed but acceptable, **2** live but refused (non-blocking 3). | `critic/c27_al_7019.json` |
| **Non-blocking 4: guarantees only the start's** | **Unchanged.** BS identical to run 26 on 4 seeds; 7019 ends the year with 4 (FRA>POL, ENG>POR, ENG>IRQ, SOV>CHI). | `critic/c27_bs_head_7019.json` |
| **BS: the AI's year one, 4 seeds × 365 days, both commits** | **Identical**: every count, row, daily hash and guarantee on 7019, 2531, 8467, 3739. The AI never calls `forceWar` (`src/sim/tick.ts:260` is its only caller, a command). | `critic/c27_bs_head_*.json` against `critic/c27_bs_c26_*.json` |
| **BOTH: war-list integrity in AI play, 3 seeds × 730 days** | 0 findings on 5113, 6151, 9241, identical to run 26. | `critic/c27_both_head_{5113,6151,9241}.json` |
| **World dynamics, 7019 × 20 headless** | **Bit-identical to run 26: 20 of 20 yearly hashes equal**; 176 war-years, 197 sea battles, 9 bursts, 83 living at y20; no AI puppet revolt in 20 years (so the new revolt path is not reached by the AI on this seed). | `critic/c27_dyn.json`, `critic/c27_headless_7019.json` |
| **LW: 10 years in the page (6151)** | Same world as run 26 (the war chips equal 9 of 10 years); 59.9–60 fps every year, longest frame gap 83 ms, none over 500 ms, no page error. | `critic/c27_lwdef_6151.json`, `critic/c27_lw_6151.log` |
| BT (desktop, phone), GU, K2, K3, DR | Identical to run 26. | `critic/c27_cmp.txt` |
| PG (3739 panels; 7019 day 33) | 3739's panels as run 26 (GRE / TUR not re-asked: my argument list differed). 7019 day 33: Poland "Guaranteed by France"; History type "War left" in the filter. | `critic/c27_pg_3739_desk.json`, `critic/c27_pg_7019_wl.json` |
| Not re-run in this focused run | The carried dimensions' probes (Q, A, Z, C, CB, CB2, WW, SB, W, PL, FO, HV, HS, SX, SXG, SXT, HU, PF, G, OS, the 30-year seeds). Their issues stand as run 26 wrote them. | run 26's report |

## New in this run

| Case | What happened | Evidence |
|---|---|---|
| **OR: every bonded Force war the fix lets through, 4 seeds × days 30 / 120 / 300** | From one saved state per day, every pair (a, b) where a fights beside b (or b's overlord) and a bond ties them (up to 150 a day, evenly sampled): **1,602 tried, 1,592 clean wars** (a at war with b, out of every war beside it, no integrity break); 9 refused for `Overrun` (France, England and Dutch colonies on the overrun Netherlands, 2207 day 300; checked: `overrun` true, a rule older than this change); **1 broken** (next row). | `critic/c27_or_{7019,2207,5113,9241}.json`, `critic/c27_rj_2207.log` |
| **OR2: Mongolia (Soviet puppet) Force-wars Romania (Soviet puppet), 7019 day 300** | Mongolia leaves the Soviet war on Yugoslavia, goes free, declares; the war it starts is `MON v SOV+LAT+EST+FIN+ROM+SIN+TAN+YUG`: **Yugoslavia is called in beside the Soviet Union while at war with it in war #25.** Five pairs (SOV, LAT, EST, SIN, TAN with YUG) are allies in one war and enemies in another **for all 60 days followed**. Run 26's commit: `WarRejected`. | `critic/c27_or2_head_7019_MON_ROM.json` against `critic/c27_or2_c26_7019_MON_ROM.json` |
| **The builder's ADR-803 checker on the same seed and days** | `tools/diag/diploInvariants.ts 7019 scenario 310 30,120,300 6`: "0 broken". Its `realm` rule names this case ("no nation at war with one it fights beside"), but at 6 a kind it did not try Mongolia on Romania. | `critic/c27_diploinv_7019.log` |
| **BX: what the bond's exit costs** | Germany (attacker on Poland, Italy called in) Force-wars Italy at day 61 of its Polish war, offering Italy peace every day: out of the Polish war with all land back (Poland held 250 German cells, Germany 133 Polish), no truce with Poland (the AI's Poland does not re-declare in 60 days; Germany's own re-declaration an hour later is accepted, 0 / 0 held, `critic/c27_bx_head_7019_GERatk_ITA_redecl.json`); Italy takes at most 11 German cells and **signs peace on day 37**; Germany is in the Anglo-French alliance by day 50. On run 26's commit the same Germany stays in and ends the war annexing Polish land (3,606 cells at day 101). Poland on Romania (allies, 7019): Romania not beside it against the Soviet Union, so Poland stays in that war (907 cells held, rising): the exit is only from wars the partner is in. | `critic/c27_bx_head_7019_GERatk_ITA.json` against `critic/c27_bx_c26_7019_GERatk_ITA.json`, `critic/c27_bx_head_7019_POL_ROM.json`, `critic/c27_bx_head_2531_POL_ROM.json` |
| **RV / PPR: the revolt in the page, watching and playing** | Watching: the five rows above in the ticker. Playing Manchukuo: Manchukuo "AT WAR WITH Japan, Mengjiang"; the rows are in the ticker (the panel covers half of it in the shot). | `critic/shots/c27rv_head_7019_MAN_watch_ticker.png`, `critic/shots/c27pp_headrev_7019_MAN_panel_after.png` |

## Dimensions

### Diplomacy, war, alliance, puppet, revolt depth: 7 (was 6; rescored)
- **Tested:** PR, PZ (4 seeds), PP, PPR, RV, FW, FW2, EXIT, COBEL, ES, ES2 (3 seeds), BT, GU, DR, BS (4 seeds, both
  commits), BOTH (3 seeds), OR (1,602 bonded Force wars), OR2, BX (3 cases, both commits), AL (2,904 alliance
  proposals against `allyWhy`).
- **Evidence:** `critic/c27_pz_7019.json`, `critic/c27_pr_head_7019_MAN.json`,
  `critic/shots/c27pp_head_7019_MAN_menu_before.png`, `critic/shots/c27rv_head_7019_MAN_watch_ticker.png`,
  `critic/c27_or_7019.json`, `critic/c27_al_7019.json`.
- **Why 7:** ADR-780's "war can be declared no matter what" holds again for puppets and allies, the SPEC's war of
  independence happens, and the partner with no bond is still refused (R25-B1). The menus say what ties the two.
- **What AoC does better** (text only, lower confidence): nothing new measured; AoC's diplomacy is shallower, but its
  guarantees and alliances are not frozen at the start (non-blocking 5).
- **Fix:** non-blocking 1, 2, 3, 5.

### Emergent world dynamics over long runs: 7 (rescored, unchanged)
- 7019 × 20 bit-identical to run 26; BS identical on 4 seeds; LW 6151 the same world. The change touches commands and
  the revolt path only, and no AI puppet revolted in 20 years. No new seeds × 30 years in this focused run.

### God Mode: 7 (rescored, unchanged)
- God's Force war of a puppet on its overlord or an ally on its ally now breaks the bond and declares (PR, PP); God's
  loyalty 0 makes a revolt with its war (RV). One bonded Force war in 1,602 breaks the war lists (non-blocking 2).
  God's Force war between partners with no bond: refused as in run 26 (BT, identical).

### Stats and history: 7 (rescored, unchanged)
- `WarLeft` and `PuppetRevolt` are in the ticker now (RV, PP), and "War left" in the History filter (PG). A single Force
  war writes five ticker rows at once (non-blocking 4).

### UI/UX and polish: 7 (rescored, unchanged)
- "Your overlord · fights beside you", "Allied · fights beside you" read clearly; the greyed "Propose alliance" matches
  the sim on 2,902 of 2,904 sampled pairs. The reason is still only a `title` (no hover on a phone; BT phone identical
  to run 26).

### Stability: 7 (rescored, unchanged)
- No page error in any of 21 page runs (LW's ten years included); no crash in any headless run. One command reaches a
  state the rules forbid and holds it for 60 days (non-blocking 2); not reached by the AI on 3 seeds × 2 years (BOTH)
  or 7019 × 20 years.

### Carried from run 26 (not rescored)
- **Map visuals 7, Editor 7, Performance 7, Semantic zoom 8, Naval 8, Tanks 8, Aircraft 8, AI nukes 8**: no file of
  theirs changed. Seen in passing: LW 6151 at 59.9–60 fps for ten years (as run 26), the zoomed map and counters in the
  PP / ES shots as before. Their run-26 evidence and issues stand.

## Blocking issues, in priority order

None in this focused run. R26-B1 is fixed (cases above). The next run must be full (the DONE CONDITION).

## Non-blocking issues

1. **The bond's exit is a one-click front reset** (new, PLAN 7.191). `leaveWarsBeside` hands every held cell back both
   ways "as at a white peace" and sets **no truce** with the old enemy. COBEL / BX, 7019: Germany (Poland holding 250
   German cells, Germany 133 Polish) Force-wars its ally Italy at day 61: out of the Polish war, all 383 cells back;
   **an hour later Germany's "Declare war" on Poland is accepted** and the new war starts from a clean border (0 / 0
   held) (`critic/c27_bx_head_7019_GERatk_ITA_redecl.json`). Without the re-declaration, Italy took at most 11 German
   cells and signed peace on day 37 of Germany's daily offers (`critic/c27_bx_head_7019_GERatk_ITA.json`); the ES shot
   shows the player's Poland "Neutral" with "Declare war" live right after (`critic/shots/c27es_head_7019_d61_polmenu_after.png`).
   ADR-801 records the land rows ("the same rows and land as `leaveBondedWars`") and "the new war is the cost of the
   exit", and is silent on a truce; run 26's fix text asked for "a truce with those wars' enemies if the exit is not to
   be free". Not blocking: it needs a bonded partner in the same war, and the exit has a cost (a new war, the alliance
   gone). Fix: a truce between the leaver and the enemies of each war it leaves (so no same-hour re-declaration), and
   either the leaver's own land held by the old enemy stays held until a peace, or the exit counts as a lost peace.
2. **A bonded Force war can call a nation in beside its enemy** (new, reached through PLAN 7.191). 7019 day 300:
   Mongolia (a Soviet puppet) Force-wars Romania (a Soviet puppet): `declareWar` calls Yugoslavia, on Romania's account
   (its ally or guarantor; not checked which), to the Soviet side although Yugoslavia is at war with the Soviet Union in war #25; five pairs are allies in one war and
   enemies in another for 60+ days (`critic/c27_or2_head_7019_MON_ROM.json`; run 26's commit: refused,
   `critic/c27_or2_c26_7019_MON_ROM.json`). 1 of 1,602 bonded Force wars (`critic/c27_or_*.json`); the ADR-803 checker
   misses it at 6 a kind (`critic/c27_diploinv_7019.log`). Fix: in `declareWar`'s `add`, skip a nation already at war
   with the leader (or a member) of the side it would join, as a truce partner is skipped; give the checker this case.
3. **Two live "Propose alliance" buttons the sim refuses:** 7019 day 30, Poland → Spanish Republic and Switzerland →
   Spanish Republic: live in the menu (`allyWhy` says nothing) but `AllianceRejected`, because a member of the
   proposer's alliance is at war with the target (`canJoin`) (`critic/c27_al_7019.json`, `deadButtons`). Fix: `allyWhy`
   applies `canJoin`'s rule (the NationStat already lists each nation's enemies).
4. **One Force war floods the ticker:** Manchukuo's Force war writes five rows at once (three "left its war", "broke its
   puppet bond", "declared war"), pushing every other row out (`critic/shots/c27pp_head_7019_MAN_menu_after.png`).
   Fix: one row ("Manchukuo left its wars with China, Spanish Republic and Lithuania and declared war on Japan").
5. **Guarantees are only the start's** (run 26's 4, unchanged: `critic/c27_bs_head_*.json` identical to run 26's).
6. **A greyed button's reason is a title only**, unseen on a phone (run 26's BT, unchanged; now also the alliance's).
7. **Unchanged from run 26, not re-run in this focused run:** Japan's armies at peace in China after random
   diplomacy's white peace; Breakthrough's refusal only in God's tab; own counters in mixed stacks; level-3 plasters read
   as ✕; the player's war behind "+1" on the phone; land "To its fight" off its formation; hero markers at T1.

## Design objections (none blocking, no score lowered)

- **A junior member's peace ends the whole war** (run 26's, unchanged), and run 25's objections stand.

## Notes

- A `vite preview` on **5297** (PID 7464, run 26's port) was already listening at the start, although run 26's notes
  say both its servers were stopped. Not started by this run and not stopped by it (the stop matched 5298 / 5299
  only); it was no longer listening at the end.
- This run used 5298 (`c26_dist`) and 5299 (`c27_dist`) and stopped both at the end; the worktree `critic/wt`
  (`33c84306`) had its `node_modules` junction removed before `git worktree remove`.
- OR's first version read `nations.cols` once and went stale after `sim.load` (false "puppet at war with overlord"
  rows); fixed (`fresh()` in `critic/scripts/c27_or.ts`) and every OR result above is from the fixed script. The PPR
  ticker text was read before the ticker re-rendered; RV reads it after a settle.
- PG's 7019 call used other tags than run 26's (`ENG,POL 33 LIT,POL`), so its diff with run 26 is in the asked panels,
  not the game.

## Strengths, verified

- **The fix touched exactly what it meant to:** 0 refusals for `Beside` left on 4 seeds where there were 52–78 %, the
  partner with no bond still refused, and the AI world bit-identical to run 26's for 20 years on 7019 and a year on 4
  seeds.
- **The new rows read well where the player looks:** "Manchukuo rose against Japan" and its war in the ticker, the
  bond and the shared war in one standing line, the greyed alliance agreeing with the sim on 2,902 of 2,904 pairs.
