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
