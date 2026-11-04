# Critic report, run 32 (full) — after R6, R16–R19

- **Mode: full.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). The first condition of a focused run
  fails: run 31's report (`8ec3458e`, on `4c546398`) has no blocking issue and no score under its bar. (The second fails
  too: R16, R17 and R18 change `src/`, and none was filed by `8ec3458e`.) Every dimension is scored afresh; none carried.
- **Commit judged:** `e7437a5744d70ec34ca653b93108ffde5927b51f` (HEAD at the start, `critic/c32_commit.txt`).
  **Date:** 2026-11-04.
- **What changed since run 31** (`git diff --stat 4c546398 HEAD -- src data public`: 46 files): nation traits made
  state, shown and set by God, and made to act (R16a, R16b; save format 1 → 2); landings the player orders, with
  transports called, convoys, the voyage shown and an escort (R17a–d); blocks of one side's stacks kept apart (R18);
  SPEC rewritten to the code (R6); the gate runs the e2e suite on a moved pin (R19, gate only: nothing to play).
- **Build:** `vite build --outDir critic/c32_dist`, exit 0 (`critic/c32_build.log`), served by `vite preview` on
  127.0.0.1:**5299**. Chromium through Playwright, headless; desk 1600 × 900, phone 390 × 844 (touch, DPR 2).
- **Baseline:** run 31's own files (`critic/c31_*`, commit `4c546398`). R16b and R18 moved the pin twice, so every
  seeded 1938 world differs from run 31 by design: no probe can be "identical". Run 31's counts are compared as
  aggregates over the **same seeds with the same script** (`c31_ho.ts`, ten seeds × 20 years, heroes off and on;
  `critic/c32_ho_cmp.txt`); page cases are re-run and read for whether the defect they named is still there.
- **Runs:** 37 headless jobs six at a time (`critic/scripts/c32_jobs1.txt`, `critic/c32_jobs.log`, every one exit 0),
  15 trait A/B runs (`c32_jobs_trab.txt`), page suites A, B, C (`critic/scripts/c32_suite{A,B,C}.sh`) and new probes:
  `c32_lp_landing.mjs` (a landing ordered in the page), `c32_lh.ts` / `c32_lh2.ts` (the same, headless, hour by hour),
  `c32_tr_traits.mjs` (traits on desk and phone), `c32_trab.ts` (do traits move a war), `c32_ot_oldtraits.mjs` (an older
  save on HEAD), `c32_sk_stacks.mjs` (R18's scene at T3), `c32_sw_hang.mjs` (a refused order over the sea, by real
  clicks), `c32_gold.ts`, `c32_swe.ts`, `c32_cellwho.ts`, `c32_comp.ts`, `c32_cells.ts` (helpers).

## Verdict

**One blocking issue: a landing the player orders on the coast of a nation it is not at war with — an ally, a neutral —
is carried out, told "Landed", and the next day the division is put back at its own capital, across the sea, with
no word.** Britain's divisions landed at Calais are in London by the next midnight; a US division that sailed 17 days
to Calais is back in Washington 15 hours after landing; a British division landed in Norway is back in London. The
order that the land march refuses (France is closed ground to a British march at peace), the sea order accepts, and
the daily repatriation rule then undoes it by a jump (R32-B1). R17's own first AT case was "ordered to land in France".
**Naval warfare drops to 7, under its bar.** Every other score holds at its bar; none rises.

What the batch does well, verified: the rule checkers are 0 broken on every new seed (5 diploInvariants runs, 6
worldInvariants runs of 5–20 years, heroWaits 9001); worker and save determinism hold with a convoy at sea; R18's
blocks keep clear on the named seed and a new one; traits read on every nation panel and God sets them; a landing at
war (Japan on Shanghai) runs through every state the panel promises.

## Scores

