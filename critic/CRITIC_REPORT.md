# Critic report, run 47 (focused): after R38, "troops lost with sunk transports are told so; the sibling wait, the phone tooltip, the far port, the sea hover"

- **Mode: focused.** I decided this from git before anything else (CRITIC_PROMPT, ADR-804). All three conditions hold:
  1. Run 46 (`72c458f7`, on `4040cad6`) has a blocking issue (R46-B1) and naval under its bar (7, bar 8).
  2. The only commit since `72c458f7` is `f464db35`, whose subject names R38, which `72c458f7` filed.
  3. The last three reports were focused (46), focused (45) and full (44), so not all focused.

  I re-ran run 46's named cases and rescored afresh the dimensions it scored under the bar or blocked on, and those the
  diff (`git diff --stat 4040cad6 HEAD`) touches:
  - **naval:** under the bar, blocked; `landings.ts`, `amphibious.ts`, `events.ts`, `server.ts`;
  - **uiUxPolish:** `MapTooltip.tsx`, `FormationPanel.tsx`, `style.css`, `en.json`, `orderNewsText.ts`, `hud.ts`;
  - **stability:** `landings.ts`, `amphibious.ts`, `protocol.ts`, `server.ts`, the checker helper.

  Every other score is **carried**. A release needs a full run with no blocking issue.
- **Commit judged:** `f464db35c03d644ac4f18a1ed2fd90fff860d768`, HEAD at the start (`critic/c47_commit.txt`). **Date:** 2026-11-06.
- **Build:** `vite build --outDir critic/c47_dist`, exit 0 (`critic/c47_build.log`). Served by `vite preview` on
  127.0.0.1:**5298**, driven through Playwright Chromium at desk 1600 × 900 and phone 390 × 844.
- **Baselines.** Run 46's own `c46_*` outputs are the `4040cad6` baseline for its named cases. New cases ran on HEAD and in
  a worktree at `4040cad6` (`critic/wt`, scripts copied into it so their imports hit its `src/`), with a
  `node_modules` junction that I unlinked before removing the worktree.
- **Runs.**
  - Run 46's named cases: 432 headless jobs (`critic/scripts/c47_jobsHL.txt` = run 46's All, G, X and Y lists),
    its page suites (`c47_suiteP.sh`, `c47_suiteP2.sh`) and the phone recall hover, and the checkers.
  - New:
    - **sinkings** (R38a beyond its unit case): `critic/scripts/c47_sunk.ts`, Japan 3517, pools of 1, 2, 3 and all
      groups, all of a landing's groups or one of two destroyed at sea a day after it sails;
    - the same **in the page** with the rows, the panel of the one left at the port, and the tooltip at the screen's
      edges (`critic/scripts/c47_lost.mjs`, desk and phone);
    - **R38d on other nations and seas** (`critic/scripts/c47_far.ts`, HEAD and `4040cad6`): the Soviet Union from
      Moscow to Gotland and to Cyprus, Germany from Königsberg to Norwich, the United States from Chicago to
      Norwich;
    - checkers on new seeds: landingInvariants 19311, 19313, 19333, 19335, and the new short pools (1 group: 19315,
      19317; 2 groups: 19319, 19331); diploInvariants 19321 (heroes), 19323 (random world); worldInvariants 19329;
      workerDeterminism 19327.

## Verdict

**R38 does what it set out to do in every one of run 46's cases. But the class R46-B1 belongs to is still there: when
a landing's transports are destroyed, the player is told "no transports of its nation with room for it are at a port
it can reach", and nothing says the transports were sunk.**

- **R46-B1's own case is fixed.** landingInvariants 19113/15101: 0 broken, and the run still reaches the sinking:
  271 and 272 are lost with group 1076 at t1464 (`critic/c47_li_19113_eng.log`, `critic/c47_li_sunk_19113.log`).
- **Run 46's 406 landing cases are identical** to run 46's hour for hour (`critic/c47_cmp46.txt`: same 406,
  different 0). Every page probe lands at run 46's hours, with no page error (`critic/scripts/c47_pagecmp.cjs`).
- **The men aboard are now told they were lost, but not by name.** The row reads "A formation: its transports were
  sunk at sea; it was lost with them." The formation is gone when the page names it, so this is what every such row
  will say (R47-N1).
