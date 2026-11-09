/**
 * HUD state (PLAN 1.8): the date, speed level and pause shown by the bottom bar, kept in
 * signals fed by snapshots. Speed level and pause persist in localStorage (AoC persists speed)
 * and are applied to the sim worker on start. Keyboard: Space toggles pause, `,` / `.` change speed
 * (+/− already zoom the camera).
 */
import { effect, signal } from '@preact/signals';
import { dateOfTick } from '../shared/calendar';
import { MAP_MODES, type MapMode } from '../shared/mapModes';
import { clampSpeedLevel, DEFAULT_SPEED_LEVEL, speedOfLevel } from '../shared/speed';
import type { Command } from '../shared/commands';
import type { ShownAlert } from '../shared/nukeAlert';
import type { NationStats, SimClient } from './simClient';
import type { FormationDetail, LandingRow, OrderNews, SeaHint, TechInfo, TemplateInfo } from '../shared/protocol';
import type { CarrierRaidView, SeaBattleView } from './MapView';
import type { MapHover } from '../ui/mapHover';
import { t } from '../ui/i18n';
import type { EditorState } from '../shared/editorState';
import type { EconomyBreakdown, RefusedBase } from '../shared/protocol';
import { RANK_LISTS, type RankList } from '../shared/ranking';
import { SEA_PAIR_MARGIN } from './battleView';

/** Order news kept on the screen at most (PLAN 4.9c), a loss told of several in one hour counted once (`keepOrderNews`). */
const ORDER_NEWS_KEPT = 4;

/**
 * The newest ORDER_NEWS_KEPT rows of order news, a loss told of several divisions in one hour (lost at sea, transports
 * sunk: one row of the ticker, ROADMAP R40c) kept whole as one (ROADMAP R56c; critic run 57, R57-N3: six told their
 * landing was over in one hour, the first two dropped from the four kept, their panels with no word of it).
 */
export function keepOrderNews<T extends Pick<OrderNews, 'kind' | 'tick' | 'reason'> & { seq: number }>(news: readonly T[]): T[] {
  const key = (n: T): string => (n.kind === 'lostAtSea' || n.kind === 'transportsSunk' ? `${n.kind}|${n.tick}|${n.reason}` : `#${n.seq}`);
  const rows = new Set<string>();
  let from = news.length;
  while (from > 0) {
    const k = key(news[from - 1]!);
    if (!rows.has(k) && rows.size === ORDER_NEWS_KEPT) break;
    rows.add(k);
    from--;
  }
  // A group cut by the bound is dropped whole: no row naming only some of it.
  const cut = new Set(news.slice(0, from).map(key));
  return news.slice(from).filter((n) => !cut.has(key(n)));
}
/**
 * Each formation's newest order news with `n` added (ROADMAP R57c; critic run 58, R58-N2: 27125's 319, its row the fifth
 * of one hour, dropped by the ticker's bound, and its panel said only "Landed"): its panel's notice, whatever the
 * ticker's rows keep.
 */
export function withLastNews<T extends { id: number }>(last: ReadonlyMap<number, T>, n: T): Map<number, T> {
  const m = new Map(last);
  m.set(n.id, n);
  return m;
}

/** `last` without the news numbered `seq` (dismissed), or empty (`undefined`: all dismissed, a new game). */
export function withoutNews<T extends { seq: number }>(last: ReadonlyMap<number, T>, seq: number | undefined): Map<number, T> {
  return seq === undefined ? new Map() : new Map([...last].filter(([, n]) => n.seq !== seq));
}
const KEY_LEVEL = 'warsim.speedLevel';
const KEY_PAUSED = 'warsim.paused';
const KEY_MAP_MODE = 'warsim.mapMode';
/** God territory brush radius in cells. */
const BRUSH_RADIUS = 5;

export type GodTool = 'revolt' | 'nation' | 'battle' | 'brush' | 'nuke' | 'city' | 'raze';
const KEY_SHOW_STATS = 'warsim.showStats';
/** The economy tab's parts are asked for at most this often while the game runs (PLAN 7.4f34). */
const ECONOMY_MS = 500;
const KEY_RANK_METRIC = 'warsim.rankMetric';

function load(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // storage unavailable (private mode)
  }
}

function store(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the setting just does not persist */
  }
}

