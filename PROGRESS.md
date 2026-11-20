# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-19`.

## 2026-11-19 — R200: a narrow desk folds the legend and shows a war in every map mode

- At 800 px or less the desk's legend is folded to its title; the band measured at a banner's height; a crossing case.

## 2026-11-19 — R201: the empty relations graph says it is empty

- "Truces hidden · No ties of these kinds." with every kind hidden; a crossing case.

## 2026-11-19 — R202: a wide desk keeps the war row on the bar's centre

- Centred whenever the banners the band holds fit there, the band's middle only when the centre costs a banner; a
  crossing case. Batch 54 done; the critic next (ADR-1138).

## 2026-11-19 — ADR-1139: non-blocking items before the release, judged at the next; the loop stops after a release

- The user's decision, on the never-ending release/critic cycle: a release run's non-blocking items are fixed before
  the tag with no critic run after them; the next release's run judges them as touched; after the tag the loop stops and
  asks what is next. PROMPT.md and CRITIC_PROMPT.md changed. Run 87 (running) is the first under it.

## 2026-11-19 — critic run 87 (focused, on bbf47bca): ADR-829's exit

- One blocking issue, R87-B1: on a narrow desk the legend R200 folds, opened, lies over the war row (a regression of
  R197's row clear of the legend). UI/UX 7; the rest 8 (diplomacyWarDepth, godMode, editorScenarios, statsHistory,
  performance afresh; emergentDynamics and stability by the rotation). Filed as Batch 55 (R203–R206); ADR-1140 proposed
  for the user. The loop stops until the user decides.

## 2026-11-19 — ADR-1140 (b) and ADR-1141: the supported sizes (the user's decisions)

- ADR-1140 (b): on a narrow desk the legend leaves the war row's band for the top left, as a phone's. ADR-1141: the
  supported sizes are the iPhone 16 (393 × 659 and 393 × 852 upright, 734 × 343 and 852 × 393 sideways, with and without
  Safari's bars) and a 1440p desk's window (2560 × 1305); only a defect there blocks. CRITIC_PROMPT.md changed; Batch
  55's items are non-blocking, done next.

## 2026-11-19 — R203: a narrow desk's legend at the top left, as a phone's (ADR-1140 (b))

- The phone's place and giving way for the folded legend on a desk of 800 px or less; its height ends above the war row
  (a phone on its side, 734 × 343: the opened sea legend lay over the row and the bar). `c87_legendOpen`, `c87_legendShot`
  and `c86_modeRow` 0 covered; a crossing case in `warBannerRows1938`, three in `landingsBarPanel1938`; run by hand:
  airControl1938, airMapRead1938, chromeCover1938, fallout1938, heroesClear1938, legendOccupied1938, mapModes1938,
  phoneLayout1938, reviewBatch1938, seaControl1938, seaLegend1938, tags1938, warBannerRows1938, landingsBar1938,
  landingsBarPanel1938. R206 not taken (one place and state in every mode). R207 filed: the landings' bar on the nation
  panel's × at 601 to 700 px.
- After it (the tick's commit): the first cue's rule back in the phone's block (24a04c8c moved it for a narrow desk on a
  reason the probe did not bear: the cue's edge at 150 px, the title's at 125); the tick names 24a04c8c; R208 filed: on
  the iPhone 16 upright the opened legend over the folded ranking's bar, as before R203. Also run by hand on the final
  tree, with the 15: contactLine1938, countryballs1938, editor1938, editorDrag1938, flagGone1938, formationFight1938,
  mapview, nukeRuins1938, nukeYield1938, shipMarks1938, wrecksHeld1938 (90/90). The replay of `c87_legendShot` wrote
  over the critic's two shots `c87ls_84901_700x800_fallout_opened.png` and `_back.png` on disk (the probe takes no tag;
  not in git): they now show the fixed build, the defect is in the report and its log.

## 2026-11-19 — R204: the desk's war row holds its side (ADR-1142)

- The side, the bar's centre or the band's middle, chosen when the band or the banners' number changes and held; a row
  that outgrows the centre gives a banner. `c87_rowJitter 87601 300`: `moves` 0 wherever `countCh` is 0; on 60 s
  passes moves with the count unchanged 11 → 0. R202's probes as then. Run by hand: the 14 specs that read the war row
  (barNarrow1938, chromeCover1938, director1938, landingsBarPanel1938, phoneLayout1938, ranking1938, reviewBatch1938,
  settings1938, tags1938, ticker1938, timeLapse1938, toBattle1938, warBannerRows1938, warToDeath1938), 72/72, the
  director's seed 7 alone after a load timeout. The replays of `c87_rowJitter` wrote over the critic's
  `c87_rj_87601.json` and its eight shots; both put back from copies.
- After it (the tick's commit): the case crosses the five supported sizes and back with a nation's panel and History
  opened and closed (ADR-1137 (d), ADR-1141), and says which branch its last stage took (a banner behind "+n", 2 banners
  0 px off); the tick names f63f45c8; `c87_rowJitter 84901 400`, a second seed: no move without its count's change;
  ADR-1142's option not chosen without its unmeasured width. The replay of `c86_deskAttack 84901 400 wide` wrote over
  the critic's run-86 shots `c86da_84901_d400_wide_*.png` on disk (the probe's shots take no tag; not in git).

## 2026-11-20 — R205: the empty relations graph without the left-out count

- "No ties of these kinds." alone with every kind hidden; the count of nations left out only beside ties shown. R201's
  case extended (1600 × 900, the count with ties); `c86_relSaid 84903 400` clean. Run by hand: heroesRead1938,
  relations1938, relationsTap1938.

## 2026-11-20 — R207: the landings' bar right of the nation panel on a narrow desk

- At 601 to 700 px the bar stood on the panel's ×; its middle now keeps right of the panel's edge by half its least width.
  Cases at 601, 640, 700, 800 and 1280 px in `landingsBarPanel1938`. Run by hand: the specs that read the landings' bar
  (landingHoldMark1938, landingMark1938, landingsBar1938, landingsBarPanel1938, research1938).

## 2026-11-20 — R208: an upright phone's ranking gives way to the opened legend

- At 393 px the opened legend lay over the folded ranking's bar; the ranking is hidden while the legend is open. The AT's
  "the ranking's toggle takes a tap while the legend is open" not met as written, by choice (the legend's title would
  move from under the tap). R203's case extended. Run by hand: airControl1938, airMapRead1938, charts1938,
  chromeCover1938, fallout1938, heroesClear1938, landingsBar1938, landingsBarPanel1938, legendOccupied1938,
  mapModes1938, nukeStats1938, phoneLayout1938, ranking1938, rankingFlags1938, rankingNames1938, rankingRows1938,
  relationsTap1938, reviewBatch1938, seaControl1938, seaLegend1938, settings1938, tags1938, warBannerRows1938 (95/95).
  Batch 55 has no open item.