- **New blocking issue: R47-B1.** Two cases:
  - A US landing's transport group is bombed and sunk in Norfolk. The landing ends with the refusal above, while
    an idle US group stands at San Francisco. Clicking the same order again an hour later makes a landing there.
  - When the groups of a sailing landing are sunk, the division left at the port for the next voyage was told "they
    come back for it". Now it gets the same refusal, and nothing says what happened.

  The first case is the same on `4040cad6`, so it is not R38's. It is the rest of the class R46-B1 was filed for.

**Naval stays 7.** The fix for the men aboard works, and R38d makes two cross-sea landings possible or faster. But
the player is still misled about what became of their transports.

## Scores

| Dimension | Run 46 | Run 47 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 (carried) | R38 changes the tooltip's box and words (judged under UI/UX), not the map |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 (carried) | diploInvariants 19321 (heroes) and 19323 (random world): 0 broken (`critic/c47_diploinv_19321s_h.log`, `critic/c47_diploinv_19323r.log`) |
| Emergent world dynamics over long runs | 7 | 7 (carried) | |
| God Mode | 7 | 7 (carried) | God's `removeFormation` of a transport group at sea is told as "its transports were sunk at sea" (`critic/c47_lost_desk.json`). That is acceptable for God |
| Editor and scenarios | 7 | 7 (carried) | |
| Stats and history | 7 | 7 (carried) | |
| UI/UX and polish | 7 | 7 | **Rescored.** **Better:** <ul><li>**R46-N1 fixed.** The sibling wait reads "At Sasebo, waiting for the landing from Tokyo for the same place, about 3 days: they land together", then "about a day" (`critic/shots/c47sib_freshfirst_h484.png`, `critic/c47_sib_freshfirst.json`). The count is right: `sibling` lasts 159 h on 16 headless cases (`critic/c47_x_*.json` `voy`), and it ends in the page between h544 and h604.</li><li>**R46-N2 and R45-N2 fixed sideways.** The phone recall hover is 200 px wide and ends 8 px inside the screen (run 46: 562 px; `critic/shots/c47rc_phone_d3_hover.png`, `critic/c47_rc_phone_d3.json`). The phone sea sweep has 0 of 6 tooltips off the screen (run 46: 6 of 6; `critic/c47_uh_phone.json`).</li><li>**R45-N3 fixed.** Over the sea, a gathering landing reads "Only sea here: your landing stays as it is", and a division in no landing reads "they cannot march there" (`critic/c47_lost_desk.json` `edgesAshore`/`edgesPlain`, `critic/shots/c47lost_phone_plain.png`).</li></ul> **Not 8:** <ul><li>**R47-N1:** the lost-at-sea row never names the division (`critic/shots/c47lost_desk_rows.png`, `critic/shots/c47lost_phone_portpanel.png`).</li><li>**R47-N2:** the tooltip is still not kept within the bottom of the screen. On a desk, hovering 45 px from the bottom puts it 25–57 px below the screen and over the bottom bar (`critic/shots/c47lost_desk_ashore.png`: the "Longyan" box [94,871,454,957] on a 900-px screen).</li><li>R47-B1's false refusal reaches the player as a notice in the panel (`critic/shots/c47lost_phone_portpanel.png`).</li></ul> |
| Performance | 7 | 7 (carried) | `tm_touch` 58.6–60.0 fps and 1.0 hover ask a second with a selection, as in run 46 (`critic/c47_tm_touch.json`) |
| Stability | 7 | 7 | **Rescored.** <ul><li>No page error in any page JSON of this run.</li><li>workerDeterminism 3517 at 2190 h ends on run 46's hash `7e113d94` on every arm (`critic/c47_wd_3517_2190.log`). At 8760 h, 3517 and new seed 19327 end the same on all four arms (`critic/c47_wd_3517.log`, `critic/c47_wd_19327.log`).</li><li>Run 46's 10 named landingInvariants runs: 0 broken. 18705 and 19111 (run 46's `stuck`, R46-N3) are now 0 broken.</li><li>New seeds 19311, 19313, 19333 and 19335, and the short pools 19315/19317 (1 group) and 19319/19331 (2 groups): 0 broken (`critic/c47_li_*.log`).</li><li>worldInvariants 19329: 0 broken.</li></ul> **Not 8:** <ul><li>landingInvariants still breaks `stuck` on 19206 and 19207: 367 waits 45 days in a gathering landing (`critic/c47_li_19206_jap.log`, `critic/c47_li_19207_jap.log`). The builder records this as R38d's follow-on.</li><li>A focused run gives no broad evidence for an 8.</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 (carried) | |
| Naval warfare (needs 8) | 7 | **7** | **Rescored. Held under 8 by R47-B1.** <br>**Better, same cases on both commits:** <ul><li>R46-B1's case: 0 broken, and the sinking is reached (above).</li><li>A partial sinking (one of two groups destroyed at sea) is handled. The survivor lands (h633), the lost is told, and the one waiting for the next voyage keeps its state and lands at h1198 (`critic/c47_sunk_3517_n2k0_part.json`, `critic/c47_sunk_3517_n3k2_part.json`).</li><li>R38d, Moscow to Gotland: lands in 45.9 days on HEAD against 69.7 on `4040cad6` (`critic/c47_far_sovmos_got_head.json`, `_wt.json`).</li><li>All 406 of run 46's landing cases are unchanged.</li></ul> **Held:** <ul><li>R47-B1.</li><li>R47-N3: R38d calls a group across seas without asking whether it can get there (Moscow to Cyprus).</li></ul> |
| Tanks (needs 8) | 8 | 8 (carried) | |
| Aircraft (needs 8) | 8 | 8 (carried) | |
| AI nuclear use (needs 8) | 8 | 8 (carried) | |

## Blocking issues

1. **R47-B1. When a landing's transports are destroyed, the player is told "not done: no transports of its nation
   with room for it are at a port it can reach", and nothing says the transports were sunk. In the US case the
   reason is false.**
   - **Case A: a gathering landing whose group is bombed in port.** United States, seed 3517, at war with Britain.
     The division nearest Chicago (615) is sent to Norwich (1.3, 52.6) (`critic/scripts/c47_far.ts`;
     `critic/c47_far_usachi_watch.json`, `critic/c47_far_usachi_stall2.json`, `critic/c47_far_usachi_reclick.json`):
     - The landing is made at Norfolk with group 1119, and 615 marches there.
     - 1119 stands in Norfolk under the landing (player order kind 3). It takes five air strikes (`StrikeHit`, wings
       1452/1453, t247–t272) and is destroyed at t272.
     - At t273 the landing ends. 615 is told `MoveRejected` reason 6, the string above, and walks on to Norfolk with
       no landing.
     - At that hour group 1123 stands idle at San Francisco with room for it (m0, room 25200). Re-clicking the same
       order at t274 makes landing 2 at San Francisco with 1123.
     - So the reason is false, and nothing tells the player that the group they were waiting for was sunk.
     - The same happens on `4040cad6` (`critic/c47_far_usachi_eng_wt.json`: t273 refused 615 reason 6).
   - **Case B: those left for the next voyage when the sailing landing's groups are sunk.** Japan, 3517, the three
     nearest Tokyo sent to Shanghai, with Japan's other groups removed (`critic/c47_sunk_3517_n3k1.json`, `n3k2`,
     `n4k2`, `n5k3`):
     - The one or two left at Tokyo are told `nextVoyage`: "it waits at the port, and they come back for it".
     - The groups are sunk a day out. Those aboard get `lostAtSea`. Those at the port get `refused` reason 6 in the
       same hour.
     - In the page, 366's panel reads "Holding" with "Square infantry division 366: not done: no transports of its
       nation with room for it are at a port it can reach." Nothing tells them their transports went down
       (`critic/shots/c47lost_desk_portpanel.png`, `critic/shots/c47lost_phone_portpanel.png`,
       `critic/c47_lost_desk.json`).
     - Here Japan had no other group, so the words are not false, but the promise "they come back for it" ends in a
       refusal with no cause given.
   - **Why it blocks.**
     - **Two rules disagree.** At t273 the game refuses 615 because "no transports … at a port it can reach". At
       that hour 1123 stands idle at San Francisco, and an hour later `chooseTransports` finds it for the same click.
     - **What SPEC decides.** SPEC (l.1290) says such a landing is over (`NoTransports`), and I do not object to that
       here. What is wrong is the reason it gives, and the silence about the sinking. The code path is `landings.ts`
       `gather` ("no group left": `endLanding(…, NoTransports)`) and the sailing branch (`l.fleets.length === 0`).
     - **It is R46-B1's player experience** in the two states R38a did not touch: the transports go down and the game
       reports a missing port.
     - **Case B supports this; it does not carry it.** The words are true there, but the sinking is never told.
   - **Fix.**
     - A landing whose last group is destroyed calls another group (`callTransports`, as R37a's busy call does), and
       is over only if none comes.
     - When it is over, it is told by its own reason or news kind ("its transports were sunk at port / at sea"),
       naming the division, not reason 6.
     - Those waiting for a next voyage get the same.
   - **AT.**
     - Case A (`c47_far.ts` USA 3517) gives no reason-6 refusal at t273. The landing goes on with 1123, or the news
       names the sinking.
     - A unit case of a gathering landing whose group is destroyed at its port while another group is idle: no
       refusal reason 6.
     - Case B: the one at the port is told its transports were sunk.

## Non-blocking issues (prioritised)

1. **R47-N1. The lost-at-sea row never names the division.**
   - **What the player sees.** `App.tsx` names a row by `view.formationTitle(id)`. The division is destroyed in the
     same hour `LostAtSea` is sent, so the name is always the fallback: "A formation: its transports were sunk at sea;
     it was lost with them." (`critic/c47_lost_desk.json` `afterSink.rows`, `critic/shots/c47lost_desk_rows.png`,
     `critic/shots/c47lost_phone_portpanel.png`).
   - **Why it matters.** Two divisions were lost and the player cannot tell which. The row's click goes to a
     formation that no longer exists (read in `App.tsx` `onOrder`; not clicked). The unit test checks the news ids, not the words.
   - **Fix.** Send the name with the news, or keep the title of a formation told `lostAtSea` until its row is
     cleared.
