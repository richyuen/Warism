# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

## ADR-1154 · 2026-11-26 · proposed · The ball look builds no T3 figures

- **The case** (the user asked whether cutting close zoom would speed the game up; he said yes to this fix). The
  countryballs are one ball an element at T2 and at T3 (SPEC 8.2, PLAN 7.174c), and their draw never reads the figures.
  `MapView.tierShares` built them anyway in the frame the close tier came in, up to `MAX_INDIVIDUALS` (60,000), and
  uploaded them: CPU time and GPU memory spent at close zoom for nothing, in the default look and on a phone.
- **Decision.** In the ball look no figures are built; figures built in Classic before a switch are let go (count and
  turrets 0), and a switch back builds them again from the kept section. The close tier's share follows the zoom alone
  in the ball look, as it did whenever figures were built, so the layers that read it (sorties, air, sea marks, hulls,
  ship sizes) are unchanged. A shot at T3 in the ball look now leaves its element's slot, as at T2, not the muzzle of a
  figure that was never drawn.
- **Consequences.** `countryballs1938.spec.ts` checks no figures are built at 15 m/px; `heroes1938.spec.ts`'s wait for
  T3 no longer asks for figures in the ball look. Typecheck, lint and the build pass; neither spec has been run: written
  in a container with no browser.

## ADR-1153 · 2026-11-25 · proposed · A lost WebGL context keeps what was open, not only the camera

- **The case** (the user, after ADR-1151: "finish the iPhone fix"). ADR-1151 boots again from the save at the camera
  the player had, but the selected nation, the formation's panel, the played nation's selected formations, the open
  top-centre panel and the God tab were gone: on a phone the player was back on a bare map.
- **Decision.** `onContextLost` keeps them with the camera in sessionStorage (`warism.viewAfterLoss`,
  `src/app/viewAfterLoss.ts`; a bare camera kept before this is still read). After the boot from the save: the camera,
  the nation selected, the formation's panel asked again, the one top-centre panel (charts, History, Relations,
  Settings or the editor) and the God tab. The selected formations are given back only once the sim says the same
  nation is played again (`PlayerControl.restoreSelection`), after the first count's `clearSelection`; given up after
  30 s. The save the boot loads is the one the loss wrote, so the ids are its own; a nation dead or a formation gone is
  let go by the rules that already do it (PLAN 2.17e3, `refreshFormation`, the snapshot's selection check).
- **Not kept.** The time-lapse (it pauses the game and is opened from History), a nation panel's tab, hover and tooltips.
- **Consequences.** `tests/e2e/contextLost1938.spec.ts` has a second test (nation, formation panel, two selected
  formations, History, God Mode through a forced loss); `tests/unit/viewAfterLoss.test.ts` reads the kept value. The
  e2e test was written in a container with no browser and has not been run yet.

## ADR-1152 · 2026-11-22 · accepted · A touch screen's map at most at 2 px per CSS px, and no kept frame (the user's decision)

- **The case.** ADR-1151 makes a lost WebGL context recoverable; it does not make it rarer. iOS takes the context under
  memory pressure, and the map's drawing buffer is the largest thing in it a frame: an iPhone's screen at 3 px per CSS px
  (1179 × 2556), kept a second time by `preserveDrawingBuffer`.
- **Decision** (the user chose both, 2026-11-22). On a touch screen (`(hover: none) and (pointer: coarse)`: phones and
  tablets) the WebGL map is drawn at most at PHONE_GL_DPR = 2 px per CSS px (`MapView.glDpr`: the canvas, the map's,
  the ground's and the sprites' passes), 2.25 times fewer px on an iPhone; and its context keeps no copy of the frame
  (`preserveDrawingBuffer: false`). The names' and flags' 2D canvases keep the screen's own px: text stays sharp. The
  screenshot (`captureMap`) draws in its own task, as it did, and composes at the names' px, the map stretched to them.
  A desk keeps both as before: its tests read the map's pixels after a frame.
- **Consequences.** On a phone at 3 px the map's colours and borders are a little softer than its names; at 2 px or
  less nothing changes but the kept frame. `tests/e2e/phoneGpu1938.spec.ts` reads both on an emulated iPhone and a desk.

## ADR-1151 · 2026-11-22 · accepted · A lost WebGL context saves the game and boots again from the save

- **The case** (the user, on an iPhone): after a while of play or zoom the map stopped moving while the nation and city
  names went on scrolling. The map is drawn with WebGL; the names are on 2D canvases of their own. iOS Safari takes a
  page's WebGL context away under memory pressure (and with the page in the background), and the view never listened
  for `webglcontextlost`: every GL call after it did nothing, and the last picture stayed while the names moved.
- **Decision.** `MapView` takes the event (`preventDefault`), stops its WebGL passes and calls `onContextLost`. The game
  (`game.tsx`) saves the autosave and boots again from it (`continueUrl`, as the title screen's Continue), at the
  camera it had (sessionStorage), once the page is shown. Before the game has started (world still building) it only
  reloads: a save then could overwrite the player's autosave with a world not yet loaded. Not a rebuild of the GPU
  state in place: the map's textures come from a dozen messages of the sim and the assets, each to be kept and sent
  again, and a page booted afresh has them all by the path every game already takes.
- **Consequences.** The player sees the game load again, at the same day and view, in place of a frozen map; the
  selection and open panels are not kept. `tests/e2e/contextLost1938.spec.ts` loses the context (`WEBGL_lose_context`)
  and reads the tick and the camera after the boot.

