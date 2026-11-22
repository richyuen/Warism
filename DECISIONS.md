# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

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

