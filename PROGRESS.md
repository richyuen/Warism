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
