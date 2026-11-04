# Warism — Specification & Architecture

Status: v1.0 (2026-11-03, after `release-2026-11-03`; ADR-805). This document says how the game works
now. The *why* of each choice is in `DECISIONS.md` and `docs/history/DECISIONS-<YYYY-MM>.md` (cited as
`[ADR-n]`). §1–§8 and §10 are current; the other sections are being brought up to date one by one
(ROADMAP R6), and where one disagrees with the code, the code and the newest ADR win. A current
section names only files, code and scripts that exist (`tests/unit/specRefs.test.ts`, ADR-821).

**Contents.** 1 Goals · 2 Architecture (2.1 module rules, 2.2 repo layout, 2.3 worker protocol,
2.4 snapshot layout, 2.5 tick order, 2.6 determinism, 2.7 persistence) · 3 World model and data
schemas (map, cells, provinces and zones, nations, diplomacy, military, tech and production) ·
4 Territory, fronts and the strategic layer · 5 Combat (engagement, element combat, combat
efficiency, Major Battles) · 6 Armour, naval, aircraft, nuclear weapons · 7 AI (layers, strategic,
operational, economic) · 8 Semantic zoom (tiers, forces by tier, effects, the map, interest
management, budgets) · 9 UI and UX · 10 Testing and verification (10.1 suites and checkers, 10.2 test API, 10.3 gate,
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
- **Units** (`data/units/land.json`, a tank element 10 tanks):

  | unit | class | soft / hard | armour / piercing | hp | km/h | fuel/h | tech (year) |
  |---|---|---|---|---|---|---|---|
  | `tank_light` | armor_l | 14 / 6 | 15 / 18 | 30 | 16 | 1 | armor_light_1 (1936) |
  | `tank_medium` | armor_m | 20 / 14 | 45 / 50 | 45 | 13 | 1.5 | armor_medium_1 (1938) |
  | `tank_medium_2` | armor_m | 24 / 20 | 70 / 80 | 55 | 14 | 1.6 | armor_medium_2 (1941) |
  | `tank_heavy` | armor_h | 22 / 26 | 110 / 120 | 70 | 9 | 2.5 | armor_heavy_1 (1942) |
  | `tank_mbt` | armor_m | 30 / 34 | 140 / 160 | 80 | 16 | 2 | armor_mbt (1950) |

  Beside them motorised infantry (motorisation, 1936; 12 km/h) and mechanised (mechanisation, 1940;
  tracked, armour 4, 14 km/h), and the AT gun (piercing 45: light and medium tanks in full, later ones
  halved). In 1938 every nation knows light tanks; the Soviet Union, France, Britain and Japan medium
  ones by `nations.json`, Germany by its panzer divisions (§3.7).
- **Templates** (`data/templates/land.json`): tank brigade, panzer division (30 light, 4 medium, 8
  motorised, 2 heavy artillery), light mechanised division, tank corps, mechanised division, and the
  later panzer division 2, heavy panzer division and MBT division. Price 3.5 × the elements' gold,
  training 3 × the slowest element's days (§3.7); upkeep in gold; fuel the sum of the elements' fuel an
  hour (`scenario1938.ts`).
- **In battle** (§5.2): hard attack against armour, × `ARMOR_PEN` (0.5) where armour beats piercing;
  armour loses whole tanks (heroes, air strikes and bombardment carry wounds instead). The arms rules
  favour armour with infantry and artillery beside it (`COMBINED_ARMS`), on open ground against a side
  with no AT gun (`IN_THE_OPEN`), and punish it unscreened in forest and towns (`UNSCREENED`); artillery
  suppresses AT guns (`SUPPRESSED`). CAS (hard 12, piercing 30) is halved against medium tanks and
  heavier.
- **Terrain** (`data/terrain.json` and the units' `terrainMods`): light tanks fire × 1.1 on grassland,
  0.8 in forest, 0.65 in towns, 0.55 in marsh, 0.5 in mountains, 1.05 in desert (light and medium); a
  tracked formation pays move cost 2 in forest. A formation's terrain speed is its slowest manoeuvre
  element's (§3.6).
- **Unsupplied** (§4.1): an armoured formation burns its fuel on the march off the network, slows to
  `DRY_SPEED`, loses org, and at org 0 breaks down `BREAKDOWN_PER_DAY` (0.1) of its tanks and its heavy
  guns (land elements with fuel and more than one man a unit). Supply over a beach caps it at
  `BEACH_SUPPLY`. The formation panel shows org and fuel.
- **The AI** (§7): the economic AI wants a share of its army's upkeep in tanks rising from 0 at income
  `RICH_INCOME` (200) to `ARMOUR_SHARE_MAX` (0.3) at `ARMOUR_FULL_INCOME` (1000), orders the best
  armoured division it knows (MBT > heavy panzer > panzer 2 > panzer) and saves for one; at war against
  enemies whose elements are ≥ `ARMOUR_HEAVY` (0.2) tanks it orders motorised divisions; disbanding, it
  keeps its armour longest. The operational AI sends a template with ≥ `SPEARHEAD_ARMOUR` (0.5) of its
  upkeep in tanks onto the enemy's cell in an attacking sector while the rest hold the front.
- **Drawn** (§8): hull and turret by weight (`src/shared/unitLooks.ts`); the turret turns to its target
  and back (`src/render/units/turrets.ts`); a muzzle flash; a tank lost under fire burns and smokes, one
  lost to breakdown leaves a cold hull (`src/render/fx/hulls.ts`, `wrecks.ts`). Small sprites draw one
  tank mark.

### 6.2 Naval
- **Ships and fleets** (§3.3, §3.6): seven ship types and six fleet templates; a fleet sails its way
  at `CRUISE_SHARE` of its slowest ship, is built at a shipyard, and weighs `NAVY_WEIGHT` (0.5) × its
  power in a war's men (§3.5). Fleets are never refilled; a sea hero heals (§3.6).
- **Detection and contact** (`src/sim/systems/navalCombat.ts`, hourly after land combat): a fleet of a
  nation at war sees an enemy fleet within its best ship's `detection` km × (1 − the enemy's least
  stealthy ship's `stealth` ÷ 100), × the air superiority term (`AIR_DETECTION`, 0.25), or its carrier
  wings' quarter range (`CARRIER_SPOT_SHARE`). Two fleets are in contact when one sees the other and
  has a weapon that can hit it (`canHit`: a gun or torpedoes against a surface ship, depth charges
  against a submarine, or carrier wings); contacts join by union-find into sea battles.
- **Closing:** an engaged fleet does not sail (a player's order excepted). From the second hour each
  fleet takes the nearest enemy fleet as its range; beyond both reaches the two close to the longer
  reach, each by its pace (`closeBy`: the template's top speed); between the reaches the fleet of the
  shorter closes by what its pace has over the other's.
- **Fire:** each ship fires at an enemy ship weighed by hit points (kept `COOLDOWN` 4 hours while in
  reach), in the fleets its weapon reaches: guns (battleship 32 km > heavy cruiser 25 > light cruiser 18 >
  destroyer 12) `hard` × `ARMOR_PEN` where armour beats piercing × `SEA_FIRE_SCALE` (2) × its
  strength ÷ size × buffs ÷ the target's defence buffs (at least 0.05) ÷ its hit points, in ships.
  Torpedoes (`torpedo`, `torpedo_km`: destroyer 40 at 10 km, light cruiser 20 at 8, submarine 70 at 6)
  ignore armour and are × the screen of a target that is no destroyer: 1 − `SCREEN` (0.6) × min(1, its
  side's destroyers ÷ its other surface ships, by element at the hour's start). A submarine is hit only
  by depth charges (`asw`), within the hunter's gun reach, the target picked each hour. Carrier wings
  strike every `CARRIER_CYCLE` (4) hours, a ship a squadron by hit points (`CarrierSunk`, `StrikeHit`);
  a battle may be fought by wings alone. Losses apply together after all fire; `FireEvent`s are drawn.
- **The end** (`world.seaBattles`, saved): a battle's record holds its fleets and the ships each came
  with, its range, its sides' first nations and losses, its start. A fleet under half its ships, or
  with no weapon against an armed enemy once under fire, breaks off unless it stands at the port it
  would sail for (`atOwnPort`): each holed ship is lost or healed on a seeded roll whose chance is its
  wound; for `BREAK_HOURS` (24) it is out of every sea battle (`FormationRetreated`), sailing for the
  nearest port of its bloc its ships reach (`waterKeys`: the lane graph without the passages shut to it,
  the ice counted as ocean; a fleet with a transport its own nation's ports). A distance is in reach
  with 1e-9 km over (`inReach`). With one side gone or no contact for an hour the battle ends: one
  history row, `SeaBattle` (each side's nation and ships lost, packed nation + 65,536 × ships).
- **Rebasing** (`rebaseFleets`, daily): a fleet with no port of its bloc within `AT_PORT_CELLS` (3)
  that is not at sea on an order sails for one; an editor's stationed fleet (`world.station`) stays
  and holds its zone.
- **Sea control** (`src/sim/systems/seaControl.ts`, daily): a zone's power by bloc is the hit points
  (wounds ignored) of the live non-submarine ships with a gun or torpedoes in it (carriers add none).
  The strongest bloc holds the zone unless an enemy bloc has ≥ `CONTEST_SHARE` (0.5) of its power (then
  nobody does; a tie to the lower bloc); with none of its ships there the hold lasts `CONTROL_DAYS` (14).
  A holder no longer a living bloc head loses its zones. `world.seaControl` is saved.
- **Blockade:** a province whose every port a ship reaches has its water in a zone an enemy holds
  (iced ports aside) yields × `BLOCKADE_SHARE` (0.5) (§3.4).
- **Supply over sea** (`src/sim/systems/seaSupply.ts`): a land of the bloc joins its network across the
  sea when a port of it (owned and held) reaches a home port by zones no enemy holds and passages whose
  banks (within `BANK_REACH`, 4 cells) no enemy holds (`passageShut`). Cells it controls that its
  network does not reach, beside water such a way reaches, are beach sources: the beach layer (§4.1).
- **Convoys** (`src/sim/systems/convoys.ts`): a land joined by sea sends its income along its way's
  zones (`convoyWays`, breadth-first from a home port's zone); it keeps Π (1 − t) over them, t = min(1,
  `RAID_PER_BOAT` (0.05) × S) × (1 − 0.6 × min(1, D ÷ S)), S the enemies' submarines and D the bloc's
  destroyer strength there, of nations at war. The gold taken is added up by quarter
  (`world.convoyQuarter`, saved) and the `CONVOY_ROWS` (3) largest are history rows (`ConvoyRaided`).
  Raids sink no ships.
- **Landings** (`src/sim/systems/amphibious.ts`): a land formation boards transports (`TRANSPORT_MEN`
  2,100 men a transport) at a port of its nation within 3 cells of it (not shut by bombing; the group
  not engaged), sails alone (an escort is the AI's choice), and lands within `LANDING_REACH` (8 cells,
  not iced) of its target in a zone no enemy holds, an owned cell first, at org `LANDING_ORG` (0.5),
  then marches on. Repulsed, its transports sail home and it lands where they next stand, or stays
  aboard. Sunk transports take it with them. A beachhead on a cell of a living nation not at war with it
  goes back to its owner. With no port or room, an order is a march (`seaBound` for a player's).
  `world.embarked` and `world.seaBound` are saved.
- **Bombardment** (`src/sim/systems/bombardment.ts`): a fleet not under way and not in a sea battle
  fires on land formations within its guns' reach (12–32 km) at the element of most hit points:
  effectiveness (§5.2) × strength ÷ size × `FIRE_SCALE` × `BOMBARD_FIRE` (2.5); its losses count to org.
- **Port damage** (`src/sim/systems/bombing.ts`): bomb tons ÷ (`PORT_TONS` (60) × the port's level), up
  to `MAX_DAMAGE` (0.9), repaired `REPAIR_DAILY` (0.02) a day; at `PORT_SHUT` (0.5) no embarking and no
  delivery.
- **Carriers:** their wings are based on the fleet (`wingBase` −fleet), move with it (`carryWings`),
  and are lost with it or when the fleet has more wings than live carriers; `manDecks` crews empty
  decks (§6.3).
- **The naval AI** (`src/sim/ai/naval.ts`, daily on each nation's turn): at peace fleets go home; at
  war warfleets in port sortie, within `SORTIE_KM` (2,500), to their own landing's water, else the
  nearest enemy port or fleet whose zone's enemy power their combined power matches, else to a forward
  base; away, a fleet goes home outnumbered `AVOID_RATIO` (1.5) or under enemy naval bombers unescorted,
  else battle, chase, station or home. Submarines raid convoy ways within `RAID_KM` (4,000); sea heroes
  follow their nation's strongest fleet.
- **The invasion AI** (`src/sim/ai/invasion.ts`): for a war with no land front, a landing on the
  nearest enemy port or coastal capital in the same waters (`planLanding`); with its own front held, a
  landing of the free army far from it scored by city worth (`planNormandy`); island armies ferried to
  a front's port (`planFerry`). A nation with a landing at sea plans no other landing.

### 6.3 Aircraft
`src/sim/systems/air.ts` and its neighbours; hourly in the air system: repairs (at 00:00), the day's
strike counts cleared, bases and sorties, the airborne by zone, air power, strikes, air lift, air
combat, AA.
- **Types and templates** (`data/units/air.json`, `data/templates/air.json`): fighters, tactical,
  strategic and naval bombers, close support, transports and the ballistic missile (§6.4); groups of
  3–4 squadrons (§3.6). A wing is a formation of an air template; `offLand` (no land rule reads it); it
  is paid upkeep and not drawn at its base.
- **Bases** (`src/sim/data/airbases.ts`, `world.airbases`, static): every capital at level 4, a city of
  size 5 at level 3 (`airbases.json`), and bases by hand at 4 or 5; held by its cell's controller; room
  `AIR_PER_LEVEL` (50) aircraft a level (`wingAircraft` = Σ count × size). A carrier holds a wing a live
  carrier. `world.wingBase` (saved): an airbase + 1, or −fleet. The random world has the same bases.
- **At the start** (`data/scenarios/1938/air.json`, `src/sim/data/wings.ts`): 198 wings of 41 nations at
  the base of their nation with most room, and a naval bomber group a carrier.
- **Building:** a wing is queued like any formation and delivered at the nation's airbase with room
  nearest its capital (`airfield`, §3.7); the economic AI buys wings while air upkeep is under
  `AIR_SHARE` (0.1) of the army's, rebuilds towards its start count (`world.airStart`) under
  `AIR_REBUILD_SHARE` (0.035) of income, a fighter while fighters are under half its wings else a
  tactical bomber (`pickWing`), and a strategic bomber group for warheads without one.
- **Losing a base:** a wing whose airbase is taken falls back to one its nation holds with room
  (`fallBack`), its mission ended, or is lost; a carrier's wings move with it (`carryWings`), are lost
  with it, or when the fleet has more wings than live carriers; `manDecks` crews empty decks (on delivery
  and at most one deck a month by the economic AI).
- **Missions** (`world.wingMission`, saved): patrol, strike or supply, at a place within the wing's range
  (its least `rangeKm`); refused `OutOfRange`, `NoBase` (also while ferrying), `NotLand`. A rebase reaches
  `FERRY_RANGE` (2) × range, to a base of its side with room within `BASE_PICK_CELLS` (2) of the point
  given, and clears the mission. Across the sea the AI ferries a wing (`orderFerry`, `world.wingFerry`,
  saved: arrival at the slowest transport's pace, else `SEA_FERRY_KMH` 30); a ferrying wing flies
  nothing.
- **Sorties** (`world.sorties`, saved; `src/shared/sorties.ts`, `sortieAt`): derived kinematics from
  base, target, launch and speed. A wing with a mission and no sortie launches each hour, with
  `TURNAROUND_HOURS` (2) between; a strike turns back at once, a patrol stays min(`PATROL_MAX_HOURS` (4),
  2 × (range − km) ÷ speed). Patrols of one nation over one place relay, launched a cycle ÷ n apart. A
  target out of range (its carrier moved) waits.
- **Air combat** (`src/sim/systems/airCombat.ts`): sorties of nations at war within `INTERCEPT_KM`
  (150) meet (linked meetings are one `AirBattle` at the nearest pair); each fires strength × aa ×
  `AIR_FIRE` (0.05) ÷ max(1, the target's defence) ÷ `hpPerUnit`, spread over its foes by aircraft. A
  wing with no aircraft left is lost; one that lost `BREAK_OFF` (0.25) of its aircraft turns home (unless
  already on its way back).
- **AA:** land and sea elements (not wings or troops aboard) fire `AA_FIRE` (0.2) × aa × strength ÷ size
  at sorties within `AA_CELLS` (1) of them, not at those flying home.
- **Air superiority** (`src/sim/systems/airSuperiority.ts`; `world.airPower`, saved): each hour a zone's
  power by nation decays × `AIR_POWER_DECAY` (0.97153: a day's half-life), entries under
  `AIR_POWER_FLOOR` (0.5) dropped, and gains Σ strength × aa of each sortie airborne there (not flying
  home). A nation's superiority s in a zone = its and its side's power ÷ (that + its enemies'), 0.5 in an
  empty zone. Read by: land fire (× 1 + `AIR_SUPERIORITY` (0.2) × (2s − 1), §5.2), supply gain
  (`AIR_SUPPLY`, 0.5), fleet detection (`AIR_DETECTION`, 0.25), strike fire and bomb tons
  (`AIR_STRIKE`, 0.25: `strikeFactor`), the air AI (`AIR_HELD`, 0.6), a nuclear bomber's chance of being
  stopped (§6.4), and the air map mode (`airHolders`).
- **Strikes** (a strike mission's sortie at its target): each element fires effectiveness (§5.2) ×
  `STRIKE_FIRE` (0.2) × its health share ÷ `hpPerUnit` at enemy elements within 1 cell, × the strike
  factor, × `DISPERSED_STRIKE` (0.25) on formations out of contact, and the k-th strike of a day on a
  formation at 1 ÷ (1 + k) (`formations.struck`, cleared at 00:00); fleets in the area are hit too (no
  submarine), hard attack × `NAVAL_STRIKE_FIRE` (1), each squadron's share on one ship by health
  (`StrikeHit`, `CarrierSunk`). In a sea battle a carrier's wings strike every 4 hours instead (§6.2).
- **Bombing** (`src/sim/systems/bombing.ts`): a strike's `bomb_t` × the strike factor falls on the cells
  within `BOMB_CELLS` (1): damage += tons × `BOMB_DAMAGE` (2) ÷ the enemy industry there, at most
  `MAX_DAMAGE` (0.9) (`world.bombDamage`, saved; income reads it), and on ports (§6.2); repaired
  `REPAIR_DAILY` (0.02) a day.
- **Air supply and paradrop** (`src/sim/systems/airLift.ts`): a supply mission's transports give
  `AIR_LIFT` (1/48) of supply an aircraft, in equal shares, to the formations of their nation or side
  short of supply within 1 cell. A paradrop: an infantry formation not engaged or aboard, at its
  nation's airbase within 2 cells, with enough of its transports there not flying (`PARA_MEN` 64 men a
  plane, first by id), lands at org `PARA_ORG` (0.5) and takes an enemy cell (or frees it to its owner).
- **The air AI** (`src/sim/ai/air.ts`, daily, with the AI on): leaves wings ferrying, carrying a warhead,
  held by a player's order (`PLAYER_MISSION_HOURS`, 24), or whose carrier is in battle. A wing's role is
  its first squadron's: fighters patrol over the fronts, bombers strike massed enemy forces or, where
  superiority ≥ `AIR_HELD`, industry; carrier wings take the naval role (fleets, then the front, then
  land forces) and never rebase; transports lift formations under `LIFT_BELOW` (0.5) supply and drop
  paratroops. At peace missions are cleared. A wing with nothing in range moves a base towards its goal
  (`toward`, at most 2 ranges a day) or across the sea (`overSea`).
- **Drawn** (§8): sorties at T0–T2, air battles, strikes and bursts; the air map mode.

### 6.4 AI nuclear weapons
`src/sim/systems/nuclear.ts` (daily, its launches' arrivals hourly).
- **Programme:** the techs (`data/tech/nuclear.json`): `atomic_bomb` (with computing), `thermonuclear`
  (×`THERMO_YIELD` 50), `ballistic_missiles` (rocketry and the bomb). Only a nation that goes for the
  bomb (`goesForBomb`: nukes allowed in the world's setting and not barred for it, `world.nukesBanned`,
  and income ≥ `NUKE_PROGRAMME_INCOME` 1000) researches the nuclear chain (§3.7); one barred later keeps
  its techs, its lines unpaid. `NuclearPower` is a history row.
- **Warheads** (`world.warheads` {stock, paid}, saved): paid daily from the treasury, never into debt,
  `WARHEAD_GOLD` (400) over `WARHEAD_DAYS` (90) each, while 10 × (stock + 1) ≤ `STOCKPILE_SHARE` (0.1) ×
  income, not bankrupt, up to `WARHEAD_MAX` (100); upkeep `WARHEAD_UPKEEP` (10) a month (§3.4); the
  economic AI scraps warheads before fleets and army when it cannot balance its books. A dead nation
  loses its stockpile.
- **Means:** a strategic bomber group at its base with the target in range flies a real sortie (a free
  one, or one taken from its raids; the lowest-id group is kept off raids as a reserve); on arrival it
  is stopped short by a hashed roll under `BOMBER_INTERCEPT` (0.8) × (1 − the defender's superiority),
  or if lost. A missile flies from the capital, at most `MISSILE_KM` (10,000 km) at `MISSILE_KMH`
  (20,000 km/h), and nothing stops it. Missile first, then bomber. `NukeMeansLost` when the last means
  goes.
- **The decision** (`nukeDecisions`, daily, at war; a living nation with a warhead, its nukes AI layer
  on, no overlord, nukes allowed): it weighs, in each war, strikes on the enemy's capitals and up to
  `NUKE_TARGETS` (6) places where enemy land formations are most massed, on land the enemy owns and
  controls, within `FRONT_KM` (1000) of its side's formations or capitals (anywhere when avenging, in
  extreme desperation or by resolve), not within 4 blast radii of a burst of the last 7 days or a
  warhead in flight, nor at a capital struck within a year. Each with each yield:
  - value = clamp01(`TARGET_SCALE` (10) × (enemy output share in the blast + enemy men share − own men
    share) + `TARGET_CAPITAL` (0.3) at a capital) × through (the chance it gets through); on a first
    strike a capital counts only with ≥ `CAPITAL_MEN_MIN` (0.01) of the theatre's men in the blast and
    its nation ≥ `CAPITAL_WEIGHT` (0.1) of its side's output; a theatre is the men within 1000 km, at
    least `THEATRE_FLOOR` (0.25) of a side's and `THEATRE_MEN_MIN` (250,000);
  - U = value × desperation × doctrine + through × (bonus − `RETALIATION_WEIGHT` (0.8) × retaliation −
    alliance cost − outrage − `TABOO_WEIGHT` (0.6) × taboo (halved when extreme) − dead cost), the bonus
    `RETALIATION_BONUS` (1) when striking back (and retaliation then not weighed);
  - doctrine = 0.5 + aggression ÷ 100; desperation (at most 2) from its land held by others, its men
    lost, its capital threatened (land forces within `CAPITAL_THREAT_KM`, 150) or taken, fighting to the
    death; extreme = ≥ 1 with the last three;
  - retaliation = the most any enemy or its ally (not a puppet) could answer: min(1, warheads ÷
    `RETALIATION_FULL` (5)) × doctrine, a bomber in flight counted; with `MAD_WARHEADS` (2) a side, U is
    capped at 0 unless extreme or striking back;
  - alliance cost `ALLIANCE_COST` (0.05) an ally not beside it, at most 0.3, halved when extreme; dead cost
    `DEAD_COST` (0.1) a million civilians × max(1, 2 − doctrine);
  - a strike is taken above its floor max(`NUKE_FLOOR` 0.025, 0.1 × min(1, through × people ÷ 1e6)), the
    best first, at most one a day; a first strike only on an enemy that threatens (a warhead, a quarter
    of its income realm to realm, or forces near its capital); none within `STRIKE_GAP_DAYS` (60) of its
    last unless striking back (a launch stopped short starts no gap).
  - *Resolve:* a long war won (score ≥ 0, no enemy able to answer, no MAD) builds a resolve to 2 at 2
    years, one strike in 90 days, at most 3 a war, on nations of ≥ a tenth of the side's output.
  - *Grievance:* the struck realm may answer the striker within `RETALIATION_DAYS` (90) from any
    distance; a strike on forces is answered at forces only.
  - `NukeDecided` with its utility; `restraintOf` gives the panel the reasons a nation holds back.
- **The burst** (`detonate`): blast radius `BLAST_KM` (25) × yield^⅓ kills `BLAST_KILL` (0.9) of the
  elements by falloff, `BLAST_PEOPLE` (0.05) × yield^⅔ of the people, and sets industry damage up to
  `BLAST_DAMAGE_MAX` (0.95); fallout laid downwind by the day's wind (`FALLOUT_KM` 200 long, `FALLOUT_WIDTH_KM`
  20) on `world.fallout` (saved), halving in `FALLOUT_HALF_LIFE` (365) days, costing formations 0.02 × f a
  day, output × (1 − 0.8f), march time ÷ (1 − 0.5f). The taboo (`world.nukeTaboo`) drops to
  `TABOO_AFTER` (0.3) and recovers `TABOO_RECOVERY` (0.0005) a day. On a nation struck by another: outrage
  against the striker (+`OUTRAGE_STRIKE` 40, decaying), shock (`NUKE_SHOCK` 30, at most 60, into its war
  exhaustion; a shocked side sues at 80 even where refused), − `NUKE_GOLD` (0.1) of its treasury,
  + `NUKE_UNREST` (40) round the burst; the striker's alliance loses `NUKE_UNITY` (20) unity. Rows:
  `NukeCasualties`, `NukeToll`. The strategic AI's pariah rules read the outrage (`PARIAH_WAR`, a
  coalition from `PARIAH_COALITION`).
- **Shown** (§9): flash, ring and cloud at every tier; an alert with Go to (`nukeAlert.ts`, at most 3,
  72 hours of game time and 8 s on screen), the game paused on a burst (`nukePause`, on by default); the
  fallout map mode; ruins that darken; the decision's row worded by its utility (`NUKE_WEIGHED_LONG` 0.1, `NUKE_WEIGHED_NONE` 0.5).
- **God** (`tick.ts`): nukes on or off (`nukesEnabled`, `setNukes` a nation), `grantWarheads` (0–100), a
  strike by any nation (`launchNuke`), or God's own burst (`godNuke`: no outrage, grievance or war
  memory). For the nation a player takes, the nukes AI layer is off.
- **Checked** by the checker's `nukes` rules (§10.1).

---

## 7. AI

Every nation's AI is a set of systems that give the same commands a player can, in the tick's order
(§2.5): strategic, operational, invasion, naval and air AI early in the hour, the economic AI after
production and research. `src/sim/ai/`.

### 7.1 Layers and switches
- **Layers** (`src/sim/ai/layers.ts`): army 1 (fronts, invasions, hollow merging), navy 2, air 4,
  diplomacy 8, economy 16, nukes 32. `aiRuns` asks whether a nation's layer runs: never when the world's
  AI is off (`aiEnabled`) or the nation's is (`aiOff`, `setAi`); for the nation a player takes, as its
  mask (`World.playerAi`, `setPlayerAi`: `PLAYER_AI_DEFAULT` 31, every layer but nukes; `PLAYER_AI_ALL`
  63). Taking a nation resets the mask and clears its player orders; releasing it gives its AI back.
- A player's order to a formation keeps every AI off it until the order is done (`playerHeld`;
  `PLAYER_MISSION_HOURS` for a wing). Without the economy layer a nation still gets its research budget
  and refills.

### 7.2 Strategic AI
`src/sim/ai/strategic.ts`, daily at the day's start.
- **Peace by stalemate:** every war over `STALEMATE_DAYS` (720) with |score| < `STALEMATE_SCORE` (15) and
  both sides' exhaustion > `STALEMATE_EXHAUSTION` (40) ends on its score, unless a side fights to the
  death. Other peace is the war system's, for every nation alike (§3.5).
- **Who acts:** a living nation that is no puppet, with its diplomacy layer, on its day
  ((day + id) mod `STAGGER` (7) = 0); draws by `hash32`. A realm's strength is the men of its formations
  (`forceMen`: a fleet weighs `NAVY_WEIGHT` × its power), a puppet's counted with its overlord.
- **War:** with fewer than `MAX_WARS` (2), aggression ≥ `PACIFIST_BELOW` (15), gold ≥ 0 and not
  bankrupt, it scores each land neighbour `whyNotWar` allows (§3.5):
  aggression ÷ 100 × (min(`RATIO_CAP` 3, attack ÷ defence) − 1) + `OPPORTUNITY` (0.3) if the target is at
  war + `CLAIM` (0.3) if it holds a province whose centre the target owns − its largest exhaustion ÷ 100 −
  `WARS_PENALTY` (0.4) × its wars + `PARIAH_WAR` (0.5) × the target's nuclear outrage (§6.4) + `RESTLESS`
  (0.3) × min(1, years since its last war ÷ `RESTLESS_YEARS` 10) when at peace. Attack and defence are the
  two realms' strength plus `ALLY_WEIGHT` (0.4) of their partners' and guarantors' (defence at least 1).
  With no neighbour over `DECLARE_AT` (0.5) it tries targets across the sea (holders of ports its
  transports at port reach, not iced or held by an enemy). It declares on the best with probability
  `DECLARE_P` (0.25) × aggression ÷ 100.
- **Threat pacts:** an unaligned nation whose neighbour of aggression ≥ `THREAT_AGGRESSION` (50) is over
  `THREAT_RATIO` (1.5) times stronger and not yet at war with it, with probability `ALLY_P` (0.3), joins
  the strongest neighbouring alliance without that neighbour that `canJoin` allows (a great power avoids
  one with another), else forms one with an unaligned neighbour of the threat (unity 40).
- **Monthly:** a coalition against the nation with over `HEGEMON_SHARE` (0.25) of the world's income (its
  unaligned neighbours, not its puppets or allies, at least two with no war among them and at most one
  great power; unity 50); a pariah league against the worst nuclear pariah (§6.4); and rivals apart: of the
  `GREAT_POWERS` (6) largest, after `RIVAL_GRACE_YEARS` (3), a great power in an alliance with another
  loses `RIVAL_LOYALTY` (30) loyalty a month (with its diplomacy layer) and leaves under 25.

### 7.3 Operational AI
`src/sim/ai/operational.ts`; every 6 hours, each nation at war with its army layer once a day
((tick ÷ 6 + id) mod `STAGGER` (4) = 0).
- **Fronts:** the frontier cells held by the nation or a partner beside an enemy cell, bucketed into
  sectors of `SECTOR_CELLS` (4) × 4 cells; a sector's threat is the enemy's land strength in the 3 × 3
  sectors round it.
- **Free formations:** not engaged, retreating, marching home, aboard, player-held, marching to a port
  where its transports stand (the invasion AI's), or a hero sent to a fight (`joinFights`). They are
  grouped by what they can reach (landmass, province group, pocket of up to `POCKET_CELLS` (4,096) open
  cells, wide ground), the reach asked only when needed. Those within `DEPLOY_RANGE_CELLS` (60) of a
  sector they reach deploy; the farthest `RESERVE` (0.15) of them stay put; those beyond range are
  garrisons.
- **Allotment:** threatened sectors are filled first in proportion to threat, the others by 1 + threat ÷
  `THREAT_UNIT` (10,000), each at least one while formations last, nearest first; a march under way
  keeps its sector unless it must yield.
- **Orders:** a sector whose allotted strength is ≥ `OFFENSIVE_RATIO` (1.5) × its threat attacks (a
  threat of 0 always): its formations march on the enemy cell beside its front nearest its centre; with
  armour among them (≥ `SPEARHEAD_ARMOUR` (0.5) of a template's upkeep in tanks) the armour attacks and
  the rest hold. Otherwise they hold its front cell nearest its centre. No new order when the target is
  within a sector of the old or already reached. A refused order is remembered (`World.refusedOrders`,
  derived) and not asked again from the same cell, template and grid; a corridor's refusal holds while
  its route is the same. An order the movement system refuses as `LongWay` is diverted to another
  target up to `DIVERTS` (2) times.
- **From afar:** every `MARCH_DAYS` (8) days (by id) a free, idle formation more than the deploy range from
  every sector it reaches marches to the nearest sector with nobody of over `takeMen` (1,500) men in it
  (its own front's, or a partner's when its own has none for it). And on its day a nation sends up to its
  reserve's count of its farthest formations "to spare" within `SPARE_RANGES` (3) × the range, to empty
  sectors of its own front, no more than the front can give. A refused march waits `FAR_RETRY_DAYS` (40)
  (`World.farWait`, saved).
- **Hollow formations** (`src/sim/ai/hollow.ts`, daily, army layer): §3.7.

### 7.4 Navy, invasions and air
The naval AI and the invasion AI are §6.2 (`src/sim/ai/naval.ts`, `src/sim/ai/invasion.ts`, each nation
weekly by `STAGGER` (7)); the air AI is §6.3 (`src/sim/ai/air.ts`, daily); the nuclear decision is §6.4.

### 7.5 Economic AI
`src/sim/ai/economic.ts`, monthly after the economy's month (the hollow merge daily). On projected
accounts (gross, upkeep, admin, efficiency's cost, research), in order:
1. **Short of money** (balance under need, `DEBT_PAYBACK` (1/12) of the debt + `MARGIN` (0.05) of income, and
   gold under `RUNWAY_MONTHS` (3) × the shortfall): scrap warheads over `STOCKPILE_SHARE`; lay up standing
   fleets, the dearest first, while the navy costs over `NAVY_SHARE` (0.12) of income (`FleetsLaidUp`);
   then disband land formations, the fewest tanks first, then the fewest men, half their men back
   (`DISBAND_MANPOWER`); not those in contact, player-held or heroes.
2. **Suppression** of unrest from `SUPPRESS_FROM` (40) where it can pay (§4.6).
3. **Means:** a delivery bomber for warheads without one; transports for a landing or the ferry (with
   `DELIVERY_RESERVE_MONTHS` (1) of reserve); saving for a first warship while outnumbered at sea with
   few formations (`FEW_FORMATIONS` 3). Research is set before building (§3.7).
4. **The army:** an order while the army costs under `ARMY_SHARE` (0.35) of income at peace, `ARMY_SHARE_WAR`
   (0.6) at war (`PEACE_ARMY_BASE` 0.3), keeping `RESERVE_MONTHS` (3) of reserve at peace and
   `WAR_RESERVE_MONTHS` (0) at war, in parallel slots (1 + income ÷ `PARALLEL_INCOME` (400), + `OUTNUMBERED_SLOTS`
   (1) when outnumbered on a land front, at most `MAX_PARALLEL` (6)). The mix: cadre divisions under `POOR_INCOME` (20), armour by `armourWanted`
   (§6.1), motorised against armour-heavy enemies, else infantry; at war an order it cannot pay falls back
   to a cadre division, one whose techs it lacks to infantry or cadre. The levy: an outnumbered nation
   raises up to `LEVY_MONTH` (2) cadre divisions a month for manpower alone.
5. **Refills** (§3.7).
6. **Fleets** under `NAVY_SHARE`: a carrier first for income ≥ `BATTLE_FLEET_INCOME` (1000) with fewer than
   `CARRIERS_KEPT` (4) afloat, then a battle squadron at that income, a cruiser squadron from `RICH_INCOME`
   (200), else destroyers (from `POOR_INCOME`); none while another warship is in training (a carrier or
   the ferry's transports excepted). Carrier decks crewed; wings under `AIR_SHARE` (§6.3).

### 7.6 The long run
A stable top is a valid world [ADR-750]; the world keeps changing through the rules that work against a
leader: admin cost by area held (§3.4), unrest on land not one's own and overextension (§4.6), coalitions
against a hegemon (§7.2), puppets drifting free (§3.5), revivals (§3.4), collapse after six bankrupt
months. The sweep judges the result (§10.4).

---

## 8. Semantic zoom / LOD design [ADR-3, ADR-4]

The renderer draws the snapshot the worker sends (§2.2); nothing it draws is sim state. `src/render/`,
`src/app/MapView.ts`.

### 8.1 Tiers
- **Zoom** is metres a screen pixel (m/px); the tier (`tierOf`, `src/shared/protocol.ts`) is a step
  function of it: T0 above 2000, T1 to 450, T1.5 to 300, T2 to 30, T3 at 30 and below. The tier decides
  what the worker sends (§8.5); what is drawn is a state, not a function of zoom: a layer comes in at its
  threshold and goes out only `ZOOM_HYSTERESIS` (1.15) beyond it, fading over `FADE_MS` (250 ms)
  (`TimedSwitch`, `SwitchBank`, `src/render/timing.ts`), a reversal in mid-fade going back from where it
  is. A change of map mode takes the nation names away at once.
- **The forces' handovers** (`TierHandover`, `src/render/units/handover.ts`):

  | handover | in at (m/px) | out above | fade |
  |---|---|---|---|
  | T0 counters ↔ T1 markers | `T1_MAX_M` 2000 | 2300 | 250 ms |
  | T1 markers ↔ T2 element sprites | `T1_MIN_M` 300 | 345 | `MORPH_MS` 470 ms |
  | T2 sprites ↔ T3 figures | `T3_MAX_M` 30 | 34.5 | 250 ms |

  The morph: over the first 250 ms the sprites come in while the marker's box fades and shrinks by
  `MARKER_SHRINK` (0.13); its bar and number linger `BAR_LINGER_MS` (220 ms) more. Fire, wrecks, contact
  lines, pointers and dead balls are drawn with the sprites' share.
- **The map by zoom:** fills, borders (wider with zoom, to 3.5 px; `borderWidthPx`) and the occupation
  hatch at every zoom; the fine coast as a mask pixel grows past a device pixel (`fineCoastShare`); the
  ground (§8.4) from `GROUND_NONE_M` (750) to `GROUND_FULL_M` (300) m/px; capital flags from
  `FLAG_MIN_SCALE` (3 px a cell), rising at most `FLAG_MAX_RISE` (40 px); city dots from T0, city names
  through T1. Map modes (`fillMode`): political, terrain, unrest, sea control, air control, fallout, at
  any zoom.

### 8.2 Forces by tier
Two looks (`src/shared/unitLooks.ts`, the game option; default `balls`, the e2e specs `classic`).
- **T0 counters** (`src/render/units/counters.ts`): a counter a formation, clustered by screen distance
  (`CLUSTER_PX` 64, levels to `MAX_LEVEL` 14, ± `HYSTERESIS` 0.15 of a level, split or merge over
  `SPLIT_MS` 250 ms), overlapping ones folded (`FOLD_GAP_PX` 2, `FOLD_HOLD_PX` 6, `FOLD_MS` 250); the
  number is the men (`1.54M`, `12.3k`), a hero's its health; a hero has a counter of its own. Balls: the
  flag chip a ball of `COUNTER_BALL_R` (8 px) over the box's left end.
- **T1 markers** (`src/render/units/markers.ts`, from `T1_MAX_M` to `T1_MIN_M`): a box with the NATO
  symbol, pips for its elements (fading in and out each; the strength bar only while no elements came),
  order arrows (a fleet's along its turning points), crossed swords while engaged. Markers that overlap
  stack (`STACK_UNDER` 0.25, `STACK_HOLD` 0.1), nudged at most `NUDGE_MAX_PX` (10) over `NUDGE_MS` (150
  ms). Balls: the box a ball of `MARKER_BALL_R` (9.5 px) wearing its symbol's prop (`markerProp`:
  treads, wheels, hull, helmet), eyes left or right to its order, a red ring while engaged.
- **T2 element sprites:** one sprite an element at its slot (`slotPlace`, the sim's own pose), its
  facing and frame (`src/shared/unitLooks.ts`), tinted by its nation (`spriteTint`: hue and saturation
  kept at least `SPRITE_LIGHT` lightness, greys to `GREY_LIGHT` or, on light ground, `GREY_DARK`; ships
  `shipTint` against the sea). At least `ELEMENT_MIN_PX` (5) wide, a tank `TANK_ELEMENT_MIN_PX` (8), a
  ship's hull `SHIP_ELEMENT_MIN_HULL_PX` (13); small sprites swap to one mark between `SMALL_FULL_PX`
  (5.5) and `SMALL_NONE_PX` (8). A formation on the march is drawn at `SPRITE_ALPHA_MIN` (0.45) to 1. Tags
  (flag, strength, name; `src/render/units/tags.ts`) stand clear of others' elements within `TAG_FAR`
  (120 px), `TAG_TRIES` (5) places tried; contact lines join engaged formations; pointers show an
  enemy off screen. Tank turrets turn to their shot (`TURN_MS` 180, held `HOLD_MS` 1500 or 1.5 ticks,
  back over `RETURN_MS` 600; `src/render/units/turrets.ts`), uploaded only when a facing changed; ships
  draw wakes.
- **T3 figures** (`src/render/units/individuals.ts`, classic only): guns, tanks, planes and ships one
  figure a unit; a battalion of men `MAX_FIGURES` (64) whole, then its share rounded up, at most
  `MAX_INDIVIDUALS` (60,000) in the view. Figures stand in a square of `FOOTPRINT_CELLS` (0.024) about
  their slot (`SLOT_SPACING` 0.03 between slots), 8 × 8 or 4 × 4 with jitter, tanks in ranks of
  `TANK_ABREAST` (4) × `TANK_RANKS` (3) fitted to the slot (`FIT` 0.97, in `FIT_STEPS` of 32), infantry in
  contact prone in a firing line of `LINE_ABREAST` (16) × `LINE_RANKS` (4); a loss takes the last figure.
  Built in the frame the tier comes in, from a copy of the elements kept below `T3_KEEP_M` (60 m/px);
  with none kept, or over the cap, the sprites stay. Ships are drawn at their length (`SHIP_MIN_PX` 26).
- **Balls at T2 and T3:** one ball an element from the flag atlas (`src/render/units/flagAtlas.ts`),
  eyes from `EYES_NONE_PX` (6) to `EYES_FULL_PX` (11), props, bob and blink, angry eyes in battle, a
  flinch when hit, cracks and plaster at `HURT_AT` 0.75, 0.5, 0.25 strength, a hero at `HERO_SCALE`
  (2); a dead ball shows ✕ eyes (`src/render/units/deadBalls.ts`). No figures and no wakes.
- **Sorties** at every tier (`src/render/units/sorties.ts`): one to three planes, a symbol far out and
  the true wingspan close in, a small ball on each in the balls look (`PLANE_BALL` 0.17 of the span).

### 8.3 Effects
- **Shots** (`src/render/fx/fire.ts`, Canvas2D): each `FireEvent` (§5.2) in the view becomes a muzzle
  flash, a tracer and an impact, its flight and impact by weapon (small arms, cannon, shell, naval,
  torpedo); spread over the tick between `MIN_SPREAD_MS` and `MAX_SPREAD_MS` (250–1000 ms), one shot at a
  time a shooter, at most `MAX_SHOTS` (3000), landing within `SCATTER_CELLS` (0.012) of the target's slot.
  A tank's shot leaves its barrel.
- **Wrecks** (`src/render/fx/wrecks.ts`): an element's end (`ElementDestroyed`, its place before it fell)
  bursts over `BURST_MS` (400), stays until the later of `WRECK_HOLD_MS` (12 s) and `WRECK_HOLD_HOURS`
  (72 game hours), and fades over `WRECK_OUT_MS` (3 s); all but men smoke; a ship sinks over `SINK_MS`
  (5 s) with an oil slick; at most `MAX_WRECKS` (1500). A formation removed whole leaves none.
- **Hulls and the fallen** (`src/render/fx/hulls.ts`): comparing snapshots, a tank lost under fire burns
  `FLAME_MS` (6 s) and smokes `SMOKE_MS` (9 s), one lost otherwise is a cold grey hull; men lost under fire
  leave fallen figures; held the same 72 game hours, at most `MAX_HULLS` (2000) and `MAX_FALLEN` (1200).
- Air strikes, bursts and ruins: §6.3, §6.4. A load clears every effect.

### 8.4 The map
`src/render/map/`; one full-screen pass.
- **Owner and controller** are R16UI textures of the grid, uploaded in dirty 64 × 64 tiles; the palette a
  256 × 256 RGBA8 texture. Borders and fills come from a 4 × 4 B-spline over the cells (the best and second
  weight), the edge warped by noise (at most 0.32 of a cell); a border is drawn where the analytic
  distance gives d × scale under its half width.
- **The coast:** the coverage grid at T0, and the fine land mask (`src/shared/landMask.ts`, 16384 × 8192,
  an R8UI texture array in row bands) closer in, its shore roughened by `SHORE_NOISE` (0.35).
- **Ground** (`src/render/map/ground.ts`): relief from the heights (× `reliefScale` 12), light from the
  north-west, texture octaves, bump by terrain, colour casts (`GROUND_CAST`, `BORDER_CAST`,
  `OCCUPIED_CAST`; the hatch yields to `HATCH_AT_GROUND`), sea depth; trees, rocks and houses as instances
  (`src/render/map/scatter.ts`, `SPACING_PX` 14; at most `GROUND_CAP` 24,000).
- **Labels:** nation names placed by the worker (`deriveLabels`: the principal axis of a nation's main
  mass, at least `MIN_CELLS` 24), sent every `LABEL_INTERVAL_MS` (2 s) when changed, drawn in Canvas2D at
  9–64 px with tracking 0.1 (`src/render/labels/nationLabels.ts`); city names (`cityLabels.ts`).

### 8.5 Interest management
- The view subscribes (`src/app/subscription.ts`) at most every 100 ms and only when its key changes: the
  box padded × `SUBSCRIPTION_PAD` (1.25), the zoom and the tier. The worker sends a snapshot on each tick,
  event or new subscription, one in flight until acked (§2.2).
- Formations, nations, wars and dirty tiles go whole; spatial events in the box (global ones always);
  elements from T1 for the formations whose block reaches the box, a formation whole or not at all, never
  wings, at most `MAX_SNAPSHOT_ELEMENTS` (40,000; then `truncated`); fire and element ends from T1.5 where
  either end is in the box (`FIRE_QUEUE_CAP` 8192 queued).
- **Precision:** the camera is f64; proxies are uploaded relative to an origin at the grid's middle
  column and the shader gets camera − origin; the map pass gets the camera as a whole cell and a fraction
  (`splitCoord`). No shader sees an absolute coordinate.
- **Units on the GPU** (`src/render/units/ProxyRenderer.ts`): instanced, each with its place before and
  now, facing, frame, tint and alpha, interpolated by `tickProgress` (the tick's length from the speed;
  none when paused or at the fastest); premultiplied atlas. The view redraws only on a change, and once
  more after an animation ends (`ANIM_TAIL_MS`).

### 8.6 Performance budgets
`npm run bench -- G` (`tools/bench/game.ts`): T0 ≥ `T0_FPS` (60) panning the 1938 world, T2 ≥ `T2_FPS`
(30) with `T2_PROXIES` (10,000) at 200 m/px, judged; GPU (`T0_GPU_MS` 1.0, `T2_GPU_MS` 2.0) and CPU
(`FRAME_CPU_MS` 6) reported. A snapshot builds in under 2 ms (`tests/unit/snapshot-perf.test.ts`).

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
