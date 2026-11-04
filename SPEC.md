# Warism — Specification & Architecture

Status: v1.0 (2026-11-03, after `release-2026-11-03`; ADR-805). This document says how the game works
now. The *why* of each choice is in `DECISIONS.md` and `docs/history/DECISIONS-<YYYY-MM>.md` (cited as
`[ADR-n]`). §1–§5 and §10 are current; the other sections are being brought up to date one by one
(ROADMAP R6), and where one disagrees with the code, the code and the newest ADR win. A current
section names only files, code and scripts that exist (`tests/unit/specRefs.test.ts`, ADR-821).

**Contents.** 1 Goals · 2 Architecture (2.1 module rules, 2.2 repo layout, 2.3 worker protocol,
2.4 snapshot layout, 2.5 tick order, 2.6 determinism, 2.7 persistence) · 3 World model and data
schemas (map, cells, provinces and zones, nations, diplomacy, military, tech and production) ·
4 Territory, fronts and the strategic layer · 5 Combat (engagement, element combat, combat
efficiency, Major Battles) · 6 Armour, naval, aircraft, nuclear weapons · 7 AI · 8 Semantic zoom ·
9 UI and UX · 10 Testing and verification (10.1 suites and checkers, 10.2 test API, 10.3 gate,
10.4 long runs, 10.5 nightly, 10.6 critic and release).

---

## 1. Goals, non-goals

**What it is.** A browser grand-strategy world war simulator. A mostly AI-driven world, the 1938
world or a random one, fights for decades: nations expand, make war and peace, ally, guarantee,
make and free puppets, revolt, collapse and come back. The player watches, steers with God Mode,
takes control of a nation, or builds a scenario in the editor. Five things are at its heart: true
semantic zoom from the world down to single units, naval warfare, armour, air power, and an AI that
builds and uses nuclear weapons. Everything is original or permissively licensed (DATA_SOURCES.md).

**Goals** (PROMPT.md "THE GOALS"): fun to watch for decades; readable at every zoom; rules that
agree with each other, checked together on many seeds; stable (no crash, no desync, bit-identical
save and load, deterministic seeds); fast (≥ 60 fps at world zoom with 100+ nations, ≥ 30 fps at
tactical zoom with 10,000+ unit sprites).

**Non-goals.** Multiplayer networking (deterministic replay would make lockstep possible later). A
server: the game is static files. Historical railroading: the 1938 start is plausible, and history
then diverges freely.

**Origins.** The game was first built to match *Ages of Conflict: World War Simulator* and go
beyond it; its observations of that game and the measure kept against it are frozen in
`docs/PARITY.md`. It is now judged by its own goals [ADR-805].

---

## 2. Architecture overview

```
 ┌──────────────── main thread ─────────────────┐        ┌────────── sim worker ──────────┐
 │ app/ (bootstrap, input, settings, autosave)  │ cmds → │ worker/ (protocol, scheduler)  │
 │ ui/ (Preact + signals, i18n)                 │ subs → │   ├─ sim/  (pure engine)       │
 │ editor/                                      │        │   ├─ snapshot builder +        │
 │ render/ (WebGL2: map, units, fx, labels, lod)│ ← snap │   │   interest management      │
 │   ↑ interpolates prev/cur snapshot on GPU    │ ← evts │   └─ derive/ (labels, modes;   │
 └──────────────────────────────────────────────┘        │       non-authoritative)       │
                                                         └────────────────────────────────┘
 Node (vitest, tools/headless, soak, sweep, critic) runs the same sim/ directly.
```

### 2.1 Module rules (enforced by ESLint) [ADR-2]
| Module | May import | Forbidden |
|---|---|---|
| `src/sim/**` | `src/sim/**`, `src/shared/**`, `data/**` (JSON), package `zod` | other packages, Node builtins, DOM, `window`, `self`, `Math.random`, `Date`, `performance`, inexact `Math` functions such as `Math.sin` or `Math.pow` (use `sim/core/dmath`), `setTimeout`, iteration over unordered keys |
| `src/shared/**` | itself, `data/**` | everything else (incl. all packages) |
| `src/worker/**` | sim, shared | render, ui |
| `src/render/**` | shared | sim internals (types come via `shared/protocol`) |
| `src/ui/**` | shared, render | sim, worker, app |
| `src/app/**` | shared, render, ui (worker only via `new Worker(new URL(...))`) | sim |

The editor has no layer of its own: its panel is `src/ui/EditorPanel.tsx` and its commands
`src/sim/editor.ts` (the rule still names a layer `editor`, which no folder fills).

Enforcement (`eslint.config.js`): the layer table is the local rule `module-boundaries` of the plugin `warism`
(`tools/eslint/warism-plugin.js`, lexical path resolution, so it also works on virtual
fixture paths). Sim purity uses `no-restricted-globals`, `no-restricted-properties`
(`Math.random`, non-exact `Math.*`, `localeCompare`, `toLocaleString`) and
`no-restricted-syntax` (`for-in`, `**`, Math destructuring/computed access). Fixtures in
`tests/lint-fixtures/` are linted by `tests/unit/lint-rules.test.ts`.

### 2.2 Repo layout
```
src/sim/           the pure engine: world.ts (cell layers, entity tables, RNG, command log), tick.ts (the
                   fixed tick order, §2.5), sim.ts (the facade: init, step, command, hash, save, load),
                   scenario1938.ts, randomWorld.ts, toy.ts (the worlds), editor.ts and scenarioEdit.ts (the
                   editor's commands), wars.ts, alliances.ts, battles.ts, buffs.ts, history.ts, stats.ts,
                   tech.ts, provinces.ts, placeForces.ts, landArea.ts, landCounts.ts, border.ts, gameOptions.ts
  core/            table.ts (SoA + free lists), sections.ts, state.ts (save and hash), rng.ts (PCG32 streams),
                   hash.ts (xxHash32), dmath.ts (exact maths)
  systems/         the tick's systems: economy, production, research, supply, movement, elements, combat,
                   retreat, territory, war, warFront, warBattle, majorBattles, efficiency, capitals, revolts,
                   revival, puppets, alliances, buffs, heroes, playerOrders; at sea: sail, navalCombat,
                   seaControl, seaSupply, convoys, amphibious, bombardment; in the air: air, airCombat,
                   airSuperiority, airLift, sorties, bombing; nuclear
  ai/              strategic, operational, economic, naval, invasion, air, hollow, layers
  data/            the map build chain (projection, provinces, terrain, ownership, cities, oob,
                   politicalMap) and the data schemas (zod)
  nav/             the movement grid, crossings and air zones
src/shared/        what the sim, the worker and the page share: protocol.ts (messages, snapshots),
                   commands.ts, events.ts, history.ts, peace.ts, nuclear.ts, mapModes.ts, saveFormat.ts and
                   saveCodec.ts, scenarioFile.ts, calendar.ts, speed.ts, terrain.ts, flags.ts, unitLooks.ts …
src/worker/        entry.ts, server.ts (scheduler, requests, snapshot builder), pool.ts, assets.ts,
                   deriveLabels.ts
src/render/        camera.ts, timing.ts; map/ (MapRenderer, the ground, its scatter); labels/; units/ (the
                   unit sprites, counters, markers and their stacks, countryballs, ships, sorties, contact
                   lines, handover between zoom tiers); fx/ (fire, wrecks, hulls, air, nukes, ruins)
src/ui/            Preact + signals: the title screen and new-game form, the bars, the nation panel with its
                   Actions and God tabs, the nation menu, the formation panel, statistics and charts, history
                   and the ticker, war banners, the map legend and tooltip, the editor and flag editor, the
                   nuke alert, settings; i18n/ (en.json the source of truth)
src/app/           main.tsx (no ?scenario: the title screen; ?scenario=1938|random|toy: game.tsx), MapView.ts,
                   simClient.ts, hud.ts, battleView.ts, input/, settings, autosave and saveDb (IndexedDB),
                   scenarioFiles.ts, sound.ts, testApi.ts (`__warsim`), bench/ (the bench pages)
tools/             data/ (the data pipeline), headless/ (runner, asset loader), soak/, sweep/, diag/ (probes and
                   the rule checkers), gate/ (`npm run check`, `check:review`), bench/, dmath/, eslint/
data/              terrain, units, templates, tech, traits, buildings, flags, maps/<id>/, scenarios/<id>/
                   (every file validated by tests/unit/data-schemas.test.ts)
public/data/       generated map assets + manifest.json (sha256)
tests/             unit/, e2e/ (timing specs: *.perf.spec.ts), sweep/ (the ten-year tests), helpers/ (shared
                   asset access, checkpoints, the rule checkers such as diploInvariants.ts), fixtures/
```

### 2.3 Worker protocol (`src/shared/protocol.ts`) [ADR-2]
Main → worker (implemented: init, step, cmd, hash, inspect, save, load, speed, pause, subscribe,
ack, buildProvinces, buildTerrain, buildPolitical; requests carry a `reqId` and get a `reply`,
`provinces`, `terrain`, `political` or `error` back):
- `init {init: {scenario, seed, options?, assets?}}`: `scenario` is `'1938' | 'random' | 'toy'`,
  `options` the new-game options (`GameOptions`, §9), `assets` the map assets of the two worlds
  on the earth map (the worker loads them when absent). A fresh sim starts paused.
- `cmd {cmd: Command, now?}`: applied at the next tick boundary, stamped with that tick,
  and appended to `commandLog`. `now` (God Mode and player UI, PLAN 1.32b) applies it at once
  between ticks with the same stamp (`Sim.applyNow`); plain commands stay pending (I3).
  A command of a kind that is not in the `Command` type is refused at `World.enqueue`: not
  queued, no sequence number, no line in the log, so the hash is that of a sim that never got
  it (PLAN 2.12b). `COMMAND_KINDS` is held to the type by the compiler. A kind's fields are
  checked by its handler, as before.
- `inspect {full?}`: a JSON world summary (`Inspection`: seed, nations incl. dead, wars,
  alliances, buffs, majors, corridors, settings, terrain counts, raster hashes, editor stack
  depths; with `full` also cities, cores and unrest, ~600 KB) for tests and the critic (PLAN
  1.32a). Read-only replies (inspect, history, stats) report `status.hash` NaN: not computed.
- `formation {id, generation?}`: one formation as JSON (`FormationDetail`: the count of its id
  (`Table.generation`), nation, template, men now and when whole, supply, engaged, moving, its
  elements by unit type) for the formation panel, or `null` (PLAN 2.14b). With `generation`,
  `null` also when the id's count is another: ids are given out again, and the formation asked
  for is gone (ADR-115). Read-only, as `inspect`.
- `warBattle {war}`: the largest battle of a war as JSON (`WarBattle`: where to look, the pair
  of formations there, formations and men of each side), or `null` when the war has none (PLAN
  2.14e; `largestBattle`, `src/sim/systems/warBattle.ts`). Worked out from the state when
  asked; read-only. A battle of the war's two leaders comes before one of a leader, before one
  of allies alone (ADR-95); of those, the one whose smaller side has the most men (ADR-94).
  Each war of `nationStats` says whether it has one (`battle`, ADR-96). `span` is how far
  apart the two blocks' middles stand, in cells: the camera goes as far out as holds both, to
  250 m/px (`battleViewM`, `src/app/battleView.ts`; PLAN 4.1d1, ADR-245). Two with water
  between them stand each on its shore, up to a contact's reach apart.
- `exportScenario`: the world without run history as state bytes + `scenarioHash` (PLAN 1.38).
- `speed {ticksPerSecond | 'max'}`, `pause {paused}`, `step {n}`
- `subscribe {bbox: [x0,y0,x1,y1] (world units, wrap-aware), z, tier, wantsElements}`
- `ack {seq, buffers: ArrayBuffer[]}`: rAF handshake + buffer pool return
- `buildProvinces {assetBase, w, h, withIds}`: load-time province raster (PLAN 0.19)
- `buildTerrain {assetBase, w, h}`: terrain raster with crossings (PLAN 1.2)
- `buildPolitical {assetBase, w, h}`: the 1938 political map via `buildPoliticalMap`: owner,
  controller, placed cities (PLAN 1.3–1.5). Bench views `?b=T` and `?b=W` use these until the
  1938 scenario boots in the app.
- `save`, `load {bytes}`, `history` (the log as JSON rows, PLAN 1.34a; filtered in the UI),
  `stats` (the monthly series as raw f32 bytes, PLAN 1.34b)

Worker → main:
- `snapshot {snap}` (transferable; layout in §2.4), `reply {reqId, status: {tick, hash}, bytes?}`,
  `provinces | terrain | political {reqId, result}`, `error {reqId, message, stack}`
- `terrainLayer {data, landChanged}` / `cityLayer {cities}`: the terrain layer and the city list
  again after editor edits (PLAN 1.35/1.36/1.37a)
- `flags {custom}`: custom pixel flags, after init/load and on change (PLAN 1.37b)
- `mapLayers {land, terrain, terrainColors, cities, province, templates}` once after a
  real-geography init (PLAN 1.28b): the fine land coverage, the terrain layer, city dots and
  names, the province raster (revolts mode, picking) and the buildable templates (PLAN 1.33b).
- `provinceStats {unrest}`: per-province unrest bytes when `Provinces.version` changes (1.30b).
- `nationStats {tick, nations, wars, dead, aiEnabled}`: panel, ranking, banner and God/player
  data (PLAN 1.31–1.33), at most 1 Hz while ticks advance, at once after a `now` command. While
  paused the worker keeps pumping (without ticking) until owed derived messages are sent.
- `labels {data, names}`: nation label curves (PLAN 1.29), after init or load and when control
  changed, at most every 2 s of wall time.

The worker sends **at most one snapshot per ack**. When main is slow, intermediate
ticks are coalesced: dirty tiles accumulate, and events stay in a ring with a
sequence cursor, so they are never lost. **No SharedArrayBuffer** [ADR-6].

Implementation (PLAN 0.13):
- `src/worker/server.ts` `SimServer` is environment-agnostic (injected `post`, driven by `pump(now, clock)`).
  `src/worker/entry.ts` wires it to `postMessage` and a timer (4 ms pacing at a fixed speed, 12 ms
  slices at `'max'`). `src/app/simClient.ts` acks from `requestAnimationFrame` and transfers the
  snapshot's `buffers` back.
- Dirty tiles: the sim marks 64×64 tiles through `World.setController` into `World.out`
  (`TickOutputs`, derived and never hashed). The server clears them when it sends.
- Events: systems call `World.out.emit`. After every tick the server moves them into an unsent queue
  with a global `seq`; spatial events outside the subscription bbox are skipped, and global ones (x = NaN)
  are always sent. Queue hard cap 2^20 records; overflow is counted in `events.dropped`.
- Buffer pool: power-of-two size classes. Leak test: 10k frames, allocation stays flat.

### 2.4 Snapshot layout
| Section | Content | Size bound |
|---|---|---|
| header | seq, tick, date, speed, paused, globals (nuclear taboo, etc.) | 64 B |
| dirtyTiles | list of 64×64 tiles: `owner u16[]`, `controller u16[]`, `flags u8[]` | changed tiles only |
| nations | per nation: color, stats row (gold, income, mil size, land, …), flags. As built: a row for every nation, the destroyed ones too, with `living` (a destroyed nation has no capital flag) and `founded` (a nation founded in the game: its flag is made, PLAN 2.15c). The view keeps of the nations what the last snapshot says and nothing else: a world loaded into a running game can have fewer nations (PLAN 2.7q) | 100s × 64 B, when changed |
| formations | all land formations, fleets, air wings: id, nation, kind, x, y (f64), prevX, prevY, facing, strength, maxStrength, org, state bits | ~4k × 48 B |
| elements | **only** for formations intersecting the subscribed bbox when tier ≥ T1 (≥ T1.5 until PLAN 7.21c1, ADR-498: a T1 marker shows its elements; their fire, `hit` and ends only from T1.5, where the sprites are drawn): type, strength, x, y, prevX, prevY, facing, state. As built (`SnapshotElements`): id, formation, nation, the atlas frame of the unit's class, strength, size (the units of the element when whole, since PLAN 2.10b), x, y, prevX, prevY, facing, the formation's flags (moving, engaged), and `hit`: fired at since the snapshot before, by anything, from anywhere (PLAN 3.6e5, ADR-167; §8) | ≤ 40k × 32 B |
| events | ring slice since the last ack, filtered by bbox/tier for spatial events (fire, death, explosion), global events always included | bounded ring |
| derived | label curves, map-mode textures (throttled, optional) | when changed |

_As of PLAN 0.13 the snapshot carries `tiles` (ids + owner/controller u16 per tile), `nations` (f64 stride 5:
id, color, cells, capitalX, capitalY), `formations` (id, nation, x, y, prevX, prevY, facing, strength) and
`events` (f64 stride 7: seq, tick, kind, a, b, x, y); see `src/shared/protocol.ts`. Other rows arrive with their systems._

_`prevX`, `prevY` are where the formation stood before the last step. A formation created in that step has none
and is sent with its own place: it was not alive before, or the count of its id (`Table.generation`) has changed
(PLAN 2.7o)._

_As of PLAN 2.4a fire events travel in a section of their own, `fires` (f64 stride 10: tick, subtick, shooter,
target, weapon, dmg, x0, y0, x1, y1; `src/shared/events.ts`), not in `events`: only for a subscription that
gets elements, filtered when they happen to those with an end in the subscribed bbox, queue cap 2^13 with
`fires.dropped`._

### 2.5 Tick order (1 tick = 1 sim hour) [ADR-5]
Calendar (PLAN 1.8, ADR-21): tick 0 = 00:00 of the scenario start date (`World.startDay`, saved);
proleptic Gregorian, so 1938 = 8760 ticks and 1940 = 8784 (`src/shared/calendar.ts`, integer-only;
`isDayStart` and `isMonthStart` gate the daily and monthly systems). Speed levels
(`src/shared/speed.ts`): 1, 3, 6, 12, 24 (default, 1 day/s), 48, 96, 256 h/s and Max. The bottom bar
(`src/ui/BottomBar.tsx`, app `hud.ts`) shows the date and has Pause, −/+ and Speed ×N. It is one line, as
wide as its widest labels: the pause button and the date keep the room of their widest text, so no button
moves at a pause or with the month (PLAN 3.12Rh1, ADR-217). Space pauses,
`,`/`.` change speed. Speed level and pause persist in localStorage.
```
 1. apply queued commands (sorted by arrival seq)
 2. AI: operational (every 6h, staggered by nation id), strategic & nuclear (daily, staggered)
 3. production / research (daily) · economy (monthly on day 1, 00:00)
 4. supply network refresh (every 6 h) · supply consumption (hourly)
 5. air: mission scheduling, sorties, air combat, bombing
 6. naval: movement, detection, fleet battles, blockade/convoy/raid
 7. land movement (formations along paths; slotted element poses implied)
 8. the retreat (formations with little org break off; before the engagement, so that one
    on the retreat is in no battle); engagement detection (spatial hash) → battles; element
    combat; org lost to the hour's losses
 9. territory control: pressure → cell flips (frontier set only); city/capital capture
10. diplomacy (daily): war score, peace, alliances/unity, puppets/autonomy
    revolts / collapse / revival (daily)
11. nuclear: launches in flight, impacts, fallout decay (hourly)
12. buff/debuff timers · history events · stats sampling (daily)
```
Implemented order for the 1938 world (`src/sim/sim.ts`, review after PLAN 1.25):
buff expiry → strategic AI (weekly per nation) → operational AI (6-hourly, daily per nation) →
production (daily) → research (daily) → economic AI (monthly, before the economy charges the
month) → economy (monthly) → combat efficiency (monthly) → supply (12-hourly network, hourly
use) → repatriation (daily) → movement → the retreat → engagement and combat (incl. Major
Battles) → org lost to the hour's losses → territory → capitals → wars (daily) → alliances,
puppets, revolts, collapse (monthly) → statistics sampling (monthly, last, PLAN 1.34b). (Research,
the economic AI, repatriation, the retreat and the org loss were missing from this line until
the review of Phase 3, PLAN 3.7b.) History events are recorded as they are emitted (PLAN 1.34a). The average tick is
1.0 ms over the first 5 years of seed 99 and 1.9 ms in its war-heavy first year (Node, M; budget
1.5 ms, PLAN 7.1; measured after PLAN 1.42a). The main costs in that first year are combat
(~35%), A* for AI orders (~28%), the supply flood over warring blocs (~15%) and territory (~10%).
Since the rules of Phase 3 the tick is over both budgets: 1.67 ms over the five years and 2.44 ms
in the first (PLAN 3.5e, 2026-10-07; the budget of the first year is 2.4 ms); PLAN 7.1 has what
it is spent on.

**Save files and autosave (PLAN 1.27).**
- *Format:* a save is the sim's section bytes (all of `World.parts()`, the command log included),
  gzipped (`src/shared/saveCodec.ts`; raw bytes still load). A 1938 world after one year of AI
  play is 38.6 MB raw and 0.79 MB gzipped.
- *Autosave* (`src/app/autosave.ts`; the store is `src/app/saveDb.ts`): IndexedDB
  `warsim`/`saves`, slot `autosave`, holding {scenario, tick, savedAt, bytes, seed, options}. It
  runs every 60 s of real time while the game runs, when the page is hidden, and on Main menu.
- *Resume:* `?continue=1` restores the slot for the same scenario after init; the title screen
  offers it as Continue (§9).
- *Status:* the worker's save reply carries the status taken at the same tick.

### 2.6 Determinism [ADR-5]
- Numbers: f64 using only `+ − × ÷`, `Math.sqrt`, `Math.floor/ceil/round/abs/min/max/
  trunc/imul/fround` (all exactly specified by ECMAScript). Trig, exp, log and pow come from
  `dmath` (table + polynomial, identical in every engine).
- RNG: PCG32 implemented with `Math.imul` and 32-bit ops. One stream per subsystem
  (`scenario`, `combat`, `ai`, `diplomacy`, `revolt`, `weather`, `nuclear`, `naval`, `air`,
  `toy`) is seeded from `xxhash32(name, worldSeed ^ k)` only, so a new subsystem doesn't perturb
  existing ones. Order-independent draws use `hash32(seed, tick, entityId, salt)`.
  `dmath` = fdlibm ports (polynomial kernels + atan table), golden bits pinned in Node and Chromium.
- Iteration is always in ascending id order. Entity ids come from free lists in
  deterministic order. `Map`/`Set` are allowed only with insertion order derived from id order.
  An id is therefore not an identity over time: a row created in a step can have the id of a row
  destroyed in that step. A table counts how often each id has been given out
  (`Table.generation`), for an observer that remembers something by id. The count is not state:
  it is not serialized or hashed, and the sim does not read it (PLAN 2.7o). A load leaves the
  counts as they are, for a table as large as the loaded one (PLAN 2.7x).
- **State hash**: `hashSections` chains (name, dtype, length, xxhash32(data)) over every
  authoritative section (`World.parts()`: meta incl. tick and seed, RNG states, command log and
  pending commands, cell layers, entity tables). Events and derived outputs are excluded.
- **How long a table is, is no part of the state** (PLAN 2.12, ADR-84). A table grows by
  doubling, and a growth moves it to new arrays; a loaded table is as long as its save. So no
  reference to a table's columns is held across a create (`Table.create`): it would read the
  old arrays and write nowhere, at a size nobody chose and at another one after a load.
  `tests/unit/tableGrowth.test.ts` runs a game whose tables move at every create beside the
  same game without (`Table.volatile`). And no number of the state is a NaN out of
  arithmetic: its bits are in the hash and need not be the same in two engines. Nor an
  `undefined` where a number is kept: a typed array takes it as a NaN, with bits of the engine's
  own (PLAN 3.5f: a peace signed by nobody, in the history).
- **Invariant tests** (must always pass): (I1) same seed + commands → same hash
  at N ticks; (I2) save → load → continue == uninterrupted, bit-identical bytes;
  (I3) Node run == worker run; (I4) random viewport/subscription churn leaves the hash
  unchanged; (I5) save bytes → load → save bytes are identical.

### 2.7 Persistence [ADR-9]
As built (reviewed 2026-10-04; §2.5 has the details of saves and autosave):
- **Save**: the sim's WSEC section stream (`src/sim/core/sections.ts`: every section of
  `World.parts()`, the command log included), gzipped with `CompressionStream` (browser and
  Node 18+; `src/shared/saveCodec.ts`). No header of its own: the seed and the tick are in the
  `meta` section.
- **Scenario** (`.warism-scenario`, `src/shared/scenarioFile.ts`): gzip of a magic line, a JSON
  header line (name, base scenario, map size, tick, state hash) and the state bytes without run
  history (`Sim.exportScenario`). Shareable; loaded in the editor or from the title screen.
- **IndexedDB** (`src/app/saveDb.ts`, database `warsim`, store `saves`): slot `autosave` (one
  slot; every 60 s of real time while running, on page hide and on Main menu) and slot
  `scenario` (the scenario file on its way from the title screen into its game).
- Settings (speed, paused, UI size, locale, unit size, map mode, etc.): localStorage.
- **Designed, not built:** a `.warism-save` file on disk with its own header (magic, version,
  scenario hash), several rotating autosave slots, an autosave interval in sim months as a
  setting (PARITY row 65).

---

## 3. World model & data schemas

### 3.1 Coordinates & map [ADR-1, ADR-7]
- **Projection:** Miller cylindrical, latitude cropped to 80° N … 64.165° S (`LAT_TOP_DEG`,
  `LAT_BOTTOM_DEG`), so the map is exactly 2:1 and its cells are square (`src/sim/data/projection.ts`;
  the schema checks the 2:1). The map meta is `data/maps/<id>/map.json`: `widthKm` 40,075, `wrapX`,
  the sizes and `defaultSize`.
- **Units:** every place in the sim (a formation, a city, an element) is in cells, as fractional
  x and y. A cell is `kmPerCell` = 40,075.017 / W km wide at the equator. `x` wraps when the game's
  `loopingMap` is on (the default; the schema refuses it on a map that does not wrap).
- **Sizes:** S 1024×512, **M 2048×1024 (the default, `DEFAULT_W`)**, L 4096×2048 [ADR-419]. Reaches,
  areas and holds are given at M and scaled to a game's size (`World.atSize`, `atSizeWhole`,
  `atSizeSnap`, `atSizeArea`; `atWidth`, `atWidthSnap`) [ADR-417].
- **True distances:** the nav grid keeps, per row, the true km of a step across, down and
  diagonally (`NavGrid.kx`, `ky`, `kd`, earth radius `EARTH_R` 6371.0088 km) and each row's cell area
  (`cellAreaByRow`). Movement (`stepKm`), path search, air and sea ranges, fallout and land areas
  (`src/sim/landArea.ts`) read them; the economy's cell weights have their own row areas.
- **Fine land mask** (static): 1 bit a pixel, 16384×8192 (8 px a cell at M), from Natural Earth 10m
  land minus its lakes of scalerank ≤ 7 (`LAKE_MAX_SCALERANK`), not reservoirs; islands in lakes
  stay land. The sim (placing, naval passability below a cell) and the renderer (coastlines) read
  the same bits; the page keeps them packed by cell (`CoastMask`). `World.landMask` comes from
  `ScenarioAssets.landMask` (the worker's and the Node loader's alike) and is neither saved nor
  hashed. In `src/shared/landMask.ts`:
  - a point is on land when its pixel's bit is set (`maskLand`); it is *surely land* (`maskSure`)
    when the four pixels round it, blended by nearness (`maskField`, 0–1, a half on a straight
    coast), make `SURE_LAND` (0.85) or more. The drawn shore moves inside a pixel by a noise of at
    most `SHORE_NOISE` (0.35) × 4f(1 − f), which the map shader takes from the module, so surely
    land is land in the picture too.
  - *Islets:* a territory with no land cell is given one (`reconcileIslands`, the cell set to
    Plains), and where the mask has no land there the world sets the cell's pixels but its corners
    (`addIslet`).