2. **R47-N2. R38c keeps the tooltip inside the screen sideways, but not at the bottom.**
   - `place()` clamps `left` but sets `top` to y + 16 always.
   - On a desk, hovering 45 px from the bottom puts the box at 871–925 (sea) and 871–957 (a city) on a 900-px screen.
     It hangs off the screen and over the bottom bar (`critic/shots/c47lost_desk_ashore.png`,
     `critic/c47_lost_desk.json` `edgesAshore`).
   - **Fix:** flip the box above the cursor when it would pass the bottom.
3. **R47-N3. R38d calls a group across seas with no check that it can get there or that this is sooner.**
   - **The case.** Moscow to Cyprus (Soviet Union at war with Britain, 3517; `critic/c47_far_sovmos_cyp_head.json`).
     - The only Soviet group, at Sevastopol, is "far" from the nearest port (Leningrad) and is called there.
     - For 9 days it shuttles between Sevastopol and the Sea of Marmara: (1195,342) → (1176,355) → (1199,338) →
       (1210,325) → …
     - At t222 the landing ends with reason 6.
   - **On `4040cad6`** the landing was made at Sevastopol and ended at t81 "its port is bombed shut", so both fail.
   - **What R38d leaves out.** It compares straight-line distances and never asks which sea a port is on, or whether
     the called group can reach it. A target in the Black Sea or the Mediterranean is then reached by a call around
     Europe (if at all).
   - **Fix.** Compare the call's sail hours plus the voyage against the march plus the voyage (`sailHours`), and
     keep the free group where the call cannot reach.