export class Hud {
  readonly tick = signal(0);
  readonly speedLevel = signal(DEFAULT_SPEED_LEVEL);
  readonly paused = signal(true);
  /** The nuclear strikes' alert banners (PLAN 6.6a), oldest first: one a strike (PLAN 7.109a). */
  readonly nukeAlerts = signal<readonly ShownAlert[]>([]);
  /** Map mode (PLAN 1.17), persisted; `onMapMode` applies it to the map view. */
  readonly mapMode = signal<MapMode>('political');
  /** The ground of T2 and T3 is the most of the picture (PLAN 7.4f3): the legend says occupied land is a tint. */
  readonly groundShown = signal(false);
  /** The nation under the mouse (PLAN 7.4f7): owner, holder and the client point, or null. */
  readonly hover = signal<MapHover | null>(null);
  /** The hovered cell an order of the selected land formations would reach over the sea (ROADMAP R17c), -1 for none. */
  readonly hoverBySea = signal(-1);
  /** The landing under the cursor (`hoverBySea`) is the ground of a nation outside the player's wars: the order would be refused (ROADMAP R21c). */
  readonly hoverSeaNeutral = signal(false);
  /** Under the cursor the sea, with one of the selection aboard at sea: the order would be refused, `OpenSea` (ROADMAP R36b). */
  readonly hoverSeaOpen = signal(false);
  /** `hoverSeaOpen` with the selection's landing gathering at its port, none aboard (ROADMAP R38f). */
  readonly hoverSeaAshore = signal(false);
  /** `hoverSeaOpen` for land formations in no landing (ROADMAP R38f). */
  readonly hoverSeaPlain = signal(false);
  /** The landing an order under the cursor (`hoverBySea`) is for (ADR-827, ROADMAP R27b), marked on the map; null for none or refused. */
  readonly hoverLanding = signal<SeaHint | null>(null);
  /** The hover is a tap's that ordered nothing yet (ROADMAP R34k3, ADR-849): a second tap there orders. */
  readonly tapAgain = signal(false);
  onMapMode: (mode: MapMode) => void = () => {};
  /** Selected nation id (0 = none; PLAN 1.30), set by map clicks. */
  readonly selected = signal(0);
  /** Selects a nation from the UI (panel chips); main wires it to the map view. */
  onSelectNation: (id: number) => void = (id) => (this.selected.value = id);
  /** Brings a place into view at a zoom that shows a battle (PLAN 2.14e); main wires it to the map view. */
  onShowBattle: (x: number, y: number, span?: readonly [number, number], fight?: boolean) => void = () => {};
  /** A sea battle's view of its fleets' box (`MapView.showSeaBattle`, PLAN 4.12a). */
  onShowSeaBattle: (x: number, y: number, span: readonly [number, number]) => void = () => {};

  /** Brings the place of an event into view (a click on a row of the ticker, PLAN 3.12c); main wires it to the map view. */
  onShowPlace: (x: number, y: number) => void = () => {};
  /** The sea battles going on (PLAN 4.10b): the ticker lists them, a click flies to both fleets. */
  readonly seaBattles = signal<SeaBattleView[]>([]);
  /** A carrier's strikes out of a sea battle (PLAN 7.154a), for the ticker. */
  readonly carrierRaids = signal<CarrierRaidView[]>([]);
  /** Who holds the seas, and how many zones each (PLAN 4.10c), the most first; the sea-control legend. */
  readonly seaHolders = signal<{ id: number; zones: number }[]>([]);
  /** The sea zone under the cursor in the sea-control mode (PLAN 4.10c), null off the sea. */
  readonly seaHover = signal<{ name: string; holder: number } | null>(null);
  /** Who holds the air zones (PLAN 5.10), the most first, and the zone under the cursor: for the legend. */
  readonly airHolders = signal<{ id: number; zones: number }[]>([]);
  readonly airHover = signal<{ holder: number } | null>(null);

  /** To the largest battle of war `war` (a click on its banner, PLAN 2.14e). A war with no formations in contact leaves the camera where it is. */
  toBattle(war: number): void {
    void this.sim
      .warBattle(war)
      .then((b) => {
        if (b) this.onShowBattle(b.x, b.y, b.span);
      })
      .catch(() => {
        /* the worker is gone or busy with a load: the camera stays */
      });
  }

  /** To the fight of the formation whose panel is open (PLAN 3.11b): its block and the block of the enemy it faces, both in the view. Out of contact the camera stays. */
  toFight(): void {
    const f = this.formationInfo.value?.fight;
    // A fleet's (PLAN 7.126): the box of its ships and the enemy fleet's, as a sea battle's row frames its pair.
    if (f?.sea) this.onShowSeaBattle(f.x, f.y, [f.span[0] + 2 * SEA_PAIR_MARGIN, f.span[1] + 2 * SEA_PAIR_MARGIN]);
    else if (f) this.onShowBattle(f.x, f.y, f.span, true);
  }

