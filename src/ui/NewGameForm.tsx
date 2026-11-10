import { useState } from 'preact/hooks';
import { t, type MessageKey } from './i18n';
import type { GameOptions } from '../shared/gameOptions';
import type { MapSize } from '../shared/scenarios';

export interface NewGameFormProps {
  /** The seed the field starts with. */
  seed: number;
  /** The options the form starts from. */
  options: GameOptions;
  /** The scenario lets the player say how many nations there are (the random world, PLAN 2.16c). */
  nationsRange?: { min: number; max: number; default: number } | undefined;
  /** The range is said beside the field (not where the page says it already: the title screen's facts). */
  rangeHint?: boolean;
  /** The sizes of the scenario's map and its own (PLAN 7.1b8): a picker where there is more than one. */
  sizes?: readonly MapSize[] | undefined;
  defaultSize?: string | undefined;
  /** The scenario starts with alliances or wars (PLAN 7.182): a choice to draw them by the seed. */
  diplomacy?: boolean | undefined;
  /** The scenario has heroes (PLAN 7.184d): a choice to give the great powers theirs (off by default). */
  heroes?: boolean | undefined;
  /** Label of the start button. */
  startLabel: string;
  /** Why the start button is not offered now, said under it and in its title (ROADMAP R60b: a scenario file pending). */
  blocked?: string | undefined;
  onStart: (seed: number, options: GameOptions) => void;
}

/** A seed for a game nobody chose one for (app side only: it reaches the sim as the chosen seed). */
export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

/** `opts` with the CE mode `v` ('scenario' removes the override). */
function withCe(opts: GameOptions, v: string): GameOptions {
  const { ceMode: _old, ...rest } = opts;
  return v === 'scenario' ? rest : { ...rest, ceMode: v as NonNullable<GameOptions['ceMode']> };
}

/**
 * The seed (or a random one) and the new-game options of PLAN 1.39b1, with the button that starts
 * the game. Shared by the title screen (PLAN 1.43) and the settings panel.
 */
