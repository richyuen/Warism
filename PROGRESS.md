# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-20`.

## 2026-11-22 — The map frozen on an iPhone: a lost WebGL context (ADR-1151)

- The user's report: on an iPhone the map stopped scrolling while its names went on. The WebGL context lost (iOS under
  memory pressure) was never handled. Now the game saves and boots again from the save at the same view;
  `contextLost1938.spec.ts` green (chromium). Not reproduced on a device here: the loss is forced with
  `WEBGL_lose_context`.

## 2026-11-22 — Less GPU memory on a phone (ADR-1152)

- The user's decision after ADR-1151: on a touch screen the WebGL map at most at 2 px per CSS px and no kept frame; the
  names at the screen's px. `phoneGpu1938.spec.ts` green (an emulated iPhone at 3 px: map 2, names 3, no kept frame, the
  map on the screen; a desk unchanged); the touch-emulated specs run again: 43 of 49 green; the 6 red (heroes1938, landingMarkMore1938, desk cases among them) red on the commit before too, here (7 there).

## 2026-11-25 — The iPhone fix finished: what was open comes back after a lost context (ADR-1153, branch)

- On branch `fix/iphone-context-keep-view`, not on main. A lost WebGL context now keeps the selected nation, the
  formation's panel, the played nation's selected formations, the top-centre panel and the God tab with the camera.
  Typecheck, lint, `viewAfterLoss.test.ts` 4/4 and the build green. `contextLost1938.spec.ts`'s new test and the six red
  touch specs of 2026-11-22 not run: no browser in the container this was made in.

## 2026-11-26 — No hidden figures at close zoom in the ball look (ADR-1154, branch)

- On branch `fix/iphone-context-keep-view` (pull request 7), not on main. The ball look no longer builds and uploads the
  T3 figures it never draws. Typecheck, lint and the build green; `countryballs1938.spec.ts`'s new check and the
  adapted wait in `heroes1938.spec.ts` not run: no browser in the container.

## 2026-11-26 — The branch's browser specs on the user's PC

- The user ran `contextLost1938`, `countryballs1938`, `heroes1938` and the touch specs (touchMenu, landingsBarPanel,
  phoneLayout, landingMarkMore, traitsTap, relationsTap, phoneGpu) on chromium: 67 of 68 green, the six touch reds of
  2026-11-22 among them. Red: `contextLost1938`'s first test read the camera when the save's tick was on the HUD, before
  the boot had set it (the start view, cx 1024 for 1064): it now waits for the kept view to leave sessionStorage, which
  the boot does in the same task as it sets the camera. Not run again here: no browser.

## 2026-11-26 — The deploy waits on typecheck and lint; the records alone deploy nothing (ADR-1155, branch)

- On branch `ci/gate-deploy-and-slim-checkout`, not on main. `pages.yml`: a typecheck-and-lint job the deploy needs,
  no deploy for a push of Markdown, docs/ or critic/ alone, checkouts without docs/evidence and critic/, the v5 Pages
  actions. PROMPT.md step 9 and ROADMAP.md's rules: the tick in the item's own commit, no hash commit. Typecheck and
  lint green; the build from the sparse tree (63 MB) green here. The workflow itself first runs at the merge.

## 2026-11-26 — Three browser specs wait for the view's state, not for seconds (ADR-1156, branch)

- On branch `test/frame-count-timing`, not on main. `shipMarks1938` and `fightSeen1938` wait for the section of their
  zoom and for rest (`settleAtZoom`), in place of 1.5 s and of "5 s at most, then 400 ms"; `cityNames1938` watches 120
  frames and 100 ticks of the running game in place of four seconds. Typecheck and lint green; the specs not run: no
  browser in the container. Their `knownRed.json` entries stay until a SwiftShader run shows them green.

## 2026-11-26 — The known reds green on SwiftShader on the user's PC; the list emptied (ADR-1156, branch)

- The user ran the 11 files of `tools/gate/knownRed.json` on branch `test/frame-count-timing` with
  `E2E_RENDER=software` (chromium, 4 workers): 22 of 22 green in 8.0 min. `shipMarks1938` at 20 m/px: destroyers 18 px
  (7 ships), cruisers 24.5. `cityNames1938`: 120 frames, 1,388 and 1,349 ticks, no jumps. The list is emptied and
  shipMarks1938's BLOCKERS entry moved to `docs/BLOCKERS_DONE.md`.

## 2026-11-26 — A profile of release-2026-11-20; Batch 60 filed (the user's decision)

- The user asked what could be faster, compromises allowed. Measured on `bc9fa5ed` (i7-13700KF, RTX 4070 Ti), the
  release's commit: this checkout was nine commits behind `main` (to `d547cda1`), none of them in `src/sim`,
  `src/worker` or `src/shared`, and the batch is rebased onto them. Seed 99 × 25 years by system (the sim's
  `--profile`, on 0xFFFF): mean 1.75 ms a tick, year 1 2.77, the quietest 0.93, year 19 (at peace) 2.66 with
  `strategicAi` 2.10. In an esbuild bundle, as the game is built (tsx read 2.30 ms for its 1.97 over three years, one
  pair), the first five years: the AI's layers about a third (operational 15 %, strategic 7, air 5, economic 4,
  invasion 3), combat 15, air 10, supply 10, movement 9, territory 6; year 1 by function: none over 6 %.