- **Where a thing stands on land** (formations at rest stand on sure land):
  - *in a cell:* at its middle when that is surely land, else at its land point, the middle of the
    pixel furthest from water (`World.cellPoint`, `landPoint`); a cell with no land in the mask
    keeps its middle;
  - *on the march* [ADR-246]: on the straight line between the two cells' points where it is clear
    of water (`lineClear`), else on the step's way over land (`landWay`, cached by `World.stepWay`:
    land pixels, 8-way, no corner of water cut, within the two cells' box and `WAY_MARGIN_CELLS` (1)
    round it, in one land body of the nav grid), as far along as the share of the step done
    (`stepPlace`); where neither exists, the straight line. Two cells' points may be up to 1.9
    cells apart; a step across the map's seam goes the short way. The step's time is the cell
    grid's either way.
  - *at a given place* (the order of battle's, a capital's, a command's): there when surely land,
    else at its cell's point (`World.standPoint`);
  - *by a city* (a division mustered in a theatre): at the city's place when that is in its cell and
    surely land, else at the cell's point (`cityStand`) [ADR-224];
  - *an element:* at its slot in the block, else at the first sure land on the way from the slot to
    its formation, searched in eighths (`slotPlace`); a formation on water keeps its slots;
  - *a fleet:* at its water cell's sea point (`seaPoint`, `waterPoint`).
  - Inland cells (their pixels and the ring round them all land) answer at once (`World.onLand`).
- **Elevation:** ETOPO 2022 60″, box-averaged into Miller cells; levels 4096, 2048, 1024 and 512
  wide ship in `public/data/earth/` (`SHIP_MAX_W`) [ADR-13]. `manifest.json` lists every asset and
  source with its size and sha256 (`npm run data`).

### 3.2 Cell layer (SoA, length W·H)
`CellLayers` (`src/sim/world.ts`), row-major, every array saved (`cells.*` sections):

| field | type | meaning |
|---|---|---|
| owner | u16 | rightful owner (nation id; 0 = none) |
| controller | u16 | current controller (occupation when ≠ owner) |
| terrain | u8 | terrain class (below) |
| province | u16 | admin-1 province (0 = none; from polygons, so a coastal water cell may have one) |
| econ | u32 | industrial output, $M a year |
| pop | u32 | population, thousands |
| supply | u16 | the supply bloc that reaches the cell (0 = none; refreshed every 6 hours) |
| flip | u8 | hours running an attacker has out-pressed the holder (§4) |

Sparse cell state, saved: `world.fallout` (cell → 0..1) and `world.bombDamage` (cell → share).
Derived and not saved: the inland cache, the frontier mask, borders, cell points, step ways. A
frontier cell's pressure is the hour's scratch of the territory system, not state.

**Terrain classes** (`src/shared/terrain.ts`, in order): Water, Crossing, Plains, Grassland, Forest,
Hills, Mountains, Desert, Tundra, Marsh, Urban, Ice. `isLand` is Plains and above; a crossing is
sea that land units walk. The sim never paints Urban; only the renderer names it.

**Terrain raster** [ADR-15]: `terrain-<w>x<h>.u8.wsz` for S, M and L, made offline by
`tools/data/terrain.ts` (`npm run data`):
- land where the land mask covers ≥ 50 % of the cell;
- the biome from the cell's mean Natural Earth I land-cover colour, matched to the nearest of 30
  labelled sites (forest, plains, grassland, desert, tundra, ice), with no desert poleward of 52°
  (`DESERT_MAX_ABS_LAT`) and ice only poleward of 58° (`ICE_MIN_ABS_LAT`), and forest where its
  pixels are the majority of a plains or grassland match; a land cell with no land-cover pixel takes
  its neighbours' commonest class, else Plains;
- relief from the elevation's standard deviation in the cell: mountains ≥ 280 m
  (`MOUNTAIN_STD_M`), hills ≥ 110 m (`HILLS_STD_M`) or a mean ≥ 3000 m (`HIGH_PLATEAU_M`);
- marsh from Natural Earth's wetlands and deltas and `tools/data/wetlands.json`, on flat ground
  (deviation < 40 m, `MARSH_MAX_STD_M`), never desert;
- priority ice > mountains > hills > marsh > biome. S is the 2×2 mode of M (land from the mask); L is
  built at its own size.

**Crossings** are not baked in: `data/maps/<map>/straits.json` lists land-to-land segments, and
`applyCrossings` (`src/sim/data/terrain.ts`) paints the water cells between each segment's first and
last land cell, extended `STRAIT_EXTEND_CELLS` (4, scaled) past both shores, at load; a segment
without land on both halves is not painted.

**The terrain table** (`data/terrain.json`, one row a class in enum order, which the validator
checks): `nameKey`, move cost by mobility (foot, motor, tracked; null = impassable), defence, attack
modifiers by unit class, supply attrition, economic weight, colour.

**Data files.** zod schemas in `src/sim/data/schemas.ts`, strict objects (an unknown key is an
error). `validateDataSet`'s cross-file checks: unique ids by kind; `techReq`, `prereqs` and
`excludes` refer to real ids, `excludes` both ways; a prereq's year ≤ its tech's; an acyclic tech
graph; a scenario's map and size exist; `loopingMap` only on a map that wraps. Errors read
`<file>: <path>: <message>`. That every `nameKey` and `descKey` is in `en.json` is a unit test
(`tests/unit/data-schemas.test.ts`). Map meta: `data/maps/<id>/map.json` (projection, `widthKm`,
sizes, `defaultSize`, `wrapX`, optional assets). Scenario meta: `data/scenarios/<id>/scenario.json`
(map, optional size, `startDate`, settings, optional `hidden`).

### 3.3 Provinces, cities, sea zones, air zones
- **Provinces.** The raster is built at load in the worker from `admin1-geometry.wsz` and
  `admin1-meta.json.wsz` (`buildProvinceRaster`, `src/sim/data/provinces.ts`, called by
  `buildPoliticalMap`); province id = Natural Earth admin-1 feature index + 1. Every province gets
  a cell: those smaller than a cell are placed largest first, at their label point when that is
  free water, else in rings out to `MAX_RADIUS` (scaled), taking a cell of their own country that
  leaves its donor one, else free water, else any donor.
  - *Static* (`Admin1Meta`, `src/shared/admin1.ts`): id, adm1, name, adm0, admin, iso2, type, the
    label point, `areaKm2`.
  - *State* (`src/sim/provinces.ts`, saved): `unrest`, `core` (the nation whose core it is),
    `heldBy` and `heldSince`, and `claims` (extra cores). Cores start as the owner of each
    province's centre cell plus the scenario's extra cores (§4). A province has no buildings:
    ports and airbases are the scenario's (below; `src/sim/data/airbases.ts`).
- **Cities.**
  - *Static* (`CityDef`, `src/sim/data/cities.ts`, from `data/scenarios/1938/cities.json`): name
    (English), longitude and latitude, size 1–5, `capitalOf` (a nation's tag). The file (5,774
    cities) is made by `npm run data` (`tools/data/cities.ts`) from Natural Earth's populated places
    and `city-rules.json` (renames, exclusions, inclusions, `maxScalerank` 8, `minSpacingCells`
    2.5). Size = the larger of the scalerank tier (≤ 1 → 5, ≤ 3 → 4, ≤ 4 → 3, ≤ 6 → 2, else 1) and
    the population tier (≥ 5 M → 5, ≥ 1.5 M → 4, ≥ 500 k → 3, ≥ 150 k → 2, else 1); a capital is at
    least 3, bound to the nearest place within `CAPITAL_BIND_KM` (40) of its nation's capital or
    made there.
  - *Placed at load* (`placeCities`): each city takes a land cell within `CITY_SNAP_CELLS` (2,
    scaled), a capital one of its own nation, and is left out with none; its owner is its cell's.
  - *State* (`world.cities`, saved): def, x, y, cell, size, `capitalOf` (nation id) and econ (the
    editor's); an editor's city's name is in `world.cityNames`. Industry and population are the
    cells' (`econ`, `pop`), filled by city size (`fillEconomy`). A capital's capture is a history
    row (`CapitalCaptured`); God's spawned and razed cities are too.
  - *Drawn* (`src/render/labels/cityLabels.ts`, on a canvas of its own under the overlay; dots moved
    onto sure land of the fine coast): a dot shows from 12,000 m/px for size 4, 6,000 size 3, 3,000
    size 2 and 1,500 size 1, and always for capitals and size 5; a name from 5,000 m/px for a
    capital, 3,500 size 5, 2,000 size 4, 1,400 size 3, 800 size 2 and 450 size 1. Each turns on and
    off with a hysteresis of ×1.15 (`ZOOM_HYSTERESIS`) and fades over 250 ms (`FADE_MS`). Font
    10 + size px, 2 more for a capital; a capital's dot and name are yellow.
  - *Where a name stands* [ADR-76]: names are laid out after the frame's counters and flags,
    capitals first, then by size, then in the file's order. A name takes the first place by its dot
    (`NAME_SIDES`: right, left, below right, below left, below; then past the counter or flag beside
    the dot, at most 40 px to the side and 26 px down, a capital's reach ×1.6 (`CAPITAL_REACH`); then
    above, right, left or centred) where its letters cross no name placed before it and no
    obstacle; with none it is left out. A new place must clear an obstacle by 2 px (`NAME_CLEAR_PX`);
    a place held need only be untouched, and is kept to the pixel as an offset from the dot; when
    something stands on it, the name takes the first free place at once and cross-fades from the
    old over 250 ms. The obstacles: T0 counters and capital flags; at T1 each marker's box with its
    bar and number, a stack's tag and the Major Battles (not the order arrows); at T2 and T3 the
    formations' tags. The unit layer that counts is the one shown or coming in, from the first
    frame in which the coming one is drawn.
  - *Label layers:* on the city canvas, the curved nation names and over them the city dots and
    names; on the overlay above, the unit layers, then the capital flags.
- **Sea zones** [ADR-242] (`src/sim/nav/seaZones.ts`, `seaOf(world)`; derived from terrain and the
  map's seeds, neither saved nor hashed, dropped with the nav grid): a zone is the water and
  crossing cells nearest its seed in 4-way steps over water (the earlier seed on a tie), so it is one
  piece and crosses no land. `SeaZones`: `zoneOf`, `count`, `seedCell`, `seed` (−1 for an unnamed
  zone), `cells`, `areaKm2`, `closed`, `adj`, `dropped`. A zone's name is its seed's.
  - *Seeds* (`data/maps/earth/seas.json`, made by `npm run data -- --seas`, `tools/data/seas.ts`): each
    named marine polygon of Natural Earth drawn on the M map; one under 10,000 km² of water
    (`MIN_NAMED_KM2`) is left out, a cell in several goes to the smallest, and water in none to the
    sea nearest over water. A sea is given a seed for each `ZONE_KM2` (1.5 M km²) of its area, or
    each `ZONE_SPAN_KM` (1,500 km) of its length when that asks for more, spread over each piece of
    it (`spreadSeeds`: the deepest cell, then each furthest from the seeds so far, then each moved to
    the middle of its part, at most 16 rounds). A seed has the sea's English name and its part (0 for
    a sea of one seed, else 1…k).
  - *Water no seed reaches* (a lake, the toy world, a map with no seas file): a body of
    `MIN_WATER_KM2` (10,000 km²) or more is given unnamed seeds by the same spread; a smaller one has
    zone 0. A seed on land takes the nearest water no seed has within `SEED_SNAP` (2 cells), or is
    dropped.
  - The tests hold the 1938 map at M to 300–450 zones, none dropped, none over twice `ZONE_KM2`. A
    zone's edge is where two seeds are as near, not the polygon's line; bodies the grid closes are
    joined only by the lane graph.
- **Lane graph** [ADR-243] (`src/sim/nav/lanes.ts`, `laneOf(world)`; derived, not saved). The worker
  builds it with the other map caches (air zones, basins, port waters: `buildMapCaches`) after an
  init or a load, as `Sim.load` and the world template do.
  - *Nodes* (`LaneNode`: zone, strait or port): one a zone at its seed (node `zone − 1`); then one
    a strait, a 4-way body of crossing cells with a zoned cell, at the middle of those cells; then
    one a port.
  - *Edges:* between zones that touch, from a strait to each zone it has a cell in (`crossing`), one
    a passage, one a port. An edge holds its km and its cells, from its lower node's to the other's,
    each an 8-way neighbour of the one before, all zoned water. Its length: one 8-way search from
    every seed over its own zone (`stepKm`; a diagonal only between two sea cells), and between two
    zones the least of seed to cell, step, cell to seed over the cells where they touch.
  - *Passages* (`data/maps/<map>/passages.json`, by hand: id, name, the water at each end): what a
    ship passes and the grid closes. On the earth 7: the Bosporus, the Dardanelles, the Suez, Panama
    and Kiel canals, and the Strait of Magellan's First Narrows and western arm. An end takes the
    nearest zoned water within `PASSAGE_SNAP` (2 cells); a passage with an end that finds none, or
    both ends in one zone, is dropped. Its km: seed to end, the great circle between the ends
    (`greatCircleKm`), end to seed; `landAt` is where its cells jump. A passage is shut while its
    bank's controller is at war with the ship's nation (`passageShut`).
  - *Ice* [ADR-251] (`data/maps/<map>/ice.json`, by hand; `World.seaIce`): the seas, by name, that
    pack ice closes all year. On the earth 21 (the Arctic Ocean, the Kara Sea to the Chukchi Sea, the
    Beaufort Sea to Baffin Bay). Their zones are `closed`: no lane edge has one at an end, no walk
    crosses one, no way begins or ends in one. The validator refuses a name not in `seas.json`.
  - *Basins* (`seaBasins`, `basinOf`): the zones the lanes join; `ocean` is the largest. The shipyard,
    a sea hero's return, the invasion AI and sea battles read them.
  - *The route* (`laneRoute`): the shortest over the edges (Dijkstra, the lower node on a tie),
    leaving out the edges `shut` names (an enemy's passage).
  - *A fleet's way* (`sailRoute`, `src/sim/nav/sailRoute.ts`) [ADR-250]: from a water cell to
    another: to its zone's seed by the seeds' tree (`toSeed`), the route's edges, and from the last
    seed to the cell; then drawn tight, twice (from each cell a straight walk, `seaWalk`, Bresenham
    over zoned water with no corner of land cut, across the seam of a looping map and never through
    a closed zone, to the furthest cell of a row it reaches; the second time only walks no longer in
    km than what they replace), the shorter kept. Each side of a passage is drawn tight by itself.
    The way: its cells, its km (`sailStepKm`: a neighbour's `stepKm`, a passage's great circle), its
    lane km (`laneKm`) and the cells it turns at.
- **Ports and naval bases** [ADR-244] (`src/sim/data/ports.ts`, `world.ports`): static data of the
  scenario, not saved. Who holds a port is who holds its land cell. A port has a `port` level 1–5
  and a `navalBase` level 0–5; levels never change. Its state is elsewhere: bomb damage
  (`world.portDamage`, saved, repaired daily; a port damaged `PORT_SHUT` or more is shut), and
  blockade, when an enemy holds the sea zone of its water (`world.seaControl`, §6.2).
  - *The file* (`data/scenarios/<id>/ports.json`): `minCitySize` (3), `reachCells` (2, scaled),
    `levelBySize` ([1, 2, 3]) and `ports`, by hand: name, place, `nation` (who holds it at the start;
    it takes that nation's land within `PORT_SNAP_CELLS`, and the world's build fails without),
    `port`, `navalBase`, and `water` where the sea is further than the reach (a river's mouth).
  - *A city's port* (`placePorts`): a placed city of `minCitySize` or more with water in reach, by
    terrain alone, its level by its size; one port a cell. A port by hand in a city port's cell takes
    its place, keeps its city and takes the higher level. In 1938: 105 by hand, 87 of them naval
    bases.
  - *Its node:* after the straits, in the ports' order, at the zoned water nearest its place within
    reach of its cell (or the `water` given, within `PASSAGE_SNAP`), with one edge from that zone's
    seed. A port whose cell is no longer land, or with no zoned water in reach (a lake under
    10,000 km²), has no node (`portNode` −1) and no ship uses it; one in the ice keeps a node with no
    edge. `portWaters` and `portSeaOf` give a port's water without the edges; `portWater` (by
    terrain) is where fleets stand.
  - The tests hold the 1938 map at M to 500–700 ports with a node, in 400 or more provinces, and a
    port on the seas for every nation with a coast on them. The random world has the same ports, the
    file's nations not read; the toy world has none. A port of a city placed in the editor, or in a
    scenario file, does not exist.
- **Air zones** (`src/sim/nav/airZones.ts`, `buildAirZones`, `airOf(world)`; derived, not saved): on
  land, regions of whole provinces of about `AIR_ZONE_KM2` (300,000 km²) each; over water, the sea
  zones. Air superiority is a nation's, not a zone's: its side's share of the air power of it and
  its enemies, 0–1, a half when neither flew (`src/sim/systems/airSuperiority.ts`; `world.airPower`,
  saved; §6.3).

**The world's build.** `Sim({scenario, seed, assets, options})` (`src/sim/sim.ts`) builds the 1938
world with `createWorld1938` (`src/sim/scenario1938.ts`), which runs `buildPoliticalMap`: the
province raster, `reconcileIslands`, then `buildOwnership`; then nations (id = index + 1, colour,
`living`, the capital's place `capitalX`, `capitalY`), cities, and formations from the order of
battle (`equipFormation`). The first world built is kept as a template and later ones are loaded
from its bytes. Static facts (names, traits, templates) are looked up by id and are not state. The
worker fetches the assets from `data/earth/`, checks their sha256 (`src/worker/assets.ts`) and builds
the Sim; the page opens it with `?scenario=1938`.

**Scenario ownership** [ADR-16] (`data/scenarios/1938/nations.json`, id = index + 1, and
`ownership.json`; `buildOwnership`, `src/sim/data/ownership.ts`):
- each province takes `byProvince[adm1] ?? byCountry[adm0]`;
- land cells take their province's owner; land with no province, or a displaced province of
  `DISPLACED_CELLS` (2) cells or fewer, takes its neighbours' majority; an islet nothing reaches
  takes the nearest owned land within `ISLET_REACH` (16 cells);
- polygon `regions` apply in order, each only to cells owned by its `onlyFrom` tags;
- `occupation` rings set the controller, on cells the occupied nation owns.

### 3.4 Nations
- **Static** (`NationDef`, `src/sim/data/schemas.ts`; `data/scenarios/1938/nations.json`, id = index
  + 1): `tag` (three capitals), `nameKey`, `adjectiveKey`, `color`, `government`, `traits` (at most 4),
  `aggression` 0–100, `incomeBonus` −100–100, `fightToDeath`, `capital` {name, lonLat}, optional
  `overlord` {tag, autonomy}, `extraCores` {countries, provinces}, `alive` and `techs`. The validator
  checks traits and their `excludes`, puppets one level deep with both alive, and one capital city in
  `cities.json` and a flag for each living nation. `adjectiveKey` and `government` are read by
  nothing. 1938 has 103 nations, 102 alive (Ethiopia dead, with cores); a unit test holds
  neighbours' colours apart (ΔE*ab > 15).
- **State** (`NATION_SCHEMA`, `src/sim/world.ts`, a saved table, id = row): `color`; the capital's
  place `capitalX`, `capitalY`; `cells` (owned, kept by `setOwner`); `living`; `gold`, `income`,
  `expenses` (last month's); `incomeBonus`, `incomeMult`; `bankrupt`, `brokeMonths`; `manpower`,
  `manpowerMult`; `fightToDeath`; `overlord`, `autonomy`, `loyalty`, `integration`; `suppression`;
  `origin` and `people` (a founded nation's province and core people); `revivalsLeft`, `revivalAt`;
  `aggression`; `aiOff`; `builds`; `efficiency`, `ceStatic`, `ceLocked` (§5.3); `casualties`;
  `tech0`, `tech1` (known techs, a bit each); `research` (gold a day). Kept on the world, not as
  columns: names (`world.names`), painted flags (`world.flags`), `world.nukesBanned`,
  `world.unionBarred`, warheads and the air totals. A capital is the city whose `capitalOf` names
  the nation (§3.3).
- **Traits** (`data/traits/traits.json`, 14): of their modifiers only `income` and `manpower` act
  (`incomeMult`, `manpowerMult`); `aggressionBias` acts only when the game's traits are random (1–3
  compatible traits a nation, `src/sim/gameOptions.ts`). The game options can also make aggression
  random (0–100), gold random (× 0.25–2) or equal (the median), and diplomacy random (§3.5).
- **Cores:** each province's core is the owner of its centre cell at the start, plus `extraCores`
  (`src/sim/systems/revolts.ts`; §4).

**The random world** [ADR-108] (`src/sim/randomWorld.ts`): scenario `random`, the earth map with the
1938 terrain, cities, ports, airbases, economy, units, templates, rules and start date, and nations
made by the seed (`hash32(seed, …)`, not the world's streams; the same seed and count give the same
world):
- *count:* the option `nations`, 2 to 200, 60 when none is asked (`RANDOM_NATIONS`);
- *capitals:* of `CAPITAL_TRIES` (12) cities drawn, the one farthest from the capitals so far; one a
  province, none on land under `HOME_CELLS` (12, scaled);
- *land:* a province goes to the nation that reaches it first over the province graph, each
  nation's km costing 0.6–1.8 by the seed; a province no road reaches goes to the nearest capital;
- *nations:* named by `randomNationName` (the capital's province without its kind word, or the
  capital's name when that is generic or taken, then II, III…), the name in `world.names`; a
  golden-angle hue; aggression 15–85; no traits, techs, alliances, wars or puppets;
- *armies:* infantry divisions for `ARMY_SHARE` (0.5) of the income after the margin, one in eight
  armoured and one in eight motorised, round up to `ARMY_ANCHORS` (6) cities, at most about
  `ARMY_TOTAL` (900).

**Names and flags** [ADR-109, ADR-19]. `ScenarioInfo.nationTags` (`src/shared/scenarios.ts`) holds a
scenario's tags by id (none for the random and toy worlds). A nation's name is, in order: its entry
in `world.names` (a rename, a random or toy world's), its tag's name key, or a founded nation's
`foundedName` ("Free <province>", then "II", "III" by `foundedNth`, so no two living nations share a
name and none changes) (`src/shared/nationNames.ts`); the worker's `nameOf` resolves it, a literal
name with a leading `=`. A flag is a `FlagSpec` {aspect, layers} (`src/shared/flags.ts`: stripes,
rect, cross, saltire, hoist triangle, disc, star, crescent, poly, canton, preset from
`data/flags/presets.json`), expanded by `flagShapes` into polygons for `flagSvg` and `rasterizeFlag`
(4×4 supersampled), packed by `buildFlagAtlas` into 48×32 cells; `data/scenarios/1938/flags.json`
maps tag → spec. A nation without one flies `foundedFlag` (one of 11 presets by a hash of its id and
colour; `src/shared/flagPixels.ts`), the view's and not state. `FlagStore` (`src/app/flagStore.ts`)
gives the painted flag, else the scenario's (a tagged nation not `founded`), else the made one.

**Economy** [ADR-22] (`src/sim/systems/economy.ts`, monthly at 00:00 of day 1):
- *Cell values* (`cells.econ`, $M a year): each country's capacity, GDP × (GDP per head ÷ the US's)^
  `INDUSTRY_EXP` (0.5) from `data/scenarios/1938/economy.json`, spread over its land cells by weight:
  `CITY_WEIGHT` by city size [0, 1, 2.5, 6, 15, 35] + `LAND_WEIGHT` (0.05) × the terrain's econ weight
  × true area. Population (`cells.pop`) is spread the same way (§3.7).
- *Gross* = Σ cells controlled ÷ `ECON_PER_BN` (1000) × `INCOME_PER_BN` (6) × `incomeMult` × (1 +
  `incomeBonus` %) × (1 + income buffs); an occupied cell counts `OCCUPIED_SHARE` (0.5), and a cell's
  value is cut by blockade (× `BLOCKADE_SHARE` 0.5), convoy losses, bomb damage and fallout (× (1 −
  0.8 × fallout)).
- *Upkeep* = `UPKEEP_SCALE` (0.35) × each formation's template upkeep × its strength ÷ full strength,
  plus `WARHEAD_UPKEEP` (10) a warhead. *Admin* = `ADMIN_BASE` (0.25) × (km² held ÷ `ADMIN_KM2`
  212,000)^`ADMIN_EXP` (1.35), at most `ADMIN_CAP_SHARE` (0.5) of gross. Gold += gross − upkeep −
  admin; tribute moves between puppets and overlords (§3.5). `economyBreakdown` gives the panel's
  lines.
- *Bankruptcy:* gold < −`BANKRUPT_MONTHS` (3) × gross. A bankrupt nation's formations on land lose
  `DESERTION` (0.05) of their units a month; recovery at gold ≥ 0; both turns are a `Bankruptcy` row.
- *Start gold:* the larger of `START_GOLD_MONTHS` (6) × gross and `START_ARMY_MONTHS` (12) × the
  monthly shortfall (`src/sim/scenario1938.ts`).

**Death, collapse and revival** (`src/sim/systems/capitals.ts`, `src/sim/systems/revival.ts`):
- *Capitals:* a nation that loses its capital moves it to its safest city up to
  `CAPITAL_SAFE_STEPS` (20) steps from the enemy, else its largest, else a field capital; with no core
  held it dies (`holdsCore`). A winner-takes-all war annexes on the capital's fall.
- *Death* (`eliminateNation`): its wars, truces, guarantees, alliance places, research and production
  orders end; its puppets go free; its land goes to the holders.
- *Collapse:* after `COLLAPSE_MONTHS` (6) bankrupt months a nation's debts are voided, its puppets go
  free, its provinces go to their dead claimants and its restless provinces revolt (`NationCollapsed`).
  With nothing to break away, the history says it defaulted (`NationDefaulted`, b = the debt voided)
  [ADR-819].
- *Revival:* a dead nation with `revivalsLeft` (the scenario's `revival.maxPerNation`, 2) and past
  `revivalAt` (`REVIVAL_COOLDOWN`, 2 years after its death) rises on its cores (`canRevive`,
  `reviveNation`, `reviveOnCores`). God's Kill hands its land out by city weight (`KILL_STATES`,
  `KILL_CELLS_PER_STATE`), and God's refusals say why (`whyNotRevive`, `whyNotKill`).
- *Founded nations* (a revolt's, §4): a colour, the parent's techs but the nuclear ones, `people` and
  `origin`, militia, `START_GOLD` (150), `REBEL_AGGRESSION` (40), no revivals.

### 3.5 Diplomacy
**State.** Saved: `world.wars` (`src/sim/wars.ts`: each war's `id`, `sides` (two lists, the leader
first), `startTick`, `score`, `capitalBonus`, `exhaustion`, `fightToDeath` and `startMen` by side,
and its strike, frontless and peak records; the truces {a, b, untilTick}; `lastFought`);
`world.alliances` (`src/sim/alliances.ts`: each alliance's `id`, `nameKey`, `leader`, `founder`,
`members`, `loyalty` by member, `unity`, `union`; the `past` alliances; the one-way `guarantees`
{guarantor, target}); the nation columns `overlord`, `autonomy`, `loyalty`, `integration` and
`fightToDeath`; `world.nukeShock`. Derived: `atWar` and `sameSide` (pair sets), `allianceOf`, a
nation's realm (itself or its overlord: `blocOf`) and the land tallies (`src/sim/landCounts.ts`,
km², integers). A realm has one head: a puppet's overlord is never a puppet [ADR-810].

**Declaring war** (`src/sim/systems/war.ts`):
- *Refusals* (`whyNotWarOn`, `whyNotWar`): no nation, itself, already at war, a truce, a bond (the
  target is its subject, ally, fellow puppet or of an allied realm), `Beside` (the two fight on one
  side elsewhere), `Overrun` (a capitulating side). The AI's choice of target asks the same.
- *War on a puppet is war on its overlord.* The call (in order): the attacker's realm, the
  defender's realm, the defender's allies, its guarantors, a target puppet's allies and guarantors,
  the attacker's allies, each with its puppets. A nation then stays out when it is `bound` to the
  other side (at war with an enemy, a bond with it, a pledge either way, fighting beside it
  elsewhere) or is a `foe` of its own side (at war with one already on it) [ADR-808]; one in truce
  with the enemy leader is never called. The two leaders and a named puppet stand. A guarantee
  between the two sides lapses (`GuaranteeLapsed`). Wars of independence call no ally or
  guarantor (`alone`).
- *Force war* (`forceWar`, God and player) [ADR-780]: breaks the truce, puppet bond or alliance
  between the two (up to 8 steps; `BondsBroken`); a bonded partner first leaves the wars it fights
  beside its target (`leaveWarsBeside`), then declares.
- `realmsAtWar`, `canJoin` and `noWarAmong` (`src/sim/systems/alliances.ts`) keep a realm and an
  alliance out of war with themselves; a new puppet leaves its wars against its new realm
  (`leaveBondedWars`).

**Score, exhaustion and peace** (daily):
- *Score* = 200 × (occ(attackers → defenders) − occ(defenders → attackers)) ± `CAPITAL_SCORE` (25) a
  capital taken (at most `CAPITAL_BONUS_MAX`, 50), rounded and clamped to ±100 [ADR-47]. occ(X → Y) =
  Y's land X holds ÷ min(Y's land, `REL_CAP` (2) × X's land), at most 1: a small nation can win
  against a large one. Every land figure is km².
- *Exhaustion* = 0.1 a day + 80 × the share of men lost (the navy weighed in men) + 60 × the true
  share of own land occupied, plus a nuclear strike's shock; at most 100.
- *Suing:* a side sues when its leader is broke, it is exhausted (≥ `EXHAUSTED`, 80) or crushed
  (score ≤ −`CRUSHED`, 90); never when either side fights to the death (the leader's flag). The
  winning side refuses a suit for exhaustion alone while its own exhaustion is ≤ 40 and it reached a
  new peak of the other's land within `GAIN_DAYS` (30), unless the loser is nuke-shocked
  (`refusesSuit`) [ADR-521].
- *Terms* (the winner is the higher score, the attackers on a tie): under `WHITE_PEACE` (10) a white
  peace; otherwise the winner annexes what it holds, third parties' cells and pockets under
  `POCKET_CELLS` (400) resolved. A loser under `SMALL_STATE_KM2` (8,500 km²) is annexed whole; at ≥
  `PUPPET_SCORE` (90) with ≥ `PUPPET_SHARE` (0.3) of the losers' land taken, the loser becomes a
  puppet of the head of the winner's realm at `PEACE_PUPPET_AUTONOMY` (30); a founded nation left
  under `STATELET_KM2` (50,000 km²) is annexed. An annexed nation's puppets go to the annexer's head.
  The two leaders take a truce of `TRUCE_TICKS` (2 years).
- *Other endings:* a side holding ≥ `CAPITULATE` (0.75) of the other's land takes its capitulation
  (`Overrun` refuses new wars on it); a war ends on its score after `MAX_WAR_DAYS` (1,825) or
  `FRONTLESS_DAYS` (365) without a land front [ADR-480]. A nation leaving a war that goes on is a
  `WarLeft` row, its occupations returned; a war left with one side empty ends with `WarEnded`, no
  peace or truce. A war on a dying nation ends with it [ADR-232].
- *Peace offers* (`offerPeace`, the player): accepted on a lead of ≥ `PEACE_ACCEPT_SCORE` (25) or
  the enemy's exhaustion over `PEACE_ACCEPT_EXHAUSTION` (40), never by one fighting to the death
  (`peaceVerdict`, `src/shared/peace.ts`); else `PeaceRejected`.
- *The march home* (`repatriationSystem`, daily; `src/sim/systems/movement.ts`): formations on the
  land of a nation not of their realm, not at war with them and not beside them in a war, or shut
  in on a crossing, march to their nation's nearest cell within `REPATRIATE_CELLS` (80, scaled), else
  to their spawn point. That march alone crosses a neutral's ground (`formations.home`) [ADR-169],
  unfed there, the operational AI leaving it be; it keeps off enemies' ground and is ordered round it
  [ADR-222]; a formation is set on its spawn point only where no land leads there.
- *God commands:* `forceWar`, `forcePeace`, `setWarFightToDeath`.

**Alliances** [ADR-30] (`src/sim/systems/alliances.ts`, monthly):
- unity += `SHARED_WAR_UNITY` (3) × wars with two members on one side + `MEMBER_UNITY` (0.25) × (members
  − 1) − `UNITY_DECAY` (1), within 0–100; each member's loyalty moves `LOYALTY_PULL` (0.25) of the way
  to unity. A new alliance starts at unity 50 (40 for an AI threat pact), members at loyalty 60.
- A member under `LEAVE_LOYALTY` (25) leaves (the lead passes on if it led); under two members the
  alliance dissolves. A dead nation leaves the same way, with the same rows (`AllianceLeft`,
  `AllianceDissolved`) [ADR-213]. A union from unity `UNION_AT` (80), lost below `UNION_LOST` (70).
- `proposeAlliance`: to an unaligned nation that is no puppet, and no puppet to its own overlord;
  else `AllianceRejected`. Guarantees come only from the scenario's `diplomacy.json` (7 alliances, 8
  guarantees, 2 wars in 1938) or random diplomacy (`randomDiplomacy`, the same shapes made by the
  seed).
- Commands: create, join, leave, `proposeAlliance`, `setUnity`, `setLoyalty`. The alliance map mode
  gives members their leader's colour, others grey.

**Puppets** [ADR-31] (`src/sim/systems/puppets.ts`, monthly). Tiers: satellite under
`SATELLITE_BELOW` (30) ≤ puppet < `VASSAL_FROM` (70) ≤ vassal. In order:
0. A puppet of a dead overlord is free.
1. Above `FREE_ABOVE` (90) autonomy it leaves freely.
2. With autonomy ≥ `PROTEST_FROM` (10) and loyalty under `REVOLT_LOYALTY` (20) it rises: it leaves
   the wars it fought beside its overlord and an alliance it shares with it, and fights a war of
   independence, the two realms' [ADR-184, ADR-807].
3. Tribute: `TRIBUTE` (0.25) × (1 − autonomy/100) × its gross to the overlord.
4. Below `INTEGRATE_BELOW` (50) autonomy, integration grows `INTEGRATION_RATE` (4) × (50 −
   autonomy)/50 a month; at 100 the overlord annexes it.
5. Autonomy drifts up `AUTONOMY_DRIFT` (0.25); loyalty moves `LOYALTY_PULL` (0.2) of the way to
   `LOYALTY_BASE` (40) + `LOYALTY_PER_AUTONOMY` (0.6) × autonomy, and while the overlord's side is
   losing (score ≤ −`LOSING_SCORE`, 30) to `LOSING_PENALTY` (25) + `SIZE_PENALTY` (25) × min(1, its
   gross ÷ its overlord's) lower [ADR-807].
- A puppet made of a puppet's subject is its realm head's; the subject's own puppets go up with it
  [ADR-810]. A nation that dies is nobody's puppet, and its puppets go free in that tick
  (`PuppetReleased`) [ADR-148, ADR-174].
- Commands: `createPuppet` (to the head of the overlord's realm), `releasePuppet`, `setAutonomy`,
  `setPuppetLoyalty`. The puppet map mode gives puppets their overlord's colour lightened 45 %.

**Buffs** (`src/sim/buffs.ts`, `src/sim/systems/buffs.ts`): {target (nation, formation or province),
kind, magnitude m, expiry}, active on ticks [grant, expiry); the expiry system runs first in a tick.
Kinds: income (gross × (1 + m)), manpower (growth × (1 + m)), attack (damage dealt × (1 + m)),
defense (damage taken ÷ (1 + m)), speed (march × (1 + m)), unrest (+10m a month). God grants them.

**The AI's diplomacy** is §7 (`src/sim/ai/strategic.ts`: at most `MAX_WARS` (2), stalemate peace
after `STALEMATE_DAYS` (720), threat pacts, a coalition against a hegemon, rivals kept apart; puppets
take no diplomatic turn). The checkers hold these rules together (§10.1).

### 3.6 Military
- **Unit types** (`UnitTypeDef`, `data/units/*.json`: land 13, sea 7, air 9, heroes 14): `id`,
  `nameKey`, `class`, `domain` (land, sea, air; the class must fit), `elementSize` (units an element:
  infantry and cavalry 500 men, guns 12, tanks 10, ships 1, aircraft 6–12, a missile 1), `mobility`
  (foot, motor, tracked; fitting the domain), `stats` (soft and hard attack, armour, piercing, hp,
  defence, AA, speed, range, detection, stealth, fuel; optional `torpedo`, `torpedo_km`, `asw`,
  `bomb_t`), `cost` {gold, manpower, days}, `upkeep` {gold}, `terrainMods`, optional `techReq` and
  `hero`. Validated but read by nothing: `stats.breakthrough`, `stats.org`, `stats.supplyPerHour`,
  `cost.industry`, `upkeep.supply`.
- **Unit rules** (`UnitRule`, `src/sim/world.ts`, built by `RULES_1938` from the data, not state):
  class, domain, size, `menPerUnit` (manpower ÷ element size), soft, hard, armour, piercing,
  `hpPerUnit`, AA, defence, `bombT`, fuel, `rangeKm`, detection, stealth, torpedo, `torpedoKm`, `asw`,
  terrain attack and defence by terrain, and the combined-arms bit (`arm`).
- **Templates** (`TemplateDef`, `data/templates/*.json`: land 19, sea 6, air 6, heroes 14): `id`,
  `nameKey`, `elements` [{type, count}], of one domain (its first element's). Land: the 15 of 1938
  (an infantry division 28 elements, 12,460 men; the square division 20,580; a panzer division 340
  tanks; a tank corps 450) and 4 gated by tech (`armor_medium_2`, `armor_heavy_1`, `mechanisation`,
  `armor_mbt`). Sea: destroyer flotilla, cruiser squadron, battle squadron, carrier group, submarine
  flotilla, transport flotilla. Air: fighter (3 × 12), tactical bomber (3 × 8), strategic bomber
  (4 × 6), close support (3 × 10), naval bomber (3 × 8), transport (4 × 6) groups. A template's rule
  (`TemplateRule`): domain, gold, manpower, days, mobility and speed (of its manoeuvre elements: foot
  if any walks, else tracked if any is, else motor; guns not counted), terrain speeds, fuel, its
  elements and its tech mask. Templates are indexed land, sea, air, then heroes (`scenario1938.ts`),
  and a formation is saved with its index.
- **Formations** (`FORMATION_SCHEMA`, saved): `nation`, `x`, `y`, `facing`, `strength` (men: Σ
  element units × `menPerUnit`), `template`, `moving`, `originCell`, `targetCell`, `pathStep`,
  `stepFrac`, `supply`, `org`, `engaged`, `struck`, `retreat`, `home`. Its domain is its template's.
  On the world: `paths`, `battles` and `seaBattles`, `embarked` and `seaBound` (§6.2),
  `station` (an editor's), `wingBase` (an airbase + 1, or −fleet for a carrier), `wingFerry`,
  `wingMission`, sorties, `playerOrders`.
- **Elements** (saved): `formation`, `slot`, `unit`, `strength` (units), `wound` (damage carried to
  the next unit lost), `target`, `cooldown`. An element's place is derived, never saved: at rest its
  slot (`slotPose`: a block about 2:1, `cols` = ⌈√(2n)⌉, `SLOT_SPACING` 0.03 cells, scaled; slots set
  when the formation is equipped), in contact the hour's deployment (`deployOf`: on the line to the
  nearest enemy in contact within `DEPLOY_REACH` (1.5 cells), `DEPLOY_GAP`, `DEPLOY_LINES` (2),
  `DEPLOY_ABREAST`, with a seeded scatter and turn); on land, `slotPlace` (§3.1). `applyLoss`
  carries wounds; `settleFormation` removes a dead element (`ElementDestroyed`) and a formation with
  none.
- **The order of battle** (`data/scenarios/1938/oob.json`, `placeOob`, `src/sim/data/oob.ts`): 225
  groups, 1,054 formations, each group flooding 4-way from its anchor (within `ANCHOR_REACH_CELLS`,
  12), a formation a cell not beside another, stacking when the room runs out; `templateStrength`
  gives a template's men, tanks, guns and elements. Fleets (`src/sim/data/fleets.ts`): 145 groups,
  197 fleets, 1,786 ships of 27 nations, at 61 bases, one fleet a cell. Air: 198 wings at the start,
  and a naval bomber group a carrier (`CARRIER_WING`). Formation ids run land, fleets, wings, heroes.
  The random and toy worlds have no fleets at the start.
- **What a fleet or wing is to the land rules:** `afloat` (a fleet, or land formations aboard) and
  `offLand` (afloat or a wing). Land rules ask `offLand`: desertion, stats, the editor's checks.
- **Building** (§3.7): a fleet at a shipyard (`shipyard`: a held port on an ocean basin, not shut by
  bombing, the highest naval base then the nearest the capital; in 1938 Portsmouth to Kronstadt), a
  wing at an airfield with room (`airfield`, §6.3). God and the editor place fleets and wings
  (`spawnFleet`, `spawnWing`, `src/sim/placeForces.ts`); `spawnFormation` refuses a template not of
  land (`NotOfLand`).
- **Sailing** (`src/sim/systems/sail.ts`): a fleet sails its way (§3.3) at `CRUISE_SHARE` (0.55) of its
  slowest ship's speed, with the speed buffs, never under × 0.05.
- **Heroes** (the new-game option `heroes`; `src/sim/systems/heroes.ts`): `world.heroRoster` {nation,
  template, x, y} from `data/scenarios/1938/heroes.json` (14: a land and a sea hero for each of seven
  powers), placed after every other formation; `world.heroes` (formation → row) and
  `world.heroReturn` (row → tick). A hero is one element; never built, refilled or paid for; it heals
  `HERO_HEAL_PER_DAY` (0.05) a day and returns `HERO_RETURN_HOURS` (1,440) after it is lost, a sea
  hero at a port on its start's basin. Its rules are a checker's (§10.1).

### 3.7 Tech & production
**Techs** (`data/tech/*.json`: 7 files, 43 techs, 1936–1952; `src/sim/tech.ts`): a rule
`TechRule` {id, year, prereqs, category, gold, days}, indexed by the schema's categories (industry,
land, armor, naval, air, electronics, nuclear), the index a bit of `tech0`/`tech1` (64 at most).
Techs gate templates (a template needs its units' `techReq` and their prerequisites: tank
generations, mechanisation, jets), missile delivery (`ballistic_missiles`) and warheads
(`atomic_bomb`). Tech modifiers and `cost.industry` are read by nothing. A nation knows at the start
the techs dated before 1938, those its starting formations need, and its `techs`; the random world's
nations only the first. God grants a tech with its prerequisites (`grantTech`).

**Research** (`src/sim/systems/research.ts`, daily):
- the budget (`nations.research`, gold a day) is set monthly for every living nation:
  `RESEARCH_SHARE` (0.05) of income ÷ `DAYS_PER_MONTH` (365/12), 0 when gold ≤ 0 or when short with a
  treasury under 3 months of the shortfall, at most `researchCap` (3 × the dearest tech's gold a day,
  4.0); the build balance counts it;
- at most `MAX_LINES` (3) lines a nation (research rows: nation, tech, paid), each paid its share of
  the budget until its gold is in, then `TechResearched` (and `NuclearPower` for the atomic bomb); a
  short treasury stops all the nation's lines for the day, never into debt;
- the next tech (`nextTech`): of those with prerequisites known and year reached (a floor), the
  earliest, the first on a tie. The nuclear chain (`HELD_CATEGORIES`) is researched only by a nation
  that goes for the bomb (nukes allowed, income ≥ `NUKE_PROGRAMME_INCOME`, 1000); a line of a nation
  no longer allowed is kept unpaid. A dead nation's lines go; a founded nation's budget is 0 until
  the month's turn.

**Production** (`src/sim/systems/production.ts`):
- `queueFormation` (the player's command and the AI's order) pays at once `PRODUCTION_COST_SCALE`
  (3.5) × the template's element gold (a carrier group with its air groups) and its manpower, and
  adds a row (nation, template, `readyDay`) ready after `TRAIN_TIME_SCALE` (3) × the slowest
  element's days for land and air, `SHIP_TIME_SCALE` (1) × for ships (an infantry division 90 days, a
  panzer division 225, a battle squadron 900). Refused (`ProductionRejected`) without gold, manpower
  or the techs, for a dead nation, a fleet with no shipyard, a wing with no airfield with room. The
  orders train in parallel; a bankrupt nation's slip a day each day.
- *Delivery:* land at the capital or the nearest controlled cell within `SPAWN_REACH_CELLS` (40,
  scaled), or at the front overseas or an ally's theatre (`musterPoint`, `allyTheatre`); a fleet at its
  shipyard's water, a wing at its airfield; with no place, it waits. New formations have full
  elements, supply and org 1; a carrier group comes with its wings (`manDecks`).
- *Levy* (`levyFormation`): cadre divisions for manpower alone, for a nation outnumbered on a land
  front (§7).
- *Manpower* (`economy.ts`): monthly + `MANPOWER_MONTHLY_RATE` (0.0005) × `manpowerMult` × (1 +
  manpower buffs) × the population of land owned and controlled (`cells.pop`, thousands: GDP ÷ GDP a
  head, spread like `econ`), up to `MANPOWER_CAP_SHARE` (0.03) of it (a pool above the cap is kept);
  start `MANPOWER_START_SHARE` (0.01).
- *Refills* (`refillable`, `refillFormation`; the economic AI's monthly turn, §7): a land formation
  not aboard, not a hero, short of men, gets up to `REFILL_MONTH` (0.3) of its template a month, a man
  of the pool a man and gold at the template's gold ÷ its manpower a man, slot by slot, dead slots
  made again; a nation without AI is refilled too. In peace the refills keep the next order's price,
  at war a warship's while the nation saves for one. Fleets and wings are not refilled; carrier decks
  are manned again (`manDecks`).
- *Hollow formations* (`src/sim/ai/hollow.ts`): a remnant under `HOLLOW_MEN` (500, or its template's
  men) merges into a formation of its nation within `MERGE_KM` (50), for a nation whose army AI runs;
  not a player's or a hero.
- No building is built: `data/buildings` costs and `buildSpeed` are read by nothing; an airbase's room
  is `AIR_PER_LEVEL` (50) × its level.
- The rules (`world.rules`: units, templates, techs) are set by the Sim from the data and are not
  state.

---

## 4. Territory, fronts and the strategic layer

The hour's systems run in a fixed order (§2.5): … supply, repatriation, movement, …, combat, …, sea
control, then territory, capitals, war, alliances, puppets, revolts and collapse (the last two at a
month's start only).

### 4.1 Supply [ADR-25]
`src/sim/systems/supply.ts`, `src/sim/systems/seaSupply.ts`.
- **Blocs and networks.** A nation's bloc is its realm (`blocOf`: its overlord, or itself). Every
  `SUPPLY_REFRESH_HOURS` (12) while anything changed, each bloc's network is flooded 4-way from its
  sources over the cells the bloc controls and the lanes no bloc holds, blocs in ascending order (the
  lower takes a lane), wrapping on a looping map; `cells.supply` (saved) holds the bloc that reaches
  each cell. A source is a city a member owns and controls whose land is sea-linked to the bloc
  (`markSeaLinks`: across the sea a fleet of the bloc keeps open). Only the blocs whose nations
  changed are refreshed; a load, a change of overlord or a raw write refreshes all.
- **Mending.** A changed cell is mended from its ring of eight. A ring that is no longer joined is
  searched part by part (up to `SEARCH_CELLS`, 4,096): a part with no source dries; the bloc is
  flooded whole when a part touches a lane, is too large, or a source was lost and no other reaches;
  also when its spans have grown past twice those of its last whole flood, or its sea links changed.
  Spans (`World.supplySpans`) and the changed marks are derived.
- **A formation's supply** (0–1, hourly; fleets, wings and troops aboard are not fed this way): fed
  when its cell is on its bloc's or a partner's network, or, off its own side's ground, a network lies
  within `SUPPLY_REACH` (2 cells, Chebyshev, scaled); else from the beach layer (`supplyBeach`, saved:
  landings supplied over the shore, §6.2). Fed: + `SUPPLY_RATE` (1/8) an hour, × (1 + the air
  superiority term, §6.3); beach-fed: towards `BEACH_SUPPLY` (0.75) at `BEACH_RATE` (1/16). Unfed: −1/8,
  and − `MARCH_BURN` (1/320) × its template's fuel while marching and not engaged. An encircled
  formation is dry within 8–20 hours.
- **At supply 0:** attrition of `BASE_ATTRITION_PER_DAY` (0.02) + the terrain's, applied hourly; a
  formation that is not on foot moves at `DRY_SPEED` (0.25) + 0.75 × supply, loses `ORG_RATE` (1/32)
  of org an hour, and at org 0 breaks down: `BREAKDOWN_PER_DAY` (0.1) of its vehicles and towed guns.
- **Org** starts at 1 and regains 1/32 an hour when fed and out of contact; fire is × (`ORG_FIRE` 0.25
  + 0.75 × org) (§5).

### 4.2 Land movement [ADR-24]
`src/sim/nav/`, `src/sim/systems/movement.ts`.
- **Cost.** A step costs its true km (`stepKm`, §3.1) × the entered cell's move cost for the
  formation's mobility (`data/terrain.json`: foot, motor, tracked; water impassable, a crossing
  walkable). Land components (`provinceGraph`) reject an unreachable target at once.
- **Route** (`findRoute`): the province graph (provinces, with crossings and orphan runs of cells as
  nodes of their own; derived) is searched first for a march over `COARSE_ABOVE_KM` (500 km), and the
  cell search (A*, 8-way, no corner cut, octile × the least cost, weighted ×1.5 past 120 cells and ×2
  past 300) runs in a corridor of the route's nodes and their neighbours; shorter marches search the
  cells directly. A march may cross only ground its `Passage` opens (its own side's and enemies'; a
  neutral's is shut, `SHUT_PRICE` 8 on the graph; `foreignTo`), entering a cell only from one of the
  same holder; routes are cached by passage. The AI's `direct` orders are refused as `LongWay` past
  `LONG_WAY` (4) × the straight line (at least `LONG_WAY_FLOOR_CELLS`, 16).
- **Orders** (`moveFormation`): refused for another nation's formation (`NoSuch`) or one on retreat
  (`OnRetreat`); a target off land snaps to land within `TARGET_SNAP_CELLS` (3, scaled) of the same
  component, else `MoveRejected` (its reason in `RejectReason`: among them `LongWay` and `Contact`). A
  target at sea makes a march to the coast, or with `byPort` to a transport port (§6.2). An order given
  mid-step finishes the step first. The path is saved (`world.paths`, moving formations only) and
  found again when missing; a step no longer allowed is ordered again from the cell behind.
- **The hourly step:** an engaged formation holds (a player's order `through` excepted; a player's
  march that meets an enemy is cancelled with `Contact`). A formation moves `MARCH_DUTY` (0.3) × its
  speed (its slowest manoeuvre element's; guns are towed) × its supply pace × its fuel × the speed
  buffs (never under × 0.05) ÷ (1 − `FALLOUT_SLOW` (0.5) × fallout) km of cost an hour, and
  `WITHDRAW_SPEED` (0.5) of that when ordered out of contact; an infantry division walks 28.8 km a day
  on plains. It goes along the cells' land points and the steps' ways over land (§3.1), waits before an
  enemy's cell (unless retreating), is barred from a third nation's, and on arrival is
  `FormationArrived`. `marchHoursLeft` gives the time left.
- **The march home** (repatriation, `HOME_MARCH` and `HOME_BACK`) is §3.5.

### 4.3 Territory [ADR-588]
`src/sim/systems/territory.ts`, hourly.
- **Frontier:** the cells with a 4-neighbour held by a nation at war with their holder, and the shores
  of a strait across a war; kept from the border index, updated round each flip, not saved.
- **Pressure:** every land formation of a nation at war (not on retreat) puts strength ÷ 1000 × (0.5 +
  0.5 × supply) × (1 − d ÷ (R + 1)) on the frontier cells within `PRESSURE_RADIUS` R (2, scaled;
  Chebyshev d), kept per nation.
- **A frontier cell held by D:** its defence is `GARRISON` (1) + the pressure of D's bloc and of D's side.
  Each nation A at war with D that controls a 4-neighbour scores the pressure of A and those beside it
  (× `CORRIDOR_PRESSURE` (2) in its breakthrough corridor, §5.4) ÷ the cell's terrain defence; the best
  (ties: its own share, then the lower id) contests. While it beats the defence the cell's `flip`
  counter (saved) rises 1 an hour (`CORRIDOR_RATE`, 4, in a corridor), else it resets; at
  `HOLD_TICKS` (16 hours at M, scaled) the cell's controller becomes A. Decisions use the hour's start,
  so a front moves at most a cell a hold, and a line held cannot be jumped. A cell taken from a living
  owner that its taker is not at war with goes back to its owner. A flip is a battle where the cell
  had defending pressure, else a walk-in.
- **Occupation and ownership.** A flip changes the controller only; an occupied cell yields its
  occupier `OCCUPIED_SHARE` (0.5) of its value (§3.4). The owner changes by peace (and its pocket
  settlement), annexation, integration, revolt and defection, revival, kin union, a capital's capture
  in a winner-takes-all war, a dead nation's land handed on (`leaveLand`), and God (`paintControl`,
  land cells, radius at most 64).

### 4.4 Capitals
`src/sim/systems/capitals.ts`.
- An enemy at war that controls a capital's city takes it (`CapitalCaptured`; the war score's capital
  bonus, §3.5). In a `winnerTakesAll` war the capturer annexes every cell the loser controls.
  Otherwise the nation moves its capital to its safest city (the enemy's distance counted up to
  `CAPITAL_SAFE_STEPS`, 20, scaled), then the largest, then the lowest id, on its main landmass; with no
  city, to a field capital (at war, the controlled cell farthest from the enemy on its largest
  landmass; at peace the nearest), moved again on any change of control. A capital given away by peace
  moves the same way [ADR-145].
- **Death:** a nation that holds no core province's centre (`holdsCore`) dies (`eliminateNation`,
  `NationEliminated`): its formations, production, research, wars, alliance place and puppetry end; its
  puppets go free; its land goes to its holders (`leaveLand`); its revival waits (§3.4). Annexation
  (`annexInto`) passes cells a third nation holds to that nation and the cores to the annexer.

### 4.5 Cores, revival and collapse
- **Cores** (`src/sim/provinces.ts`, saved): each province's `core` is the owner of its centre at the
  start, plus `extraCores` as `claims`. A holder that keeps a province's centre owned and controlled for
  `CORE_YEARS` (10; `heldBy`, `heldSince`) makes it its core, and the old core keeps a claim. Cores also
  pass with rebels, a rising neighbour, kin, a revival and annexation.
- **Revival and collapse** are §3.4. The scenario's `revival.cooldownDays` is read by nothing: the
  cooldown is `REVIVAL_COOLDOWN` (2 years).

### 4.6 Revolts
`src/sim/systems/revolts.ts`, at a month's start; none on a map with no provinces.
- **Unrest** (0–100, a province with a living holder): + `NON_CORE` (4) on land not the holder's core,
  and there + `AT_WAR` (2) at war and + `BANKRUPT` (3) while bankrupt; + `OCCUPIED` (6) when its centre
  is occupied; + overextension on a province whose centre is over `OVEREXT_CELLS` (80, scaled) from the
  capital, core or not, for a nation holding more than `OVEREXT_SHARE` (0.04) of the owned land:
  `OVEREXT_UNREST` (1.25) × min(`OVEREXT_MAX` (2), share ÷ 0.04 − 1), and `AT_WAR` on core land too while
  a war has worn its side to `OVEREXT_EXHAUSTION` (60); +
  10 × the unrest buff; + `NUKE_UNREST` (40) under a burst (§6.4); − `DECAY` (2); − `SUPPRESS` (5) with
  suppression; − `GARRISON_UNREST` (3) with a land formation of the holder within `GARRISON_CELLS` (3) of
  its centre.
- **Revolt:** from `REVOLT_FROM` (50), with a chance rising to `MAX_P` (0.5), × `SUPPRESS_P` (0.7) with
  suppression (costing `SUPPRESSION_COST` (0.15) × its level of gross income) and × `GARRISON_P` (0.7)
  garrisoned; an occupied province does not revolt. In region mode (the 1938 scenario's) the restless
  provinces round it at ≥ `REGION_JOIN` (40) join, at most `REGION_MAX` (8) and `REGION_KM2` (1 M km²).
  Unrest after a revolt is `AFTER_REVOLT` (10).
- **Who rises**, in order: defection to a neighbour of the area's people at war with the holder (no
  puppet: `risingNeighbour`), a dead claimant returning, kin (`kinUnion`), else a new nation (`spawnRebels`:
  "Free <province>", the holder's techs but the nuclear, militia `round(cells ÷ MILITIA_PER_CELLS (40))`
  up to `MILITIA_MAX` (4), gold at least `START_GOLD` (150), `REBEL_AGGRESSION` (40)), at war with the
  holder and its puppets but not its allies. `LandCeded` and the history rows tell it. God has
  `forceRevolt` and `spawnNation` (no war, `NationSpawned`).

---

## 5. Combat model

Hourly, in order (§2.5): supply, movement, retreat, combat (with the Major Battles), player orders, …,
org loss, territory. `src/sim/systems/combat.ts` unless named.

### 5.1 Engagement
- **Contact** (`findBattles`): formations of nations at war, on land, with elements and not on the
  retreat, are bucketed (`BUCKET_CELLS`, 2 cells, scaled); two at war whose centres are within
  `CONTACT_CELLS` (1.5) are in contact, set `engaged`, and joined by union-find into battles. A battle is
  a derived list of formations, made again each hour; only Major Battles are records (§5.4). Air
  strikes and bombardment are their own systems (§6.2, §6.3) and are not members of a battle.
- **In contact** a formation's march pauses (an enemy's ground is entered only once it flips, §4.3);
  each block deploys towards its nearest enemy in contact (`deployOf`, §3.6, drawn only). A player's
  march that meets an enemy is cancelled (`RejectReason.Contact`); one given in contact (`through`)
  goes on at `WITHDRAW_SPEED` (0.5) until first out of contact.
- Contact ends when no enemy is within 1.5 cells, or when the formation retreats.

### 5.2 Element combat (an hour, a battle)
- **Elements** (§3.6): a formation's strength is Σ element units × `menPerUnit`, rounded.
- **Target:** an element keeps its target while it lives and is hostile, for `COOLDOWN` (4) hours after
  the pick; else it picks among the enemy elements of its battle by weight eff × health × 1/(1 +
  the distance between the formations), drawn by `hash32(seed, tick, element)`, by binary search in
  tables kept per formation and unit type.
- **Damage** of an element's volley on its target:
  eff × fullness × `FIRE_SCALE` (0.1) × attack × the shooter's factor × attack buffs × Major Battle ×
  the arms factors ÷ defence ÷ defence buffs ÷ `hpPerUnit`, where
  - *attack* is hard attack on a target with armour, soft otherwise, × `ARMOR_PEN` (0.5) when its armour
    exceeds the shooter's piercing; × the terrain's attack figure for the shooter's class × the unit's
    `terrainMods`; the terrain is the target formation's cell;
  - *defence* is the ground's figure × the unit's, only for a target not moving;
  - *the shooter's factor* = (0.5 + 0.5 × supply) × (`ORG_FIRE` (0.25) + 0.75 × org) × combined arms ×
    air (1 + `AIR_SUPERIORITY` (0.2) × (2s − 1), s its nation's superiority, §6.3);
  - *attack buffs* = combat efficiency (§5.3) × (1 + attack buffs, at least 0); defence buffs at least
    0.05; × `MAJOR_LOSS_MULT` (1.5) in a Major Battle;
  - *arms* (`data/combat.json`; arms of each side taken at the hour's start: infantry, artillery,
    armour, AT): `COMBINED_ARMS` (1.15) for a side with infantry, artillery and armour together;
    `UNSCREENED` (1.3) on armour in forest or urban terrain when the target's side has no infantry;
    `SUPPRESSED` (0.7) on AT guns when the enemy has artillery; `IN_THE_OPEN` (1.25) for armour firing
    at unarmoured elements on plains, grassland or desert whose side has no AT gun.
- **Losses** are summed by target and applied after all volleys, in id order: wounds carry towards the
  next unit (`applyLoss`), armour loses whole tanks and one more by a seeded draw with no carry
  (`applyWholeLoss`; a hero's armour carries as the rest). `settleFormation` removes dead elements
  (`ElementDestroyed`: the element, its unit and where it stood), adds to the nation's casualties, and
  destroys a formation with none (`FormationDestroyed`).
- **Fire events** (`FireEvent`, 10 fields, a second of the hour by hash, the shooter's unit as the
  weapon) for every volley that does damage: the renderer's tracers (§8). Not state.
- **Org and retreat** (`src/sim/systems/retreat.ts`, `orgLoss`): a formation loses org 1 ÷
  `lossToBreak` (0.3) × the share of its strength lost in the hour, and regains none in contact (§4.1).
  Engaged with org under `RETREAT_ORG` (0.15), it retreats: to a point `RETREAT_CELLS` (3) beyond itself
  away from the enemy, snapped within `RETREAT_SNAP` (2) to ground of its nation, bloc or side on its
  landmass out of every enemy's contact, else within `RETREAT_REACH` (8) of itself; with none it tries
  again when (tick + id) mod `RETREAT_RETRY_HOURS` (6) is 0. For `RETREAT_HOURS` (24) it is out of
  contact and battles, its march held by neither contact nor enemy cells, pressing no cell, given no AI
  order; a player's orders to it are refused (`OnRetreat`) or dropped. It regains 0.75 org fed.
  `FormationRetreated` is an event, not a history row. Encircled formations do not surrender.
- **Not modelled:** entrenchment, experience, night, weather, river crossings.

### 5.3 Combat efficiency
`src/sim/systems/efficiency.ts`, at a month's start after the economy; a nation's `efficiency`
multiplies its fire (0 counts as 1). The mode (`settings.ceMode`, saved; the game option, default
dynamic):
- *dynamic:* towards `PEACE_CE` (0.7) at peace, `WAR_CE` (1) at war, ± `WIN_SWING` (0.15) by its mean war
  score, − `SUPPLY_PENALTY` (0.1) by its land formations' mean shortfall of supply, within `MIN_CE`–
  `MAX_CE` (0.5–1.5);
- *progressive:* the same target, `PROGRESSIVE_STEP` (0.05) a month;
- *static:* `ceStatic` = 0.8 + aggression ÷ 250;
- *locked:* 1; *random:* `RANDOM_MIN`–`RANDOM_MAX` (0.6–1.4) by the seed.
A nation's `ceLocked` (God's `lockEfficiency`) keeps its value in any mode; `setEfficiency` sets it
(0.5–1.5). Efficiency costs `COST_SHARE` (0.2) × max(0, CE − 0.7) ÷ 0.3 × its income a month.

### 5.4 Major Battles
`src/sim/systems/majorBattles.ts`; its records (majors, corridors, history) are saved with the world.
- A battle whose two camps hold ≥ `MAJOR_MEN` (120,000) men is a Major Battle, named after the nearest
  city; a later group within `MATCH_CELLS` (3) of its starting place continues it (one group a battle
  an hour). Its losses are × 1.5 (§5.2). It ends when no group continues it: the winner is the camp with
  more men within `END_CELLS` (5), the last count breaking a tie.
- The winning side's strongest nation (most men in its army) gets a breakthrough corridor for
  `CORRIDOR_DAYS` (10): from the battle's place along (the loser's centroid − the winner's), −1 to
  `CORRIDOR_LEN` (8) cells long and ± `CORRIDOR_HALF_WIDTH` (2) + 0.5 wide, scaled; inside it the
  nation's pressure is × `CORRIDOR_PRESSURE` (2) and its flips count × `CORRIDOR_RATE` (4) (§4.3).
- Its start and end are events and History rows (`MajorBattleStarted`, `MajorBattleEnded`); the map marks it with a crossed
  swords disc (§8). God's `forceBreakthrough` makes a corridor and its row, refused at peace
  (`AtPeace`).

---

## 6. Differentiators

### 6.1 Armour
- Classes light/medium/heavy (+ mechanised/motorised infantry). Generations are gated by tech
  (1938 light/medium → 1943 heavy → post-war MBT).
- Production cost and time (industry heavy), monthly upkeep, and **fuel per hour moving**.
  Unsupplied armour loses speed, then org, then strength (breakdowns).
  *Implemented (PLAN 3.2b, ADR-134):* the fuel figure, the burn on the march off the network and
  the speed (§4, Supply v1). *(PLAN 3.2c, ADR-135):* the org, lost with no supply and read by
  combat. *(PLAN 3.2d, ADR-136):* breakdowns. With no supply and no org a formation on engines
  loses a tenth a day of its vehicles and towed guns (the elements that burn fuel and are not
  counted in men), besides the attrition of every formation without supply; its men go at
  that attrition alone. The formation panel has the org and the fuel the template burns.
- Terrain: a small bonus on grassland and in the desert, heavy penalties in forest, marsh,
  mountains and urban. Tracked mobility costs from the terrain table.
  *Implemented:* the move cost by mobility class (PLAN 1.11) and the fire by unit class
  (PLAN 1.13), both of `data/terrain.json`: a light tank's fire is × 1.1 on grassland, 0.8 in
  forest, 0.65 in a city, 0.55 in a marsh, 0.5 in mountains, and tracks cross a forest at
  half their pace. *(PLAN 3.3a, ADR-137):* a unit type's own `terrainMods.atk` and `.def`
  multiply those in a volley (infantry holding a forest takes ÷ 1.1 more, the heavy tank's
  fire in a marsh is × 0.8 more). *(PLAN 3.3b, ADR-138):* a template crosses a cell at the
  least `terrainMods.speed` of its manoeuvre elements for that ground, × the pace the move
  cost gives (cavalry in a forest 0.8, the heavy tank in a marsh 0.7, motorised infantry in
  a marsh or mountains 0.6, and with it every division that has some).
- Combined arms: armour is vulnerable to AT guns, CAS and heavy armour, and is strong vs
  infantry in the open. Infantry screens armour in urban/forest terrain. Artillery suppresses AT.
  Bonuses apply only when the elements are actually present in the battle.
  *The design table (PLAN 3.4, ADR-139).* Each rule is a factor on a volley's damage and
  never on the choice of target. A formation's *side* is the formations of its battle that
  its nation is not at war with, itself among them; an arm is *present* on a side while an
  element of it there has strength left. The classes of an arm and the figures are in
  `data/combat.json` from the part that reads them.

  | # | rule | when | factor | part |
  |---|------|------|--------|------|
  | 1 | The three arms | the shooter's side has infantry (`inf`, `mot`, `mech`), artillery (`art`) and armour (`armor_l/m/h`) present | fire × 1.15 | 3.4a, implemented |
  | 2 | The screen | the target is armour (by its arm, not its `armor` figure) on forest or urban ground and its side has no infantry present; holding or moving | damage taken × 1.3 | 3.4b, implemented (ADR-140) |
  | 3 | Guns on guns | the shooter is an AT gun (class `at`) and its enemy (the battle's formations its nation is at war with) has artillery present | fire × 0.7 | 3.4c, implemented (ADR-141) |
  | 4 | The open | the shooter is armour (by its arm), the target has no armour (its `armor` figure is 0: not a tank, not mechanised infantry) and stands on plains, grassland or desert, and the target's side has no AT gun (class `at`) present | fire × 1.25 | 3.4d, implemented (ADR-142) |

  Beside the table, in since PLAN 1.13 (§5.2): a shooter's `hard` against an armoured target
  and its `soft` against another, × 0.5 when the armour beats its piercing. That is "AT vs
  armour": the AT gun of 1938 (hard 18, piercing 45) hits every tank of 1938 in full.
  Measured before rule 3 (PLAN 3.4c; 48 hours on plains, three seeds): of the tanks an
  infantry division (24 battalions, 3 batteries, 1 AT battery) takes from a tank brigade,
  its one AT battery takes 73 to 76 % (75 to 77 % in a forest), its battalions 21 to 22 %,
  its howitzers 3 to 5 %; from a panzer division 85 to 89 %.
  Measured before rule 4 (PLAN 3.4d; one volley of a light tank company at a holding
  battalion, plains = 1): grassland 1.16 (the tank's 1.1 ÷ the ground's 0.95), desert 1.05,
  forest 0.58 (0.8 ÷ 1.25 ÷ the battalion's own 1.1). So the terrain table already tells
  open ground from close, for every target and whoever is beside it. What it did not do:
  a division's AT gun changed what it took from the tanks (3.5 to 3.8 tanks in 48 hours
  against 0.5 for a division with none) and nothing of what the tanks took from it
  (1,312 men from either). Rule 4 is that.

  *The matrix* (`tests/unit/combinedArmsMatrix.test.ts`, the AT of PLAN 3.4; seed 5, 48
  hours, both holding, an attacker against an `infantry_div`; "men" are the battalions' men
  lost, "to tanks" those the tanks' fire took, "by AT" the tanks the AT battery took):

  | ground | attacker | defender | men | to tanks | tanks lost | by AT |
  |--------|----------|----------|-----|----------|------------|-------|
  | plains | tank brigade | the division | 1,356 | 1,319 | 3.76 | 2.73 |
  | plains | tank brigade | no AT gun | 1,685 | 1,649 | 1.01 | 0 |
  | plains | tank brigade | no howitzers | 1,372 | 1,326 | 3.48 | 2.73 |
  | plains | tank brigade | rifles alone | 1,727 | 1,680 | 0.74 | 0 |
  | plains | panzer division | the division | 3,261 | 2,684 | 1.96 | 1.63 |
  | plains | panzer division | no AT gun | 3,944 | 3,363 | 0.30 | 0 |
  | plains | panzer division | no howitzers | 3,330 | 2,739 | 1.89 | 1.63 |
  | plains | panzer division | rifles alone | 4,041 | 3,450 | 0.25 | 0 |
  | plains | tank brigade, its infantry destroyed | the division | 1,319 | 1,319 | 5.26 | 2.73 |
  | plains | panzer division, its howitzers destroyed | the division | 2,538 | 2,334 | 2.70 | 2.34 |
  | forest | tank brigade | the division | 797 | 767 | 3.17 | 2.39 |
  | forest | tank brigade | no AT gun | 797 | 767 | 0.78 | 0 |
  | forest | tank brigade | no howitzers | 807 | 771 | 3.00 | 2.39 |
  | forest | tank brigade | rifles alone | 817 | 782 | 0.60 | 0 |
  | forest | panzer division | the division | 1,952 | 1,546 | 1.70 | 1.43 |
  | forest | panzer division | no AT gun | 1,952 | 1,546 | 0.26 | 0 |
  | forest | panzer division | no howitzers | 1,992 | 1,578 | 1.66 | 1.43 |
  | forest | panzer division | rifles alone | 2,004 | 1,590 | 0.22 | 0 |
  | forest | tank brigade, its infantry destroyed | the division | 767 | 767 | 5.72 | 3.11 |
  | forest | panzer division, its howitzers destroyed | the division | 1,496 | 1,344 | 2.35 | 2.06 |

  What the test asks of it, each ratio to 3 % (48 hours cost a formation so little that the
  dead hardly move it). Rule 1: the panzer division's tanks take × 1.15 of what they take
  with its howitzers destroyed. Rule 2: in a forest the AT battery takes × 1.3 of tanks from
  the brigade with no infantry (3.11 for 2.39), on plains × 1. Rule 3: the health the AT
  battery takes off the panzer division's tanks is × 0.7 of that with the division's
  howitzers destroyed. Rule 4: on plains the tanks take × 1.25 of men from the division with
  no AT gun, in a forest × 1. "AT vs armour": the battery takes over 0.7 of the tanks lost,
  and a division without it under 0.3 of what the whole one takes.
- Tactical view: tank sprites with turret facing their target, muzzle flash, burning wrecks.
  *As built so far (PLAN 3.6a to 3.6c):* the hulls and the turrets, a turret that turns
  to its target as its shot leaves, and the shot from its muzzle (§8, "Tanks").

### 6.2 Naval
- Sea zones + lane graph (§3.3). Ports and naval bases are province buildings that
  repair, rebase and enable supply. *As built (PLAN 4.1c):* a list of the scenario with the
  two levels, each a node of the lane graph (§3.3). Read since by a fleet's orders and its
  lost base (4.2c, 4.4e), the shipyard (4.2e), the blockade, supply over sea and convoys
  (4.4b–d) and the landings (4.5).
- Fleets are formations of ship elements: DD, CL, CA, BB, CV, SS, TP. *As built (PLAN 4.2a):*
  the six templates and the seven ship types are in the rules (§3.6). *As built (PLAN 4.2b):*
  197 fleets stand at the water of their bases in 1938 (§3.6), paid for. *As built (PLAN
  4.2c):* a fleet sails by an order, over the lanes' way drawn tight, at a cruising share of
  its slowest ship's speed (§3.3, §3.6); the naval and invasion AIs order them since PLAN 4.6
  (§7), and a fleet weighs in a declaration and a war's exhaustion (ADR-274). Pack ice
  closes 21 seas to a fleet (4.2d, ADR-251); a fleet is built at its nation's shipyard
  (4.2e, ADR-252). Movement runs along
  lanes with continuous positions. Detection uses zone-level search plus element-level
  range.
- **Fleet battles** at element level: gunnery ranges (BB > CA > CL > DD), torpedoes
  (DD and SS, short range, high damage), carrier air groups (strikes from the CV's air
  wing at long range), screening (DDs protect capitals from subs and torpedoes).
  *As built (PLAN 4.3a, ADR-254; `src/sim/systems/navalCombat.ts`, after the land's combat):*
  - *Detection:* a fleet of a nation at war sees an enemy fleet within its best ship's
    `detection` km × (1 − the enemy's least stealthy ship's `stealth` / 100): destroyers
    see a battle squadron at 29 km and a submarine flotilla at 18.
  - *Contact:* two fleets of nations at war of which either sees the other and one has a
    weapon a ship of the other can be hit by: a gun or torpedoes for a surface ship, depth
    charges for a submarine (`canHit`, PLAN 4.8k, ADR-290); joined, a sea battle. A fleet in one is
    `engaged`: the movement system leaves it; it moves only to close.
  - *The closing* (PLAN 7.19a, ADR-493): from a battle's second hour a fleet with no enemy
    fleet of the battle within its reach (against a surface ship its longest gun, torpedo or
    carrier wings' quarter range; against a submarine its depth charges', its guns' reach)
    closes on the nearest it can hit, on the water (the straight line where it is water, else
    its sea way), by `closeBy` (its template's top speed): beyond both reaches the two close
    together to the longer reach, each its share by its pace; between the two the fleet of the
    shorter reach closes by what its pace has over the other's, to its reach, and the other
    holds it off; a fleet of submarines closes at its pace whatever the other's (under water).
    The record's range is the distance of its nearest two fleets at war with each other.
    Until 7.19a one range for the whole battle closed so while every fleet stood still, and
    ships fired at fleets up to 292 km off (seed 5591).
  - *Fire:* each ship fires at an enemy ship weighed by hit points (kept 4 hours, while
    within its reach) in the fleets its weapon reaches, by the distance of the two fleets: `hard` × (0.5 where the target's armour beats its piercing) ×
    `SEA_FIRE_SCALE` 2 × the buffs ÷ the target's hit points, in ships; simultaneous;
    FireEvents. Four battleships sink four light cruisers from 24 km in 5 hours, losing
    140 of 8,000 hit points and none in the first hour.
  - *Torpedoes and the screen* (PLAN 4.3b, ADR-255; `torpedo`, `torpedo_km`, `asw` of
    the units' data: destroyer 40 at 10 km and depth charges 10, light cruiser 20 at 8,
    submarine 70 at 6, its gun a deck gun of 3 at 4 km): a ship fires its torpedoes at its
    target where their reach covers the two fleets' distance, a submarine too (PLAN 7.19a:
    before, whatever the range); no armour against a torpedo; × the screen of a target that is no
    destroyer: 1 − `SCREEN` 0.6 × min(1, its side's destroyers ÷ its side's other surface
    ships). A submarine is no target of a gun or a torpedo: only of depth charges, within the
    reach of the hunter's guns (PLAN 7.19a: before, at any range). A submarine flotilla on a battle squadron for 3 hours: its larger ships lose
    1,323 hit points with its 8 destroyers, 3,200 with none.
  - *The battle's record and its end* (PLAN 4.3c, ADR-256; `world.seaBattles`, state,
    saved while there is one): its fleets with the ships each came in with, its range,
    its sides' first nations and the ships each lost, where it began. An hour's battle
    takes the record with one of its fleets (two such merge). A fleet under half the ships
    it came in with, or with no weapon against an armed enemy once under fire (a volley or a
    carrier strike on it that hour; until then it stands and the enemy closes, PLAN 7.31,
    ADR-526), breaks off unless it stands at the port it would sail for (`atOwnPort`: it
    fights there). A distance is within a reach with 1e-9 km over it (`inReach`). It breaks off: first each holed ship
    of it is lost or healed on a seeded roll whose chance is its wound, counted to its side's losses (PLAN 7.107, ADR-682); `BREAK_HOURS`
    24 out of every sea battle (its `retreat`: the contact search leaves it out, PLAN 4.8l), `FormationRetreated`, and sails for its
    nation's nearest port a ship reaches (in the basin of the water it stands on: zones that
    touch, a passage's ends, a strait's zones, PLAN 4.8o). With no fleet of one side left, or no contact in
    an hour, the battle is over: one row of the history log, `SeaBattle` (each side its
    nation and ships lost, packed as nation + 65,536 × ships; where it began): "Germany
    and United Kingdom fought at sea: Germany lost 0 ships, United Kingdom 7".
  - *Not yet:* air (5.4). The AI sails for a battle it can win and turns home outgunned
    (PLAN 4.6c, §7).
- **Sea control** per zone per side = Σ naval power present and recent wins. It decays.
  *As built (PLAN 4.4a, ADR-257; `src/sim/systems/seaControl.ts`, daily at 00:00):* a
  zone's power by bloc is the hit points of the live armed ships (a gun or torpedoes) of
  the fleets in it; the bloc of the most holds it unless a bloc at war with it has half its
  power there or more (`CONTEST_SHARE`), then nobody; with none of its ships there it keeps
  it 14 days (`CONTROL_DAYS`). State (`world.seaControl`, per zone holder and days), saved
  while a zone is held. 45 of 428 zones are held on the first day of 1938.
  *The blockade (PLAN 4.4b, ADR-258):* a port is blockaded when the zone of its water is
  held by a nation at war with the port cell's controller (`blockadedPorts`); a province
  whose every port a ship reaches is blockaded, and the cell of a blockaded port in no
  province, pay `BLOCKADE_SHARE` 0.5 of their land's income in the economy's month
  (`blockadedCells`). On seed 99 Japan blockades 6 Chinese ports in the first month, 19 by
  the twelfth; 24 provinces of 8 nations are blockaded then.
  *Supply over sea (PLAN 4.4c, ADR-259; `src/sim/systems/seaSupply.ts`):* a bloc's home is
  every land component holding a living member's capital and the one holding most of its
  cities. Another land with a port of the bloc (owned and held, water a ship reaches) is
  joined when a way from zone to zone (touching zones and the passages, `zoneLinks`) from a
  home port's zone reaches its port's zone through no zone held by an enemy of the bloc. A
  city is a source of the supply network only on a land that is home, joined, or has no port
  of the bloc (`seaLinkedAll`); at each refresh hour a bloc whose joined lands changed is
  refreshed whole (`markSeaLinks`; ADR-272). (At war with Italy Malta was cut at once while Italy's
  submarines held the zones about it; since PLAN 4.4d a submarine holds no sea.)
  *Supply over the beach (PLAN 7.70a, ADR-622; PLAN 7.75, ADR-630, the user's decision):* a coast
  cell the bloc controls that its cities' network does not reach is a beach source (`seaBeaches`)
  while a zone of the water beside it, not iced, is reached by such a way from a home port's zone
  (so no enemy holds it), on any land. The beaches feed a layer of their own
  (`World.supplyBeach`, saved): at each refresh hour, after the network's refresh, it is made
  whole, each bloc in ascending order flooding from its beach sources over the cells it controls
  that are in no network (`refreshBeaches`). A formation no network feeds (on its cell, or within
  `SUPPLY_REACH` off its side's ground) is fed by that layer at `BEACH_RATE` (1/16 an hour) to
  `BEACH_SUPPLY` (0.75) and no higher. A beachhead is fed from the refresh after its landing (up
  to 12 h on), a landing in France by a Britain whose bloc holds cities in Asia as well (from
  7.70a to 7.75 a beach was a source only on a land where the bloc owned and controlled no city,
  and of the network itself).
  *Convoys and raiding (PLAN 4.4d, ADR-260; `src/sim/systems/convoys.ts`):* the income of a
  land joined to home by sea goes by convoy along its way (`convoyWays`, the zones from a home
  port's to the land's port). In each zone of it the boats (S) of the nations at war with
  the bloc take min(1, `RAID_PER_BOAT` 0.05 × S) of what passes, × (1 − 0.6 × min(1, D / S))
  for the bloc's destroyers there (D); the land's cells pay the product of what each zone
  leaves (`monthlyAccounts`). The raids are told a quarter at a time (PLAN 7.33a, ADR-530): a
  zone's take is split among its raiders by their boats, each nation's gold taken of each bloc
  is added up over the quarter (`World.convoyQuarter`, state), and at the next quarter's start
  the `CONVOY_ROWS` = 3 largest are history rows (`ConvoyRaided`, b = the bloc and the gold in
  tenths), at the zone the raiders took most in. A
  submarine holds no sea (it counts for no zone's control). On seed 99 Italy raids British
  convoys in 5 months of the first year.
  *A fleet's loose ends (PLAN 4.4e, ADR-261):* a passage's bank is the land cell nearest the
  middle of its ends (`passageBank`); a passage whose bank a nation at war with a fleet holds
  is shut to its way (`orderSail`) and to its bloc's ways by sea (`passageShut`). Daily, a
  fleet that stands with a port its nation owns held by an enemy within 3 cells of it and
  none it holds there sails for its nation's nearest port (`rebaseFleets`); an enemy's own
  port is no lost base (ADR-264). A fleet in a passage's step is kept by a
  map import (its cell is the canal's land, its step's ends are water).
  It controls **supply over sea** (overseas formations and colonies), **convoys**
  (income from overseas provinces and trade), and **blockade** (an enemy-controlled
  zone adjacent to a port reduces its income and supply). **Submarines** raid convoys
  (sinkings logged).
- **Amphibious invasion**: formations embark on transports at a port, move with an
  escorting fleet, land on a coast cell (landing penalty, needs sea control or
  surprise), and receive naval bombardment support. A land formation ordered to another land
  (another component of the land grid) at a port its nation holds, where a transport group
  of its nation stands with room for it (2,000 men a transport), goes aboard: it is where
  its transports are, and no rule of the land reads it. They sail for the zoned water nearest
  the target (within 8 cells) and it lands at the nearest cell of the target's land, its org
  at most 0.5, then marches on to the target. Transports that stop elsewhere land it at the
  land within 3 cells of its side (its nation's, its bloc's, an ally's in the war) or no one's,
  no one's not where an enemy holds the sea there; else it stays aboard (PLAN 4.8n, ADR-294); sunk, they take it with them. With no port or no room the order
  is a march as before (PLAN 4.5a, ADR-262). A place aboard ends with its formation, and the troops its transports carried are lost with them (`destroyFormation`, PLAN 4.8m, ADR-292): a formation given a freed id is not aboard and carries nothing. A formation is at a port within 3 cells of its land cell or of its water (London's water is 7.5 cells down the Thames), and embarks at the first such port with transports for it (PLAN 4.9b, ADR-299). A player's order over the sea from where no transports wait marches to the nearest port of its land whose transports have room, and the order is kept (`world.seaBound`, saved) until the march ends: it embarks there and sails, or is refused with its reason; any order ends it. The AI's orders do not do this (its landings are its own, PLAN 4.6b). When the transports reach the landing water and its zone
  is held by a nation at war with the formation's, the landing is thrown back: they sail for
  their nation's nearest port and it lands there. A landing on an enemy's cell takes that
  cell (the beachhead), from which the front spreads; its disorder (org 0.5, fire 0.625) is
  the landing's penalty (PLAN 4.5b, ADR-263). A fleet that stands off a coast fires each ship with a
  gun (not a submarine) at the nearest enemy land formation in a fight within its reach
  (a destroyer 12 km, a battleship 32 km), at the element with the most hit points, with a
  land volley of its soft attack × 2.5 (a ship is many guns); the losses take org as a
  fight's do (PLAN 4.5c, ADR-265). **Crossings** remain for AoC-parity
  walkable straits.

### 6.3 Aircraft
- Air wings of fighter, tactical bomber, strategic bomber, CAS, naval bomber and transport,
  based at airbases (province building) or carriers. Range is limited from the base.
- Missions (per wing, set by AI or player): air superiority (zone patrol),
  interception, CAS, tactical bombing, **strategic bombing** (industry, ports, cities,
  then income and production), naval strike, paradrop/air supply.
- Each hour per zone: the scheduler launches **sorties**. A sortie flight path is
  derived kinematics `(base, target, launchTick, speed)`, so its position is never stored.
  A nation's patrols over one place take off in turn, an n-th of a wing's cycle apart, the
  launch within the hour where that falls (PLAN 7.36a, ADR-558).
  Air combat is at element level between sorties in the same zone. AA from ground
  elements, buildings and ships shoots down planes.
- *As built (PLAN 5.1a, ADR-306; `src/sim/nav/airZones.ts`, `airOf(world)`):* the air zones are
  the sea zones over water (428 on the 1938 map) and, over land, regions of whole nodes of the
  province graph of about 300,000 km² (`AIR_ZONE_KM2`; 1.5 M until PLAN 7.36b, ADR-560, when
  London, Paris and Berlin were one zone 4,000 km across), 405 in 1938, 85 of them islands
  alone (the others 82,000 km² to 3.1 M, the largest a province of Siberia, Canada or Australia
  alone): seeds on a lattice of that side in km, each region grown from its seed over the graph
  by the km between the nodes' centres; a land mass under a third of the target (an island) joins
  whole the zone of the nearest seed if that seed is within 450 km (`ISLAND_REACH_KM`), else it is
  a zone of its own that later islands within reach of it join (PLAN 7.36b2, ADR-562: the Azores
  were in a zone of the Sahara); a region under a quarter of the target joins its neighbour of
  least area. Derived, not saved; the sorties' zones (`airborne`), air superiority and the air AI
  read it.
- *As built (PLAN 5.1b, ADR-307):* the nine aircraft types of `data/units/air.json` are in the
  rules after the ships, and six wing templates (`data/templates/air.json`) after the fleets: a
  fighter group (3 squadrons of 12), a tactical bomber group (3 × 8), a strategic bomber group
  (4 × 6), a close support group (3 × 10), a naval bomber group (3 × 8) and an air transport
  group (4 × 6). A wing is a formation of an air template. The 1938 start has its wings (5.1d);
  none is built yet: the order to build one is refused (no domain but the land's and, with a
  shipyard, the sea's), as is the spawn (`NotOfLand`); the build list leaves them out (PLAN 5.8s).
- *As built (PLAN 5.1c, ADR-308; `src/sim/data/airbases.ts`, `data/scenarios/1938/airbases.json`):*
  every capital city is an airbase of level 4, a city of size 5 one of level 3, and 27 main air
  stations of 1938 are listed by hand (Mildenhall, Le Bourget, Tempelhof, Guidonia, Monino,
  Kasumigaura, Langley Field…, levels 4 and 5; the levels raised at 5.1d to hold the start's air
  forces): every living nation holds one. Who
  holds the cell holds the base; its room is the airbase building's 50 aircraft a level. Static
  data of the scenario (`world.airbases`), as the ports are; the random world has them too.
- *As built (PLAN 5.1d, ADR-309; `data/scenarios/1938/air.json`, `addWings`, `src/sim/systems/air.ts`):*
  the 1938 start has 216 air wings: 198 of the nations' air forces by template at their airbases
  (the base with the most room left that holds the wing; Germany 28, the Soviet Union 30, Britain
  20, Italy 17, Japan 16, France 15, the United States 15, a few for 33 more nations; a wing of
  the start stands for about three first-line groups of the record) and a naval bomber group on
  each of the 18 carriers. A wing's base is state (`world.wingBase`: an airbase, or a carrier's
  fleet, which it follows hourly, `airSystem`; it is lost with its carrier: a fleet keeps a wing to
  each of its live carriers, the lowest ids, and a rebase to it counts them, PLAN 5.8l, ADR-335;
  one whose airbase a nation not of its side took falls back to its nation's nearest airbase with
  room, its mission ended, or is lost with none, PLAN 5.8m, ADR-336). It is paid; it weighs
  nothing in a reckoning of forces; no rule of the land's march, supply or fire reads it
  (`World.offLand`: afloat or a wing); a wing at its base is not drawn (left out of the
  snapshot's formations), its sorties are (5.7a).
- *As built (PLAN 5.1e, ADR-310; `orderMission`, `orderRebase`):* a wing's range is the least
  `range_km` of its aircraft, from its base (a carrier's moves with its fleet). A mission (patrol
  about a place, strike a place; `world.wingMission`, saved) beyond it is refused with its reason
  (`OutOfRange`). A wing rebases at once to an airbase of its side (its nation, bloc or allies at
  war) within range with room for its aircraft, or to a carrier of its nation's with a free deck;
  else `OutOfRange` or `NoBase`.
- *As built (PLAN 5.2a, ADR-311; `src/shared/sorties.ts` since 5.7a):* a sortie is its launch (base,
  target, launch tick, speed, km, hours over the target); `sortieAt` gives its place and leg at
  any time by a straight line between base and target at its speed. A strike turns at once; a
  patrol stays over its zone for the fuel its range leaves it (2 × (range − km) ÷ speed), at
  most 4 hours.
- *As built (PLAN 5.2b, ADR-312; `airSystem`, `airborne`):* each hour a wing with a mission and
  no sortie launches one from its base (state: `world.sorties`, saved; the wing's row stays at
  its base); home, it turns round 2 hours. `airborne` gives the sorties in the air at a time by
  air zone, from `sortieAt`: where interception is reckoned (PLAN 5.3).
- *As built (PLAN 5.3a, ADR-313; `airCombat`):* each hour the sorties in one air zone of nations
  at war fire on each other (since 5.7d those within 150 km of each other): a squadron's aircraft × its air attack × 0.05 over the target's
  defence, in hit points, the losses in aircraft carried as on the land (× 0.25 until PLAN 7.24a0,
  ADR-502: an even fighter fight 2.6 % an hour each side, 13 % before; the air forces of 1938
  were gone in three weeks of war). A wing with none left is
  lost; a sortie that lost a quarter in the hour turns home. Fighters beat bombers by the data.
- *As built (PLAN 5.3b, ADR-314; `antiAir`):* a sortie in the air is fired on by the formations of
  its enemies within a cell of its place, land and fleets: each element's `aa` per full element
  × 0.2, over the aircraft's defence; a tactical bomber group over an infantry division loses
  0.13 % an hour (× 2 and 1.25 % until PLAN 7.24a0, ADR-502).
- *As built (PLAN 5.3c, ADR-315; `airSuperiority`):* per air zone per nation the air power flown
  there (a sortie's aircraft × air attack an hour, half-life a day; `world.airPower`, saved); a
  nation's superiority there is its side's share of its side's and its enemies' power, a half
  where neither flew.
- *As built (PLAN 5.4a, ADR-316; `airFactor` in `combat.ts`):* a formation's fire in a land battle ×
  (1 + 0.2 × (2s − 1)), s its nation's air superiority in its zone: 1.2 with the air, 0.8
  without, 1 at a half.
- *As built (PLAN 5.8t1, ADR-345; `supplySystem`):* a formation fed gains its supply × (1 + 0.5
  × (2s − 1)) an hour: half the rate under the enemy's air, one and a half under its own.
- *As built (PLAN 5.8t2, ADR-346; `factsOf` in `navalCombat.ts`):* a fleet's detection (its
  carriers' wings with it) × (1 + 0.25 × (2s − 1)): 1.25 under its side's air, 0.75 under the
  enemy's.
- *As built (PLAN 5.8t3, ADR-347; `strikeFactor`):* a strike's fire on the enemy's elements and
  its tons on industry and ports × (1 + 0.25 × (2s − 1)), s the striker's superiority over its
  target: 1.25 under its side's air, 0.75 under the enemy's.
- *As built (PLAN 5.8u1, ADR-348; `airLift`):* a transport wing's mission may be `supply` (a
  wing not of transports is refused it, `NotLand`). Its sortie, at the target in the hour it
  arrives, lifts 1/48 of a formation's supply an aircraft (a group of 24: a half) to its side's
  formations on the land within a cell that are short of it, the same share each, none past
  full. The air AI's transports fly it (5.8u3a, ADR-350): daily, to the nation's own land
  formation under half its supply nearest their base within range.
- *As built (PLAN 5.8u2, ADR-349; `orderParadrop`, the `paradrop` command):* a formation of
  infantry alone, not in contact, at an airbase its nation holds, is flown by its nation's
  transport wings based there and on the ground (the fewest by id whose 64 men a plane lift its
  men) to a land cell in their range held by its side, an enemy or no one. It stands there at
  once, its org at most 0.5, an enemy's cell its (a beachhead's rule); the wings fly the sortie
  out and home. Else refused: `NotLand`, `NoLanding` (water), `NoRoute` (a nation at peace),
  `OutOfRange`, `NoAirlift` (no lift there, or in contact). The air AI drops (5.8u3b, ADR-351):
  daily, before its wings' missions, a formation that can be dropped, not on the front, on its
  nation's front formation nearest it.
- *As built (PLAN 5.4b, ADR-317; `strikes`):* a strike sortie at its target fires once on the
  enemy's land elements within a cell: its aircraft × soft or hard attack × 0.2, in units over
  their hp, spread by their health; carried as on the land. A close support group takes about
  117 men of an infantry division a strike. On a formation not in contact, a quarter of it
  (PLAN 7.110b, ADR-692). The k-th strike in a day that hits one land formation fires at
  1 / (1 + k) on it (PLAN 7.144, ADR-737; `formations.struck`, cleared at 00:00): what the first
  left is dug in or scattered. Without it, the larger air forces of ADR-736 wore the few
  formations of a war away from the air before they met the enemy's; ships are not dimmed.
- *As built (PLAN 5.4c, ADR-318):* a strike on enemy ships fires its aircraft's hard attack
  (halved on armour beyond its piercing) × 1 in hit points; each squadron's share on the ships
  (their health of the whole) goes on one ship, picked by hit points (PLAN 7.61, ADR-606: spread
  over all, alike ships sank together); what is aboard is not struck.
- *As built (PLAN 5.4d, ADR-319):* a carrier's wings on board see and strike for its fleet as far
  as a quarter of their range (250 km): its detection and its reach in a sea battle; once in 4
  hours they strike the enemy's surface ships of the battle as a naval strike does, but each
  squadron puts its whole fire on one ship, picked by hit points as a gun picks (PLAN 7.60, ADR-605):
  spread over all, alike ships sank together, a whole fleet in one strike.
  Out of a sea battle (PLAN 7.145, ADR-738; `airAi`): an AI nation's carrier wings, their fleet at
  war, take a naval bomber's missions from the deck, as land-based wings do: the enemy's fleet
  nearest in range, else its front, else its land forces in range; they never rebase. When their
  fleet is in a sea battle, an AI's carrier wing ends its mission in that hour (`airSystem`; one
  aloft flies its sortie out) and strikes for the fleet. Until then they struck only in a sea
  battle, and the carriers at war stood by ports of enemies with no fleet afloat (PLAN 7.141).
  A deck whose wing is lost is re-manned (PLAN 7.151, ADR-746; `economicAi` 3c0): monthly, an AI
  nation puts a carrier wing aboard a carrier afloat with none, a deck a fleet a month, at the
  wing's gold and men under the wing rebuild's reserve; aboard at once, wherever the fleet is.
  The formation panel of a fleet with carriers lists the wings aboard and their missions.
- *As built (PLAN 5.5a, ADR-320; `bombIndustry`, `repairSystem`):* a strike on land drops its
  aircraft's bombs (`bomb_t`) on the enemy's industry within a cell of its target: each cell
  there out of work by tons × 2 $M over their industry together (at most 0.9); the monthly income
  takes it off; repaired 2% a day.
- *As built (PLAN 5.5b, ADR-321; `portShut`):* the bombs damage the enemy's ports within reach by
  tons over 60 × the port's level; repaired as industry; a port damaged by a half or more embarks
  no one and its yard delivers no fleet.
- *As built (PLAN 5.6, ADR-322; `airAi`):* daily, a nation at war sends its fighters to patrol
  over its front, its close support and tactical bombers to strike the enemy's, its naval bombers
  at the enemy's fleets, and its strategic bombers at the enemy's richest industry in range where
  its side holds the air (superiority 0.6 or more), but for one group a nation holding a warhead
  and no missiles keeps home for it (its lowest id, `nuclearReserve`; PLAN 7.37a, ADR-561); at
  peace, no missions. Spread (PLAN 7.24a,
  ADR-503): of a nation's wings, by id, each takes of the formations its role and range allow the
  one with the fewest of its wings of its kind sent there that day, the nearest of equals. Over
  the men (PLAN 7.24d, ADR-504): a fighter's patrol over its formation in contact is set on the
  middle of that formation's deployed block (`deployOf`, worked out afresh from the state,
  `withFreshDeployments`), where that is in its range; else on the formation's place.
- *As built (PLAN 5.7a, ADR-323; `render/units/sorties.ts`):* the snapshot carries the sorties in
  the air; the page draws each as planes of its nation's colour where `sortieAt` (in `shared/`)
  has it at the frame's time (in the hour the snapshot ends, as the formations are played: 5.7d),
  a patrol circling over its target, T0 to T2 (every tier since PLAN 5.9; its circle at most 0.6 × its
  share of the view's smaller half side on the screen since PLAN 7.24c, so at T3 it stays over the
  fight the camera is on; the circle is the page's, the sim's place its middle). A plane is its
  nation's sprite tint, its edge under its fill (dark at T3, light further out), and at T3 at least
  PLANE_MEN = 5 figures of a man wide, the air's marks scaled with it (PLAN 7.51a, ADR-609). From 8 m/px in
  that symbol crossfades into the plane at its wingspan (`WINGSPAN_M` by role), all of it from 4 m/px: a
  fighter some 3 px at 3 m/px, under 12 px with no edge and its shadow cast to the side (PLAN 7.108a,
  ADR-684); the air's marks keep their size.
- *As built (PLAN 5.7b, ADR-324; `render/fx/air.ts`):* an hour's air fight is tracers and flak with
  smoke trails for the aircraft lost; a strike, bombs bursting about its target; a sortie under
  AA (`FlakFired`), flak puffs about it; on the render clock, T0 to T2.
- *As built (PLAN 5.7c, ADR-325):* the air-superiority map mode tints each air zone whose air a
  nation holds (superiority 0.6 or more) with its colour, stripes a contested one, and fades the
  rest; daily from the worker.
- *As built (PLAN 5.7d, ADR-326):* a sortie fights the enemy's sorties of its zone within 150 km of
  it (an air zone is too wide to be one fight); each meeting is a fight of its own, told between
  its nearest foes. The air battle demo: `tests/e2e/airDemo1938.spec.ts`.
- **Air superiority** per zone per side (0–1) modifies ground combat, supply,
  naval detection and bombing accuracy. *As built:* ground combat (5.4a); supply, naval
  detection and bombing accuracy not yet (PLAN 5.8t).
- *As built since* (PLAN 5.8u, ADR-348 to ADR-351): the transports' missions, air supply and the
  paradrop, above. Interception is no mission of its own: a patrol meets what comes within 150 km
  of it (5.7d).
- Tactical view: plane sprites flying sortie paths, dogfight tracers, bomb impacts,
  flak. *As built:* 5.7a and 5.7b, at T0 to T2.

### 6.4 AI nuclear weapons
- **Programme**: tech chain (fission research → enrichment → bomb → thermonuclear →
  ballistic missiles; as built, `data/tech/nuclear.json`: atomic research → reactor → bomb →
  thermonuclear, rocketry → ballistic missiles; no SLBM, ADR-434). It is expensive in industry and gold, and gated by
  `nukesAllowed` (global and per nation).
- **Stockpile**: warheads are built over time with upkeep, while the stockpile's upkeep stays
  under STOCKPILE_SHARE (0.1) of the nation's income; a nation short of money scraps the warheads
  over that share before its fleets and its army (PLAN 7.3g, ADR-439). **Delivery**: bombers (can be
  intercepted by fighters and AA, need range) or missiles (later tech, hard to stop).
- **Use decision** (nuclear AI, daily, at war only). Utility:
  `U = targetValue·desperation·doctrine − through·(retaliationRisk + allianceCost +
  globalOutrage + tabooBarrier + deadCost)`, with targetValue already × through, the chance the warhead gets
  there: U is through × the utility of a burst, whose costs fall only on a burst; a launch stopped
  short spends its warhead and nothing more (PLAN 7.18i, ADR-491).
  - targetValue: enemy capital, industry, fleets in port, massed formations, Major-Battle
    fronts. Uses expected damage from blast radius × local value. An enemy capital counts on a
    first strike only with an army in the blast (at least a hundredth of the theatre's men); on a
    strike back it counts whole (PLAN 7.62, ADR-629, the user's decision: an empty capital is no
    first strike's target). Men are weighed as a share
    of the enemy side's men in the place's theatre (within 1,000 km), and that theatre counts
    for at least a quarter of all the side's men: a lone garrison is not the whole of its
    theatre (PLAN 7.18c, 7.18j, ADR-492). It counts for at least 250,000 men too: a burst is
    weighed by what it destroys, whole at 25,000 men, not by its share of a beaten side's last
    men (PLAN 7.32a, ADR-528).
    Only an enemy that can threaten the striker is struck first: it holds a warhead, its income
    is a quarter of the striker's, or its land forces stand near the striker's capital (PLAN
    6.12a, 6.12f, ADR-394). A puppet counts its overlord's warheads and income only while the
    overlord fights beside it in that war (PLAN 7.37d, ADR-564).
    A place within a hydrogen bomb's blast of a burst of the side's in the war: no capital for the
    rest of the war; a place of massed men only with more men than the burst found (PLAN 7.38d,
    ADR-569), twice them within a year of the burst (PLAN 7.50b, ADR-600).
  - desperation: rises with losing war score, capital threatened or taken in the war (PLAN
    7.76, ADR-631: the capital moves after its fall, with no enemy near the new one), core
    loss, and fightToDeath.
    A holder winning or holding its own in a war of a year or more, against enemies that
    cannot strike back, weighs as at a desperation rising to 2 at two years (resolve to end
    the war; one such strike a side every 90 days, three in a war at most; places anywhere on
    the land of enemies holding a tenth of their side's output; PLAN 7.18e, 7.18h, ADR-488 to
    ADR-490).
  - retaliationRisk: the enemy's *and its allies'* deliverable second-strike capacity ×
    their doctrine, plus survivable assets (dispersed bombers: a bomber flying counts, ADR-385;
    submarines carry no warhead, ADR-434). A puppet's warheads answer no strike: it weighs none
    and no one launches them, so they count neither here nor for MAD, and the panel's deterrent is
    the nation of most of this capacity (PLAN 7.52a, ADR-610).
  - taboo: a global value that starts high, drops sharply after the first use worldwide,
    and recovers slowly. When both sides have assured second strike (**MAD**), the
    utility of first use is ≤ 0 unless desperation is extreme (fightToDeath or capital falling).
    In extreme desperation the taboo weighs half (PLAN 6.7).
    After a burst a side waits STRIKE_GAP_DAYS for the answer before its next first use in that
    war (PLAN 7.25b, a week; two months since PLAN 7.96c, ADR-660 a: the broken taboo made a week's
    wait a volley), a nation fighting for its life as well. A strike back is not held.
  - allianceCost: 0.05 for each ally not at the striker's side in that war, to 0.3; half of it in
    extreme desperation, as the taboo (PLAN 7.48, ADR-581: the critic's overrun France, three
    allies apart, its bomber's strike on Berlin 0.017–0.020 under the floor for 15 days).
  - doctrine and aggression come from traits. Retaliation-doctrine nations strike back after
    being hit.
  - deadCost: 0.1 for each million people (anyone's) the burst is expected to kill at the yield
    weighed, × (2 − doctrine) and at least × 1, so a high doctrine does not ease it (PLAN 7.45,
    ADR-572): a strike back weighs it too, its bonus as it was (PLAN 7.38c, ADR-568). A holder of the hydrogen bomb weighs each place at both yields (PLAN 7.38b,
    ADR-567) and uses the yield of the higher utility, each with its own dead (PLAN 7.44,
    ADR-571); a tie goes to fission.
  - The floor: a strike is decided above NUKE_FLOOR (0.025, PLAN 7.25a), and above 0.1 for each
    million people it is expected to kill (× the chance through), to 0.1 at a million (PLAN 7.50a,
    ADR-599: in extreme desperation gain and costs of 1.5 to 1.9 each made a million dead a near-tie
    at 0.026). Each yield is weighed by its utility above its own floor.
- **Effects**: blast radius (by yield) kills elements by distance falloff and
  destroys city industry and population. A thermonuclear warhead is THERMO_YIELD (50) fission
  ones (PLAN 7.20, ADR-495): its blast and its fallout plume the yield's cube root wider and
  longer, the people killed of the blast's share the yield's ⅔ power more (a fission bomb's
  BLAST_PEOPLE 0.05: about 190,000 dead at Paris, 350,000 at Berlin; a hydrogen bomb's 15 to 21
  times that), and its ruin on the map its blast's size. Cells get FALLOUT (attrition, income loss,
  movement penalty) that drifts with a deterministic seasonal wind field and decays over
  years. Plus a stability shock and a war-exhaustion jump.
- **Consequences**: relations hit with every nation (scaled by distance and alliance),
  the striker's alliance unity drops, the target may sue for peace or retaliate, global
  outrage persists, and economic shocks follow.
- **Presentation**: flash, shockwave ring and mushroom cloud at every tier (scaled), an
  alert banner, an auto-pause option, a camera "go to" button, a history-log entry and a
  fallout map mode. An AI's decision to strike is a history row of its own, told by the city
  nearest its place and its utility in words, never as a number: "after long hesitation" under
  0.1, "after weighing it" under 0.5, "without hesitation" from there (PLAN 7.25c).
  A strike's row and its alert tell the civilians killed and the men, guns (artillery,
  anti-tank, anti-air) and tanks lost, or that no troops were in the blast: the forces lost are
  a companion history row (`NukeToll`) read into the strike's row, and a game saved before it
  tells the dead alone (PLAN 7.32b, ADR-529).
  The alert goes once its strike is 72 hours of the game old and it has been shown 8 seconds (a
  paused game's stands), and the panels of the centre stand below it (PLAN 7.25d).
  The nation panel of a holder at war says why it does not strike, in its war whose best place
  weighs most (`restraintOf`, read and never a rule): a puppet, its AI off, barred, avenging,
  waiting for the answer, no threat, no target, deterred by a named enemy (or mutual
  destruction), its allies, the world's outrage, the taboo, the people it would kill, no value, not desperate, its doctrine;
  or that it would strike but has no means, or none in range (PLAN 7.37f, ADR-565).
- **God Mode**: toggle nukes globally and per nation, grant warheads, force a strike.

---

## 7. AI

- **Strategic AI** (daily, staggered): utility scoring over candidate actions
  (declare war, sue for peace, accept peace, join or leave an alliance, form a coalition, create or
  release a puppet, guarantee, integrate). Inputs: relative strength (incl. allies),
  opportunity (the target is at war elsewhere or weak), aggression and traits, war exhaustion,
  gold (broke → peace), core claims, threat from the largest nation (coalition),
  fightToDeath.
  *Implemented v1 (PLAN 1.24, ADR-36; `src/sim/ai/strategic.ts`), runs first in the tick:*
  - *Cadence:* each nation acts weekly (staggered by id), with hash-seeded draws.
  - *War:* a nation needs aggression ≥ 15, must not be a puppet or broke, and may have at most
    2 wars. utility = aggression/100 × (min(3, attack/defence) − 1) + 0.3 if the target is at
    war + 0.3 for claims − exhaustion/100 − 0.4 × wars. Attack = own strength + 0.4 × alliance
    partners; defence = the target's strength + 0.4 × (partners + guarantors) (ADR-47); a puppet is read as its realm, the overlord's strength with the partners and guarantors of both (ADR-183). It declares on the best target with utility > 0.5, with probability 0.25 ×
    aggression/100.
  - *Stalemate peace:* a war older than 720 days, with |score| < 15 and both sides' exhaustion
    above 40, ends in peace.
  - *Alliances:* an unaligned nation bordering an aggressive neighbour more than 1.5× stronger
    joins a neighbour's alliance or forms one (30%).
  - *Coalitions:* monthly, the unaligned neighbours of a nation earning > 25% of world income
    form or join a coalition.
  - *Rivals apart (PLAN 7.53b, ADR-586):* the great powers are the 6 strongest living nations that
    are no puppet. From 3 years after the scenario's start, monthly, each great power of an
    alliance but its first (the leader if it is one, else the strongest) loses 30 loyalty while it
    fights no great power together with the first, and leaves under 25; a great power joins no
    alliance that holds another (against a threat, a coalition), and an alliance against a threat
    or a coalition is founded with one great power at most.
  - *Switches:* `setAi` per nation; setting `aiEnabled`.
  - *10-year AT:* `tests/sweep/` runs 3 seeds as its own `npm run check` stage.
- **Operational AI** (every 6 h): assigns formations to fronts proportionally to
  threat, keeps reserves, launches offensives at local superiority ≥ k (with armour
  spearheads), sets defensive postures, tasks fleets (sea control around coasts, convoy
  escort, raiding, invasion), tasks air wings (superiority over active fronts, CAS on
  Major Battles, strategic bombing when superiority is high).
  *Invasions (PLAN 4.6b, ADR-268, ADR-511; `src/sim/ai/invasion.ts`):* daily, staggered weekly
  by id, a nation with no formation aboard and a war in which it has no land front today takes
  its transport group with the most room at a port it holds, and aims at the port nearest them,
  of an enemy of such a war, whose sea is open to it (not closed by ice, not held by its enemy)
  and in the waters they sail (not a lake across land, not behind a passage shut to it: PLAN
  7.56b, ADR-597); or, nearer them by sea, the capital of such an enemy held by one of them on a
  coast, at the distance of a water cell beside it that passes the same tests (PLAN 7.69,
  ADR-621: a capital on a land where its nation holds no port was never invaded); a port wins a
  tie. The landing goes ashore by the target, port or beach (`orderLanding`).
  Its free formations at that port (within 3 cells of its land cell or of its water, as an
  order over the sea takes them: PLAN 7.49f, ADR-593) go aboard there, one after another on the
  one transport group, under way once the first is aboard, until it has no room for the next
  (PLAN 7.72, ADR-625: before, every trip carried one formation), and on no other group: one
  ordered on a full group is refused, and the port's next group takes the rest in its own try (PLAN
  7.90g, ADR-649: before, it went on another group standing there, which sailed with it alone); with none there, the nearest on the port's
  land are sent to it to fill the room (one whose march there is refused is passed over, the send
  ending at the third refused march that was a search: PLAN 7.54a, ADR-594); with the nearest
  unable to march there (the transports in an exclave), the transports sail instead for a port
  of the nation that one of its four nearest can march to, and nobody is sent that day (PLAN
  7.54b, ADR-595). A nation with a front in another war uses only
  formations beyond the deploy range of its own front on their land. A formation on the march to
  a port where its nation's transports stand is not one the operational AI plans with (PLAN
  7.56a, ADR-596: it manned an ally's front with them on the way). A landing takes a cell a nation owns where the target is owned.
  The ferry (PLAN 7.49d1, ADR-612), in the same turn and lock when no landing gave an order (no
  target, or nobody at its port nor on its land: PLAN 7.64, ADR-617): a
  nation with a land front ships its free formations standing on a landmass with none of its
  front cells to its own port on a front's land nearest a front cell of its own there (straight
  cells; the nearest its transports by sea on a tie; PLAN 7.63, ADR-616; open, unbombed, not held
  by its enemy), boarding them as a landing does; transports standing at a port on a
  front's land, or on a land with none of that army, sail instead for a port of its that the
  army's formations nearest them can march to. With no such port of its own, an ally's (PLAN
  7.49d2, ADR-613): of the ports held by nations fighting beside it that pass the same tests, the
  nearest a front cell of its own on that land, the nearest by sea on a tie. A nation with no
  front cell of its own (its land front its allies' alone) takes as its front cells their cells
  beside the enemies it fights with them (`wars.together`; PLAN 7.64, ADR-617). A beachhead with
  no port (PLAN 7.70c, ADR-624): on a front's land where no port of its own nor of an ally passes
  those tests, a front cell of its own beside water that passes them (its zone not iced, in the
  transports' waters, held by no enemy) stands as its port there, on the front itself (nearer it
  than any port not on a front cell; the nearest the transports by sea of such cells), so the
  ferry reinforces a landing on a coast with no port.
  A new front (PLAN 7.70b, ADR-623), in the same turn and lock, after a landing that gave no order
  and before the ferry: a nation with a land front of its own that it holds (its land formations'
  men in the squares of the deploy range's side about its front cells, and those beside, at least
  those of the nations at war with it there, and more than none: a front with nobody of either
  side about it is not held, PLAN 7.73c, ADR-628) lands its free army (standing, beyond the deploy
  range of its front on their land) on an enemy's coastal city, of the enemies of its wars with a
  front, more than the deploy range from its front, with a water cell within 2 cells passing the
  landing's tests and reached by its bloc's way from home (a beachhead there is fed from the
  beach, §6.2; on any land since PLAN 7.75, ADR-630): the most worth (3 for a capital, 1 for another city, times the deploy range
  over its straight distance to the nearest cell of the nation's front: near the enemy's front's
  rear, PLAN 7.73a, ADR-626) over one more than the enemy's land formations within 10 cells;
  nearest by sea on a tie. Its free formations at the
  port go aboard as a group: once their men fill three quarters of the room, or no more of its
  free army on the port's land is left to come (the rest sent there meanwhile; none aboard while
  one marches there and is there within a week, the nation's next invasion turn, by its path at its
  pace; a march in a fight or before an enemy's cell, or one farther, is not waited for: the group
  at the port goes aboard as it is, or with nobody there the turn is the ferry's, PLAN 7.73b,
  ADR-627), each on the same transports, passing over one with no room left. A front not
  held leaves the turn to the ferry.
  *Fleets at sea (PLAN 4.6c, ADR-270; `src/sim/ai/naval.ts`):* daily, staggered weekly by id. At
  war, each warfleet (power: its armed ships' hit points, submarines left out) standing at a
  port of its nation sails, within 2,500 km, to a landing of its nation's under way (escort),
  else to the nearest enemy port whose zone's enemy power is no more than that of its nation's
  warfleets in port within 2,500 km of it together, or, nearer, to a standing enemy warfleet
  within 2,500 km in its sea basin whose zone passes the same test (PLAN 7.35d2c, ADR-550); one
  away from its ports where the enemy is over 1.5 times its power turns home. Any other warfleet away from its ports at war gets a new
  order on its day (PLAN 7.35d2b, ADR-549): by such a standing enemy warfleet, it stays; else the
  nearest battle in reach that it and its fleets there together can win, a standing enemy
  warfleet from any zone, or from a zone with no enemy ship an enemy port with enemy ships in
  its zone; else, from a zone with no enemy ship, the nearest standing enemy warfleet of its waters
  beyond 2,500 km whose zone's enemy power is no more than its nation's standing warfleets of those
  waters together (the chase, PLAN 7.39b, 7.46c, ADR-580); else, by an
  enemy port's water, it keeps its station (the blockade); else the nearest enemy port a sortie
  may take; else home. At peace a fleet away from its ports turns home.
  A fleet the editor placed holds its place instead (`World.station`, saved
  while there is one; PLAN 7.22c, ADR-500): the AI sends it nowhere and sails it back when a
  battle drew it more than 3 cells off; a player's order that sails it, or its breaking off
  beaten, lets go of the place. At war it holds its sea (PLAN 7.59, ADR-608): it sails for the
  nearest standing enemy warfleet in the zone of its place whose zone's enemy its nation's
  warfleets together can win (its own power counted with them there), then back to its place.
  At war, a submarine flotilla that stands off an enemy bloc's convoy way sails for the
  nearest zone of one within 4,000 km (PLAN 4.6d, ADR-271).
  *The navy's cost (PLAN 4.6e1, ADR-273; `src/sim/ai/economic.ts`):* a nation keeps its navy's
  upkeep near 12 % of its income. Monthly, after its army's orders, a nation with a shipyard
  and no fleet in training orders one while under it, if the books and the reserve allow: a
  battle squadron from an income of 1,000, a cruiser squadron from 200, a destroyer flotilla.
  The order and ADR-557's saving read the upkeep of its armed fleets alone (PLAN 7.46b1,
  ADR-574): submarine flotillas and transport groups do not stop a warship; the lay-up reads
  every fleet.
  ADR-557's saving (a nation with no armed fleet keeps a warship's price over the reserve from its
  army's orders and refills) holds in peace, at war with its army at its peacetime share, and at
  war with an enemy that has an armed fleet (PLAN 7.46b2, ADR-575). At war with such an enemy it
  holds too for a navy rebuilt to a ship or two, its armed fleets' upkeep under the share (PLAN
  7.47, ADR-579). Not for a nation of FEW_FORMATIONS (3) land formations or fewer: at war with
  such an enemy its army orders first, as against an enemy with no fleet (PLAN 7.49c, ADR-590).
  Nor, in peace or war, for a nation that holds a land front (a cell beside one of the other side's)
  in a war where its side has fewer men on land than the other (`outnumberedOnLand`; PLAN 7.146,
  ADR-739): the weak side of a long-front war orders for its front first.
  Its transport group is bought apart (PLAN 7.26h2, ADR-518), before research and the army's
  orders, outside the navy's share, on a month of reserve: at war, in a war in which it has no
  land front and whose enemy holds a port, with a free formation on a land with a port of its
  own and no group (a group with room under an infantry division's men is none: sunk to one or
  two transports, it carries no division and is never refilled; PLAN 7.55, ADR-598); while it
  wants one it orders no other fleet. The ferry's want orders one too (PLAN 7.49d3, ADR-614): a
  land front (with no front cell of its own, its allies' cells beside the enemies it fights with
  them, as the ferry's: PLAN 7.66, ADR-618), a port of its own or of an ally in the war on that front's land (or a front cell of
  its own there beside water not iced, a beachhead's: PLAN 7.70c, ADR-624), and an island army
  (standing on a land with a port of its own and no front cell of its, or on a front's land with a
  port of its own and reaching none of its front cells, the ferry's own test: PLAN 7.90e, ADR-648)
  of more men than its
  transports' room; it stops no other fleet, and its transports in training hold back no
  warship, as it holds for the war's length. Short of money and over
  it, it lays up its fleets in port, the dearest first, before its army is sent home.
  *A navy's weight (PLAN 4.6e2, ADR-274):* a fleet weighs half its armed ships' hit points in
  men (a transport's or a submarine's nothing): in a nation's strength for the strategic AI (a
  declaration, an alliance against a threat, a coalition) and in a war's men of each side, so
  ships lost at sea weigh in its exhaustion and its peace.
  *Implemented v1 (PLAN 1.25, ADR-37; `src/sim/ai/operational.ts`):*
  - *Cadence:* each 6 h, a nation at war plans once a day (staggered).
  - *Front sectors:* its front cells form 4×4-cell sectors. Threat is the enemy strength in a
    sector's 3×3 neighbourhood.
  - *Who deploys:* free (not engaged, not on the retreat: §5.2 step 4) formations within 60 cells of the front. The farthest 15%
    stay in reserve. The range is to each sector (PLAN 3.10c1, ADR-187): a sector is allotted no
    more than the formations within 60 cells of it and takes only those; what the allotments
    leave over joins its nearest sector.
  - *Marches from afar* (PLAN 3.10c1a, ADR-190): a sector of the nation's own front (not an
    ally's) that has nobody takes one formation from beyond the range. Nobody: no formation
    of the nation stands in the sector or in one next to it, the allotment gave it none and
    none is on the march into it. The formation: free, standing still, on the sector's
    landmass, more than 60 cells from every sector it reaches; the nearest first. It is
    ordered to the sector's front cell and not planned again before the march ends or
    comes within the range (then it is a march into a sector, kept as below). A formation
    is looked at for this on one day in eight (`MARCH_DAYS`, by its id). One whose order
    from afar or to spare is refused is given none so again for 40 days (`FAR_RETRY_DAYS`,
    PLAN 7.117, ADR-703; `World.farWait`, saved): late in a war nearly all such orders are
    refused, each a failed search of the whole way.
  - *To spare* (PLAN 3.10c1d, ADR-191): such a sector that no formation of the nation is
    within 60 cells of also takes one of the formations near the front. On the nation's day
    in eight, of the free formations within the range of a sector that are not on an errand
    (below), the farthest from the front, as many as the reserve's share (one at least), may
    go: each to
    the nearest such sector within 180 cells (`SPARE_RANGES` × the range) on its landmass,
    one a sector. No more go than the front can spare: the formations near it, less the
    share of them that the other sectors weigh among all (1 + threat/10,000 each, as in the
    allotment). On an errand (PLAN 3.10c1d2) is a formation on the march to a cell more than
    60 cells from it (no allotment orders that far), or into a sector that would have nobody
    without it: no other formation of the nation stands in it or next to it, and none other
    marches into it. So a march this rule gave is kept, and a formation that marches to its
    sector's cell as the others of a front that fights do is to spare as one that stands.
  - *Reach* (PLAN 3.5b, ADR-152): those formations are classes by where they stand (the
    landmass; on it the group of provinces joined by ground open to the nation, §4, or
    closed ground). A class reaches a sector when an order to the sector's front cell would
    not be refused before its search. Range and reserve count the sectors a formation
    reaches; each class is allotted to the sectors it reaches and to no other.
  - *Pockets* (PLAN 3.10c2b1, ADR-192): the provinces are kinder than the cells (two
    neighbours with open ground each are one group, whether or not their open cells meet).
    So formations that stand in a pocket of open ground are a class of their own, which
    reaches the sectors whose front cell lies in the pocket and no other. A pocket: the cells
    a route comes to from the formation's cell over ground open to the nation, when they are
    no more than `POCKET_CELLS` (4,096). It is walked once a passage (`pocketOf`,
    nav/grid.ts). Wider ground is not walked to its end and is judged by the provinces, as
    before; a formation in a province with no closed ground that is joined to such
    provinces of more than 4,096 cells is not walked at all (`wideNode`). And the other way
    (PLAN 3.10c2b2): a sector whose front cell lies in a pocket is reached by the class of
    that pocket and by no other on open ground; the cells are walked from the sector's cell
    as from a formation's, once a cell and passage. A class on closed ground is not asked
    (it walks out of it, into a pocket too). An order's own test (`mayReach`) does not ask
    this: the order's search finds it.
  - *Wide grounds* (PLAN 3.10c2b3a, ADR-193): wide ground is not one. The provinces with no
    closed ground that neighbours join, when they have more than 4,096 cells, are a wide
    ground with a number (`wideNode`), and a walk that ends at a cell of one says which
    (`pocketOf`). Formations are classes by the wide ground they stand in or come to, and a
    class reaches a sector whose front cell is in another wide ground, or comes to another,
    only when the cells join the two (`wideJoined`, nav/provinceGraph.ts): the open cells of
    the provinces that have closed ground are walked, once a passage and only when two wide
    grounds are asked for, and two wide grounds that a run of such cells touches are joined.
    The plans ask it pair by pair (`wideLinked`, PLAN 7.129, ADR-719): the runs are walked
    outwards from the two grounds only until they are joined or one side has nothing left, each
    run once in the passage's hour; the answer is the whole walk's.
    A class's reach to a sector is asked where the plan reads it and kept for the plan (PLAN
    7.129, ADR-720): the sectors within 60 cells of one of its formations, the empty sectors a
    march from afar looks at, and a long way's other sectors; not every sector for every class.
    Ground that was walked 4,096 cells and came to no wide ground is taken to reach any.
  - *Allotment:* the rest go to the threatened sectors first (PLAN 7.79b, ADR-634): those with a
    threat share, by largest remainders over their threat, as many as there are of the class
    within 60 cells of one of them; the other sectors share what is left over 1 + threat/10,000,
    every sector getting one while formations last (taken from the largest allotments of those
    with no threat). Formations already marching into a sector keep it, also beyond the sector's
    allotment of the day [ADR-53], except one marching into a sector with no threat that is
    within 60 cells of a threatened one and began its march within 60 cells of its sector (not a
    march from afar or to spare): it yields to the threatened sectors' allotments and keeps its
    march only when none takes it. The rest fill what is left nearest-first, the threatened
    sectors first.
  - *Orders:* a sector at ≥ 1.5× local superiority attacks the enemy cell next to its centre;
    otherwise it holds its front cell. A formation is not re-ordered if its target is within a
    sector of the current one. An order refused for want of a way is not given again while
    nothing its search read has changed (PLAN 1.42g, ADR-421: the formation stands still, the
    same holders are open to it, no cell went from an open holder to a closed one or back). One
    refused by the cells of a corridor of provinces holds while the provinces' open and shut
    ground is the same, its start is open and no cell of the corridor went from a closed holder
    to an open one (PLAN 7.30b, ADR-523).
  - *No long way round* (PLAN 1.42h, ADR-422; the user's decision of 2026-10-15): the AI's order
    is refused (`RejectReason.LongWay`) where its way is longer than 4 times the straight line
    in steps of cells (`LONG_WAY`), or 64 steps where the line is under 16 cells
    (`LONG_WAY_FLOOR_CELLS`, of the map's default size); where its coarse route by the
    provinces' centres is 3 times that (`COARSE_SLACK`) no cell is searched. The formation then
    goes to the front cell of the nearest other sector of its class within the range, up to two
    of them (`DIVERTS`), and else holds. Such a refusal is kept as one for want of a way is. A
    player's order and a march home have no such limit. The coarse routes over open provinces
    are kept with the open and shut provinces they were read on (`NodeParts.coarse`).
  - *Spearheads* (PLAN 3.5c, ADR-153): a formation is armour when half of its upkeep or more
    is in tanks (`SPEARHEAD_ARMOUR` against `EconomyTables.templateArmour`: 0.66 to 0.93 for
    the armour formations, 0.20 at most for the others; the planner looks at no element).
    Where a sector that attacks has armour, the armour marches on the enemy's cell and the
    rest are sent to the front cell, as in a sector that holds. A sector with no armour
    attacks with all it has. The rest follow by the plans of the days after: the front cell
    is then where the armour has taken ground.
  - *The spearhead metric* (PLAN 3.5c and 3.5e; `tools/diag/spearheads.ts`, read from the
    run with no hook in the planner). An *attack* is the formations of one nation ordered to
    one cell that an enemy of the nation holds at the hour of the order, from the first such
    order until the first of them is in contact within a sector (4 cells) of the cell; a later
    order to that cell opens another attack. The metric is the share of the attacks that came
    to contact whose first formation in contact is armour, read beside armour's share of
    the formations sent, over all attacks and over those armour was sent to.
  - *Tick cost* with 10-year AI wars: 2–3 ms (above the 1.5 ms budget) until PLAN 1.42a; since
    then 1.0 ms over 5 years of seed 99 (§2.5).
- **Economic AI** (daily): a budget split between army, navy, air, industry, research, nukes,
  revolt suppression and reserve gold. The production mix is adapted to enemies (AT vs armour-heavy
  enemies, fighters when bombed).
  *Implemented v1 (PLAN 1.26, ADR-38; `src/sim/ai/economic.ts`), monthly, just before the economy
  charges the month, on projected accounts (gross − upkeep − admin − CE cost − suppression −
  tribute):*
  - *Disbanding:* a nation whose balance does not cover a 5% margin plus debt repaid within a
    year is short by S a month. While its gold is below 3 × S (`RUNWAY_MONTHS`), idle
    formations go; a nation with gold enough runs the deficit (PLAN 2.13, ADR-86). The order:
    the least of its upkeep in tanks first (`EconomyTables.templateArmour`: 0 for a division
    on foot, on horse or in lorries, 0.14 for the mechanised division, 0.20 for the Soviet
    rifle division, 0.66 to 0.93 for the armour formations), among those the weakest by men,
    then the lowest id (PLAN 3.1d, ADR-131: by men alone the tank brigades went before every
    rifle division). Half their men return to the manpower pool. One `FormationsDisbanded` event per
    nation and month, kept in the history.
  - *The treasury of the start* is six months of income, or twelve months of S with the army
    of the order of battle where that is more (`START_ARMY_MONTHS`; 16 nations of 1938): no
    army of the start is disbanded in the first hour.
  - *Suppression:* while a held province has unrest ≥ 40: 1 while the treasury holds a month
    of it over 3 months of income (at war over the war reserve, none: PLAN 7.173, ADR-776), else
    0.5 while the balance before suppression is over 15% of income, else 0 (PLAN 7.3e2, ADR-436).
    The month's balance takes the level set.
  - *Building:* up to 1 + income/400 orders in training at once, one more for a nation holding a land front where its
    side is outnumbered on land (`outnumberedOnLand`; PLAN 7.146b, ADR-739) (at most 6; ADR-47). It needs
    army upkeep, counting the orders in training, under 35% × (0.3 + 0.7 × aggression/100) of
    income in peace (60% at war), a positive balance after the new upkeep, and 3 months of
    income in reserve; at war, while that upkeep is under the peacetime share, no reserve
    (`WAR_RESERVE_MONTHS` 0, for the armour's pick too; PLAN 7.65, ADR-615: the defenders of an
    income of 150–500 were stopped by gold in most of their months at war). The warship's
    saving, the refills, the fleets and the wings keep the 3 months.
  - *The levy (PLAN 7.150, ADR-745):* an AI nation at war holding a land front where its side is
    outnumbered on land queues up to 2 cadre divisions a month (`LEVY_MONTH`) for no gold, their men
    from its manpower, while its balance less their upkeep stays over its need. They train as orders
    do and stand in its order slots meanwhile.
  - *Overseas muster (ADR-47):* a nation whose fronts all lie on other landmasses than its
    capital raises new formations in the theatre (nearest own city to the front), an abstraction
    of sealift until PLAN 4.5. A nation at war with no front cell of its own (its land front its
    allies' alone; PLAN 7.67, ADR-619) takes its allies' cells beside the enemies it fights with
    them as its front, as the ferry does (ADR-617): its city on a landmass of those cells nearest
    one of them; with none there, its port with water nearest one of them by sea (`seaKm`), where
    the ferry boards; with no port, at home.
  - *Build mix* (PLAN 3.5d, ADR-154): cadre divisions if income < 20. A nation wants a share
    of its army's upkeep in tanks (`armourWanted`): none up to an income of 200, rising in a
    line to 0.3 at 1,000 (`ARMOUR_SHARE_MAX`, `ARMOUR_FULL_INCOME`). While its army, with the
    orders in training and each order as it is made, has less (`EconomyTables.templateArmour`
    of each template, by strength), its order is the best armoured division it knows the
    techs of (MBT, heavy, medium of 1941, the division of 1938; PLAN 3.1c), in peace as at
    war. Short of that one's price with the reserve it *saves*: with an order in training
    and an army that costs at least its peacetime share of its income (`peaceShare`, PLAN
    7.3b, ADR-429) it orders nothing more that month; else it orders the best it has the gold
    for, infantry at the least (PLAN 1.42c). Its other orders are motorised divisions at war
    against armour-heavy enemies (≥ 20% tanks) and infantry otherwise; a nation that knows
    no armoured division orders as one with armour enough.
    Measured over ten years (`tools/diag/armourMix.ts`; seed 99, seed 7), the tanks' share
    of the army's upkeep at the end, before → after: GER 3.9 → 29.5 % and 0 → 28.4 %, ENG
    7.5 → 28.1 and 5.2 → 25.1, USA 30.7 → 31.2 and 20.9 → 27.6, JAP 0 → 13.8 and 0 → 14.7,
    SOV 28.0 → 22.3 and 15.1 → 14.8, ITA 0.1 → 1.6 and 0.5 → 21.5, FRA 0 → 0 and 3.7 → 10.9.
- **Peace**: settlement by war score. Terms are cells/provinces up to score, puppet creation,
  and white peace. Broke or exhausted nations sue for peace.
- **Anti-hegemon dynamics** (long-run requirement): administrative cost rises
  superlinearly with non-core territory, unrest is high in non-core occupied land,
  coalitions form against nations above X% of world industry, puppets drift toward
  independence, revival brings back dead nations, and collapse on bankruptcy or capital loss.
  Tuned by sweep (§10).
- **The long run's shape** (ADR-732, ADR-750, the user's decisions): a stable top is a valid state
  of the world. The five largest nations by area, as a set and in their order, and the five
  strongest by `strengths` may stay the same for decades: the largest include empty lands far
  from any war (the Canadian north, Greenland, Siberia, Australia), which change hands seldom,
  and great powers that hold their own are as plausible as ones that fall. Turnover at the top
  is not the measure of a living world and its absence is no defect. The world's change is read
  by what moves: borders still changing, wars declared and ended, armies in contact, nations
  rising, falling, revolting and revived, and the shares at the top moving. The largest
  nation's share of the land has no bar (ADR-740, the user's decision).

---

## 8. Semantic zoom / LOD design [ADR-3, ADR-4]

Continuous zoom `z = log2(screen px per world km)`. Tiers are bands with overlap.

**What shows at a zoom is a state, not a function of the zoom** (as built, PLAN 1.45a and
2.7; ADR-64, ADR-71, ADR-73). The first design gave every layer an opacity curve `α_layer(z)`.
It was dropped: a camera resting on a curve showed two layers half there.
- A thing (a tier's unit layer, the capital flags, a city's dot, a city's name, a nation's name)
  comes in when the zoom reaches its threshold and stays until the zoom is 1.15 × beyond it.
- A change is a fade of 250 ms of real time, the same when a name finds room because its
  neighbour went. At rest everything is in full or absent.
- `src/render/timing.ts` has the pieces: `TimedSwitch` (one thing), `SwitchBank` (a layer's
  things, by key), `ZOOM_HYSTERESIS`, `FADE_MS`. Layouts stay pure functions: they are told what
  is on and what still fades out (`SwitchState`).
- Not zoom, and at once: a change of map mode takes the nation names away with the mode; new
  label curves from the worker move a name. The counters' cluster level has its own hysteresis
  (± 0.15 of a level) and a split or merge of 250 ms.

| Tier | m/px | Map | Forces |
|---|---|---|---|
| **T0 Strategic** | > 2000 | fills, smooth borders, occupation tint/hatch, fronts glow, curved names, cities as dots | aggregated counters per nation per screen cluster (stable multi-level grid clustering), strength numbers |
| **T1 Operational** | 300–2000 | + province borders, from 750 m/px in the ground of T2 coming in with the zoom (PLAN 7.34a), city names, sea-zone and air-zone overlays, supply/convoy lanes; the coast from the fine land mask from where a mask pixel is a device pixel (about 1,200 m/px on the 1938 map, all of it from there, none above 2,400: PLAN 4.7g, ADR-284), so a lake the coarse coverage averages away is drawn as at T2 | formation/fleet/wing markers: type symbol, flag chip, a pip for each element by class, a lost one an empty socket (PLAN 7.21c2, ADR-498; the strength bar while its elements are not in hand) + number, order arrows (a fleet's along its way by the points it turns at: PLAN 4.7d, ADR-281), battle markers |
| **T2 Tactical** | 30–300 | + hillshade, procedural ground texture, tree, rock and building instances, the coast from the fine land mask, the sea shaded by its depth (the elevation's sea floor, lighter over shallows: PLAN 4.7f, ADR-283) (roads near cities: not built, a line under PLAN 7.4) | element sprites (facing, walk/drive animation, firing, tracers, impacts, wrecks, casualties), sorties in flight (and at T0 and T1, smaller: PLAN 5.7a), ships by class with wakes under way (PLAN 4.7b, ADR-276), a sea battle's gunfire on a long arc, torpedo tracks and a ship going down into its slick (PLAN 4.7c, ADR-277) |
| **T3 Close** | < 30 | the same ground, worked out for each pixel with finer octaves down to 1 m/px, and the things on it at their own size (not tiles kept in textures: ADR-78) | element → individuals: where an element holds up to 64 units (vehicles, guns, ships and planes: 1 to 12), one figure for each unit it has; a battalion of 500 has 64 figures when whole and its share of them while it loses men, rounded up [ADR-80, in place of ADR-69's cap]; a battalion in contact lies in 4 ranks of 16 across the front of its ground, facing the enemy, the front rank first, a loss a man of the rear rank (PLAN 7.21a, ADR-496); a ship its own length, at least 26 px for a battleship and up to 0.9 of the gap between two slots on the screen (40 px at most), the other classes in proportion to their length or at their class's share of it where more (a cruiser 0.88, a transport 0.85, a destroyer 0.8, a submarine 0.65), each its own length again once that is more (PLAN 4.12c, 7.22b, 7.35c, ADR-499, ADR-548) |

*The look of the forces (PLAN 7.174, ADR-777, ADR-778):* two looks, chosen in the settings
("Unit look"). The table's Forces column is Classic. The countryballs ('balls'), the default from
PLAN 7.174h, draw every unit as a ball of its nation's flag with two eyes, wearing a prop for its
class, at each tier:
- T0: a counter's flag chip a ball over its box's left end (`COUNTER_BALL_R` 8 px); its strength
  and "+n" as before (`counters.ts`, `ball2d.ts`).
- T1: a marker's box a ball (radius 9.5 px) wearing its symbol's prop (`markerProp`: armour
  treads, motorised wheels, a fleet a hull, the rest a helmet), its eyes the way of its order, a
  red ring while engaged; its pips, number, "×n" and the click as Classic's (`markers.ts`).
- Sorties at every tier: each plane a ball with wings, its radius half the plane's span
  (`PLANE_BALL`, `sorties.ts`). The sea battles' marks are as Classic's.
- T2 and T3: one ball an element (a battalion, a tank company, a battery, a ship), at T3 too and
  no figures, by a second program of the proxy renderer (`ballShader.ts`): the flag from one
  texture of every living nation's flag (`flagAtlas.ts`, 38 × 26 slots), shaded round, a dark
  outline, eyes toward the facing (the flag never mirrored), from 6 px faded in by 11; props by
  class (a helmet, treads and barrel, a gun's barrel and wheel, a hull, wings; a turret's barrel
  over its hull's ball). They move on the render clock: a bob on the march, a blink every few
  seconds, slanted eyes in contact, a flinch when hit; a destroyed element's ball fades with ✕
  eyes (`deadBalls.ts`). The same number of draws as Classic.
- Held to the performance budget's GPU line (§8, "Performance budgets": T2 with 10k proxies ≤ 2.0 ms GPU; ADR-778), not to Classic's time:
  0.39 ms at 10k on bench B (`&look=balls`) against Classic's 0.35.

*How far the ground reaches (PLAN 7.34a, ADR-532):* the ground and what stands on it come and
go with the zoom alone, the same in and out: none from 750 m/px, all of it from 300 (T2's
edge), linear in the zoom's log between (`groundShareAt`, 1.32 octaves). It is the one change
of T1 → T2 that is a blend by the zoom and not a state: the fill giving way to the terrain's
colour, the relief and the trees are a matter of degree, and a camera resting at 500 m/px shows
the T1 markers on ground half come in. A step of the wheel of 1.5625× changes the share by
0.49 at most; the unit layers' change at 300 m/px stays the handover's morph by time. Until
PLAN 7.34a the ground came with the element sprites' share of the handover, so that one step
of the critic's wheel went from none of it to all of it (412 to 264 m/px); and beyond T2 it
went with the zoom too (PLAN 2.11l, `groundReach`: to none at 690 m/px). A camera far out has
no ground made for T2 from its first frame.

*The ground of T2 and T3, as built so far (PLAN 2.8a, ADR-78):* hillshade in the map pass
(`mapShader.ts`). The worker sends the elevation level of the map's size after the map layers
(`elevation`: int16 metres, one value a cell); the pass smooths it over the 4×4 cells around by
the borders' cubic B-spline, takes the slope from the spline's derivative, steepens it 12
times, and lights it from the north-west, 41° up: level ground is unchanged, a slope is from
0.58 to 1.28 of its fill, by a soft limit. The sea is level. It comes in by the ground's share
(the zoom's, above) and shows in every map mode. A map without elevation of its size (the
toy world) is drawn flat: the one switch is for the ground as a whole.
*The ground's colour (PLAN 2.14d, ADR-90):* with the ground's share the fill gives way to the
terrain's colour (the terrain mode's blend of the four cells around) and stays as a cast on
it: 0.14 of the fill away from borders, 0.62 on a border falling over about half a cell, at
least 0.3 on occupied land (ADR-82's tint, 0.42 until PLAN 7.4f14, ADR-449; an eighth of the hatching is left in the picture).
Only where the land is coloured by a palette (not in the terrain and unrest modes), and not
at T0 and T1 beyond the ground's band. Plains in two nations are 14 apart in RGB where the fills are 103 apart.

*Ground texture (PLAN 2.8b):* the same pass adds small relief and grain from noise seeded by
the place. Gradient noise in octaves, 2^k lattice points to a cell, the lattice points named
and hashed as integers (a float that held the cell and the place in it is too coarse at 1 m/px)
and periodic over the map's width (no line at the seam). An octave counts by its wavelength on
screen: from 256 px down to 16 px at the far end of T2 and to 2.5 px from 20 m/px in, so the
ground is finer the nearer the camera. The slope of the octaves is added to the data's slope
before the lighting, by the terrain class of the four cells around (`ground.ts`: 1 for
mountains, 0.55 hills, 0.14 plains); their value varies the fill's brightness by a few
hundredths, and woods are a little darker, sand and ice a little lighter. The fill keeps its
colour.
*Two programs:* the pass of T0 and T1 is compiled without any of this, and the pass with the
ground is used while any of it shows (PLAN 2.8b: a branch in one program made T0 half as dear
again).
*Trees, rocks and buildings, drawn (PLAN 2.8c2, `GroundInstances.ts`):* one instanced draw
between the map and the unit sprites, of at most 12,000 instances, by the ground's share
(the zoom's: they fade in with it through the band) and under its one switch. The fragment shader draws each in its square:
a crown with a lobed edge, a block of rock with cut corners, a roof of two slopes (tile or
slate, along one of two directions that cross), each lit from the north-west with its shadow to
the south-east. In natural colours on the nation's fill. The view scatters again only when the
camera, its size, or the world's terrain or cities change.
*Where they stand (PLAN 2.8c1, `scatter.ts`):* a
nested lattice, 2^l points to a cell at level l, each point of a level a point of every finer
one. An instance belongs to the coarsest level its point is on and stands near it, moved by a
hash of the point: one place whatever the zoom. A view shows the levels whose points are 14 px
apart or more, and the next finer level comes in by its opacity through the upper half of the
octave of zoom before that. Further out than level 0 the levels go on, coarser: level −k is
every 2^k-th point of level 0 each way (PLAN 2.11l), so a view is never denser than that. At a point: a building by how near a city is and how large (reach
3 to 18 km by size, densest at the middle); else a tree or a rock by the terrain class of the
cell (forest 0.75 trees; mountains 0.42 rocks; plains 0.05 trees; ice nothing). Nothing on
water: by the cell's class, and where the fine land mask is there only on sure land
(`maskSure`, since PLAN 2.9b2; the coverage before). Size: a symbol of 6 or 7 px at
T2, the thing's own (a crown of 9 m, a house of 14 m) once the zoom shows it larger.

*T1 implemented (PLAN 2.1, `src/render/units/markers.ts`):* Canvas2D markers, the unit layer
from 2000 m/px down to 300 (see the handovers below). Each
shows a type symbol (from the template's
elements), a flag chip, under the box a pip for each of its elements (PLAN 7.21c2, ADR-498,
`pips.ts`: by the template's parts, coloured by class, fainter by the men lost, a lost element an
empty socket; the elements are sent from T1; a strength bar, strength / template men, where they
are not in hand), the strength number, a dashed
order arrow to the target, and a red outline while engaged; Major Battles get crossed swords.
Since PLAN 7.4b (ADR-441) the arrow is drawn only for what is looked at: the formation whose
panel is open, the player's selection and own nation, and the nation whose panel is open.
The same arrows are drawn at T2 and T3 (the user's request of 2026-10-29, `drawOrderArrows`,
`MapView.drawCloseOrders`), faded in as the markers go: from where the formation is drawn
(between ticks, its block), along its way, with a dark edge under the line and a larger head.
*Stacks (PLAN 2.7s1, `markerStacks.ts`, ADR-77):* a marker that is more than a quarter of its
box under a stronger marker of its own nation goes into that one, which then shows the men of
all it stands for and "×n". It stays in until it is under its lead by less than a tenth; a
change is a fade in place over 250 ms. Markers of two nations are never one marker: where two
shown boxes are still more than a quarter on each other (across a front at the far end of T1)
they move apart by half each, at most 6 px from their formations, by an ease of 150 ms (PLAN
2.7s2). Where the boxes stand is a function of where the formations stand, with no memory of
the frame before (PLAN 2.7v); where the 6 px cannot part them they are left on each other. A
pair moves apart along x or y, whichever is the shorter way; where that leaves boxes on each
other, the group of markers within reach of each other is parted along the lines between the
centres instead, if that leaves less on each other (PLAN 3.5h, ADR-157). A
box that goes into a stack fades at the place it is drawn at, and one that comes out again in
mid-fade eases from there (PLAN 2.7w). The order arrow starts at the formation. The boxes do
not move during the morph into T2; on the way back from T2 they grow where they will rest
(PLAN 2.7z).
The snapshot carries template, flags and target per formation, plus Major Battle positions. T0
sprites stop once markers are fully in; capital flags draw above the markers. At T0 a capital
flag that would cover a counter stands just above it instead (up to 40 px from its usual place,
else it is left out), so no counter's number is hidden (PLAN 1.45c). A nation's fleets are
counters of their own (PLAN 4.10a, ADR-302): clustered and folded among themselves apart from
its armies (as another nation's would be, `NAVAL` added to the nation), and drawn as a navy's,
a sea-blue box and frame with a hull under the strength, the nation's flag in the chip. A sea
battle going on is marked at its place at T0 to T2 (PLAN 4.10b, ADR-303; `seas` of the snapshot:
place, cells to its furthest fleet, its sides): a navy-blue disc with crossed guns over a wave,
and a dashed ring round the water its fleets are on; it is gone with the figures of T3. A destroyed nation has no
flag: the snapshot says which nations live (PLAN 2.7g).

*T0 implemented (PLAN 2.2, `src/render/units/counters.ts`, ADR-45):* counters per nation per
cell of a nested 2^L-cell grid (~64 px), showing Σ strength. Splits and merges animate the child
level for 250 ms. The level wanted is judged against the level held, and a change that has
finished is taken over first: a camera at rest holds one level (PLAN 2.7f). The unit-size
setting scales counters and markers.

*T0 declutter (PLAN 1.45b, `foldOverlaps` in `counters.ts`, ADR-65):* no two counter boxes
overlap. In screen space, a counter whose box would come within 2 px of a stronger one's is
folded into it: first a nation's own counters into each other, then across nations in the
order of what they hold. The stronger counter shows the sum and "+n" for the other nations
folded in; nothing is dropped, so the shown counters still add up to every formation's
strength. A change is a fade in place over 250 ms; a folded counter comes out only once it
clears its neighbour by 6 px more. That hold is a memory of the layer at rest: a split or merge
on its way is folded without it and leaves none, so the counters land as a view opened at that
zoom shows them, whatever frames were drawn on the way (PLAN 2.7l, ADR-75). It is a memory of
one zoom too: the first frame at another zoom is folded without it, and folds on with the hold
of each fold until the fold stands, so a step of the zoom inside a level also ends as a view
opened there, in the frame of the step (PLAN 3.5i, ADR-158). The result depends
on the zoom, not on where the camera is. Strengths from a million on read "1.54M".

*Tier handovers (PLAN 1.45a and 2.7b, `src/render/units/handover.ts`, ADR-64, ADR-71):* at each
of the three boundaries which of the two unit layers shows is a state. The nearer layer comes
in when the zoom reaches the boundary and goes out above it by the hysteresis (× 1.15); a
change is a cross-fade over 250 ms of real time. At rest one layer is drawn at full opacity and
the other not at all, wherever the camera stops.

| Boundary | Nearer layer in at | out above |
|---|---|---|
| T0 counters ↔ T1 markers | 2000 m/px | 2300 |
| T1 markers ↔ T2 element sprites (470 ms: see the morph below) | 300 | 345 |
| T2 sprites ↔ T3 individuals | 30 | 34.5 |

- The elements are in the view before the sprites come in: they are sent from T1 (2,000 m/px,
  ADR-498; from 450 m/px before), where a marker's pips are drawn from them; their fire and ends
  are sent from 450 m/px. At 900 m/px an element is its pip: the elements of a division stand
  0.65 px apart there (PLAN 7.34b, ADR-535), and the view counts the pips drawn
  (`elementsAtT1`).
- The figures of T3 are built in the frame the close tier comes in, from a copy of the last
  element section that the view keeps below 60 m/px. A snapshot subscribed at T3 is a frame or
  two away, and the cross-fade needs both layers. They are built from each snapshot for as long
  as they are drawn: while the close tier is on, and while its fade out runs (PLAN 2.7j).
- Elements whose figures cannot be drawn keep their sprites at T3 (their section not kept yet,
  or more figures than the renderer's cap). A view with no elements at all keeps the close
  tier as the zoom has it, so that the figures of a formation panned to are there in its first
  frame (PLAN 2.7p).
- Fire and wrecks are drawn with the sprites' share, at T2 and T3 alike.
- *Before:* T0 ↔ T1 cross-faded by zoom over 2000–2600 m/px and T1 → T2 over 210–300 m/px, so
  a camera resting in either band showed two layers half-faded; T2 → T3 was a switch in one
  frame.
- *Checked (PLAN 2.7b, `tests/e2e/fades1938.spec.ts`):* the camera steps across each boundary
  in both directions and stays; of the frames that follow, 16 ms apart, no pixel of the unit
  layers changes by more than 48 of 255 between two frames (measured: 31–39; the whole change
  is about 250).

*T2 elements implemented (PLAN 2.3, ADR-46):* the view subscribes with its padded bbox
and tier at most 10 Hz. The worker sends the elements of the formations whose block reaches
into the box (by the block, not the centre: at the closest zooms the box is smaller than a
division; PLAN 2.7n1), a formation whole or not at all, at their slot
poses (`sim/core/pose`, shared with the sim). They are drawn as instanced sprites, interpolated
on the GPU, with facing and a procedural walk/drive animation, fading in as the markers fade out.
The walk is for a formation on the march: one that has a march and holds in contact stands, as
the sim holds it (`marching` in `src/shared/protocol.ts`, PLAN 2.11e). A sprite's opacity is
what is left of its element: its share of its size, from 0.45 to 1 (`spriteAlpha`, PLAN 2.11g).
Where a snapshot has no elements, each formation is one stand-in sprite of 0.9 cells and at most
48 px (PLAN 2.7n3): the toy world's formations, which have no elements, and any world for the
moment before its first elements arrive.

*T2 fire implemented (PLAN 2.4a, `src/render/fx/fire.ts`, ADR-66):*
- *Transport:* a view that draws elements also gets the FireEvents (§5.2 step 5) with an end
  inside its subscribed box, in the snapshot's `fires` section (shooter, target, the two slot
  poses, the minute of the hour, and the weapon kind of the shooter's class: small arms, cannon
  or shell). Any other view gets none. The queue is capped at 8,192 events; the oldest are
  dropped and counted.
- *A shot* is a muzzle flash at the shooter, a tracer that flies to the target (shells on an arc)
  and an impact there, 310–880 ms in all, on the render clock. The shots of a tick start spread
  over its wall time by their minute (250–1000 ms; 400 ms for a tick stepped while paused).
- *One at a time:* a shooter shows one shot at a time. Within a tick every FireEvent is a shot
  (an element fires once an hour); from tick to tick the events that find their shooter's shot
  still on screen are not drawn, and are counted. So the fire on screen grows with the elements
  that fight, not with the game speed.
- *Presentational freedom:* a shot lands up to 0.012 cells from its target's slot. Nothing of
  it is sim state; a reload starts with no shots.
- *Not built:* GPU particle pools (the layer is Canvas2D: 0.12–0.22 ms a frame for the fire of
  three divisions).

*T2 casualty removal and wrecks implemented (PLAN 2.4b, `src/render/fx/wrecks.ts`, ADR-67):*
- *The event:* an element whose strength reaches 0 (combat, attrition, desertion) is removed
  and emits `ElementDestroyed` with the slot it stood in (§5.2 step 3). It is a tick output,
  not state. Elements that go with a formation removed whole (disbanded, annexed, by God or the
  editor) emit none. Only a view that draws elements gets the event, with what the unit's class
  leaves in place of the unit: the fallen, a broken gun, a burnt-out vehicle.
- *The visible end:* the snapshot that no longer has the sprite brings the event. In that frame
  a burst (a flash and an expanding ring, 400 ms) is drawn where the sprite stood, and the
  wreck comes in under it.
- *The wreck* stays for 12 s of real time and fades over 3 s; guns and vehicles smoke. It stays
  where the element died while its formation moves on. At most 1,500 are held.
- Nothing of it is sim state; a reload starts with no wrecks.

*T3 individuals implemented (PLAN 2.6 and 2.10b, `src/render/units/individuals.ts`, ADR-69 and ADR-80):*
- *Count:* an element whose unit type has up to 64 units to an element (guns 12, tanks 10,
  planes 6 to 12, ships 1) has a figure for each unit it has. A battalion (500) has 64 when
  whole and `ceil(64 × strength ÷ size)` while it loses men: 20 figures at 150 men. An element
  with men has a figure, and all 64 only when it lacks less than a figure's worth. The
  snapshot's element section carries the element's size besides its strength and atlas frame
  (PLAN 2.10b; until then the count was `min(strength, 64)`, and a battalion showed its losses
  only when fewer than 64 men were left).
- *Place:* the footprint is a square of 0.024 cells around the element's slot pose (slots are
  0.03 apart), turned with the formation and divided into sub-slots: 8 × 8 for men and for
  anything that has more than 16 figures when whole, 4 × 4 for vehicles and guns. The grid is
  the whole element's and does not change as it loses. An element's figures take the sub-slots
  in an order of its own (a shuffle by its id), each a little off its sub-slot's centre.
- *Casualties:* a loss takes the last figure of that order away; the others stand where they
  stood. So a battalion thins out across its block as it loses men (ADR-80).
- *Drawing:* the view expands the elements of a snapshot that arrives at T3 into instances of
  the same instanced renderer as the element sprites, previous and current place alike, so the
  GPU still interpolates. The origin is the camera's cell (f32 offsets from the middle of the
  map would step by 2.4 m). A figure is at least 2.5 px.
- *Guns* have a frame of their own in the procedural atlas (artillery, anti-tank, anti-air), at
  T2 and T3; they were drawn as infantry.
- *Tanks* (PLAN 3.6a, ADR-159) are two sprites: a hull frame for each weight (light, medium,
  heavy) and its turret with the gun as a frame of its own, a second instance at the hull's
  place written after all the others of the layer (`render/units/turrets.ts`), at T2 and T3.
  The turret's ring is the middle of both frames. Mechanised infantry is a half-track, with no
  turret. The snapshot carries the hull's frame alone.
  *At T3 an element of tanks is ranks* (PLAN 7.9c, 7.34c1; ADR-469, ADR-536): four abreast
  across its facing, the front rank first, straight; two tanks of a rank the turret's reach and
  half a hull apart (and 0.04 of a figure more), so a turned turret's muzzle is off the next
  hull. The element's hulls fit its slot's square, so no hull of a block at rest is on another:
  a light tank at its full figure (`TANK_CELLS`, a 14 px hull at 10 m/px), a medium and a heavy
  by a scale of their class, the heavy hull still the longest.
  *Vehicles fitted to their room* (PLAN 7.34c2, ADR-540): in a block in contact the elements
  stand off their slots (`DEPLOY_SCATTER`), nearer than a slot. An element of vehicles (tanks,
  half-tracks) is drawn at its fit (`fitScales`), figures and places alike: the least, over the
  vehicles near it, of the scale two keep so that an axis parts their drawn boxes, of the place
  before and now, in 32nds. A block at rest has fit 1. Turrets, muzzles and wrecks take it too.
  *The small mark* (PLAN 3.6e3b, ADR-165): where an element sprite is drawn 5.5 px wide or
  less (from about 92 m/px outward at the default size setting; the least size is 5 px, from
  102), a hull of any weight is one frame made for that size, a solid slab along the facing
  (`Frame.tankSmall`, `smallFrameOf`), and its turret is not drawn. From 5.5 to 8 px (92 to
  64 m/px) the shader mixes the two frames by `smallShare` of the sprite's size and fades the
  turret in: a matter of the zoom alone, with no clock. From 8 px in a tank is hull and turret.
  No other class has a small frame.
  *The turret turns* (PLAN 3.6b, ADR-160): `TurretAims` has an aim for every element whose
  cannon shot the view draws, the angle of the fire record's line. The turret turns there in
  180 ms before the shot starts (a cannon's shot starts 180 ms after its minute of the tick,
  so the turn is over as it leaves: PLAN 3.6e1, ADR-163), stays for 1.5 s (or 1.5 ticks), and turns back to its hull's
  facing in 0.6 s. View state on the render clock; while an aim is live the turrets' facings
  are written and uploaded again each frame. The tanks of an element have one angle.
  *The shot leaves a barrel* (PLAN 3.6c, ADR-161): at T3 a shot starts at the muzzle of one
  of its shooter's figures (`firingFigure`: by the element and the tick; `originOf`), a
  tank's along its turret of the frame, a gun's and a rifle's along the figure's facing, and
  a cannon's flash is a tongue along the barrel. From the slot to the muzzle with the close
  tier's share. A shooter outside the view's box fires from its slot.
  *A tank that is lost leaves its hull* (PLAN 3.6d, ADR-162, `render/fx/hulls.ts`): the view
  compares the elements of a snapshot with those of the snapshot before, and a figure that an
  element of tanks had and has no more leaves a hull on its place, at the old pose. If the
  snapshot says the element was fired at since the one before (`SnapshotElements.hit`: by
  anything, from anywhere; not the fire records, which are only of the shots with an end in
  the view's box, while a formation is sent whole: PLAN 3.6e5, ADR-167), the hull burns:
  flame for 6 s of real time, smoke for 9 s more, a fade of 2.5 s. If not (a breakdown,
  attrition: PLAN 3.2d),
  the tank was left behind: a grey hull with its gun in line, for as long, without flame or
  smoke. None for an element first seen, and none for one that is gone: the last tank of an
  element ends with it and leaves the element's wreck (PLAN 2.4b). Drawn with the figures'
  share, at a figure's size, also where the view holds no element any more (the fight moved
  off: PLAN 7.23a0); at T2 a loss is the sprite's opacity, as for every element. At
  most 2,000 are held. View state on the render clock: a reload starts with none.
  *What else is lost lies there too* (PLAN 3.11d, ADR-205, `fallenLost` in the same file): a
  figure that an element of infantry, of guns or of half-tracks had and has no more leaves a
  mark where it was drawn, by the same comparison of two snapshots. The fallen: a man down on
  a dark stain, lying his own way; only for a loss in an hour in which the element was fired
  at (men lost to attrition or desertion are gone, not fallen). A gun and a half-track:
  broken and smoking if fired at, grey and left behind if not. A figure of a battalion is 8
  men, and a battalion in contact loses about 15 men a day: two in three show a loss within
  a day. The marks have the hulls' time and share and go at a load; at most 1,200 are held,
  each a stamp of its kind's picture (5.7 ms a frame for all 1,200). None at T2.
  A game loaded into a running one (PLAN 3.7n, ADR-175) takes the hulls, the wrecks, the shots
  and the turrets' aims of the game before with it, and its first snapshot makes no hull: the
  view is told of the load (`SimClient.onLoad`), it does not read it off the clock.
- *The T2 ↔ T3 change* is a handover like the others (see above), since PLAN 2.7b.
- *Measured:* 3,345 figures of 89 elements (three divisions at 28 m/px): 0.7 ms to build per
  snapshot, 0.5 ms of CPU to draw a frame.

**One truth.** Every number or sprite derives from sim state: counter strength =
Σ formation strength = Σ element strength. Sprites are at element positions, and tracers
come from FireEvents. Close-tier positions inside an element footprint are the only
presentational freedom, and the count is always exact.

*Checked (PLAN 2.5, `tests/e2e/tiers1938.spec.ts`):* in a battle spawned by God where nothing
else stands, the element sprites read at T2 and the counter read at T0 give the same men before
the fight, when the first elements have died and when one division is gone: what the counter
loses is what the elements lost, to the man. Men are units × the men per unit of the element's
type, summed over a formation's elements and rounded, as the sim does: a gun crew is not a whole
number of men (12.5 or 8.33 per gun). No mechanism was needed for it: the number at every tier
is the formation's strength, which the sim recomputes from its elements at each settle.

**Transitions without popping.**
- T0→T1: clusters split by animating from the cluster centroid to member positions
  over 250 ms (positions are real). They merge in reverse.
  (As built: that is the change between two cluster levels inside T0, PLAN 2.2. T0 ↔ T1
  itself is a handover, a cross-fade of counters and markers over 250 ms: see the table above.)
- T1→T2: the marker scales down and fades into the formation centroid while elements fade
  in at their real positions. The strength bar lingers above the group until T2 is fully in.
  (As built, PLAN 2.7c, ADR-72: over 250 ms the box fades and shrinks by 13% about its centre
  while the sprites fade in; the strength bar and the number stay for that time and fade over
  the 220 ms after it. Out of T2 the same, backwards: the bar first, then the box. Of a
  formation in contact the bar goes and comes with the box, PLAN 2.14f4, ADR-92: its elements
  stand at the block deployed against the enemy, up to 43 px from the marker. The box does
  not move: a marker stands on its formation's centre already. It shrinks by 13% and no more:
  see the ADR.)
- T2→T3: an element sprite cross-fades into its individual expansion, which is laid out inside
  the element footprint. (As built, PLAN 2.7b: a cross-fade over 250 ms.)
- *Formation tags at T2 and T3 (PLAN 2.14a, ADR-88; `src/render/units/tags.ts`, drawn on the
  overlay by `MapView`):* where the marker's box has given way to the elements, every formation
  with something in the view has a tag: its nation's flag, its strength, its name ("Infantry
  division 658": the template's name and the formation's id, derived in the view, not state).
  A tag stands by the part of its formation that is on the screen: above it, below it, left
  or right of it, in that order, then a step further out on each side, five rings of places
  (`TAG_TRIES`). Stronger formations are placed first; one that finds no place is left out
  and counted (`tagsLeft`). It is tied to its elements, in three passes over those places
  (`layoutTags`). First a place by the block (the first on each side) that is clear of
  every other formation's elements and not nearer to the middle of another block than that
  block's own tag, placed before it (PLAN 3.11f1, ADR-207), nor further from its own
  block's middle than a tag placed before it is (PLAN 4.2b1, ADR-249: it would have the
  line of ADR-188 where a place beside the block has none). Then the nearest place clear of
  other formations' elements (PLAN 3.7g, ADR-168). With none, any place free of tags. A tag
  has a thin line in its nation's colour to the middle of its elements in the view when it
  stands more than `TAG_GAP` + 1 px (5) from their box (ADR-168), and when another placed
  tag is nearer to that middle than it is (PLAN 3.10c1b, ADR-188). It does not stand under the war banners or the bottom bar (PLAN 2.14f2). The
  tag of the formation whose panel is open is framed and placed before any other (PLAN
  2.14f3). A click on a tag or on a formation opens the formation panel (§9).
- The map shader blends the detail layers by `z`, and border width is constant in screen px.

**Interest management.** Main sends `subscribe` whenever the camera moves (throttled to
10 Hz) with the bbox padded by 25%. The worker only includes elements/events inside it.
This never affects sim state (invariant I4).
*As built (`src/app/subscription.ts`, PLAN 2.7n2):* "moves" is judged by a key: the box rounded
to a step that is a part of the box itself (a 32nd to a 16th of its smaller half-size, less
than a third of the pad). While the key stands, the view is inside the box the worker has. The
step was a quarter cell at every zoom, which at 1 m/px is two and a half screens.

**Precision.** The CPU camera is in f64. Per frame (or per tile batch), choose an origin
and upload f32 positions relative to it. The vertex shader never sees absolute world coordinates.

**Rendering techniques.**
- Ownership: `R16UI` textures (owner, controller; tiled only if a size exceeds
  MAX_TEXTURE_SIZE) + a 256×256 palette `RGBA8` texture (nation and map-mode colours).
  Smooth borders (`src/render/map/mapShader.ts`): every distinct id in the 4×4 cell
  neighbourhood accumulates cubic B-spline weight (a C2-smooth indicator field). The max
  wins; the border is where the best and second weights meet, at a constant screen-px width
  (d / fwidth(d)). A bounded value-noise domain warp (≤ 0.32 cell) makes borders organic.
  Occupation hatching uses the same weights. With the ground of T2 and T3 the hatching gives
  way to it (PLAN 2.11f, ADR-82): by the ground's share the two stripes close on the tint
  between them, and an eighth of the hatching stays (`HATCH_AT_GROUND`).
  Since PLAN 1.28b the coastline comes from the 16384 × 8192 land mask:
  - The worker reduces it once to a 4096 × 2048 coverage texture (land fraction of each 4×4-bit
    block; `src/shared/landCoverage.ts`) and posts it with the terrain layer (`mapLayers`).
  - The shader samples coverage bilinearly: water at ≤ 0.5. Land the cell rule called water takes
    the strongest land id nearby (unclaimed land is neutral grey).
  - The coast line uses the coverage gradient; the cell-based coast lines are off once the fine
    layer is present.
  - *The coast of T2 and T3 (PLAN 2.9b2, ADR-79)* is the mask's own, four times as fine as the
    coverage. The mask's bits are a texture (R8UI, 2048 × 8192, eight pixels to a texel). The
    pass with the ground blends the four mask pixels round a fragment (the rule of
    `maskField`, `src/shared/landMask.ts`) and draws land over a half. Where the four differ, a
    noise of at most 0.35 × 4f(1 − f) moves the line (`SHORE_NOISE`; the ground's noise from
    its third octave down to a wavelength of 4 px): a shore at 1 m/px is not a ruler's edge.
    The picture can differ from the mask's bit only between four pixels that differ.
    - The two coasts cross-fade with the T1 ↔ T2 handover: each says land or sea, a pixel is
      land by as much as the two say by their shares, and each has its coast line by its share.
    - At T0 and T1 the coast is the coverage's, pixel for pixel as before.
    - The mask has lakes that the coverage has not; they are drawn at T2 and T3.
    - What stands on the ground (PLAN 2.8c) stands on sure land (`maskSure`), read on the CPU.
    - Without the texture (a GPU that takes none of 8192 px; land painted in the editor) the
      coast stays the coverage's, or the cells'.
  - Terrain map mode (`fillMode` 1) bilinearly blends the terrain colours of the 4 nearest cells
    and keeps national borders.
  Since PLAN 1.28a the border distance is d/|∇d| with the gradient from the analytic B-spline
  derivatives, not d/fwidth(d). fwidth spiked where the second-strongest id changed between
  pixels, and is undefined inside the n > 1 branch; that drew dashed stair lines about 2 cells
  inside every border. The gradient pass runs only where d·scale < (halfW + 1)·2√2
  (|∇d| ≤ 2√2 per cell).
  GPU at 1080p on the bench machine: 0.54 ms T0 world, 0.50 Europe, 0.46 close (was 0.47; a
  full per-id gradient cost 1.30 ms).
- Map modes are palette swaps or derived per-province textures (no reupload of the cell grid).
- Labels (implemented PLAN 1.29, ADR-40):
  - *Derivation:* the worker derives a quadratic Bézier per nation from control
    (`src/worker/deriveLabels.ts`). It takes the capital's 4-connected component (else the
    largest), with x unwrapped at the date line; finds the PCA axis; takes the mid-line at
    10/50/90% of the robust extent; and records half-thickness = 1.2σ.
  - *Delivery:* it posts `labels` (with i18n keys, or literal names for spawned nations) at most
    every 2 s, when control changed.
  - *Drawing:* the app lays the glyphs out along the curve on a Canvas2D overlay
    (`src/render/labels/nationLabels.ts`). Font ≤ 2 × half-thickness and fits the curve length,
    9–64 px; greedy glyph-circle collision runs largest first. Since PLAN 7.4a (ADR-440) the
    glyphs are the name's capitals spaced by 0.1 of the size, in a darker shade of the nation's
    colour with a lighter edge (over a dark nation the other way round), as AoC's; since PLAN 7.4e
    (ADR-444) in Lato Black, the city names in Lato Bold and the UI in Lato (`render/labels/fonts.ts`).
  - *Coming and going:* a name is a switch like the others (the list at the head of this
    section), one for each nation. On a looping map the copies of a name either side of the
    seam share it: it is on when any copy is wanted (PLAN 2.7k, `fadeNationLabels`).
- Labels (original plan): MSDF font atlas. The curve comes from the worker's `derive/labels` (largest
  connected component → skeleton/PCA → quadratic Bézier, size by area), throttled
  and cross-faded on change.
- Units: one instanced draw per sprite atlas. Instance attributes are prev/cur pos,
  facing, frame, tint and alpha. The interpolation alpha is a uniform.
  *The atlas is premultiplied (PLAN 7.21b, ADR-497):* uploaded with its colour multiplied by its
  alpha, so that its mipmaps average colour by coverage, and blended `ONE, ONE_MINUS_SRC_ALPHA`;
  the shader scales the tinted colour by the instance's alpha. A sprite of a few px keeps its
  nation's colour (straight, the clear texels' black darkened every small sprite alike).
  *As built (PLAN 2.7h):* it is the time since the tick in hand arrived over the tick length,
  0–1 (`MapView.tickProgress`). Its clock starts with a new tick only: a snapshot that repeats
  the tick (a new subscription, a pause, another speed) goes on from the progress reached.
  A pause in a tick lets the sprites finish the step they are on, at the length the tick had,
  and then they stand where the tick has them (PLAN 2.7y: put there at once, every marching
  sprite jumped by the rest of its step). A tick that comes while the game is paused (a single
  step) or at full speed has no length: its progress is 1.
  The tint is the nation's own colour in every map mode (PLAN 2.7i): the map's palette
  carries the mode's colours, the units do not, at any tier. For the stand-in sprite, the
  elements and the figures (`spriteTint`, `src/render/units/tint.ts`; PLAN 3.11e, ADR-206)
  a colour whose lightness (HSL) is under 0.42 (`SPRITE_LIGHT`) is made lighter up to it,
  every channel times one factor, which keeps its hue and saturation; black is a grey of
  that lightness. Any other colour is drawn as it is (until then every colour was mixed
  45% toward white, and a dark red and a rose came out two pale reds).
  A ship is the exception (PLAN 7.41b, ADR-602): its atlas frame holds the hull's fill in red
  and its marks and outline in green (`splitShipTint`), the shader tints the fill alone and
  draws the marks grey, and a ship of a hue within 25° of the sea's is at least 0.6 light
  (`shipTint`): a blue nation's tinted marks were the sea's colour at 20 m/px. The Pixi bench
  (`benchBP.ts`) multiplies the atlas by the tint as before; its ship frames are not decoded.
- Effects: GPU particle pools (muzzle, impacts, smoke, explosions, nukes). *As built (PLAN
  2.4a):* tracers, muzzle flashes and impacts are drawn with Canvas2D on the overlay; no pools yet.

**Performance budgets.** T0 ≥ 60 fps with 100+ nations at M size. T2 ≥ 30 fps with
10 000 visible proxies. Snapshot build ≤ 2 ms. Main-thread frame CPU ≤ 6 ms.
Sim tick ≤ 6.5 ms in any year, the late game's busiest among them (headless, pinned, M, 1938: at least 150 game hours
a second; ADR-757, 2026-10-29, the user's decision; ADR-709's 5.5 ms before, ADR-698's 5.0 ms before that; before
those, ≤ 1.5 ms average). *Since ADR-654 a (2026-10-23, the user's decision):* the
1.5 ms stands for the 1938 world as first measured; the busier land war since R11-B1/R12-B1 reads
1.94–1.97 ms on seed 99 × 5 years, and a rule change is judged instead by its cost on one world:
HEAD's rules at most +0.2 ms a tick over `dd3b730`'s on HEAD's year-4 world of seed 99 (+0.145 at
PLAN 7.83). Dev-GPU translation (ADR-4): T0 frame ≤ 1.0 ms
GPU and T2 frame with 10k proxies ≤ 2.0 ms GPU at 1080p on the bench machine (Phase 0:
0.46 and 0.41 ms). *As built (PLAN 7.1j, ADR-402):* `npm run bench -- G` measures the game
itself, the 1938 world at 1080p with the game running: T0 190.6 fps, T2 108.9 fps with 10,752
element sprites in the view (RTX 4070 Ti); the software rasteriser 2.8 and 2.3 fps, reported. The
GPU and main-thread translations above were missed there (GPU T0 1.58 ms, T2 2.57; draw at T2
7.8 ms) and are PLAN 7.1l's. The map view redraws only when the camera, a snapshot or an
interpolation changes something, and once more after any frame that left a unit animation
unfinished, however late that frame comes (PLAN 2.7m): the end of an animation is what stays
on screen.

---

## 9. UI / UX

- **Layout** (parity with the VISUAL reference): left nation panel, Actions/Economy tab panel,
  right Statistics ranking, bottom bar (map modes, pause, God Mode, Statistics, speed,
  date, events counter, history log), and a war-banner strip of active wars.
- **Nation panel** (implemented PLAN 1.31a, `src/ui/NationPanel.tsx`): opens on the nation
  selected by a map click. Overview and Economy tabs; nation chips select. Data comes from the
  worker's `nationStats` message (every living nation + active wars, at most 1 Hz while ticks
  advance, and after init/load); real-map scenarios only.
- **Formation panel** (PLAN 2.14b, `src/ui/FormationPanel.tsx`): opens on a click on a
  formation, at any zoom that shows formations, where the nation panel stands. Its name and
  kind, whose it is (the chip leads to the nation panel), its men against a whole one's, its
  supply, whether it is in contact or on the march, its elements by unit type. The numbers are
  the sim's (`formation {id}`, §2.3), asked for again as ticks advance with the count of the
  first answer; the panel closes when the formation is gone, whether or not another has taken
  its id, and at a load (ADR-115). The formation is marked on the map while the panel is open.
  A formation in contact has a button beside its status, "To its fight" (PLAN 3.11b,
  ADR-199): `FormationDetail.fight` is the middle between its block and the block of the
  nearest enemy it is in contact with (`contactsOf`, the one its block faces; where that one died later in the hour, the nearest live enemy in reach), that enemy's
  id, and how far apart the two blocks' middles stand east-west and north-south. The camera
  flies there (`MapView.showBattle` with that span): at 20 m/px, or further out, as far as
  holds both blocks (`T3_MAX_M`, 30 m/px, at most where the view is large enough for 20, so that it stays
  T3; 28 before ADR-700; a smaller view, which has a battle at T2 already, as far out as holds the two;
  a pair T3 cannot hold, their middles more than the view at 30 m/px less 5 km apart, as far out as holds the two
  within T2, ADR-743). No rule of `deployOf` changed for it: a line behind its side's front stands up to a
  cell from the enemy's block.
- **Statistics ranking and war banners** (implemented PLAN 1.31b, `src/ui/StatsRanking.tsx`,
  `src/ui/WarBanners.tsx`, `src/shared/ranking.ts`): top-15 ranking (land, army, income,
  treasury, manpower) on the right, toggled by the bottom bar's Statistics button, each row
  one line (PLAN 4.11, ADR-305: the name cut with an ellipsis, the value never wrapping), with
  the nation's flag and a bar in its colour as long as its value is of the first row's (PLAN
  7.4c, ADR-442, as AoC's Statistics panel); one banner
  per active war (side leaders, ally counts, score bar) above the bottom bar, at most 6 + "+N" (8 until PLAN 7.4f6: three rows deep at 1400 px).
  A click on a banner selects the attackers' leader and, when the war has a battle (gold
  swords; ADR-96), flies the camera to it at 20 m/px (`flight` in `render/camera.ts`: pan and
  zoom in one eased movement, ended by any camera input; ADR-91, ADR-94, ADR-95, ADR-97).
  While paused, the worker keeps pumping (without ticking) until throttled derived messages are
  flushed, so a single step still updates the UI.
- **Map modes** (implemented PLAN 1.17–1.30a, `src/shared/mapModes.ts`):
  - *Choosing one* (the user's request of 2026-10-29, `BottomBar.tsx` `MapModeMenu`): the bar's
    map button opens a menu of every mode above it, the current one ticked, each with its number
    key (1–9, 0; the eleventh has none); a pick switches and closes it, as do Escape (before the
    game's Escape), the button again and a press elsewhere. The button no longer steps to the
    next mode. While it is open the bar stands over the war banners and the ticker.
  - *Implemented:* political, alliances, puppets, terrain, wars (red at war), diplomacy (relations
    to the nation selected by clicking the map), income (log ramp) and revolts.
  - *Off-map rows* (above/below the map when fully zoomed out) render as sea.
  - *How:* palette swaps from snapshot fields (alliance leader, overlord, income, war pairs);
    terrain uses the shader's terrain layer. Each mode has a legend (`src/ui/MapLegend.tsx`).
  - *Revolts* (1.30b): a per-province unrest choropleth. The worker sends the province raster
    in `mapLayers` and per-province unrest bytes (`provinceStats`) when `Provinces.version`
    changes; the shader colours land by its province's unrest (fill mode 2).
  - *Sea control* (PLAN 4.7a): the worker sends the zone of each cell when the zones are new
    to the client and each zone's holder when that changes (`seaControl`; a world with no
    sea control yet, as after a load of a save in which no zone is held, is sent all open
    once where the page had holders, PLAN 4.8p); the shader tints a
    zone held with 0.5 of its holder's colour over the sea's, leaves an open one the sea's, and
    fades the land 0.65 towards grey (fill mode 3). Its legend (PLAN 4.10c, ADR-304) lists the
    holders in their colours with their zones, the most first (8, and how many more), and names
    the zone under the cursor with its holder ("Inner Seas: held by United Kingdom"; its sea's
    name from the map's seeds, sent with the zones; "held by none").
  - *Air superiority* (PLAN 5.7c, ADR-325): the worker sends each air zone's holder daily
    (`airControl`: the nation with superiority 0.6 or more there, contested, or none) with the
    cells' air zones the first time and after a load, at once (at the first look of a day a pump
    stepped past its first hour in; PLAN 5.8n, ADR-338); the shader (fill mode 4) fades land as the sea-control mode
    does and tints a zone held, land and sea, 0.55 of its holder's colour, a contested one striped.
- **Map modes still planned**: fallout, supply (with their phases).
- **God Mode commands** (implemented PLAN 1.32a): `renameNation` (saved in `world.names`,
  section `world.names`; the empty name gives back the scenario's name or the founding
  province's, and is refused for a nation with neither: ADR-124), `declareWar`, `forcePeace`, `createAlliance`, `collapseNation` (God
  Kill: the nation dies, its land goes back to claimants or founds at most five nations, and
  no war starts: ADR-99), `reviveNation` (within the revival
  rules; refused with the reason: it lives, no other nation holds land it has a core on, no
  revival left, the cooldown: ADR-121), `spawnRevolt`, `forceBreakthrough`, `grantBuff`, `setAi` / `aiEnabled`,
  `setIncomeBonus`, plus the edits from 1.17–1.24. `sim.inspect()` returns a JSON world summary
  (tests, critic). Owned-cell counts (`nations.cells`) are maintained by `World.setOwner`.
  `spawnFormation {nation, x, y, strength, template?}` (PLAN 2.5, ADR-68): with a template of
  the scenario the formation has its elements and fights, as one from production does; without
  one it is a bare strength with no elements (the toy world). It has no button in the God tab.
  It stands where `standPoint` puts the place given (on the water of a coastal cell: the
  cell's land point), and is refused (`Refusal.AtSea`; PLAN 3.12Rq, ADR-228) where that is a
  cell of no component of the route grid (water) or off the map: no route begins there.
  **A command that is not carried out says why** (PLAN 2.17a, ADR-117): `applyCommand` returns a
  `Refusal` (`shared/commands`), the tick emits `CommandApplied` or `CommandRefused` (b = the
  reason) after the command, the worker posts `{type: 'refused', reason}` to the page, and the
  God tab says it in words. Refused: a NaN or an infinity anywhere in a command; a dead nation
  where a living state is needed (a formation, control, land, an alliance, a puppet, a war); a
  nation that is not there; a number out of its range (`Refusal.OutOfRange`, `inRange`; PLAN
  7.2c, ADR-426): an id that is not a whole number of 0 or more, a place more than two map
  widths or one map height off the map, a strength below 0, a radius past `MAX_PAINT_R` (32,
  the editor's), a side of a war not 0 or 1, an alliance with a member twice. Ally with a nation in an alliance is refused; "Leave alliance" is
  the button for that.
- **Player control** (PLAN 1.33a, `src/app/player.ts`): "Take control" in the nation panel
  (`setPlayer`, saved as `settings.player`, so loads and resumed autosaves keep it) makes map
  clicks player orders. Its AI stays on (ADR-759, the user's decision; `ai/layers.ts`): each
  layer acts for it while its box is ticked (`World.playerAi`, `setPlayerAi`, saved while not
  the default): army (fronts, invasions, merging hollow divisions), navy, air, diplomacy (war,
  peace, alliances), economy (building, research, lay-up), all ticked when a nation is taken, and
  nuclear strikes, not. God Mode's AI switch (`aiOff`) is still every layer. A direct order of
  the player's (`World.playerOrders`: a march or a fleet's move, a wing's rebase or mission)
  keeps every layer's hands off its formation until it is done: a march until it arrives (or
  ends, or the formation retreats), a rebase until the wing is at its base, a mission for 24 h.
  The AI then has it back and may undo the order at once. A formation or a wing placed by God
  Mode is the AI's at once (a fleet so placed holds no station: `spawnFleet.free`).
  A click on an own formation selects it (Shift toggles, Esc clears;
  rings on the overlay); a click elsewhere orders the selection to march there (into enemy land
  = attack). "Release control" hands the nation back to its whole AI (and its God Mode switch on,
  for a save from before ADR-759, where the nation played had it off); the boxes go back to the
  default and the player's orders are forgotten. The bottom bar shows the nation and count.
  The selection is of the played nation (ADR-116): each snapshot takes out of it an id that
  is gone or is another nation's by now (`MapView.selectionNation`), the bar's count
  follows, and a load empties it.
  The selection's mark (`MapView.drawSelection`, the user's request of 2026-10-29): a gold frame
  with a glow and a pointer above it, around the T1 marker that stands for a selected formation
  (or its stack), a ring where no marker is drawn (T0), and at T2 and T3 around the box of its
  elements on the screen (the box its tag is placed by), so that it grows with the zoom; the two
  cross-fade with the elements' share. A click that selects a formation has the camera follow
  the selection (`CameraController.follow`, `MapView.followPoint`): its middle where the sprites
  are drawn, between the tick before and the tick in hand, is eased to the middle of the view;
  a zoom goes on about it. A pan of the user's (a drag past 5 px, a pan key, one finger, a jump
  or a flight) ends the follow, as an empty selection does.
  A selection box (the user's request of 2026-10-29; `MapView.formationsInBox`, `PlayerControl.boxSelect`):
  a Shift-drag of the mouse (past 6 px; less is a Shift-click) adds the played nation's
  formations in it, a Ctrl+Shift-drag takes them out; on a touch screen a finger held still
  450 ms, then dragged, draws one (a finger that moves first pans). In it: each formation drawn
  in the box, and far out every one a T1 marker overlapping it stands for. The land formations
  where there is one, else the fleets; never wings. Ctrl+A selects all of them (`selectAll`).
  A box and Ctrl+A leave the camera where it is (no follow). The box is drawn dashed gold, red
  for one that takes out.
  A right-click (no drag: a drag of the right button pans) on the ground of another nation
  (its controller) opens its menu (`src/ui/NationMenu.tsx`, `PlayerControl.menu`; the user's
  request of 2026-10-29): Declare war, or Offer peace in the war with it; Propose alliance,
  disabled at war and between allies. The Actions tab's commands. It closes with its action, a
  press or a wheel turn on the map, Escape (before the selection), a load, or a change of the
  nation played; a refusal of its action within 3 s is told in words where it was, for 5 s.
  The controlled nation gets an Actions tab (PLAN 1.33b, `src/ui/ActionsTab.tsx`). At its top the
  AI assist (ADR-759): a box for each layer of the AI (Army, Navy, Air, Diplomacy, Economy,
  Nuclear strikes), ticked as `World.playerAi` has them (`nationStats.playerAi`); a tick or an
  untick sends `setPlayerAi`, applied at once. Below:
  - `declareWar`, `offerPeace` and `proposeAlliance` (refusable, unlike God commands):
    - peace is accepted when the offering side leads by ≥ 25 or the other side's exhaustion is
      > 40, never against a side fighting to the death;
    - an alliance is accepted when the target is unallied, not a puppet and not at war with
      the proposer.
  - Production: every land and sea template with gold, manpower and training days
    (`mapLayers.templates`), Build when affordable, and the training queue
    (`NationStat.queue`). A fleet is disabled, "no port", for a nation with no shipyard
    (`NationStat.shipyard`, PLAN 4.2f, ADR-253; the worker asks `shipyard` of each living
    nation, about 3 ms for all, by the ports' water of the zones alone, `portSeaOf`: the
    zones are built at the first stats of a game, not the lane graph). A wing is disabled, "no
    airfield with room", where the nation's most room for aircraft at an airbase it holds
    (`NationStat.airRoom`) is under the wing's aircraft (`TemplateInfo.aircraft`; PLAN 5.8v4,
    ADR-355).
  - The air force (PLAN 5.8v1, ADR-352): its wings (`nationStats.wings`, the player's, by
    id), each with its template, base (an airbase, a carrier), mission and whether it flies;
    a button arms its order (Patrol, Strike, or Supply for a transport; Rebase), the next map
    click gives it there (`wingMission`, `wingRebase`, with the nation), and Escape disarms it.
    Paradrop (PLAN 5.8v2, ADR-353), with transports: armed for the formations selected, the
    next map click drops each there (`paradrop`). A refusal of either is told as a march's is
    (PLAN 5.8v3, ADR-354: `orderNews`, with its reason in words; a wing named by its template).
- **God Mode UI** (PLAN 1.32b, `src/ui/GodTab.tsx`): the bottom bar's God Mode button adds a God
  tab to the nation panel. It has rename, income bonus ±10, AI switches (nation and world), war/
  ally/puppet on a chosen target, peace per war, buffs, revive (dead nations), Kill (two clicks).
  Map tools (revolt, breakthrough from two clicks, territory brush) take the next map clicks.
  The territory brush also paints on a left-drag (PLAN 1.44b): a disc at the press, then the
  way to every further cell the pointer enters; the right or middle button pans meanwhile.
  It gives the land to the selected nation, owner and controller (PLAN 2.17b, ADR-118): it
  sends the editor's `editPaint` on the nation layer (radius 5, no mask; `brush` with
  `stroke: 'start'` at the press, `line` with `stroke: 'more'` after). A stroke is one step
  of the editor's undo history; the keys of undo and redo work while the editor is open.
  God commands are sent with `now`: applied at once between ticks with the next step's tick
  stamp (`Sim.applyNow`), so they show while paused and replay identically.
  What the tab holds is its nation's (`src/app/hud.ts`, `GodTab.tsx`): the words of a refusal
  are shown only while the selection is the one the command was sent under, and go with any
  change of the selection or of God Mode (ADR-125); an armed Kill and a typed name are
  nothing on another nation's tab; a selected nation that the statistics list among the dead
  is deselected, and with no nation selected an armed territory brush is switched off
  (ADR-126).
  God Mode's placing (the user's request of 2026-10-29, `PlayerControl.placing`): with God Mode
  on, the played nation's Actions tab lists every template, of land, sea and air, researched or
  not, each with Place. One armed, each map click puts one of the played nation's there at once,
  with no gold and no training: `spawnFormation` (any land, the enemy's too), `spawnFleet` (the
  water by the click; it holds its place until ordered away), `spawnWing` (an airbase of its with
  room). The click is the place on a formation too. It stays armed until Escape, the same
  button, another order or God tool armed, a change of the nation played, or God Mode off. A
  refusal is told in words under the armed note. Nothing new is saved: the commands are those of
  the editor and the God tools.
- **God Mode**: rename; force war, peace, alliance or collapse; spawn a nation, revolt or battle;
  grant buffs; take control of a nation; disable AI globally or per nation; toggle nukes
  globally or per nation; grant warheads; force a strike. All of these are Commands.
- **Editor** (paint tools implemented PLAN 1.35, `src/sim/editor.ts`, `src/ui/EditorPanel.tsx`):
  - Commands `editPaint` (layer nation = owner + controller, or terrain; tool brush / line /
    bucket; radius ≤ 32; mask by terrain or nation), `editUndo` and `editRedo`.
  - The diff stack is world state (`edits.*` sections, ≤ 50 edits and 500 k cells), so a save
    plus a log with undos replays exactly.
  - A dead nation gets no cell from the history or an import (PLAN 3.4Ri) [ADR-146]: an undo or
    a redo that would write one writes the living nation the step says held the cell, else
    nobody; a controller that is dead becomes the owner. The step is kept as it was made.
    `importLayer` reads a dead nation's id as unowned, as an unknown one.
  - Land cells only: terrain edits are land ↔ land until map import (1.37) can regenerate the
    fine coastline. Terrain edits drop nav and paths; the worker resends `terrainLayer`.
  - UI: the bottom bar's Editor button; map clicks paint; Ctrl+Z / Ctrl+Y.
  - Painting by dragging (PLAN 1.44) [ADR-63]: while the brush or the line is the editor's tool,
    the primary button (and one finger) paints and does not pan; the camera pans with the right
    or middle button, two fingers and the keys. The brush stamps at the press (`editPaint` with
    `stroke: 'start'`) and paints a line to every further cell the pointer enters (`stroke:
    'more'`). A stroke is one undo step: `more` grows the top edit instead of pushing one
    (`EditStack.stroke`, saved only while a stroke is open). The line paints from the press to
    the release; released in the cell of the press it is a click of the two-click line. The
    bucket and the scenario tools are click tools: with them a left-drag pans.
- **Map import** (PLAN 1.37a):
  - `src/shared/mapImport.ts` maps an image to the map: nearest-neighbour resample, then the
    nearest palette colour (terrain colours, or nation colours within 40, else unowned). The
    result travels as runs in the `importLayer` command.
  - `importLayer` lets terrain change water ↔ land; owners of new water are cleared in a linked
    edit, so undo/redo act on the pair. The undo cap never evicts the two newest edit groups.
  - The worker reports `terrainLayer.landChanged` (land/water differs from the start); the
    renderer then draws cell coasts with water taken from the terrain layer.
  - City cells keep their land (a city becomes an island). Formations left on water move to the
    nearest land within 64 cells, or are removed (PLAN 1.41).
- **Scenario files** (PLAN 1.38, `src/shared/scenarioFile.ts`, `src/app/scenarioFiles.ts`):
  - A `.warism-scenario` file is gzip of the magic line, a JSON header (format, name, base,
    w, h, tick, hash) and the state bytes.
  - `Sim.exportScenario` saves the world without its run history (command log, pending,
    history log, statistics, undo stack) and leaves the running game untouched.
  - Import checks the base and map size, loads the bytes, and compares the state hash with
    the header. The editor's "Scenario file" section exports a download and loads files.
- **Flags in play** (PLAN 1.37b, `src/shared/flagPixels.ts`, `src/app/flagStore.ts`,
  `src/ui/FlagEditor.tsx`):
  - `setFlag {nation, runs}` stores a 36×24 pixel flag in the world, saved with the names;
    empty runs restore the scenario flag.
  - The app resolves each nation's flag: custom, else its scenario FlagSpec rasterized to 36×24
    (stretched to 3:2), else plain colour. Flags are drawn at capitals from 3 px per cell, and
    in the nation panel.
  - The editor's flag tool offers pencil, bucket, colour picker and 11 presets. The editor
    panel docks right, hiding the ranking, so the map centre stays free.
- **Scenario editing** (PLAN 1.36, `src/sim/scenarioEdit.ts`):
  - Commands `spawnCity` (a named city on land; adds 20 × size × mean land-cell economy to its
    cell, stored on the row and taken back by `removeCity`), `removeCity` (a capital
    relocates), `setCapital`, `setGold`, `setCore` (core or claim; a dead nation's claim is a
    preset revolt) and `annexNation` (land, formations, cores and puppets pass; `NationAnnexed`).
  - Editor city names are saved with the nation names. The worker resends the city layer
    (`cityLayer`) when cities change. Alliances and puppets use the God tab's commands.
  - The core-cost rule waits for a core economy.
- **Editor forces** (PLAN 7.13a, 7.22c, 7.24b; `src/sim/placeForces.ts`):
  - `spawnFleet` puts a fleet on the sea water nearest the click within `BASE_PICK_CELLS`; it
    holds that place (`world.station`). Refused `NotAtSea` where no such water is near.
  - `spawnWing` puts a wing at the airbase of its nation's with room for its aircraft nearest
    the click: anywhere when the click is on the nation's own land, else within
    `EDITOR_WING_CELLS` (4 at M) [ADR-505]. Refused `NoAirbase` otherwise; the worker then adds
    to the `refused` message the nearest base of the nation's with room and its km from the click
    (`nearestWingBase`, read from the command log; null where it holds none), and the editor says
    so under the refusal. A change of the editor's nation clears the refusal.
- **Editor**: brush, bucket, line; undo/redo (command-pattern diff stack); target
  mask (paint only over a selected terrain or nation); cities; gold and core costs; alliances;
  puppets; annex; preset revolts; map import (image → terrain/owner via palette
  mapping); flag editor with presets (tricolours, crosses, cantons, emblems from
  our own SVG set); save/load scenario files.
- **Stats** (implemented PLAN 1.34b):
  - `src/sim/stats.ts`: a monthly sample per living nation [tick, nation, land, income, gold,
    men, casualties], saved as f32 `stats.rows`. It is the last system of the tick.
  - Casualties are counted in `settleFormation` as men lost since the last settle (combat,
    attrition, desertion).
  - The worker serves the rows raw (`stats` request); `StatsChart` (Charts button in the
    ranking) draws SVG lines for the top 5 at the latest sample + the selected nation.
  - Naval/air military sizes join with their phases.
- **Stats**: per-nation series (land in km² [ADR-52], income, gold, military size by domain,
  casualties, warheads), ranking list, charts.
- **History log** (implemented PLAN 1.34a):
  - `src/sim/history.ts`: state, saved as `history.rows`. Every emitted event of a
    `HISTORY_KINDS` kind is recorded on emit.
  - The worker resolves names per `HISTORY_ROLES` (`history` request,
    `src/worker/historyRows.ts`). No row shows an id (PLAN 3.12a, ADR-208): an alliance has
    its name, alive or dissolved (`Alliances.past`), and its founder's (`Alliance.founder`,
    the row's `of`); a Major Battle the city it began near.
  - A kind that is more than one thing has a sentence for each (`HistoryRow.as`, told from
    the log alone, so a game saved before reads the same and no state changed). A
    `RevoltSpawned` (PLAN 3.12b1, ADR-209): "{a} broke away from {b}" for a nation founded;
    'revived', "{a} took back land held by {b}", when a has a `NationRevived` in that hour;
    'joined', "More of {b} rose and joined {a}", when a had a `RevoltSpawned` before and no
    `NationEliminated` since. A `LandCeded` (ADR-210, §4 "Land handed over"): its own
    sentence, or 'left' when b died in that hour. An `AllianceJoined` (PLAN 3.12Rg1,
    ADR-214; every member of an alliance that is made has one, the founder first):
    'founded', "{a} founded {b}", when a is the alliance's founder and no row before names
    the alliance; b is then told without its founder ("Norway founded a Defensive Pact").
    A `WarEnded` (PLAN 3.12Rn, ADR-225; a war that a bond ended, emitted by
    `leaveBondedWars` when the nations that leave were the last of their side: a the leader
    of the side that stayed, b the nation that left): 'puppet', "The war between {a} and {b}
    ended: {b} is now a puppet of {c}", when a row before it in its hour is b's
    `PuppetCreated` or a `NationAnnexed` (the nearest of them: the overlord, or the annexer
    that has b now, is the row's `cn`); else "… ended with no peace signed". A war whose
    last nation of a side died has no row of its own: the death's row is its end.
  - God Mode's acts (PLAN 7.33b, ADR-531): Spawn nation is `NationSpawned`, "{a} was set up on
    land of {b}" (a birth in the lives, not a revolt of b; land that rises to it later "joined"
    it); Found city `CitySpawned`, "{a} was founded in {b}"; Raze city `CityRazed`, "{a} in {b}
    was razed" (a = the city's definition, b its holder; `removeCity` emits it, the editor's
    too). A town is named as the log keeps it (`History.towns`, row number → name, section
    `history.towns` saved while not empty): the name a city was placed with, or a razed city's
    definition's. A city's row and name go when it is razed and the row is reused. A scenario
    exported from the game has no history and no names.
  - `src/ui/HistoryPanel.tsx`: newest first, filters by type, nation and years; CSV
    (RFC 4180) and JSON export of the filtered rows. The sentence of a row is
    `src/ui/historyText.ts`.
- **Ticker** (implemented PLAN 3.12c, ADR-211; `src/ui/Ticker.tsx`): the major events
  (`TICKER_KINDS`: a war declared, a peace, a war ended by a bond, a capital taken, a nation
  destroyed, collapsed, annexed or returned; God Mode's nation set up, town founded or razed,
  PLAN 7.33b) as they happen, bottom left above the bar, the newest last, a live
  region (`role="log"`).
  - Below the events, what became of the player's orders of formations (PLAN 4.9c, ADR-300):
    the worker remembers each formation a player's `moveFormation` names and tells the page at
    once (`orderNews`, not with the stats) a refusal with its reason (`RejectReason`), a landing
    thrown back, and troops ashore more than 3 cells from the order's cell (their transports
    broke off). A refused order leaves the one before it standing, and that one is told on (a
    division aboard keeps its voyage; ADR-301). The page keeps the last 4 (beside a panel the
    last one); a click flies to the formation and forgets the row; the formation's panel shows
    its last (`formation-notice`).
  - Before the orders, the sea battles going on (PLAN 4.10b, ADR-303): "Sea battle: <side>
    against <side>" from each snapshot's `seas`; a click flies to a T2 view of both fleets
    (`showBattle`, the span the cells across them). Since PLAN 7.10b the view is of its nearest
    two fleets at war; since 7.19b (ADR-494) of the nearest two within reach of a ship's weapon
    of either (a gun or torpedoes on a surface ship, depth charges on a submarine; not the
    carriers' wings, `inShipReach`), centred on the point of the line between them nearest its
    middle that is water; a battle with no such pair (a carrier's wings alone reach) is marked
    on the map and has no row.
  - The rows are the worker's (`tickerRows`, `src/worker/historyRows.ts`), read from the end
    of the history log and sent with every `nationStats`: the last `TICKER_ROWS` (5) of the
    last `TICKER_HOURS` (30 days). Not from the view's event queue, which drops records at
    Max speed. A death told twice in an hour (a collapse or an annexation, then
    `NationEliminated`) is one row. A peace whose winner annexed its loser in that hour is
    one row too, the annexation (PLAN 3.12Rg2, ADR-215); the log has both, the peace first
    (`makePeace` emits `PeaceSigned` before its terms' `NationAnnexed` or `PuppetCreated`).
  - Every row has a place: the event's own (a capital taken, a return), else a capital as it
    is now: of the nation a war was declared on, of a peace's loser, of the nation a bond
    took out of its war, of the nation that died.
    A click flies the camera there (`MapView.showPlace`), 1,500 km across the view.
  - While a nation's or a formation's panel is open on the left, the last two rows only,
    each of two lines at most (PLAN 3.12Rh, ADR-216): the panel is the view less 12.5 rem
    at most, which leaves the room of two rows of two lines at every UI size. The war
    banners are as wide as the lesser of 60% of the view and the view less 39 rem: they
    begin right of the ticker and of an open panel, whose right edge is at 18.9 rem and
    2 px (PLAN 3.12Rh4).
  - At Max speed the ticker is a sample (counted, ADR-216): a message a second spans some
    380 hours, and 18% of the messages bring more than five major events. It stays the last
    five (PLAN 3.12Rh2, ADR-218): the History panel has every row, and the room beside a
    panel is two rows. The cue does not depend on the five (see Sound).
- **Sound** (implemented PLAN 3.12d, ADR-212; `src/shared/sound.ts`, `src/app/sound.ts`): a
  cue for each major event the ticker tells, made in code with the Web Audio API (no sound
  file is loaded).
  - Five cues (`cueOfKind`): a war declared (three rising notes, as of a trumpet), a peace
    or a war ended by a bond (two bells), a capital taken (two drum strokes), a nation destroyed, collapsed or annexed
    (two low falling tones), a nation returned (a rising arpeggio). The notes are data
    (`CUE_NOTES`), each cue over in 1.5 s at most.
  - The cue of a `nationStats` message is that of its ticker rows that are new and of its
    `news` (`cueOfTicker`): one a message at most, the first of war, death, capital, return,
    peace. `news` is the kinds of every major event since the message before, each once
    (`tickerNews`, PLAN 3.12Rh2, ADR-218): the worker keeps the log's length at its last
    message (`SimServer.newsFrom`, not sim state), so a war declared before five captured
    capitals in one second at Max is heard.
    The message carries the number of the worker's world (`world`), which a new game or a
    load changes: the first message of a world is its past and asks for nothing.
  - A browser lets a page sound after a press: the `AudioContext` is made at the first
    `pointerdown` or `keydown`. A cue asked for before that is dropped, not kept.
  - Settings: the volume (25, 50, 75 or 100%, 50% at first; a choice sounds the peace cue at
    it) and a mute, both persisted (`warsim.volume`, `warsim.muted`). A muted cue is not
    asked for.
  - `window.__warsim.sound`: `asked` (the cues asked for) and `sounded` (how many reached the
    audio context), for a test, which cannot hear.
- **History log**: wars, peace, battles, Major Battles, city captures, revolts,
  collapses, revivals, nukes. Filterable by type, nation and date, and exportable to CSV/JSON.
- **Title screen** (implemented PLAN 1.43a, `src/ui/TitleScreen.tsx`, `src/app/main.tsx`) [ADR-60]:
  - `/` (no `?scenario=`, or an unknown one) is the title screen: the scenario list (the
    scenarios whose `scenario.json` is not `hidden`, the 1938 world first), the chosen scenario's
    name, description, start date and map, and the new-game form (`src/ui/NewGameForm.tsx`: a
    seed, random per visit, and the options below). No sim worker and no map exist behind it.
  - A game is its URL. Start navigates to `?scenario=<id>&seed=<n>&paused=1` plus the options,
    as New game in the settings panel does; a reload restarts that game and the URL can be shared.
  - The toy world is a test world (`hidden`): it opens by `?scenario=toy` only.
  - The random world (PLAN 2.16c) [ADR-110] is second on the list. Its picture is one random
    world (seed 7, 60 nations: `previewRandom`, `tools/data/preview.ts`), and the text says so.
    Its new-game form has a field for the number of nations (`ScenarioInfo.nationsRange`, 2 to
    200, 60 at first; Start only for a whole number in the range). The number is the game
    option `nations`, `?nations=N` in the URL, so it is in the autosave's record and in
    Continue, and the game's own new-game form starts from it. A world loaded without the
    number in its URL (a scenario file; a continue URL typed without it) gives the form its
    number of living nations, brought into the range (`setup` in `src/app/game.tsx`; ADR-111).
    The range is said once on the title screen, among the scenario's facts; the hint beside
    the field is the settings panel's.
  - Settings → Main menu autosaves the game and returns to `/`.
  - Loading a game (PLAN 1.43b) [ADR-61]:
    - *Continue:* shown when there is an autosave, with its scenario, in-game date and the time
      of the save. It opens the URL of the game that wrote it plus `continue=1` (the record keeps
      that game's seed and options).
    - *Scenario file:* a `.warism-scenario` file is checked on the title screen (it unpacks, its
      format, its base scenario exists here at that map size), kept in IndexedDB (slot
      `scenario`) and loaded by `?scenario=<base>&load=scenario`. The game checks the state hash.
      The file stays stored, so a reload starts the scenario again. A file the game cannot load
      leads back to `/?failed=scenario`, which says so.
    - *The loaded world wins:* after a load the game shows the world's own seed, and when the
      world's looping setting differs from the URL's the URL is corrected and the game boots
      again (the map view is built from the URL before the world is there).
  - The chosen scenario's map (PLAN 1.43c) [ADR-62]: an image of the political map of its start,
    `public/data/scenarios/<id>/preview.png` (1024 × 512; nations in their colours, the game's
    sea colour, dark borders where the holder changes), beside the start date, the map with its
    size and the number of nations alive at the start. The image is made by
    `npm run data -- --previews` (`tools/data/preview.ts`) from the shipped map assets and the
    scenario data; `tests/unit/scenarioPreview.test.ts` rebuilds it and fails when the committed
    image differs.
- **Settings** (implemented PLAN 1.39a, `src/app/settings.ts`, `src/ui/SettingsPanel.tsx`):
  interface size 85–130% (root font size, also on the title screen), unit size 50–200% (marker
  size multiplier), both persisted; the unit look, Countryballs or Classic (`warsim.unitLook`,
  `src/shared/unitLooks.ts`; PLAN 7.174a, see §8), switched at once and persisted; the sound's volume and mute (PLAN 3.12d, see Sound); F2 or
  the panel saves a PNG of the map with its overlays;
  Main menu; seed field, random seed and New game (reloads with `?seed=`, paused).
- **New-game options** (PLAN 1.39b1, `src/sim/gameOptions.ts`, `src/app/gameUrl.ts`): looping map
  (`settings.loopingMap`, saved; off = no wrap in pathing, the frontier, the supply flood
  (ADR-227), the measure of contact (who fights whom, where a block deploys, a retreat's
  way, a breakthrough corridor: ADR-233), the supply's reach about a formation (ADR-234),
  the pressure of a formation on a frontier cell (ADR-236), the operational AI's
  distances and its sums over a sector's 3 × 3 buckets (ADR-237), the nearest-cell
  search in play (`nearestCellWhere` with `wrap`: a retreat's cell, a capital's move to
  the field, the cell an order is snapped to, a march home's cell, where a formation is
  mustered, a founded nation's field capital, the neighbour a collapsed nation's land
  goes to, a formation an import left on water: ADR-238), the brushes (the editor's brush,
  line and bucket, the God brush of control, a placed city: a column beyond an edge is no
  cell and the bucket's first and last columns are not neighbours; the page takes a point
  beside the map for no cell, `cellOfPoint`: ADR-239), where a block and its slots
  stand (none beyond an edge, `World.onMap`; over the seam of a map that loops their x is
  left unfolded: ADR-240; the page draws such a place, and finds it under the pointer, in
  the copies of the map within `SEAM_MARGIN` (2 cells) of the view, `wrapOffsets` in
  `render/camera.ts`: the sprites, the tags, the shots, wrecks and hulls, the selection
  ring and the click, ADR-241), what a view is sent (`inBbox`) or rendering; a world's build
  wraps as its map does), aggression (random 0..100), traits (1–3 random, exclusions respected → income and
  manpower multipliers and aggression bias), starting gold (random 0.25–2× or equal = median),
  CE mode, the start's alliances, guarantees and wars as the scenario's or drawn by the seed (`diplomacy`,
  PLAN 7.182, ADR-785; puppets stay), and for the random world the number of nations (`nations`, §3.4). Applied once at
  init from the seed; carried in the URL
  (`looping=0&aggr=random&traits=random&gold=random|equal&ce=…&nations=N`). The type is
  `GameOptions` (`src/shared/gameOptions.ts`).
- **QoL**: keyboard (WASD/arrows pan; +/-, numpad ± and Q/E zoom as in AoC; space pause, 1–5 speed), drag,
  wheel and touch pinch. Speed and pause persist. Autosave. Screenshot key (F2 → PNG).
  UI size (rem scale; "The least view" below). Unit-size setting. Looping map. Map size picker (PLAN 7.1b, ADR-43: the
  sim is tuned in cells for M until its distances are km-based). Locale
  picker (en first; all strings through `t()`).
- **The least view** (PLAN 3.12Rh4, ADR-220): the game is laid out for a view 64 rem wide
  or more, the bottom bar's one line at its widest map mode with 0.5 rem a side: 871 px at
  85%, 1,024 at 100%, 1,178 at 115%, 1,332 at 130% (`LEAST_VIEW_REM`). A UI size whose
  least view is wider than the window is not offered (disabled in Settings) and the size
  in use is the largest offered that is no larger than the one chosen; the choice is kept
  and is in use again in a wider window. Below 871 px the size is 85% and the bar's ends
  are cut. A played nation's label is the one item of the bar that shrinks (an ellipsis,
  the text in its `title`). The History panel is the view less 40 rem at most: clear of a
  panel on the left at the least view. The title screen keeps the size chosen.
- **A low view** (PLAN 3.12Rh5, ADR-221): a panel of the centre is the view less 12 rem
  high at most. The Settings panel scrolls its rows in that box, the History panel its
  list. The ticker and the war banners are mounted before these panels: where the rows of
  banners reach above a panel's foot (eight banners in a view 1,100 px wide), the panel is
  drawn over them and takes the pointer.
- **Seeds & randomisation**: seed field (shareable), random-seed button, options
  (randomise aggression, traits, starting gold, alliances and wars, efficiency mode).

---

## 10. Testing & verification

Every check runs the same `src/sim/` as the page. Tools run TypeScript through `tsx`.

### 10.1 The suites
- **Unit** (`npm test`, vitest, `tests/unit/`): dmath's accuracy and determinism, the RNG, the
  hash, each system's rules, every JSON file against its schema, save and load round trips. A 1938
  world after a test file's first is made from its template (`keepWorldTemplates`, the tests'
  setup), and pure runs are loaded from shared checkpoints in `.cache/checkpoints/`
  (`tests/helpers/checkpoint.ts`; `NOTEMPLATES=1` builds every world) [ADR-279].
- **Ten-year tests** (`npm run test:sweep`, `vitest.sweep.config.ts`, `tests/sweep/`): long runs
  that test correctness, not balance: allies never at war, no bankruptcy in peace, saves across
  years, research, the AI's year. `baselineHash.test.ts` pins the state hash of seed 99 after one
  year; a change of rules moves the pin in its own commit, with the old and new hash in DECISIONS
  [ADR-278].
- **Browser** (`npm run e2e`, Playwright, `tests/e2e/`, against `vite preview` of the build): the
  project `chromium` runs every spec but `*.perf.spec.ts`, which run on the project `perf`
  (`--project=perf --no-deps` alone). The scripted demos are specs: the seamless zoom from the
  world to the men of a battle (`zoomDemo1938.spec.ts`), sea, tank and air battles, an AI nuclear
  strike, the editor's round trip, save and load.
- **The checkers** [ADR-803, ADR-804]: the rules of several systems judged together, every hour
  or day of a run, on many seeds. `tests/helpers/diploInvariants.ts` holds war and peace (`held`,
  `exit`, `realm`, `bond`, `rise`), on the days of a run and on the wars a player or God could
  declare in it; `tests/helpers/worldInvariants.ts` holds the other systems by rule set
  (`RULE_SETS`: economy, navy, air, nukes, bonds, heroes). Unit tests run them on fixed seeds of
  the 1938 and the random world (`diploInvariants*.test.ts`, `worldInvariants*.test.ts`), each red
  on a rule patched to break it; `tools/diag/diploInvariants.ts` and `tools/diag/worldInvariants.ts`
  run them on any seed. A feature that adds rules adds them to a checker.

### 10.2 The test API and the page's options
`window.__warsim` (also `window.__warism`, the same object; `src/app/testApi.ts`) is the surface
for Playwright and the critic, present only in a game: `sim` (the `SimClient`: init, step, command,
hash, save, load, speed, pause, subscribe), `view` (the `MapView`: its `controller`, the
`CameraController`, with `set` and `zoomTo`; null with `?view=0`), `hud`, `autosave`, `player`, `settings` and `sound`.

URL options: `?scenario=1938|random|toy` (none: the title screen), `?seed=`, `?paused=1`, `?view=0`,
`?continue=1`, `?load=scenario`, `?size=`, and the new-game options of §9: `?looping=`, `?aggr=`,
`?traits=`, `?gold=`, `?ce=`, `?diplo=`, `?heroes=`, `?nations=` (the random world).

### 10.3 The gate
`npm run check` (`tools/gate/check.ts`) must be green before every commit. It is sized to what
changed since HEAD [ADR-48, ADR-55]:
- a clean tree the gate has passed, or documents only (Markdown, `docs/`): nothing runs; the tree
  is recorded (`.cache/gate/green.json`);
- code: typecheck (`tsc -b`), lint (`eslint .`), the unit tests whose imports reach a changed file
  (`vitest related`; all of them when something they all stand on changed: the vitest config,
  `tests/helpers/`, `data/`, `public/data/`, `tools/headless/`, `package.json`, the lock file)
  [ADR-280], the build, the e2e specs that changed (all when a helper or the config changed), and,
  when a sim input changed (`SWEEP_INPUTS`), the pin alone.
- A test red in a run is run again alone; red twice fails, unless it is on
  `tools/gate/knownRed.json`: a failure of this machine, not of the code, each with why and its
  BLOCKERS entry. A test leaves the list when it passes here [ADR-297, ADR-779].

`npm run check:full` runs every stage whatever changed. `npm run check:review` (`tools/gate/review.ts`)
runs every stage on its own, the browser suite in chunks of 20 spec files, a failed test again alone,
and records each step under the code's tree without the documents (`.cache/gate/review.json`), so a
run cut off resumes where it stopped and a commit of documents is proved by it; it is green when
every test red twice is on the known reds [ADR-297].

### 10.4 Long runs
- **Headless** (`npm run sim`, `tools/headless/`): `--scenario toy|1938|random`, `--nations`,
  `--size`, `--seed`, `--years`, `--out` (per-year metrics, `YearMetrics`: hash, cells controlled and
  owned by nation, formations, cells flipped, events by kind, tick ms mean, p95 and max). `--save` writes the final state and `--load` continues from it,
  bit-identically. `--affinity <mask>` pins the run to those CPUs: a tick time for a budget is
  measured so. `--profile` prints the tick by system.
- **Diagnostics** (`npm run diag`, `tools/diag/`): wars and great-power state at chosen years, from
  1938 or a checkpoint; the other diagnostics are run as `npx tsx tools/diag/<name>.ts`.
- **Soak** (`npm run soak`, `tools/soak/`): two twins of one game for `--minutes` (30) of the wall
  at headless speed; one is saved, gzipped and loaded into a fresh sim every `--interval` (5)
  minutes, and the hashes compared after each load, every `--compare` (30) days and at the end
  [ADR-424]. Each day both twins are searched for a NaN or an infinity in a float section of the
  save and a NaN or `undefined` in the history's rows [ADR-425]. It fails on an exception, a desync
  or such a value.
- **Sweep** (`npm run sweep`, `tools/sweep/`, criteria in `tools/sweep/criteria.ts`): 10 seeds × 50
  years by default, `--first <seed>` on seeds no tuning has seen, `--tag`, `--size`, `--heroes on`;
  `--from <report.json>` judges a written report again; reports in `docs/sweeps/` (`--scratch`:
  `.cache/`). Land is km² of true area, never cells (`src/sim/landArea.ts`) [ADR-52]. Criteria
  [ADR-54]:
  - *Limits, every seed* (`MOVING_MIN`, `MAX_LAND`, `MAX_INCOME`, `ALIVE_MIN`, `ALIVE_MAX`,
    `WAR_YEARS`): land changing controller in the last 5 years ≥ 1 %; the largest nation < 35 % of
    the land and < 40 % of the income at the end; 20 to 250 nations alive every year; a war in
    ≥ 80 % of the years.
  - *Dynamism, each in ≥ 80 % of the seeds of runs of ≥ 50 years* (`DYNAMISM_QUORUM`), on realms (a
    nation with no overlord, with its puppets' land): a riser (ends with ≥ 1 % of the land and
    ≥ 1.5 × its land after year 1), a faller (one of the ten largest after year 1 ending with ≤ 2/3
    of its land then), and no break-up (the living nations never more than 1.1 × the most they were
    20 or more years before) [ADR-428].
  - *Nuclear weapons* (`NUKES_USED_SEEDS`, `FALLOUT_MAX_LAND`): used in at least one seed, and on
    no day of any seed fallout on more than 50 % of the land.
  - *Reported, not judged:* stasis (the longest run of the same five largest by land; ADR-750), new
    nations in the top ten, and the leader's share range.
  A release needs land moving on every seed; the largest nation's share is reported, not a
  release's condition [ADR-740]. `npm run sweep:quick` (10 × 20 years, report in `.cache/`) is for
  tuning.
- **Bench** (`npm run bench [-- A B BP R G]`, `tools/bench/`): the production build in Chromium on
  the real GPU (ANGLE with `--enable-gpu --ignore-gpu-blocklist`; without them SwiftShader). Pages
  `bench.html?b=A` (map), `B` and `BP` (proxies), `P` (precision, run by an e2e spec), `R` (the
  province raster). `G` is the game itself, judged against the frame budgets of §1 on this
  machine's GPU, with the software rasteriser reported beside it (`tools/bench/game.ts`); it exits 1
  when a judged budget is missed. Results and screenshots go to `docs/bench/`.

### 10.5 The nightly run
`.github/workflows/nightly.yml`, every night on `main` (no GPU, so no e2e or bench): typecheck, lint,
the whole unit suite (`tools/ci/unit.ts`: red twice fails, except a test on `tools/ci/runnerRed.json`,
a time budget of the development PC, or on the known reds, shown as warnings), build, the ten-year
tests, a 30-minute soak, both checkers on four new seeds each (seeds from the run's number; the 1938
and random worlds, random diplomacy, heroes), and a 4 × 20-year sweep; on Sundays the 10 × 50-year
sweep. Its reports are kept 30 days.

### 10.6 The critic and the release
A batch of ROADMAP ends with the critic (`.claude/agents/critic.md`, `CRITIC_PROMPT.md`): an
independent agent that plays the built game, judges it by the goals, scores each dimension and
writes `critic/CRITIC_REPORT.md` and `.json`; each blocking issue becomes a ROADMAP item. On a full
report with no blocking issue: `npm run check:review`, the soak (1938, seed 99, 30 minutes), the
sweep on unseen seeds, and `npm run bench -- G`; then a CHANGELOG entry and the tag
`release-<YYYY-MM-DD>` [ADR-804, ADR-805, ADR-820].