  /** The formation whose panel is open (0 = none; PLAN 2.14b), set by map clicks, and what the sim says of it. */
  readonly formation = signal(0);
  readonly formationInfo = signal<FormationDetail | null>(null);
  private formationAsked = false;
  /**
   * Which formation of that id (PLAN 2.16Ri): the id's count in the first answer. A freed id is
   * given to the next formation made, and the panel is not that one's.
   */
  private formationGeneration: number | undefined;

  /** The open nation's month in parts (PLAN 7.4f34), while its panel's economy tab is open. */
  readonly economy = signal<{ nation: number; tick: number; parts: EconomyBreakdown } | null>(null);
  /** The nation whose economy tab is open (0: none), and the request in flight. */
  private economyNation = 0;
  private economyAsked = false;
  private economyAt = -Infinity;

  /** The economy tab of `nation` is open (0: closed): its parts are asked for, and kept up with the game. */
  watchEconomy(nation: number): void {
    if (nation === this.economyNation) return;
    this.economyNation = nation;
    this.economyAt = -Infinity;
    if (nation === 0) this.economy.value = null;
    this.refreshEconomy();
  }

  /** Asks for the open economy tab's parts again: one request at a time, at most every ECONOMY_MS (a scan of the map's cells in the worker). */
  refreshEconomy(): void {
    const n = this.economyNation;
    if (n === 0 || this.economyAsked) return;
    const tick = this.tick.value;
    if (this.economy.value?.nation === n && this.economy.value.tick === tick) return;
    const now = performance.now();
    if (now - this.economyAt < ECONOMY_MS) return;
    this.economyAsked = true;
    this.economyAt = now;
    void this.sim
      .economy(n)
      .then((parts) => {
        if (this.economyNation === n) this.economy.value = parts ? { nation: n, tick, parts } : null;
      })
      .catch(() => {
        /* the worker is gone or busy with a load: the tab keeps what it has */
      })
      .finally(() => {
        this.economyAsked = false;
      });
  }

  /** Opens the panel of formation `id`; 0 closes it. */
  selectFormation(id: number): void {
    if (id === this.formation.value) return;
    this.formation.value = id;
    this.formationInfo.value = null;
    this.formationGeneration = undefined;
    this.refreshFormation();
  }

  /** Asks the sim for the open formation again (one request at a time). A formation that is gone closes its panel, whether or not another has its id. */
  refreshFormation(): void {
    const id = this.formation.value;
    if (id === 0 || this.formationAsked) return;
    this.formationAsked = true;
    const generation = this.formationGeneration;
    // Whether the answer was for a panel that is no longer the open one.
    let stale = false;
    void this.sim
      .formation(id, generation)
      .then((info) => {
        // Closed, or closed and opened again on the same id, while this was asked.
        stale = this.formation.value !== id || this.formationGeneration !== generation;
        if (stale) return;
        if (info === null) this.formation.value = 0;
        else this.formationGeneration = info.generation;
        this.formationInfo.value = info;
      })
      .catch(() => {
        /* the worker is gone or busy with a load: the panel keeps what it has */
      })
      .finally(() => {
        this.formationAsked = false;
        // Another formation was picked while this one was asked for.
        if (this.formation.value !== 0 && (this.formation.value !== id || stale)) this.refreshFormation();
      });
  }
  /** Statistics ranking (PLAN 1.31b): shown and metric, both persisted. */
  readonly showStats = signal(true);
  readonly rankMetric = signal<RankList>('land');
  /** Buildable templates of the scenario (PLAN 1.33b), from the worker's map layers. */
  readonly templates = signal<TemplateInfo[]>([]);
  /** The scenario's techs (PLAN 3.1e), from the worker's map layers. */
  readonly techs = signal<TechInfo[]>([]);
  /** Nation panel / war banner data from the worker (PLAN 1.31). */
  readonly stats = signal<NationStats | null>(null);
  /** Speed and pause as last reported by the worker (snapshots), for tests and diagnostics. */
  readonly worker = signal<{ speed: number | 'max'; paused: boolean } | null>(null);