4. **R47-N4.** landingInvariants `stuck` on 19206 and 19207: 367 waits 45 days in a gathering landing
   (`critic/c47_li_19206_jap.log`, `critic/c47_li_19207_jap.log`). This is R46-N3's class; the builder records it
   as R38d's follow-on.
5. Carried, unchanged:
   - R44-N3 (`steal_one`), R46-N5 (Britain `n6_012` +17 h), identical to run 46 (`critic/c47_cmp46.txt`);
   - R37-N3, R37-N4, R32-N3, R40-N2, R39-N2, R39-N3, R36-N3, R32-N2, R31-N1, R31-N6, R32-N5, R39-N4;
   - the ranking cutting long names (`critic/c47_hs_desk.json` identical to run 46's but for the shot names).

## Run 46's cases re-run

| Run 46 case | `4040cad6` (run 46) | HEAD `f464db35` | Evidence |
|---|---|---|---|
| **R46-B1** landingInvariants 19113/15101 | `aboardNoLanding` ×2 at t1463 | **fixed**: 0 broken; 271/272 lost with group 1076 at t1464 | `critic/c47_li_19113_eng.log`, `critic/c47_li_sunk_19113.log` |
| **R46-N1** sibling wait (page, 3517 and 19101) | "all of the landing there: it sails when its transports and escort are ready" | **fixed**: "waiting for the landing from Tokyo … about 3 days", then "about a day"; lands h658/h682 as before | `critic/c47_sib_freshfirst*.json`, `critic/shots/c47sib_freshfirst_h484.png` |
| **R46-N1** headless `sibling` hours (16 cases) | 159 h `ready` | 159–161 h `sibling`, 0–1 h `ready` | `critic/c47_x_*.json` |
| **R46-N2** recall hover on a phone | 562 px, cut | **fixed**: 200 px, inside | `critic/c47_rc_phone_d3.json`, `critic/shots/c47rc_phone_d3_hover.png` |
| **R45-N2** sea sweep on a phone | 6 of 6 off the screen | **fixed**: 0 of 6 | `critic/c47_uh_phone.json` |
| **R45-N3** gathering landing over water | no hover | **fixed**: "Only sea here: your landing stays as it is" | `critic/c47_uh_desk.json`, `critic/c47_uh_phone.json` |
| **R46-N3** `stuck` 18705, 19111 | 1 broken each | **fixed**: 0 broken (19206, 19207 still `stuck`, R47-N4) | `critic/c47_li_18705_jap.log`, `critic/c47_li_19111_jap.log` |
| **R46-N4** `leftBehind` and short pools | not exempt; no pool | exempt; pools of 1 and 2 on four new seeds: 0 broken | `critic/c47_li_193*_g*.log` |
| All headless lists (All, G, X, Y; 432 jobs) | — | 406 with landings, all identical hour for hour; the 13 that fail are run 46's own stale `c45_ll4` imports, which failed there too | `critic/c47_cmp46.txt`, `critic/c47_q_hl.done` |
| Page suites P, P2 (SE, RC, MK, MK2, MK4, UW, UH, SP, PN, FS, HS, LWT5, TM) | — | identical landings, no page error | `critic/c47_*.json`, `critic/scripts/c47_pagecmp.cjs` |
| workerDeterminism 3517 (2190 h) | `7e113d94` | `7e113d94` on every arm | `critic/c47_wd_3517_2190.log` |
| Run 46's 10 landingInvariants runs | 0 broken | 0 broken | `critic/c47_li_18*.log`, `critic/c47_li_15101_o18117.log`, `critic/c47_li_3517_o18113.log` |

## Design objections (none blocking, no score lowered)

- **R38d puts the call before the walk by straight-line distance alone.** The ADR records it as a cure for one
  40-day walk within Honshu. On a continent, the nearest port may lie on another sea from both the target and the
  group (R47-N3). Judging the call by hours, as escorts already are (`sailHours`, R23d), would make it a choice
  rather than a rule of thumb.
- **SPEC ends a landing whose last group is lost** (l.1290) rather than calling another. With R37a's busy call
  already in the game, keeping the landing and calling a group would match what the player asked for.

## Ideas from other games (not scored)

- Hearts of Iron names the divisions lost with a convoy in one message ("3 divisions lost at sea"). That is the shape
  of R47-N1's fix.
- Many strategy games flip a tooltip above the cursor near the screen's bottom. That is R47-N2's.

## Strengths (verified)

- **R38 changed nothing it did not mean to.** All 406 of run 46's landing cases are identical hour for hour. Every page
  probe lands at run 46's hours. Seed 3517's worker hash is unchanged (`critic/c47_cmp46.txt`,
  `critic/c47_wd_3517_2190.log`).
- **The sibling wait now tells the truth, and its count is right.** "About 3 days" at h484 and "about a day" at
  h544, against a 159-hour wait that ends before h604 (`critic/c47_sib_freshfirst.json`).

## Notes

- **Königsberg to Norwich (R38d), not judged as better or worse.**
  - `4040cad6` refuses it with reason 3 (`critic/c47_far_gerkon_eng_wt.log`).
  - HEAD calls the Kiel group to Königsberg and sails at t47. The convoy then comes ashore on Germany's own North Sea
    coast at t150, not in England.
  - No repulse or refusal event is logged for the division, and I did not trace the fleet
    (`critic/c47_far_gerkon_eng_head.json`, `critic/c47_far_gerkon_eng_head2.json`).
- `c47_far.ts` cases where no landing is made:
  - Moscow to Turkey and to Finland march overland; I did not judge them (`critic/c47_far_*` first attempts were
    deleted).
  - Chicago to Dublin was water, refused 17.
- The `c47_sunk` cases destroy groups with `destroyFormation`, as a sinking does: `elements.ts` sets the fleet of
  those aboard to −1. The US case A is a real sinking, by air strikes in port.
- workerDeterminism at 8760 h: 3517 (`4c5a37a2`) and new seed 19327 (`849bf16d`) end the same on all four arms (plain,
  quiet, start, every) (`critic/c47_wd_3517.log`, `critic/c47_wd_19327.log`).
