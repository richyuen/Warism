import { t } from './i18n';

export interface TopBarProps {
  /**
   * The played nation (PLAN 7.176a, the user's request): "Playing {name} · {n} selected" in the
   * tagline's place, and a click on it opens its panel. None played: the tagline.
   */
  playing?: { name: string; selected: number; onOpen: () => void } | null;
}

/**
 * Top bar: the title and tagline (PLAN 0.21), or the played nation (PLAN 7.176a). The language
 * picker is gone (the user's request, ADR-763): the release build offers English alone; a
 * tester's pseudo-locale is the stored `warsim.locale` (`src/ui/i18n`).
 */
export function TopBar({ playing }: TopBarProps = {}) {
  return (
    <header class="topbar" data-testid="topbar">
      <span class="topbar-title" data-testid="app-title">
        {t('app.title')}
      </span>
      {playing ? (
        <button type="button" class="topbar-playing" data-testid="player-label" title={t('player.open')} onClick={playing.onOpen}>
          {t('player.playing', { name: playing.name, n: playing.selected })}
        </button>
      ) : (
        <span class="topbar-tagline">{t('app.tagline')}</span>
      )}
    </header>
  );
}