- Max in the page (`maxStalls 99 - 2`): 290 and 363 ticks a second in years 1 and 2, about 70 % of the bundle's own; a
  trial with the worker's next slice by a message, each build twice: 30.2 → 25.2 s and 24.2 → 20.2 s, 60 fps kept.
- Trials in a scratch worktree, two years, arms at once: no fire records −3.3 % (combat −22 %, the same hash); the
  operational AI's turn every second day, `operationalAi` 0.39 → 0.22 ms (another world); each element firing every
  second or third hour, within a diverged world's noise (±3 %). The S map slower than M (2.63 against 2.31 ms,
  `farPoint` 28 % of S). The month's first hour 92 to 109 ms (`tickMax` on year 2: economicAi about 50, economy 30).
- Filed as Batch 60 (R225 to R228): the four that change no rule. The compromises (the army AI's cadence, the month's
  accounts by nation, fewer formations, render settings for weak machines) are the user's to choose and are not filed.

## 2026-11-26 — R225: a massing's refused formations are not searched for again every day

- Seed 99's year 19 (at peace, five nations massing most of the year): `strategicAi` 2.13 → 0.56 ms a tick, the tick
  2.9 → 1.3, the same hash (`2cbef30d`); three-nation worlds' hashes the same. Two causes: R224's second ask replaced
  the one refused cell the memo kept (now each is kept), and a formation on the march keeps no memo, 3,442 of the
  year's 5,743 searches (now refused from a region another's search walked that day, `keepRegions`).
- Left in that year's `strategicAi`: the routes found (1,421 orders), each region's first refusal, and `massPoints`,
  `homeByLand` and `borderOnLands` (about 0.2 ms together). `npm run check` green on the rebased tree.

## 2026-11-26 — R226: at Max the worker's next slice comes by a message, not a timer (ADR-1157)

- `maxStalls 99 - 2`, each build twice: year 1 31.2 → 25.2 s, year 2 24.1 → 20.1 s (347 and 435 ticks a second for 280
  and 363), 60 fps kept. `maxLoop1938.spec.ts` (new) 16 of 16 under eight workers; the whole browser suite on the GPU
  551 of 551 (11.6 min), run by hand: the worker's entry is under every spec, and the gate runs only changed specs.
- The spec's first form held the pause to 250 ms of the wall and was red once in eight under eight workers (357 ms, with
  3 ticks run); it now counts ticks and frames, as ADR-1156 has it.

## 2026-11-26 — The gate's test of the known reds takes the emptied list

- `gateReview.test.ts` asked for a list of known reds longer than none; `d547cda1` emptied it (ADR-1156), so the unit
  suite run in full was red on `main` from then (found by R227's gate, the first to run it in full: a change of
  `tests/helpers/aiSweep.ts`). It now asks for a list, and of each entry what it asked before.

## 2026-11-26 — R229: `settleAtZoom` asks again for the section of a camera at rest

- R227's run of the whole browser suite read 549 of 551: `relationsTap1938`'s footer test timed out at its boot under
  eight workers (green alone, as at the release) and `fightSeen1938`'s Japan case timed out in `settleAtZoom`, alone
  too. Not R227's: 3 of 3 red on the commit before it, 1 of 3 on `d547cda1`, the remote's head before this batch. The
  trace: the camera at rest at 20 m/px, the section taken at 19.7, the subscription's key the one last asked with.
  The helper now sends the view's subscription again in that state. `fightSeen1938` × 5: 10 of 10.

## 2026-11-26 — R227: the sim makes a fire record only while a reader wants it (ADR-1158)

- Combat −22 % and the tick about −3 % in seed 99's first two years with no view drawing elements (the hash the same);
  the records with a reader the same as before, number for number, in three windows with land, naval and bombardment
  fire. The switch is the reader's (`FireLog.wanted`); `npm run sim`, the sweeps, the soak and the replay's build run
  with it off, so their tick is the world-zoom page's.
- The AT asked for the comparison with HEAD's records as a unit test; kept as a one-off read (a hash of records in a
  test is a second pin that every combat rule would move), and the kept test holds a reader against none.
- The whole browser suite on the GPU: by hand 549 of 551 (R229's case, and `relationsTap1938`'s boot under eight
  workers); in the gate's run with R229 550 of 551, `relationsTap1938` green alone, as at the release.

## 2026-11-26 — R228: the S map's water points are kept, and the mask's search is cheaper

- Three years of seed 99 at S: 2.5 → 1.57 ms a tick, the same hash; S was slower than M (2.63 against 2.31 at the
  profile) and is a quarter under it. M itself 2 to 3 % less. `World.seaPoint` keeps a coastal cell's point as
  `cellPoint` keeps the land's; `farPoint` no longer reads the mask through `maskBit` for every pair of pixels.
- A mask is shared by the worlds made on it and `addIslet` writes to it: it counts its changes now (`version`), and
  the kept water points go with a change. `cellPoint`'s kept land points are as they were (no such guard; not touched).
- The first gate run on it ended green with `worldTemplate.test.ts` never run: its worker ran out of memory comparing
  the new kept points (they hold the mask) as a field outside the state. Mended in the test's list of derived fields;
  the gate's blind spot for a crashed file is filed as R230, open. The second run: every file, no crash.
- Batch 60's four items and R229 are done; R230 is open. The critic and a release when the user wants one (ADR-1139).