  constructor(
    readonly sim: SimClient,
    readonly startDay: number,
  ) {
    const lvl = load(KEY_LEVEL);
    this.speedLevel.value = lvl === null ? DEFAULT_SPEED_LEVEL : clampSpeedLevel(Number(lvl));
    this.paused.value = load(KEY_PAUSED) === '1';
    const mode = load(KEY_MAP_MODE);
    this.mapMode.value = (MAP_MODES as readonly string[]).includes(mode ?? '') ? (mode as MapMode) : 'political';
    sim.onStats((m) => {
      this.stats.value = m;
      // A nation that has died is not selected any more (PLAN 2.17e3): its panel is gone, and the
      // legend, the diplomacy colours and the brush were its still. By the statistics that list it
      // dead, not when a Kill is sent: a Kill that is refused keeps its nation and its words.
      const selected = this.selected.peek();
      if (selected !== 0 && m.dead.some((d) => d.id === selected)) this.onSelectNation(0);
    });
    // The words are for the nation whose panel sent the command: a refusal that arrives after
    // the selection has moved on is not shown, and none stays through a change of the selection
    // (PLAN 2.17e2).
    sim.onRefused((reason, base) => {
      // A map tool's (R34d; critic run 37, R37-N3: Breakthrough at peace said nothing, the God tab not open): its
      // words on the tools' bar, whatever panel is open.
      if (this.commandFromTool) this.toolRefusal.value = reason;
      if (this.selected.peek() !== this.commandFor) return;
      this.refusal.value = reason;
      this.refusalBase.value = base;
    });
    // What became of the player's orders (PLAN 4.9c): the newest last, ORDER_NEWS_KEPT at most.
    sim.onLandings((rows) => {
      // A new landing of the player's on a phone: the nation's panel gives way to the bar, which it hides there
      // (ROADMAP R48g; critic run 51, the ADR-854 objection: take control left Japan's panel open, and the bar was not
      // seen after the first order).
      const had = new Set(this.landings.peek().map((r) => r.id));
      const fresh = rows.some((r) => r.state !== 'over' && !had.has(r.id));
      if (fresh && this.selected.peek() !== 0 && typeof window !== 'undefined' && window.matchMedia?.('(max-width: 600px)').matches) this.onSelectNation(0);
      this.landings.value = rows;
    });
    sim.onOrderNews((news) => {
      // Its name as the page knows it now: one lost at sea is gone by the next snapshot (ROADMAP R39b).
      const name = news.name ?? this.nameOf?.(news.id);
      this.addOrderNews({ ...news, ...(name === undefined ? {} : { name }), seq: this.orderSeq++ });
    });
    effect(() => {
      const selected = this.selected.value;
      this.refusal.value = 0;
      // The Territory brush paints for the selected nation. With none it painted nothing, took the
      // map's clicks all the same, and no God tab was open to switch it off (PLAN 2.17e3).
      if (selected === 0 && this.godTool.peek() === 'brush') this.setGodTool(null);
    });
    sim.onMapLayers((m) => {
      this.templates.value = m.templates;
      this.techs.value = m.techs;
    });
    this.showStats.value = load(KEY_SHOW_STATS) !== '0';
    const metric = load(KEY_RANK_METRIC);
    if ((RANK_LISTS as readonly string[]).includes(metric ?? '')) this.rankMetric.value = metric as RankList;
    // A loaded world's formations are others, whatever their ids and counts (a load does not raise the counts).
    sim.onLoad(() => {
      this.selectFormation(0);
      this.dismissOrderNews();
    });
    sim.onSnapshotReceived((s) => {
      this.tick.value = s.tick;
      // The open formation panel follows the game.
      if (this.formation.value !== 0 && this.formationInfo.value?.tick !== s.tick) this.refreshFormation();
      this.refreshEconomy();
      this.worker.value = { speed: s.speed, paused: s.paused };
    });
  }

  date() {
    return dateOfTick(this.startDay, this.tick.value);
  }

  /** Sends the persisted speed and pause to the worker; `forcePaused` (e.g. ?paused=1) wins. */
  apply(forcePaused: boolean): void {
    this.sim.setSpeed(speedOfLevel(this.speedLevel.value));
    if (forcePaused) this.paused.value = true;
    this.sim.setPaused(this.paused.value);
  }

  setSpeedLevel(level: number): void {
    const l = clampSpeedLevel(level);
    this.speedLevel.value = l;
    store(KEY_LEVEL, String(l));
    this.sim.setSpeed(speedOfLevel(l));
  }

  /** Map editor (PLAN 1.35): open, its settings and a started line's first point. */
  readonly showEditor = signal(false);
  readonly editor = signal<EditorState>({ tool: 'brush', layer: 'nation', nation: 0, terrain: 2, r: 4, mask: 'none', maskTerrain: 2, maskNation: 0, cityName: '', citySize: 2, template: -1 });
  readonly lineStart = signal<[number, number] | null>(null);
  /** The map mode to go back to when the editor's terrain layer is left (PLAN 7.4f5). */
  private modeBeforeTerrain: MapMode = 'political';

