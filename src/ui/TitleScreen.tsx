import { useEffect, useState } from 'preact/hooks';
import { dateOfTick } from '../shared/calendar';
import type { GameOptions } from '../shared/gameOptions';
import type { ScenarioId } from '../shared/protocol';
import type { ScenarioInfo } from '../shared/scenarios';
import { t, type MessageKey } from './i18n';
import { NewGameForm, randomSeed } from './NewGameForm';

/** What the title screen shows of a saved game. */
export interface SavedGame {
  /** Its scenario (which may be one that is not on the list). */
  info: ScenarioInfo;
  tick: number;
  /** Wall-clock time of the save (ms since the epoch). */
  savedAt: number;
  /** Written by another version, in a state format this one does not read (PLAN 7.152a): not offered. */
  older?: boolean;
}

export interface TitleScreenProps {
  /** The scenarios on offer, in list order (at least one). */
  scenarios: readonly { id: ScenarioId; info: ScenarioInfo }[];
  /** The image of a scenario's start (its political map, PLAN 1.43c). */
  previewUrl: (id: ScenarioId) => string;
  /** Starts a new game of scenario `id` with `seed` and the new-game options. */
  onStart: (id: ScenarioId, seed: number, options: GameOptions, start?: ReplayStart) => void;
  /**
   * A scenario's replay of history (ROADMAP R68c, the user's decision of 2026-11-12: one card for 1938, a slider of years
   * under its map): the scenario it starts, and the years built for this site to start it from (1938 always).
   */
  replays?: Partial<Record<ScenarioId, { id: ScenarioId; info: ScenarioInfo }>>;
  startYears?: () => Promise<{ year: number; nations?: number; powers?: string[] }[]>;
  /** The map of a later year's start (R74b, critic run 65 R65-N6); the scenario's own where it has none. */
  yearPreviewUrl?: (year: number) => string;
  /** The saved game to offer as Continue, if there is one (PLAN 1.43b). */
  readSave: () => Promise<SavedGame | null>;
  onContinue: () => void;
  /**
   * Reads a scenario file's header (PLAN 7.13b): its name, its scenario and its date; rejects with a
   * readable error when the file does not fit. Nothing starts. `upgraded`: the parts of an older version's file that
   * this one adds to start it (ROADMAP R53i), said under its date.
   */
  checkScenarioFile: (file: File) => Promise<{ name: string; scenario: ScenarioId; startDay: number; tick: number; upgraded?: readonly 'traits'[] }>;
  /** Starts the game of a scenario file (checked); rejects with a readable error when the file does not fit. */
  onScenarioFile: (file: File) => Promise<void>;
  /** A scenario file could not be loaded after this screen was left for its game. */
  loadFailed: boolean;
  /** The saved game could not be loaded after Continue (PLAN 7.149): it is not offered again. */
  saveFailed?: boolean;
  /**
   * A start of the replay from a year could not be loaded (ROADMAP R73): that year ('' when the URL named none). Told on
   * the card that offers the replay; the saved game is not what failed.
   */
  startFailed?: string | undefined;
}

/**
 * The title screen (PLAN 1.43): what `/` opens. On the left the saved game, the scenario list and
 * the scenario file loader; on the right the chosen scenario (a map of its start, its facts) with
 * its new-game form. No world runs behind it.
 */
/** A game of the replay from 1 January of `year`, the replay going on or left (`free`; R68b-c). */
export interface ReplayStart {
  year: number;
  free: boolean;
}

