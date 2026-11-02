# Critic report, run 26

- **Commit:** `33c84306e54134456989126a3b16d545d9a9153c` (HEAD at the start, `critic/c26_commit.txt`). Run 25 was on
  `e4386478`; 3 commits since (run 25's report, PLAN 7.189, PLAN 7.190). What changed for a player: **a war between two
  nations that fight on one side of a war is refused** (`Refusal.Beside`, checked before the bonds, so God's and the
  player's Force war break nothing of it), **a nation called against its partner stays out**, and PLAN 7.188's leave
  rule is gone (PLAN 7.189, ADR-799, for R25-B1); **the nation panel lists "Guarantees" and "Guaranteed by"**, and a
  lapsed guarantee and a war left are history rows (PLAN 7.190, ADR-800). Seed 99's pin unchanged. On 7019 the world
  is identical to run 25's for ten years and splits in year 11 (`critic/c26_dyn.json`).
- **Date:** 2026-11-02.
- **Build:** `vite build --outDir critic/c26_dist`, exit 0 (`critic/c26_build.log`), served by `vite preview` on
  127.0.0.1:**5297**; run 25's build (`critic/c25_dist`, `e4386478`) on **5296** for before/after. No 529x port was
  listening at the start (run 25's stray servers are gone). Run 25's commit checked out in `critic/wt` for the headless
  before/after (junction removed before `git worktree remove`). Chromium through Playwright, headless, 1600 × 900
  (1400 × 800 for the menu probes); 390 × 844 for the phone probes.
- **Runs:** every run-25 page suite re-run on HEAD (`c26_suite1.sh`, `c26_suite2.sh`, `c26_clicks.sh`, `c26_misc.sh`,
  `c26_new.sh`); R25-B1's cases (ES, ES2 × 3 seeds in the page; EXIT × 3 seeds and COBEL headless); 7019 × 20 and
  2531 / 8467 × 30 headless on HEAD against run 25's files. New: BS (the new refusal in AI play, 4 seeds × 365 days, both
  commits), BOTH (war-list integrity, 3 new seeds × 2 years), PG (the pledge panels, the WarLeft row in the page), BT
  (the refusal in the Actions tab, desktop and phone), **PZ / PR / PP (what the refusal does to a puppet and an ally;
  both commits, page and headless)**, two new seeds × 30 years (3163, 6907), LW (10 years in the page, new seed 6151),
  PF alone at the end.
- Every path below was made in this run (`c26`) unless it names `c25`. Scripts are in `critic/scripts/c26_*`.
  The re-run comparison of every probe JSON is `critic/c26_cmp.txt`.

## Verdict

**R25-B1 is fixed, and the fix took the player's Force war and the puppets' war of independence with it.** On HEAD,
Poland's war on France and Germany's on Italy are refused (0 of 6 leave, run 25: 6 of 6), the menu reads "Fights beside
you" with the war greyed, and the AI world is untouched by it for ten years on 7019. But `Refusal.Beside` is checked
*before the bonds* and counts as a hard refusal, and a puppet fights in every war of its overlord, an ally in most of
its ally's. So **a puppet can no longer declare war on its overlord on 59–78 % of its days** (Manchukuo on Japan 365 of
365 days on 3 of 4 seeds; Albania on Italy 363 of 365), **an ally can no longer Force war its ally on 52–68 % of allied
days**, and **a puppet that revolts (SPEC: "a revolt and a war of independence") goes free with no war, still fighting
on its old overlord's side in all its wars**. ADR-780, the user's decision ("war can be declared no matter what": "a
puppet in the way goes free", an ally leaves its alliance), is contradicted for most of a game; on run 25's build both
went through (Manchukuo freed and at war with Japan in the page and headless; Albania freed in FW2). **R26-B1,
blocking.** Run 25's own suggested fix ("refuse the declaration") is what the builder applied; applied to every bond,
it overreaches. Diplomacy stays at 6, now for R26-B1.

## Scores

| Dimension | Run 25 | Run 26 |
|---|---|---|
| Map visuals and readability | 7 | 7 |
| Diplomacy, war, alliance, puppet, revolt depth | 6 | 6 |
| Emergent world dynamics over long runs | 7 | 7 |
| God Mode | 7 | 7 |
| Editor and scenarios | 7 | 7 |
| Stats and history | 7 | 7 |
| UI/UX and polish | 7 | 7 |
| Performance | 7 | 7 |
| Stability | 7 | 7 |
| Semantic zoom to unit level (needs 8) | 8 | 8 |
| Naval warfare (needs 8) | 8 | 8 |
| Tanks (needs 8) | 8 | 8 |
| Aircraft (needs 8) | 8 | 8 |
| AI nuclear use (needs 8) | 8 | 8 |

**No score moves.** Diplomacy would have gone back to 7 on R25-B1's fix and run 25's non-blocking 1 and 9 (both
addressed in the page), but R26-B1, new in the same commit, holds it at 6.

## Run 25's cases re-run

| Run 25 case | On HEAD | Evidence |
|---|---|---|
| **R25-B1, EXIT: Poland declares on France at day 45, headless, 3 seeds** | **Fixed.** `WarRejected POL FRA`; Poland stays at war with Germany, the hold unchanged (377 + 60, 249/250 + 39, 342 + 42 cells); the re-declaration on Germany rejected (already at war). Run 25: 3 of 3 out of the war, the hold to 0. | `critic/c26_exit_head_{7019,2531,8467}.json` against `critic/c25_exit_head_*.json` |
| **R25-B1, COBEL: Germany force-declares on its ally Italy at day 61** | **Fixed.** `WarRejected GER ITA`; Germany still at war with Poland (133 / 250 held; 421 / 77 after 30 more days). Run 25: out of the war, all 383 cells back. | `critic/c26_cobel_head_GER_ITA_POL.json` against `critic/c25_cobel_head_GER_ITA_POL.json` |
| **R25-B1, ES2 in the page (playing Poland, peace refused on day 10), 3 seeds** | **Fixed.** France's menu: "Fights beside you", "Declare war" greyed with the title "they fight on one side in a war: a nation does not turn on its partner, nor leave its war so." (3 of 3; run 25: "Neutral", war accepted, Germany "Neutral" 2 h later). | `critic/c26_es2_head_{7019,2531,8467}_d10.json`, `critic/shots/c26es2_head_7019_d10_framenu.png`, `critic/shots/c26es2_head_7019_d10_germenu_refused.png` |
| **R25-B1, ES (playing Germany, Force war on Italy at day 61)** | **Fixed.** Italy's menu: "Fights beside you", war and alliance greyed (run 25: "Allied", "Force war" live). The standing no longer says "Allied" (non-blocking 2). | `critic/c26_es_head_7019.json`, `critic/shots/c26es_head_7019_d61_itamenu.png` |
| **Non-blocking 1: a war left leaves no trace** | **Fixed in the history, not in the ticker.** On 7019 "2 February 1938 Lithuania left its war with Germany" is a History row (Lithuania made Poland's puppet); "War left" is a type in the filter. The ticker shows no row for it (`WarLeft` is not a ticker kind). | `critic/shots/c26pg_7019_wl_d33_history.png`, `critic/c26_pg_7019_wl.json` |
| **Non-blocking 9: guarantees shown nowhere** | **Fixed.** 3739 day 0: UK "Guarantees Belgium, Portugal, Iraq"; France "Czechoslovakia, Poland, Belgium"; Czechoslovakia "Guaranteed by France, Soviet Union"; Soviet Union "Czechoslovakia, China"; chips at 1600 wide without overflow. GU day 13: Czechoslovakia "Guaranteed by France, Soviet Union", at war with Bulgaria only. | `critic/c26_pg_3739_desk.json`, `critic/shots/c26pg_3739_desk_d0_CZS.png`, `critic/c26_gu_3739.json` |
| FW / FW2 (2207): Japan's Force war on ally Germany; Albania (Italy's puppet) on Italy | Case A as before (Japan not beside Germany that day). **Case B now fails**: Albania's "Declare war" on Italy is greyed ("they fight on one side…"); run 25: Albania freed and at war with Italy, Germany, Poland. Part of R26-B1. | `critic/c26_fw2_2207.json` (`fatal`: button disabled) against `critic/c25_fw2_2207.json` (case B) |
| Non-blocking 2–8 (Japan's armies at peace in China, refusal in God's tab, mixed stacks, plasters, phone "+1", "To its fight", hero markers) | **Unchanged** (K, K2, K3, SX, SXG 3917 / 6827, SXT, HU, TD, HS identical). | `critic/c26_cmp.txt` |
| God tools, nukes, zoom, fights, fleets, editor, UI, widths, touch, tags, old files | 24 probe JSONs identical (Q, K, K2, K3, P, P2, P3, PH, TG, U, Z, C, CB, CB2, WW, SX, SXT, SXG ×2, TD, HU, HS, ...); A, FO, PT, SB, W, HV, G differ only in live counts (camera 0.01–1 off, sortie pixels, a tick, hero rows, sea battles of a run at speed). G (the editor's 120-day run) finished this time (run 25: a 900 s timeout at its last mark). OS / OS2's `waitForURL` fatal is the same as run 25's (a probe artefact). PL's panel has one more button: the new "Guaranteed by France" chip. No page error in any probe. | `critic/c26_cmp.txt`, `critic/c26_g_4877.json`, `critic/c26_pl_6011.json` |
| History (7019 y20), export | Same function: 3,717 events, all exported (CSV 3,719 lines, JSON); the type filter has 27 kinds (run 25: 25; the two new). | `critic/c26_hi_7019.json`, `critic/c26_dl_7019.json` |
| World dynamics, 7019 × 20 | **Identical to run 25 for years 1–10** (every count; the hash differs only by the new WarLeft row in year 1); splits in year 11 (a GuaranteeLapsed row and its war). Same shape after: 96 → 83 living (run 25: 79), 176 war-years (173), 9 bursts (13), 197 sea battles (216); the US, the Soviet Union and Canada on top. | `critic/c26_dyn.json` |
| 2531 and 8467 × 30 (run 25's new seeds, now compared) | 2531 identical to year 12, splits in 13; 8467 splits in year 3. Same shape: 88 and 81 living at y30 (run 25: 78, 88); sea battles 182 / 192 (200 / 237); bursts 27 / 59 (35 / 13). One seed's chaos; no score moves. | `critic/c26_headless_2531.json`, `critic/c26_headless_8467.json` against `critic/c25_headless_*.json` |

## New in this run

| Case | What happened | Evidence |
|---|---|---|
| **BS: the new refusal in AI play, 4 seeds × 365 days, both commits** | Declarations, peace, wars ended, the longest "partner" pair (England–Portugal 227–297 days) and the day-counts of free partner pairs with no bond are **equal on both commits on 4 of 4 seeds**; the only difference is the new WarLeft row (7019 day 32, 8467 day 279). The AI's own choices are untouched in year one. | `critic/c26_bs_head_*.json`, `critic/c26_bs_c25_*.json` |
| **PZ: how often Force war is now refused for Beside, 4 seeds × 365 days, HEAD** | Puppet → its overlord: refused for Beside on **73 % (7019), 78 % (2207), 59 % (5113), 76 % (9241)** of puppet-days. Manchukuo → Japan 365 / 365 on 7019, 5113, 9241; Mengjiang → Japan 314 / 314 and 365 / 365; Albania → Italy 363 / 365; Egypt, Sudan, South Africa, Nigeria … → the UK 331 / 365 (7019), 364 / 365 (9241); French colonies → France 347 / 365 (2207). Ally → ally: **66 %, 65 %, 54 %, 52 %** of allied-pair days. `forceWar` treats `Beside` as hard (`war.ts`: not in the list it breaks), so these are refusals, not an upper bound. | `critic/c26_pz_{7019,2207,5113,9241}.json`, `critic/scripts/c26_pz.ts` |
| **PR: a puppet's Force war and a puppet's revolt, headless, both commits (7019, day 30)** | HEAD: Manchukuo's and Albania's Force war → `WarRejected`, still puppets. God sets loyalty 0, autonomy 60 → `PuppetRevolt` then **`WarRejected`**: Manchukuo free, in all three of Japan's wars on Japan's side (China; Spanish Republic; Lithuania–Latvia–Estonia), at war with Japan: false. Run 25's commit: Force war → `PuppetReleased`, `BondsBroken`, `WarDeclared MAN JAP` (Manchukuo alone against Japan, Mengjiang, Germany, Italy, Austria, Albania, Poland); revolt → `PuppetRevolt`, `WarDeclared MAN JAP` (Manchukuo against Japan and Mengjiang). | `critic/c26_pr_head_7019_{MAN,ALB}.json` against `critic/c26_pr_c25_7019_{MAN,ALB}.json` |
| **PP: the same in the page, playing Manchukuo, both builds** | HEAD: Japan's menu "Fights beside you", "Declare war" greyed (not "Your overlord / Force war"); after God's revolt: Manchukuo's panel shows no overlord, at war with China, Communist China, Spanish Republic, Lithuania, Latvia, Estonia; the ticker says nothing of a revolt; Japan's menu still "Fights beside you". Run 25's build: "Your overlord / Force war" → "Manchukuo broke its puppet bond with Japan", "Manchukuo declared war on Japan", Japan "At war / Offer peace". | `critic/shots/c26pp_head_7019_MAN_menu_before.png`, `critic/shots/c26pp_c25_7019_MAN_menu_before.png`, `critic/shots/c26pp_c25_7019_MAN_menu_after.png`, `critic/c26_pp_head_7019_MAN.json`, `critic/c26_pp_c25_7019_MAN.json` |
| **BT: the refusal in the Actions tab, desktop and phone (5113, playing Poland, day 10)** | France: "Fights beside you", "Declare war" greyed with the reason as its title; on the phone the standing line is visible above the greyed button (the title is not, no hover). God's direct Force war of France on Poland: no war. | `critic/c26_bt_5113_{desk,phone}.json`, `critic/shots/c26bt_5113_phone_actions_FRA.png` |
| **BOTH: war-list integrity, 3 new seeds × 730 days** | No pair on one side of a war and enemies in another, no puppet at war with its overlord, no guarantor at war with its own, no allies at war, no dead side: 0 findings on 5113, 6151, 9241. | `critic/c26_both_head_{5113,6151,9241}.json` |
| **New seeds 3163 and 6907 × 30 years (new seeds, not compared)** | 3163: 98 → 75 nations, 3–10 wars a year, 33 bursts, 174 sea battles, 92 revolts; the US 29 %, the Soviet Union 24 % at y30. 6907: 97 → 69, 4–11 wars, 14 bursts, 243 sea battles, 106 revolts; the Soviet Union 30 %, the US 15 %. Mean tick 2.7 ms (three runs at once, unpinned), longest 282 / 207 ms. 0 puppet revolts in any 30-year run on either commit (so R26-B1's revolt face is reached through God and loyalty, not yet by the AI). | `critic/c26_headless_3163.json`, `critic/c26_headless_6907.json` |
| **LW: 10 years in the page (6151, default diplomacy)** | 1938 → 20 January 1948: 23–37 s a simulated year at Max, 59.9–60 fps every year, longest frame gap 83 ms, no gap over 500 ms, no page error; 70 nations at the end; five wars on the banner (US–UK, Soviet Union–Nationalist Spain, Brazil–Netherlands …); France 12.5 M km², the US 18.1 M. | `critic/c26_lwdef_6151.json`, `critic/shots/c26lwdef_6151_y10_world.png`, `critic/shots/c26lwdef_6151_zoom_*.png` |

## Dimensions

### Map visuals and readability: 7 (unchanged)
- **Tested:** CB, CB2, Z, C, TG, HV, HS re-run; LW zoom shots. **Evidence:** `c26_cb_7019.json`, `c26_z_5861.json` (identical), `c26tg_7019_d21_60m.png`.
- **What AoC does better:** counters in the nation's colour (as before). **Fix:** run 25's non-blocking 8 (hero T1 marker) stands.

### Diplomacy, war, alliance, puppet, revolt depth: 6 (unchanged; R25-B1 fixed, R26-B1 new)
- **Tested:** EXIT, COBEL, ES, ES2 (R25-B1, all fixed); BS on both commits; PZ, PR, PP (both commits), BT, PG, GU, FW, FW2, BOTH.
- **Evidence:** `c26_exit_head_7019.json`, `c26es2_head_7019_d10_framenu.png`, `c26_pz_7019.json`, `c26_pr_head_7019_MAN.json`, `c26pp_head_7019_MAN_menu_before.png`.
- **What AoC does better:** (text only, lower confidence) a puppet there can rise and fight for its freedom; there is no state in which it cannot.
- **Fix:** R26-B1. The pledge panels and the WarLeft row are real (run 25's 1 and 9).

### Emergent world dynamics over long runs: 7 (unchanged)
- 7019 identical for ten years, then the same shape; 2531 / 8467 compared on both commits, same shape; two new seeds × 30 years busy and global (69–75 nations left, 3–11 wars a year, 14–33 bursts); LW 6151 in the page. **What AoC does better:** the same three (the US, the Soviet Union, Canada) top every seed here too.

### God Mode: 7 (unchanged)
- Q, A, K, K2, K3 as before. God's Force war on partners is refused with nothing broken (BT); God's loyalty to 0 makes a revolt with no war (PR / PP; scored under Diplomacy, R26-B1).

### Editor and scenarios: 7 (unchanged)
- G ran to its 120-day mark (run 25 timed out there); old save and format-1 files as before.

### Stats and history: 7 (unchanged)
- WarLeft and GuaranteeLapsed rows in the history and its filter (27 kinds), exported; neither in the ticker (non-blocking 1).

### UI/UX and polish: 7 (unchanged)
- The new standing "Fights beside you" reads clearly on desktop and phone (BT, ES2), but it hides "Allied" and "Your overlord" (non-blocking 2).

### Performance: 7 (unchanged)
- LW 6151: 59.9–60 fps for ten years, longest gap 83 ms. PF alone on 7019's year-20 save: 60 fps at 3000 / 1200 / 600 m/px both looks; 120 m/px 40.5 / 37.5, 30 m/px 38.9 / 39.9 (balls / Classic) over a 7-formation fight. Lower than run 25's 41.2 / 39.2 and 45.3 / 47.9, but that was a different year-20 world (7019 splits in year 11) and a 12-formation fight: **the same save on run 25's build reads 40.4 / 37.3 and 38.8 / 39.3**, so no change in the game (`critic/c26_pf.log` against `critic/c26_pfold.log`). Mean headless tick 2.7–4.3 ms (several at once, unpinned). **What AoC does better:** nothing measured here; the unit-level zooms stay under 60 over a fight (as before).

### Stability: 7 (unchanged)
- No page error in any probe (LW included); no crash in 7 headless runs of 20–30 years, 12 of 1–2 years, and 20 short case runs.

### Semantic zoom to unit level: 8 (unchanged)
- Z identical to run 25 (`c26_z_5861.json`); TG and CB / CB2 identical; LW zoom shots at 25–30,000 m/px.

### Naval warfare: 8 (unchanged)
- SB as before but a tick; 174–243 sea battles in 30 years on four seeds.

### Tanks: 8 (unchanged)
- C, FP2, FT as before (C identical).

### Aircraft: 8 (unchanged)
- W differs only in sortie pixels of a run at speed; PL as before.

### AI nuclear use: 8 (unchanged)
- 14–59 bursts in 30 years on four seeds; LW 6151: the UK's atomic bomb on Turkey in January 1947 in the page; God's nuke as before (`c26_a_4219.json`).

## Blocking issues, in priority order

1. **R26-B1: a puppet cannot break free of an overlord at war, and a puppet's revolt starts no war of independence;
   an ally's Force war on its ally is refused most of the time (ADR-780 and SPEC's war of independence contradicted).**
   PLAN 7.189's `Refusal.Beside` is checked before the bonds and `forceWar` treats it as hard. A puppet joins every war
   of its overlord, so: Force war of a puppet on its overlord is refused on 59–78 % of puppet-days (4 seeds × 365 days;
   Manchukuo → Japan 365 / 365 on 3 seeds, Albania → Italy 363 / 365), and of an ally on its ally on 52–68 % of
   allied-pair days (`critic/c26_pz_*.json`). A revolt (God's loyalty 0) emits `PuppetRevolt` then `WarRejected`: the
   rebel is free, at peace with its old overlord, fighting beside it in all its wars (`critic/c26_pr_head_7019_MAN.json`;
   run 25's commit: `WarDeclared MAN JAP`, `critic/c26_pr_c25_7019_MAN.json`). In the page, playing Manchukuo: Japan
   "Fights beside you", war greyed (`critic/shots/c26pp_head_7019_MAN_menu_before.png`); on run 25's build "Your
   overlord / Force war" and the war of independence (`critic/shots/c26pp_c25_7019_MAN_menu_before.png`,
   `..._menu_after.png`); Albania the same (`critic/c26_fw2_2207.json` against `critic/c25_fw2_2207.json`). ADR-780 is
   the user's decision ("war can be declared no matter what"; "a puppet in the way goes free"); SPEC § puppets: "Loyalty
   < 20 with autonomy ≥ 10 means a revolt and a war of independence".
   Fix: keep R25-B1 closed for partners with no bond (Poland on France), but let a bond's break win over `Beside`: where
   `forceWar` frees a puppet or takes an ally out of its alliance, and where `puppetSystem` frees a rebel, the attacker
   first leaves the wars it fights beside the defender in (the `leaveBondedWars` way, with its `WarLeft` row, and a
   truce with that war's enemies if the exit is not to be free), then declares. The cost of leaving is the new war
   against the overlord or ally, so this is not run 25's free exit. (Run 25's suggested fix, "refuse the declaration",
   is what produced this; applied to every bond it overreaches.)

## Non-blocking issues

1. **The ticker tells neither a war left nor a revolt:** "Lithuania left its war with Germany" is only in History
   (`c26pg_7019_wl_d33_history.png` against `c26pg_7019_wl_d33_ticker.png`); God's revolt of Manchukuo leaves no ticker
   row on HEAD (`c26_pp_head_7019_MAN.json`: `PuppetRevolt` and `WarRejected` are not ticker kinds; run 25's build at
   least showed the war). Fix: `WarLeft` and `PuppetRevolt` in `TICKER_KINDS`.
2. **"Fights beside you" hides the bond:** Italy, Germany's ally, reads "Fights beside you" (was "Allied",
   `c26es_head_7019_d61_itamenu.png`); Japan, Manchukuo's overlord, reads "Fights beside you" (was "Your overlord",
   `c26pp_head_7019_MAN_menu_before.png`). Fix: show both ("Allied · fights beside you").
3. **"Propose alliance" is live to one's own overlord and to a partner** (Japan from Manchukuo, France from Poland;
   unchanged on run 25's build for the overlord: `c26pp_c25_7019_MAN_menu_before.png`).
4. **Guarantees are only the start's:** no guarantee is made after the first day (only the scenario and random
   diplomacy's draw add one; SPEC § 7 lists "guarantee" among the AI's actions), and 0 lapse with a row in 4 seeds ×
   365 days (`c26_bs_head_*.json`: 8 standing all year on 2531, 8467, 3739; 8 → 6 on 7019 when Czechoslovakia and
   Belgium die, `c26_gl_7019.log`); 1 lapse in 30 years on 3163, 2 on 8467. The new panels show a list that only
   shrinks.
5. **Unchanged from run 25:** Japan's armies at peace in China after random diplomacy's white peace (2); Breakthrough's
   refusal only in God's tab (3); own counters in mixed stacks (4); level-3 plasters read as ✕ (5); the player's war
   behind "+1" on the phone (6); land "To its fight" off its formation (7); hero markers at T1 (8).

## Design objections (none blocking, no score lowered)

- **A junior member's peace ends the whole war:** `offerPeace` accepts an offer from any member of a side (Poland's
  offer would end France's war with Germany too). Not a SPEC contradiction that I found; noted.
- **Run 25's objections stand** (ADR-798's lowered fleet floor; the heroes' AI, a hero covering its neighbours, hero
  labels at world zoom, the drawn diplomacy's shapes; ADR-773, ADR-777, ADR-782, ADR-783, ADR-771).

## Notes

- No 529x port was listening at the start. This run used 5296 (`c25_dist`) and 5297 (`c26_dist`) and stopped both at
  the end. The worktree `critic/wt` (`e4386478`) had its `node_modules` junction removed before `git worktree remove`.
- OS / OS2 (old scenario files) end in the same `waitForURL` timeout as on run 25; the first OS run here also ran before
  G had written this run's scenario file and was re-run after it (`c26_os_scen.rerun.log`).
- LW ran beside two headless 30-year runs for its first ~2 years (its frame rate held at 59.9). The first PF overlapped
  a 1-minute headless probe (GL) and is kept as `critic/c26_pf_withgl.log`; PF was re-run alone (`critic/c26_pf.log`),
  then the same save on run 25's build alone (`critic/c26_pfold.log`).

## Strengths, verified

- **R25-B1 is closed exactly where it was found:** 0 of 6 exits headless, 3 of 3 refused in the page, and the AI world
  identical to run 25's for ten years on 7019 and for a year on 4 seeds (BS): the fix touched what it meant to.
- **Clean in the browser and the war lists:** no page error in any probe or in ten years in the page; 0 integrity faults
  in 3 new seeds × 2 years (BOTH).