  /** Settings panel (PLAN 1.39a). */
  readonly showSettings = signal(false);

  toggleSettings(): void {
    if (!this.showSettings.value) this.closeCentre('settings');
    this.showSettings.value = !this.showSettings.value;
  }

  /**
   * Escape (PLAN 7.4f1, the critic's N7): closes one thing a press, the nearest first: an armed God
   * tool, a top-centre panel, the nuclear alert, the formation's panel, the nation's panel.
   * False when nothing was open.
   */
  escape(): boolean {
    if (this.godTool.value !== null) this.setGodTool(null);
    else if (this.showEditor.value || this.showCharts.value || this.showHistory.value || this.showRelations.value || this.showSettings.value) {
      this.closeCentre('none');
      this.lineStart.value = null;
    } else if (this.nukeAlerts.value.length > 0) this.nukeAlerts.value = this.nukeAlerts.value.slice(0, -1);
    else if (this.formation.value !== 0) this.selectFormation(0);
    else if (this.selected.value !== 0) this.onSelectNation(0);
    else return false;
    return true;
  }

  /** Opening one top-centre panel (editor, charts, history, relations, settings) closes the others. */
  private closeCentre(except: 'editor' | 'charts' | 'history' | 'relations' | 'settings' | 'none'): void {
    if (except !== 'editor') this.showEditor.value = false;
    if (except !== 'charts') this.showCharts.value = false;
    if (except !== 'history') this.showHistory.value = false;
    if (except !== 'relations') this.showRelations.value = false;
    if (except !== 'settings') this.showSettings.value = false;
  }

  toggleEditor(): void {
    if (!this.showEditor.value) this.closeCentre('editor');
    this.showEditor.value = !this.showEditor.value;
    this.lineStart.value = null;
    // Paint with the selected nation by default.
    if (this.showEditor.value && this.editor.value.nation === 0) this.editor.value = { ...this.editor.value, nation: this.selected.value, maskNation: this.selected.value };
  }

  setEditor(s: EditorState): void {
    // The layer painted is the one shown (PLAN 7.4f5, the critic's N12): the terrain layer shows
    // the terrain mode, and the nation layer the mode it had before, political if none.
    if (s.layer !== this.editor.value.layer) {
      if (s.layer === 'terrain') {
        if (this.mapMode.value !== 'terrain') this.modeBeforeTerrain = this.mapMode.value;
        this.setMapMode('terrain');
      } else if (this.mapMode.value === 'terrain') this.setMapMode(this.modeBeforeTerrain);
    }
    if (s.tool !== this.editor.value.tool) this.lineStart.value = null;
    // A refusal's words are of the nation it was for (PLAN 7.24b: the nearest base of its).
    if (s.nation !== this.editor.value.nation) this.refusal.value = 0;
    this.editor.value = s;
  }

  /**
   * A map click while the editor is open: paints (a line needs two clicks) or applies a scenario
   * tool at the clicked cell (`city` is the nearest city row, `province` the clicked province).
   */
  editorClick(x: number, y: number, city = 0, province = 0): boolean {
    if (!this.showEditor.value) return false;
    const s = this.editor.value;
    switch (s.tool) {
      case 'city':
        if (s.cityName.trim() !== '') this.command({ kind: 'spawnCity', x: x + 0.5, y: y + 0.5, name: s.cityName, size: s.citySize });
        return true;
      case 'removeCity':
        if (city !== 0) this.command({ kind: 'removeCity', city });
        return true;
      case 'capital':
        if (city !== 0 && s.nation !== 0) this.command({ kind: 'setCapital', nation: s.nation, city });
        return true;
      case 'core':
      case 'uncore':
        if (province !== 0 && s.nation !== 0) this.command({ kind: 'setCore', province, nation: s.nation, on: s.tool === 'core' });
        return true;
      case 'fleet':
      case 'wing':
        // The editor's forces (PLAN 7.13a): of its nation, at the water or the airbase by the click.
        if (s.nation !== 0 && s.template >= 0) this.command({ kind: s.tool === 'fleet' ? 'spawnFleet' : 'spawnWing', nation: s.nation, x: x + 0.5, y: y + 0.5, template: s.template });
        return true;
      default:
        break;
    }
    const cx = x + 0.5;
    const cy = y + 0.5;
    if (s.tool === 'line' && !this.lineStart.value) {
      this.lineStart.value = [cx, cy];
      return true;
    }
    const [x0, y0] = s.tool === 'line' ? this.lineStart.value! : [cx, cy];
    this.editPaint(s.tool as 'brush' | 'line' | 'bucket', x0, y0, cx, cy);
    this.lineStart.value = null;
    return true;
  }