export function NewGameForm({ seed, options, nationsRange, rangeHint = true, sizes = [], defaultSize = 'M', diplomacy = false, heroes = false, startLabel, blocked, onStart }: NewGameFormProps) {
  const [next, setNext] = useState(String(seed));
  const [count, setCount] = useState(String(options.nations ?? nationsRange?.default ?? ''));
  const [opts, setOpts] = useState<GameOptions>(options);
  const sel = (testid: string, value: string, values: readonly string[], key: (v: string) => MessageKey, set: (v: string) => void) => (
    <select data-testid={testid} value={value} onChange={(e) => set((e.currentTarget as HTMLSelectElement).value)}>
      {values.map((v) => (
        <option key={v} value={v}>
          {t(key(v))}
        </option>
      ))}
    </select>
  );
  const seedValid = /^\d{1,10}$/.test(next.trim()) && Number(next) <= 0xffffffff;
  const countValid = !nationsRange || (/^\d{1,4}$/.test(count.trim()) && Number(count) >= nationsRange.min && Number(count) <= nationsRange.max);
  // The number of nations goes with the scenario that asks for it, and with no other.
  // So do the diplomacy drawn by the seed (PLAN 7.182) and the heroes (PLAN 7.184d; off is no option).
  const chosen = (): GameOptions => {
    const { nations: _old, diplomacy: _d, heroes: _h, ...rest } = opts;
    const drawn = diplomacy && opts.diplomacy === 'random' ? { ...rest, diplomacy: 'random' as const } : rest;
    const own = heroes && opts.heroes === 'on' ? { ...drawn, heroes: 'on' as const } : drawn;
    return nationsRange ? { ...own, nations: Number(count) } : own;
  };
  return (
    <div class="new-game">
      <label class="form-row">
        <span class="form-name">{t('settings.seed')}</span>
        <input data-testid="settings-seed" inputMode="numeric" value={next} onInput={(e) => setNext((e.currentTarget as HTMLInputElement).value)} />
        <button type="button" class="god-btn" data-testid="settings-random-seed" onClick={() => setNext(String(randomSeed()))}>
          {t('settings.randomSeed')}
        </button>
      </label>
      {nationsRange ? (
        <label class="form-row">
          <span class="form-name">{t('settings.nations')}</span>
          <input
            data-testid="settings-nations"
            type="number"
            inputMode="numeric"
            min={nationsRange.min}
            max={nationsRange.max}
            step={1}
            value={count}
            aria-invalid={!countValid}
            onInput={(e) => setCount((e.currentTarget as HTMLInputElement).value)}
          />
          {rangeHint ? (
            <span class="form-hint" data-testid="settings-nations-range">
              {t('settings.nationsRange', { min: nationsRange.min, max: nationsRange.max })}
            </span>
          ) : null}
        </label>
      ) : null}
      <div class="panel-sub">{t('settings.options')}</div>
      {sizes.length > 1 ? (
        <label class="form-row">
          <span class="form-name">{t('settings.size')}</span>
          <select
            data-testid="opt-size"
            value={opts.size ?? defaultSize}
            onChange={(e) => {
              // The scenario's own size is no option at all: the URL of such a game says nothing of it.
              const v = (e.currentTarget as HTMLSelectElement).value;
              const { size: _old, ...rest } = opts;
              setOpts(v === defaultSize ? rest : { ...rest, size: v });
            }}
          >
            {sizes.map((s) => (
              <option key={s.id} value={s.id}>
                {t(`settings.size.${s.id}` as MessageKey, { w: s.w, h: s.h })}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label class="form-row">
        <span class="form-name">{t('settings.looping')}</span>
        {sel('opt-looping', opts.loopingMap === false ? 'off' : 'on', ['on', 'off'], (v) => `settings.onOff.${v}` as MessageKey, (v) => setOpts({ ...opts, loopingMap: v === 'on' }))}
      </label>
      <label class="form-row">
        <span class="form-name">{t('settings.aggression')}</span>
        {sel('opt-aggression', opts.aggression ?? 'scenario', ['scenario', 'random'], (v) => `settings.choice.${v}` as MessageKey, (v) => setOpts({ ...opts, aggression: v as 'scenario' | 'random' }))}
      </label>
      <label class="form-row">
        <span class="form-name">{t('settings.traits')}</span>
        {sel('opt-traits', opts.traits ?? 'scenario', ['scenario', 'random'], (v) => `settings.choice.${v}` as MessageKey, (v) => setOpts({ ...opts, traits: v as 'scenario' | 'random' }))}
      </label>
      {diplomacy ? (
        <label class="form-row">
          <span class="form-name">{t('settings.diplomacy')}</span>
          {sel('opt-diplomacy', opts.diplomacy ?? 'scenario', ['scenario', 'random'], (v) => `settings.choice.${v}` as MessageKey, (v) => setOpts({ ...opts, diplomacy: v as 'scenario' | 'random' }))}
        </label>
      ) : null}
      {heroes ? (
        <label class="form-row" title={t('settings.heroesHint')}>
          <span class="form-name">{t('settings.heroes')}</span>
          {sel('opt-heroes', opts.heroes === 'on' ? 'on' : 'off', ['off', 'on'], (v) => `settings.onOff.${v}` as MessageKey, (v) => setOpts({ ...opts, heroes: v as 'off' | 'on' }))}
        </label>
      ) : null}
      {/* What the option is, as text (ROADMAP R11, R29-N6): a hover title alone says nothing on a phone. */}
      {heroes ? (
        <p class="form-hint form-note" data-testid="opt-heroes-hint">
          {t('settings.heroesShort')}
        </p>
      ) : null}
      <label class="form-row">
        <span class="form-name">{t('settings.gold')}</span>
        {sel('opt-gold', opts.gold ?? 'scenario', ['scenario', 'random', 'equal'], (v) => `settings.choice.${v}` as MessageKey, (v) => setOpts({ ...opts, gold: v as 'scenario' | 'random' | 'equal' }))}
      </label>
      <label class="form-row">
        <span class="form-name">{t('settings.ce')}</span>
        {sel('opt-ce', opts.ceMode ?? 'scenario', ['scenario', 'dynamic', 'progressive', 'static', 'locked', 'random'], (v) => `settings.ce.${v}` as MessageKey, (v) => setOpts(withCe(opts, v)))}
      </label>
      <button type="button" class="start-btn" data-testid="settings-new-game" disabled={!seedValid || !countValid || blocked !== undefined} title={blocked} onClick={() => onStart(Number(next) >>> 0, chosen())}>
        {startLabel}
      </button>
      {blocked !== undefined ? (
        <p class="panel-note" data-testid="start-blocked">
          {blocked}
        </p>
      ) : null}
    </div>
  );
}