| Dimension | Run 31 | Run 32 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | rescored: R18's blocks clear at T3 (1212, 4111); the voyage's dashed sea leg reads. Not 8: R31-N1 (Japan's heroes under the Ranking panel at a desk) unchanged on 5521 |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | rescored: diploInvariants 0 broken on 3517 (heroes), 9137 (random), 2203 (random world), 6421, 1201; worldInvariants 0 broken (3517 × 20 y, 9137 random × 20 y, 2203 world × 5 y, 6977 bankrupt × 20 y). Traits shown and set. Not 8: run 31's list (R30-N6: bond exit, guarantees, Force war rows, refused peace untold) was not re-run, nothing in the batch touches it; R32-B1's two rules disagree (counted under naval) |
| Emergent world dynamics over long runs | 7 | 7 | rescored: same ten seeds, heroes off, 20 years: wars declared +20 ± 9, capitals taken +29 ± 11, revolts +15 ± 10, nations alive at year 10 +5.4 ± 1.4, nuclear bursts 5.9 → 13.2 (+7.3 ± 3.2); no great power dies more. A busier world. Not 8: defaults still never happen in AI play (0 in 3 seeds × 20 years), sea heroes still die every few months |
| God Mode | 7 | 7 | rescored: the new trait boxes work and are kept by a save (desk and phone); Militarist ticked greys Pacifist, a clashing mask is refused "Not done: those traits exclude each other." (`critic/c32_tc_3517.json`, `critic/shots/c32tc_3517_clash.png`); Q, K, K2, K3, A run. Not 8: a trait's effect is not shown anywhere a player can check it (below) |
| Editor and scenarios | 7 | 7 | rescored: a scenario file made before R16a (run 25's) is now refused, "made by an older version of Warism, and this one cannot start it" (decided, ADR on save format 2; design objection). G probe times out as in runs 29–31 (probe side) |
| Stats and history | 7 | 7 | rescored: year-20 History 3,714 events, opens in 158 ms, 29 kinds; CSV/JSON export whole. Not 8: nothing new in the batch; the teleport of R32-B1 leaves no row |
| UI/UX and polish | 7 | 7 | rescored: the landing's tooltip, status, sea leg and escort box work in the page; traits read on desk. Not 8: a trait's description is a hover title only, unreadable by touch; refusal toasts cut their reason ("not done: there is no …"); R31-N6 items unchanged (graph's first tap after a drag eaten, a hero hides the fleets under it) |
| Performance | 7 | 7 | rescored: the ten-year page watch of 6151 with nothing else running: 59.9–60 fps every year, longest gap 83 ms, 290 s (run 31's quiet watch: 283 s, 83 ms); the loaded watch of 3517 with heroes 59.8–60 fps, longest gap 117 ms; PF on HEAD's year-20 save 60 fps at 3,000 and 1,200 m/px. Not 8: no phone-class device measured, nothing in the batch changes a frame's cost |
| Stability | 7 | 7 | rescored: no page error in any game probe; 37 headless jobs + 15 A/B runs, none crashed; save mid-voyage reloads to the same hash; an older save is refused cleanly. The landing probe's page crashed ("Target crashed") twice with six sims and two browsers beside it; re-run alone it did not (Notes) |
| Semantic zoom to unit level (needs 8) | 8 | 8 | rescored: Z on new seed 3517 (elements from 1,573 m/px, men from 28 m/px), PHZ on a phone (2671, six tiers 30,000 → 25 m/px, no horizontal overflow, `critic/c32_phz_2671.json`), C on new seed 6421 (German armour on Poles at 15 m/px, every tank drawn), R18's blocks at 60 m/px |
| Naval warfare (needs 8) | 8 | **7** | **R32-B1**: a player's landing on a non-enemy coast is undone overnight by a jump home. Otherwise: navy and heroes rules 0 broken over 20 years (4637, 3517); sea battles with heroes on +46 ± 10 against run 31's ten seeds |
| Tanks (needs 8) | 8 | 8 | rescored: C 6421 and 7019, armoured divisions fight at T3; R16b's `armorAttack` acts (unit-tested); FW2 runs |
| Aircraft (needs 8) | 8 | 8 | rescored: air rules 0 broken over 20 years on 3373 random (heroes) and the full rules on 3517 and 9137; W 7019 (fighter followed, marks on 55 of 60 samples) |
| AI nuclear use (needs 8) | 8 | 8 | rescored: two AI strikes met in the page on 7019's year-20 save made on HEAD ("China struck United States with an atomic bomb near Belfast: 54,000 civilians killed", then a hydrogen bomb on Iceland), each alerted, Go to on the burst; bursts per 20 years up from 5.9 to 13.2 over the ten seeds |

## R16–R18, case by case

### R17, landings the player orders
| Case | Result | Evidence |
|---|---|---|
| LP, 3517, Britain played, three divisions by London, real hover and left-click on Calais, escort box | Box shown, ticked by default; the tooltip says "Your selected forces go by sea: they board transports at a port"; panel states toPort (Portsmouth) → atSea → landed; dashed sea legs drawn from Portsmouth's water to Calais | `critic/c32_lp_eng_calais.json`, `critic/shots/c32lp_eng_calais_hover.png`, `critic/shots/c32lp_eng_calais_h66.png` |
| …the first division landed at Calais (h66) | **at London by h84**, still selected, no notice, no ticker row; the other two land at h99 and are **at London by h120** (re-run alone, the same course) | `critic/shots/c32lp_eng_calais_h84.png`, `critic/shots/c32lp_eng_calais_quiet_h120.png`, `critic/c32_lp_eng_calais_quiet.json` |
| LH (headless), the same orders hour by hour | 270 lands at Calais t74, stands there until t95, **at London (1023.3, 275.2) at t98**: the day start's `repatriationSystem` (`foreignTo(ENG, FRA)` is true: France is not Britain's bloc, not at war beside it), no land way home, so `c.x = spawnPoint` (`movement.ts` 637). 271 and 274 land t99, the same at t120. Belfast (Britain's own land) keeps its division | `critic/c32_lh_3517.json`, `critic/scripts/c32_cellwho.ts` (holder FRA, foreign true) |
| LH2, USA played, a division by New York to Calais | boards t324, 17 days at sea, lands t730, **at (585.9, 364.2), the US spawn, at t745** | `critic/c32_lh2_usa_calais.log` |
| LH2, Britain to Bergen (Norway, neutral) | lands t135, marches to Bergen t180, **in London at t193** | `critic/c32_lh2_eng_bergen.log` |
| LP, Japan (at war with China) to Shanghai, two divisions, escort | each through toPort/atSea/landed, and they stay and fight on; but **the one click's two divisions land 16 days apart** (h123 and h510): one boarded at Tokyo at once, the other marched to Matsuyama for another group | `critic/c32_lp_jap_shanghai.json`, `critic/shots/c32lp_jap_shanghai_h510.png` |
| Netherlands (no transports) to Java | refused `NoTransports` (6) | `critic/c32_lh2_ned_java.log` |
| Escort (headless) | three escorts made (one per new convoy), each gone once its convoy is ashore; released, the player's groups go back to the AI within 30 days (R17's "Also" causes nothing seen) | `critic/c32_lh_3517.json` |
| Save at the first hour aboard (t54), two loads × 200 h | same hash both (3,455,707,383) | `critic/c32_lh_3517.json` (`saveMid`) |
| workerDeterminism 3517, 2,190 h, four arms | all `7e113d94` | `critic/c32_wd_3517.log` |
| Selection by a real click (Sweden) | header "Playing Sweden · 1 selected" (the "0 selected" in LP's shots is the probe's API selection, not a defect) | `critic/c32_sw_swe.json`, `critic/shots/c32sw_swe_sel.png` |

### R16, traits
| Case | Result | Evidence |
|---|---|---|
| TR desk, 12 nations | chips on every great power (Germany: Militarist, Industrial, Armoured doctrine; Soviet Union: Industrial, Mass mobilisation, Revolutionary); Turkey none; each with its description as a hover title | `critic/c32_tr_desk.json`, `critic/shots/c32tr_desk_GER.png` |
| TR God (Poland) | boxes; Armoured doctrine and Fortifier ticked; the panel then shows three chips; an out-of-range mask refused "a value is out of its range"; save and load keep the traits and the hash (946,992,852 both) | `critic/shots/c32tr_desk_god_after.png`, `critic/c32_tr_desk.json` |
| TR phone | the chips show; **their descriptions are `title` only — a touch cannot read them** | `critic/shots/c32tr_phone_GER.png`, `src/ui/NationPanel.tsx` 173 |
| TRAB, Germany on Poland (90 days) and on France (120 days), three seeds: Poland + Fortifier, Poland no traits, Germany no traits | no direction survives the chaos of one war: Poland holds 420 / 759 / 583 cells with Fortifier against 672 / 1,133 / 490 without at day 90; Germany without traits takes **more** of France on two seeds of three. Not a defect (R16b's unit tests isolate each modifier), but a player cannot see a trait act | `critic/c32_trab_*.json` |
| An older save (run 31's 7019 year 20) | refused, "missing section nations.traits" (by decision; the title says "from an older version") | `critic/c32_ot_c31y20.json` |

### R18, blocks of one side's stacks
| Case | Result | Evidence |
|---|---|---|
| SK, 1212 (R18's scene), Soviet Union on Poland from hour 1, day 20, 60 m/px | the closest Soviet pairs (0.14 cells apart) drawn as separate blocks; none inside another | `critic/c32_sk_1212.json`, `critic/shots/c32sk_1212_0.png` |
| SK, new seed 4111, day 30 | the same | `critic/shots/c32sk_4111_1.png` |

## Run 31's cases re-run

| Run 31 case | On HEAD (`e7437a57`) | Evidence |
|---|---|---|
| R31-N1, HF desk 5521 (Japan's heroes under the Ranking panel) | **Unchanged**: 12 of 14 reached, Yamato and O-I open Anglo-Egyptian Sudan | `critic/c32_hf_5521_desk_d0_0.json` |
| HF 7019 day 730 desk (O-I, Sovetsky Soyuz under the panel) | 11 of 11 (another world since R16b; not a fix) | `critic/c32_hf_7019_desk_d730_0.json` |
| HF / HFT phone 5521 | 10 of 10; folds reached by touch | `critic/c32_hf_5521_phone_d0_0.json`, `critic/c32_hft_5521.json` |
| R31-N2 (two nations' hero counters overlap, "Ma") | HWP 4637 at tick 132,000 is another world now (Richelieu "returns in 21 days"); not met | `critic/c32_hwp_4637_fra.json` |
| R31-N3 (no default in AI play) | **Unchanged**: 0 defaults, 0 collapses, 3 seeds × 20 years. DF 7019 (God sets Poland −800) no longer defaults within 220 days: Poland takes Lithuania on day 56 and climbs back (−674 → +236 by day 220, `c32_gold.ts`) | `critic/c32_def_*.json`, `critic/c32_df_7019_pol.json` |
| R31-N4 (sea heroes lost often) | **Unchanged/worse**: Sovetsky Soyuz 46.7 losses per 20 years (run 31: 33.5), waits past its hour 1,237 days over ten seeds (run 31: 0); Hood 29.4, Bismarck 28.4, Roma 27.3, Richelieu 29.2 | `critic/c32_ho_sum.txt`, `critic/c31_ho_sum.txt` |
| R31-N6, RGT (graph's first tap after a drag) | **Unchanged**: tap 1 after the drag opens nothing, tap 2 opens Syria | `critic/c32_rgt_4111.json` |
| R31-N6, HS 3739 (a hero hides the fleets under it) | **Unchanged** | `critic/c32_hs_3739.json` |
| HO, ten seeds × 20 years, heroes off / on | Off: above (Emergent). On: sea battles 346.7 → 392.6 (+46 ± 10), the rest within noise | `critic/c32_ho_cmp.txt` |
| AN with run 31's saves (7019 y20, 6299 y18) | refused (save format 2); re-made on HEAD: two strikes on 7019 y20 (above); 6299's HEAD save (1947) none in 400 days | `critic/c32_an_7019y20.json`, `critic/c32_an_6299y18.json` |
| HI / DL on a HEAD year-20 save | 3,714 events, 158 ms; CSV 3,716 lines | `critic/c32_hi_7019.json`, `critic/c32_dl_7019.json` |
| Checkers on run 31's seeds (4637 heroes+navy 20 y, 3373 random air 20 y, 6977 bankrupt 20 y, heroWaits 9001) | 0 broken each | `critic/c32_wi_4637_h20_hn.log`, `critic/c32_wi_3373r_h20_air.log`, `critic/c32_wi_6977_h20_bk.log`, `critic/c32_herowaits_9001.log` |

## Blocking issues

1. **R32-B1. A player's landing on a non-enemy coast is undone by a jump home the next day.** Seen in the page (3517,
   Britain, Calais: `critic/shots/c32lp_eng_calais_h66.png` landed, `..._h84.png` at London) and headless on three
   cases (`critic/c32_lh_3517.json`: Calais t74 → London t98; `critic/c32_lh2_usa_calais.log`: a US division 17 days
   at sea, landed at Calais t730, at Washington t745; `critic/c32_lh2_eng_bergen.log`: Bergen t180 → London t193). The
   order goes through `seaConvoy` (R17), which checks only `hasLanding`; at the next day start `repatriationSystem`
   finds the division on ground `foreignTo` its nation (France is not Britain's bloc nor its co-belligerent), finds no
   land way home, and sets its place to the nation's spawn point. No notice and no ticker row (the probe read both each
   3 hours); the panel had said "Landed". The land rule on the same kind of ground refuses: Sweden's division ordered
   to Copenhagen (Denmark at peace, reached over the Øresund crossing) is `MoveRejected` "no way by land that keeps off
   the ground of nations outside its wars" (`critic/c32_sw_swe.json`, `critic/scripts/c32_swe.ts`); Britain's division
   ordered to Bergen (Norway at peace) over the sea is accepted, lands, and is jumped home. So the two orders
   disagree. SPEC §3.5 (752–757) specifies the march home and the set-down at the spawn point "only where no land leads
   there", and §6.2 (1251–1252) that a beachhead on a neutral's cell "goes back to its owner"; neither covers a
   player's landing on such ground, which R17 accepts and shows as done (R17a's AT names "ordered to land in France"). **Fix:** refuse a player's order over the sea whose landing is on
   ground `foreignTo` the nation (say why, as the land march does), or let `seaConvoy` count such a landing as the
   march home's and keep the division where it landed under its order, and never move a land formation across the sea
   without its transports; tell any repatriation in the formation's panel.

## Non-blocking issues
1. **R32-N1.** One click's divisions do not always sail together: Japan's two for Shanghai landed 16 days apart, one
   boarding at Tokyo at once while the other marched to Matsuyama for another group (`critic/c32_lp_jap_shanghai.json`);
   Britain's three for Calais landed in two waves (`critic/c32_lh_3517.json`). For Britain this is SPEC §6.2's order
   of choice (the first group full with two, the third takes a standing group before a full convoy's next voyage);
   for Japan the cause (room or port) was not traced. Either way the player sees one click land as two expeditions
   weeks apart, which ROADMAP R17b's "sail as one convoy" does not prepare them for.
2. **R32-N2.** A trait's description is reachable only by hovering (`title`); on a phone the chips are names with no
   meaning (`critic/shots/c32tr_phone_GER.png`). Nothing in the game shows a trait act (A/B: `critic/c32_trab_*.json`).
3. **R32-N3.** A refusal toast cuts its reason: "Cadre infantry division 860: not done: there is no …"
   (`critic/shots/c32sw_swe_click.png`).
4. **R32-N4.** Unchanged from run 31: Japan's heroes under the Ranking panel at a desk (R31-N1); the graph eats the first
   tap after a drag; a hero hides the fleets stacked with it at T1; run 30's diplomacy list; no default in AI play.
5. **R32-N5.** Sea heroes die more: Sovetsky Soyuz 46.7 times in 20 years over ten seeds (run 31 33.5), 1,237 days
   waiting past its hour (run 31 0) (`critic/c32_ho_sum.txt`).

## Design objections (none blocking, no score lowered)
- Save format 2 (R16a) refuses every older save **and every older scenario file**: run 25's editor scenario now reads
  "made by an older version of Warism, and this one cannot start it" (`critic/c32_os2_c25.json`). A scenario is the
  player's own work; a missing column with a default (no traits) could load.
- Repatriation by a jump to the spawn point (ADR-169, older than this batch) was a corner case while only the AI moved
  armies over the sea; with R17 it is a player's everyday result (R32-B1).
- Run 31's objections stand.

## Ideas from other games (not scored)
- Hearts of Iron-style "military access" asked of a neutral or an ally before a landing on its coast, so that an
  expedition to a friend's shore is a diplomatic act with a visible yes or no.
- A trait's effect listed with its sources in the nation's economy and combat panels (e.g. "+15 % ship fire:
  Naval tradition"), as Europa Universalis shows modifiers.

## Notes
- The landing probe's page crashed twice ("page.evaluate: Target crashed", `critic/c32_lp_eng_calais_loaded.json`),
  both with six headless sims and two other browsers running (the first also when its runner was stopped). Re-run
  alone at the end (`critic/c32_lp_eng_calais_quiet.json`): no crash, no page error, the same course, and at h120 all
  three divisions landed at Calais stand in London, "37.1k ×3" (`critic/shots/c32lp_eng_calais_quiet_h120.png`).
  Counted as the machine's load, not the build.
- Quiet ten-year watch: `critic/c32_lwquiet_6151.json` (run after every queue ended).
- `c32_lp_landing.mjs` read the notice with Playwright's default 30 s wait, so each 3-hour step of its first runs took
  up to a minute; fixed in the script (500 ms) before the Japan case. The Sweden and Netherlands page cases were cut for
  it and done headless instead (`c32_swe.ts`, `c32_lh2.ts`). The probes' Brest and Tripoli cells were water or on the
  same land as the source; not used.
- `same: false` in the save probes compares two objects (`sim.hash()` returns `{tick, hash}`); the hashes are equal.

## Strengths, verified
- **The rules agree where the checkers look:** 0 broken over 5 new diploInvariants seeds and 6 worldInvariants runs
  (up to 20 years, random diplomacy, random world, bankrupt nations), and the worker and a save at sea reproduce the
  hash exactly (`critic/c32_wd_3517.log`, `critic/c32_lh_3517.json`).
- **A landing at war is a real feature now:** Japan's order on Shanghai goes from a click through the tooltip's "by
  sea", the panel's port, sea and landed, a drawn sea leg and an escort that goes home after, and the divisions fight
  on ashore (`critic/c32_lp_jap_shanghai.json`).