  /** Paints with the editor's layer, value, radius and mask; `stroke` joins a dragged stroke. */
  private editPaint(tool: 'brush' | 'line' | 'bucket', x: number, y: number, x2: number, y2: number, stroke?: 'start' | 'more'): void {
    const s = this.editor.value;
    const mask = s.mask === 'none' ? null : { kind: s.mask, value: s.mask === 'terrain' ? s.maskTerrain : s.maskNation };
    this.command({ kind: 'editPaint', layer: s.layer, tool, x, y, x2, y2, r: s.r, value: s.layer === 'nation' ? s.nation : s.terrain, mask, ...(stroke ? { stroke } : {}) });
  }

  /**
   * Painting by dragging (PLAN 1.44): the tool that paints on a primary-button drag, or null.
   * While the editor is open that is its brush or its line (its other tools are click tools,
   * and the editor takes the map's clicks before God Mode does); otherwise the God Mode
   * territory brush, when a nation is selected to paint for (PLAN 1.44b). The map view asks
   * this, and the camera leaves that button to the tool.
   */
  dragTool(): 'brush' | 'line' | 'god' | null {
    if (this.showEditor.value) {
      const tool = this.editor.value.tool;
      return tool === 'brush' || tool === 'line' ? tool : null;
    }
    return this.godTool.value === 'brush' && this.selected.value !== 0 ? 'god' : null;
  }

  /** Where the drag is: its tool, and the last point (brushes) or the press (line), in world cells. */
  private drag: { tool: 'brush' | 'line' | 'god'; x: number; y: number } | null = null;

  /**
   * The God Mode territory brush (PLAN 2.17b): the editor's nation paint for the selected nation,
   * owner and controller together, so the land is the nation's and not land it occupies. A
   * dragged stroke is one step of the editor's undo history.
   */
  private godPaint(tool: 'brush' | 'line', x: number, y: number, x2: number, y2: number, stroke: 'start' | 'more'): void {
    this.command({ kind: 'editPaint', layer: 'nation', tool, x, y, x2, y2, r: BRUSH_RADIUS, value: this.selected.value, mask: null, stroke });
  }

  /** A press at world (x, y): a brush stamps and opens a stroke; the line waits for the release. */
  dragStart(x: number, y: number): void {
    const tool = this.dragTool();
    if (!tool) return;
    this.drag = { tool, x, y };
    if (tool === 'brush') this.editPaint('brush', x, y, x, y, 'start');
    else if (tool === 'god') this.godPaint('brush', x, y, x, y, 'start');
  }

  /** The pointer entered another cell: a brush paints the way there, as part of its stroke. */
  dragMove(x: number, y: number): void {
    const d = this.drag;
    if (!d || d.tool === 'line') return;
    if (d.tool === 'brush') this.editPaint('line', d.x, d.y, x, y, 'more');
    else this.godPaint('line', d.x, d.y, x, y, 'more');
    d.x = x;
    d.y = y;
  }

  /**
   * The release. A line dragged to another cell is painted from the press to the release;
   * released in the cell of the press, it is a click of the two-click line.
   */
  dragEnd(x: number, y: number): void {
    const d = this.drag;
    this.drag = null;
    if (d?.tool !== 'line') return;
    if (Math.floor(d.x) === Math.floor(x) && Math.floor(d.y) === Math.floor(y)) {
      this.editorClick(Math.floor(x), Math.floor(y));
      return;
    }
    this.editPaint('line', d.x, d.y, x, y);
    this.lineStart.value = null;
  }

  /** The drag was taken away (a second finger): what a brush painted stays, a line is not drawn. */
  dragCancel(): void {
    this.drag = null;
  }

  /** Statistics charts panel (PLAN 1.34b). */
  readonly showCharts = signal(false);

  toggleCharts(): void {
    if (!this.showCharts.value) this.closeCentre('charts');
    this.showCharts.value = !this.showCharts.value;
  }

  /** History log panel (PLAN 1.34a). */
  readonly showHistory = signal(false);

  toggleHistory(): void {
    if (!this.showHistory.value) this.closeCentre('history');
    this.showHistory.value = !this.showHistory.value;
  }

  /** The relations graph (ROADMAP R1, ADR-806). */
  readonly showRelations = signal(false);

  toggleRelations(): void {
    if (!this.showRelations.value) this.closeCentre('relations');
    this.showRelations.value = !this.showRelations.value;
  }

  toggleStats(): void {
    this.showStats.value = !this.showStats.value;
    store(KEY_SHOW_STATS, this.showStats.value ? '1' : '0');
  }