export function TitleScreen({ scenarios, previewUrl, onStart, replays = {}, startYears, readSave, onContinue, checkScenarioFile, onScenarioFile, loadFailed, saveFailed = false, startFailed, yearPreviewUrl }: TitleScreenProps) {
  // A refused start opens on the card that offers the replay, its notice there (R73).
  const [chosen, setChosen] = useState<ScenarioId>(() => (startFailed !== undefined ? (scenarios.find((s) => replays[s.id])?.id ?? scenarios[0]!.id) : scenarios[0]!.id));
  const [startError, setStartError] = useState(startFailed);
  // A new seed per visit, so two games started without touching the field differ.
  const [seed] = useState(randomSeed);
  // undefined while the store is being read.
  const [save, setSave] = useState<SavedGame | null | undefined>(undefined);
  // The error of the last file chosen here, or of the one a game could not load (`loadFailed`).
  const [fileError, setFileError] = useState<string | null>(null);
  const [failed, setFailed] = useState(loadFailed);
  // A file chosen and read, waiting for Start (PLAN 7.13b, critic run 7: "a file starts the game at
  // once, with no confirmation").
  const [pending, setPending] = useState<{ file: File; name: string; scenario: ScenarioId; startDay: number; tick: number; upgraded?: readonly 'traits'[] } | null>(null);
  // The replay's years built for this site (R68c); 1938 alone until read, or without them.
  const [built, setYears] = useState<{ year: number; nations?: number; powers?: string[] }[]>([]);
  // On a card with a replay: replay history (or play free), from 1 January of `year`.
  const [history, setHistory] = useState(false);
  const [year, setYear] = useState(1938);
  useEffect(() => {
    void startYears?.()
      .then(setYears)
      .catch(() => setYears([]));
  }, []);
  useEffect(() => {
    void readSave()
      .then(setSave)
      .catch(() => setSave(null));
  }, []);
  const dateAt = (startDay: number, tick: number): string => {
    const d = dateOfTick(startDay, tick);
    return t('date.format', { day: d.day, month: t(`month.${d.month}` as MessageKey), year: d.year });
  };
  const own = scenarios.find((s) => s.id === chosen)!.info;
  const replay = replays[chosen];
  const years = replay ? [...new Set([1938, ...built.map((y) => y.year)])].sort((a, b) => a - b) : [];
  // A later year chosen on a card with a replay: its map, its nations and its name are that year's (R74b).
  const later = replay !== undefined && year > 1938 ? built.find((y) => y.year === year) : undefined;
  // The year's great powers on a card with a replay (R75b), 1938's too, where the index has them.
  const powers = replay !== undefined ? built.find((y) => y.year === year)?.powers : undefined;
  const ownPreview = previewUrl(chosen);
  const preview = later && yearPreviewUrl ? yearPreviewUrl(later.year) : ownPreview;
  // The replay's world: history replayed, or a later year's world played free.
  const replayed = replay !== undefined && (history || year > 1938);
  const info = replayed ? replay.info : own;
  return (
    <main class="title-screen" data-testid="title-screen" data-save={save === undefined ? 'reading' : save ? 'found' : 'none'}>
      <header class="title-head">
        <div>
          <h1 class="title-name" data-testid="app-title">
            {t('app.title')}
          </h1>
          <p class="title-tagline">{t('app.tagline')}</p>
        </div>
      </header>
      <div class="title-body">
        <div class="title-column">
          {save ? (
            <section class="title-card" data-testid="title-save">
              <h2 class="title-sub">{t('title.savedGame')}</h2>
              <div class="title-scenario-name">{t(save.info.nameKey as MessageKey)}</div>
              <div data-testid="title-save-date">{dateAt(save.info.startDay, save.tick)}</div>
              <div class="title-scenario-date">{t('title.savedAt', { time: new Date(save.savedAt).toLocaleString() })}</div>
              {save.older ? (
                <div class="panel-warn" data-testid="title-save-older">
                  {t('title.saveOlder')}
                </div>
              ) : saveFailed ? (
                <div class="panel-warn" data-testid="title-save-error">
                  {t('title.saveFailed')}
                </div>
              ) : (
                <button type="button" class="start-btn" data-testid="title-continue" onClick={onContinue}>
                  {t('title.continue')}
                </button>
              )}
            </section>
          ) : null}
          <section class="title-card title-list">
            <h2 class="title-sub">{t('title.scenarios')}</h2>
            <ul>
              {scenarios.map((s) => (
                <li key={s.id}>
                  <button type="button" class={`title-scenario${s.id === chosen ? ' active' : ''}`} data-testid={`title-scenario-${s.id}`} aria-pressed={s.id === chosen} onClick={() => setChosen(s.id)}>
                    <span class="title-scenario-name">{t(s.info.nameKey as MessageKey)}</span>
                    <span class="title-scenario-date">{dateAt(s.info.startDay, 0)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section class="title-card">
            <h2 class="title-sub">{t('scenario.file')}</h2>
            <p class="title-desc">{t('title.fileHint')}</p>
            {/* A button of the game's, not the browser's "Choose File / No file chosen": the input is emptied once read, so
                its own words read "No file chosen" beside the file chosen (ROADMAP R60b; critic run 61, R61-N2). */}
            <label class="god-btn title-file-btn">
              {t('title.fileChoose')}
              <input
                class="title-file"
                data-testid="title-scenario-file"
                type="file"
                accept=".warism-scenario,.warsim-scenario"
                aria-label={t('scenario.import')}
                onChange={(e) => {
                  const input = e.currentTarget as HTMLInputElement;
                  const file = input.files?.[0];
                  input.value = '';
                  if (!file) return;
                  setFileError(null);
                  setFailed(false);
                  setPending(null);
                  void checkScenarioFile(file)
                    .then((h) => setPending({ file, ...h }))
                    .catch((err: unknown) => setFileError(t('scenario.failed', { error: err instanceof Error ? err.message : String(err) })));
                }}
              />
            </label>
            {pending ? (
              <div class="title-file-pending" data-testid="title-file-pending">
                <div class="title-scenario-name" data-testid="title-file-name">
                  {pending.name}
                </div>
                <div class="title-scenario-date">
                  {t(scenarios.find((s) => s.id === pending.scenario)?.info.nameKey as MessageKey ?? 'scenario.file')} · {dateAt(pending.startDay, pending.tick)}
                </div>
                {pending.upgraded?.map((u) => (
                  <div key={u} class="panel-note title-file-upgraded" data-testid="title-file-upgraded">
                    {t(`scenario.upgraded.${u}` as MessageKey)}
                  </div>
                ))}
                <div class="title-file-actions">
                  <button
                    type="button"
                    class="start-btn"
                    data-testid="title-file-start"
                    onClick={() => {
                      const f = pending.file;
                      setPending(null);
                      void onScenarioFile(f).catch((err: unknown) => setFileError(t('scenario.failed', { error: err instanceof Error ? err.message : String(err) })));
                    }}
                  >
                    {t('title.fileStart')}
                  </button>
                  <button type="button" class="god-btn" data-testid="title-file-cancel" onClick={() => setPending(null)}>
                    {t('title.fileCancel')}
                  </button>
                </div>
              </div>
            ) : null}
            {fileError !== null || failed ? (
              <div class="panel-warn" data-testid="title-file-error">
                {fileError ?? t('title.loadFailed')}
              </div>
            ) : null}
          </section>
        </div>
        <section class="title-card title-detail" data-testid="title-detail">
          <h2 class="title-sub" data-testid="title-chosen">
            {later ? t('title.worldOfYear', { year: later.year }) : t(own.nameKey as MessageKey)}
          </h2>
          <div class="title-detail-grid">
            <div>
              <img
                class="title-preview"
                data-testid="title-preview"
                src={preview}
                width={1024}
                height={512}
                alt={later ? t('title.previewAltYear', { year: later.year }) : t(info.nationsRange ? 'title.previewAltExample' : 'title.previewAlt', { name: t(info.nameKey as MessageKey) })}
                onError={(e) => {
                  // A site whose starts were built before their maps: the scenario's own.
                  const img = e.currentTarget;
                  if (img.src !== ownPreview) img.src = ownPreview;
                }}
              />
              {replay && years.length > 1 ? (
                <div class="title-years">
                  {/* The year on the thumb (R74b): 38 years in ~270 px on a phone. */}
                  <span class="title-year-thumb" data-testid="title-year-thumb" style={{ left: `calc(${(year - years[0]!) / (years.at(-1)! - years[0]!)} * (100% - 16px) + 8px)` }}>
                    {year}
                  </span>
                  <input type="range" class="title-year-slider" data-testid="title-start-year" min={years[0]} max={years.at(-1)} step={1} value={year} aria-label={t('title.startYear')} onInput={(e) => {
                      setYear(Number((e.currentTarget as HTMLInputElement).value));
                      setStartError(undefined);
                    }} />
                  <div class="title-year-ends">
                    <span>{years[0]}</span>
                    <span>{years.at(-1)}</span>
                  </div>
                </div>
              ) : null}
              <p class="title-desc" data-testid="title-desc">{later && !history ? t('title.freeYearDesc', { year: later.year }) : t((history && replay ? replay.info : own).descKey as MessageKey)}</p>
              {replay && startError !== undefined ? (
                <div class="panel-warn" data-testid="title-start-error">
                  {startError ? t('title.startFailed', { year: startError }) : t('title.startFailedAny')}
                </div>
              ) : null}
              <div class="form-row">
                <span class="form-name">{t('title.startDate')}</span>
                <span data-testid="title-start-date">{replay ? t('title.startYearOption', { year }) : dateAt(info.startDay, 0)}</span>
              </div>
              <div class="form-row">
                <span class="form-name">{t('title.map')}</span>
                <span data-testid="title-map">
                  {t(info.mapNameKey as MessageKey)} · {info.geometry.w} × {info.geometry.h}
                </span>
              </div>
              <div class="form-row">
                <span class="form-name">{t('title.nations')}</span>
                <span data-testid="title-nations">{info.nationsRange ? t('settings.nationsRange', { min: info.nationsRange.min, max: info.nationsRange.max }) : (later?.nations ?? info.nations)}</span>
              </div>
              {powers && powers.length > 0 ? (
                <div class="form-row">
                  <span class="form-name title-powers-name">{t('title.greatPowers')}</span>
                  <span data-testid="title-powers">{powers.map((tag) => t(`nation.${tag}` as MessageKey)).join(', ')}</span>
                </div>
              ) : null}
            </div>
            <div>
              {replay ? (
                <div class="panel-tabs" role="radiogroup" aria-label={t('title.startMode')}>
                  <button type="button" role="radio" aria-checked={history} class={history ? 'tab active' : 'tab'} data-testid="title-mode-replay" onClick={() => setHistory(true)}>
                    {t('title.mode.replay')}
                  </button>
                  <button type="button" role="radio" aria-checked={!history} class={history ? 'tab' : 'tab active'} data-testid="title-mode-free" onClick={() => setHistory(false)}>
                    {t('title.mode.free')}
                  </button>
                </div>
              ) : null}
              {replay && replayed ? (
                <NewGameForm key={`${chosen}-replay`} seed={seed} options={{}} rangeHint={false} startLabel={t('title.start')} blocked={pending ? t('title.fileFirst') : undefined} fixedSeed={replay.info.fixedSeed} fixedNote={history ? undefined : t('title.freeYearNote', { year })} onStart={(s, o) => onStart(replay.id, s, o, history && year === 1938 ? undefined : { year, free: !history })} />
              ) : (
                <NewGameForm key={chosen} seed={seed} options={{}} nationsRange={info.nationsRange} sizes={info.sizes} defaultSize={info.defaultSize} diplomacy={info.diplomacy} heroes={info.heroes} rangeHint={false} startLabel={t('title.start')} blocked={pending ? t('title.fileFirst') : undefined} fixedSeed={info.fixedSeed} onStart={(s, o) => onStart(chosen, s, o)} />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