  setRankMetric(m: RankList): void {
    this.rankMetric.value = m;
    store(KEY_RANK_METRIC, m);
  }

  setMapMode(mode: MapMode): void {
    this.mapMode.value = mode;
    store(KEY_MAP_MODE, mode);
    this.onMapMode(mode);
  }

  /** God Mode (PLAN 1.32b): the God tab in the nation panel and map tools. */
  readonly godMode = signal(false);
  /** Active God map tool and, for a breakthrough, its first point. */
  readonly godTool = signal<GodTool | null>(null);
  /** How many provinces the Spawn nation tool's nation starts with (PLAN 7.4f26, AoC's initial size). */
  readonly spawnSize = signal(5);
  /** The Nuke tool's size (PLAN 7.16a): a thermonuclear bomb, or a fission one. */
  readonly nukeThermonuclear = signal(false);
  private battleStart: [number, number] | null = null;

  toggleGod(): void {
    this.godMode.value = !this.godMode.value;
    if (!this.godMode.value) this.setGodTool(null);
    // The editor sends its commands this way too: none of its refusals is the God tab's.
    this.refusal.value = 0;
  }

  /** Why the sim did not carry out the last command sent from here (`Refusal`; 0 = it did; PLAN 2.17a). */
  readonly refusal = signal(0);
  /** With a wing of the editor refused for want of an airbase (PLAN 7.24b): the nearest of its nation's with room, null for none. */
  readonly refusalBase = signal<RefusedBase | null | undefined>(undefined);
  /** What became of the player's orders of formations, the newest last (PLAN 4.9c; `seq` numbers them). */
  readonly orderNews = signal<(OrderNews & { seq: number })[]>([]);
  /** Each formation's newest order news, for its panel: kept whatever the ticker's rows drop (ROADMAP R57c). */
  readonly lastOrderNews = signal(new Map<number, OrderNews & { seq: number }>());
  private addOrderNews(n: OrderNews & { seq: number }): void {
    this.orderNews.value = keepOrderNews([...this.orderNews.peek(), n]);
    this.lastOrderNews.value = withLastNews(this.lastOrderNews.peek(), n);
  }
  /** The player's landings in rows (ROADMAP R47a): those under way, and those over for a day with their outcome. */
  readonly landings = signal<LandingRow[]>([]);
  /** A formation's name as the map last drew it (set by the game; ROADMAP R39b: a notice keeps it). */
  nameOf: ((id: number) => string | undefined) | undefined;
  private orderSeq = 0;
  /**
   * For each formation ordered from here, the `seq` the next order news was to take when its last
   * order was sent (ROADMAP R24c, critic run 36, R36-N1): a refusal before it is older than an order
   * given since, and its notice goes, even for an order to the same place.
   */
  readonly orderedAt = signal(new Map<number, number>());
  /** Forgets the order news (a click on one, a new game). */
  dismissOrderNews(seq?: number): void {
    this.orderNews.value = seq === undefined ? [] : this.orderNews.peek().filter((n) => n.seq !== seq);
    this.lastOrderNews.value = withoutNews(this.lastOrderNews.peek(), seq);
  }
  /** The selection when the last command was sent: a refusal is shown to that nation's panel only. */
  private commandFor = 0;
  /** Why the sim did not carry out the last command a map tool's click sent (R34d; 0: it did, or none sent since). */
  readonly toolRefusal = signal(0);
  /** Whether the last command was sent by a map tool's click (`pick`). */
  private commandFromTool = false;
  private picking = false;

  /** Issues a God command, applied at once (also while paused). */
  command(cmd: Command): void {
    this.refusal.value = 0;
    this.toolRefusal.value = 0;
    this.commandFromTool = this.picking;
    this.commandFor = this.selected.peek();
    if (cmd.kind === 'moveFormation' || cmd.kind === 'paradrop') this.orderedAt.value = new Map(this.orderedAt.peek()).set(cmd.id, this.orderSeq);
    this.sim.command(cmd, true);
  }

  /**
   * One click's orders of the selection, applied together at once (ROADMAP R29a; critic run 40,
   * R40-B2): one at a time, a whole landing re-clicked told all but the last "the rest keep the old
   * landing", and each order chose transports while the rest still held the landing's.
   */
  /** A landing's cancel from its row (ROADMAP R48a): its divisions' orders are the worker's; each counts as ordered now. */
  cancelLanding(row: LandingRow): void {
    const at = new Map(this.orderedAt.peek());
    for (const d of row.divisions) at.set(d.id, this.orderSeq);
    this.orderedAt.value = at;
    this.sim.cancelLanding(row.id);
  }

  commands(cmds: Command[]): void {
    if (cmds.length === 0) return;
    this.refusal.value = 0;
    this.toolRefusal.value = 0;
    this.commandFromTool = false;
    this.commandFor = this.selected.peek();
    const at = new Map(this.orderedAt.peek());
    for (const cmd of cmds) if (cmd.kind === 'moveFormation' || cmd.kind === 'paradrop') at.set(cmd.id, this.orderSeq);
    this.orderedAt.value = at;
    this.sim.commands(cmds, true);
  }

  /**
   * Told when a click orders divisions all of which already have the landing it is for (ROADMAP R34j; critic run 36,
   * R36-N3: the re-click was taken in silence, the panel unchanged): an order's news, "the order changes nothing".
   * Asked of the sim before the orders are sent (`overSea`, read-only), so it reads the landings they had.
   */
  tellSameLanding(ids: readonly number[], x: number, y: number, nation: number): void {
    if (ids.length === 0) return;
    void this.sim.overSea([...ids], x, y).then((h) => {
      if (h.how !== 1 || !h.same || h.marks.length !== 1) return;
      const id = ids[0]!;
      const name = this.nameOf?.(id);
      const news: OrderNews = { kind: 'sameLanding', id, nation, reason: ids.length, x, y, tick: this.tick.peek() };
      this.addOrderNews({ ...news, ...(name === undefined ? {} : { name }), seq: this.orderSeq++ });
    });
  }

  setGodTool(tool: GodTool | null): void {
    this.toolRefusal.value = 0;
    this.godTool.value = this.godTool.value === tool ? null : tool;
    this.battleStart = null;
  }

  /**
   * A map click while a God tool is active (cell x, y; its province). Returns true when the
   * tool used the click (the map then does not select).
   */
  pick(x: number, y: number, province: number, city = 0): boolean {
    this.picking = true;
    try {
      return this.pickTool(x, y, province, city);
    } finally {
      this.picking = false;
    }
  }

  private pickTool(x: number, y: number, province: number, city = 0): boolean {
    const tool = this.godTool.value;
    const nation = this.selected.value;
    if (!tool) return false;
    if (tool === 'city') {
      // A city founded in the game (PLAN 7.4f18, AoC's God panel): a town at the cell clicked,
      // on the land of whoever holds it; the tool stays for the next one.
      this.command({ kind: 'spawnCity', x: x + 0.5, y: y + 0.5, name: t('god.newCityName'), size: 2 });
      return true;
    }
    if (tool === 'raze') {
      // The city by the click (within two cells) is razed; the tool stays.
      if (city !== 0) this.command({ kind: 'removeCity', city });
      return true;
    }
    if (tool === 'nation') {
      // A nation set down (PLAN 7.4f26): the province clicked and the nearest of its holder's,
      // the size chosen in all; the tool stays for the next one, as Found city's.
      if (province > 0) this.command({ kind: 'spawnNation', province, size: this.spawnSize.value });
      return true;
    }
    if (tool === 'revolt') {
      if (province > 0) this.command({ kind: 'spawnRevolt', province });
      this.godTool.value = null;
    } else if (tool === 'nuke') {
      // God Mode's strike (PLAN 6.6a): a bomb at the cell clicked, at once.
      this.command({ kind: 'godNuke', x: x + 0.5, y: y + 0.5, thermonuclear: this.nukeThermonuclear.peek() });
      this.godTool.value = null;
    } else if (tool === 'battle') {
      if (!this.battleStart) {
        this.battleStart = [x, y];
        return true;
      }
      if (nation !== 0) this.command({ kind: 'forceBreakthrough', nation, x: this.battleStart[0], y: this.battleStart[1], toX: x, toY: y });
      this.battleStart = null;
      this.godTool.value = null;
    }
    // The territory brush paints through the drag path (`dragStart`, PLAN 1.44b) and stays
    // active. Its click arrives here only with no nation selected: nothing to paint for.
    return true;
  }

  togglePause(): void {
    this.paused.value = !this.paused.value;
    store(KEY_PAUSED, this.paused.value ? '1' : '0');
    this.sim.setPaused(this.paused.value);
  }

  /** Space = pause, `,` = slower, `.` = faster. Ignored while typing in a form field. */
  installKeys(target: Window): void {
    target.addEventListener('keydown', (e) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePause();
      } else if (e.code === 'Period') this.setSpeedLevel(this.speedLevel.value + 1);
      else if (e.code === 'Comma') this.setSpeedLevel(this.speedLevel.value - 1);
    });
  }
}
