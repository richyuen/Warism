import { useEffect, useState } from 'preact/hooks';
import { t } from './i18n';

/** Set by the title screen as a game is started from it; read once by the game's page (ROADMAP R113). */
export const CUE_ASKED = 'warsim.cueAsked';
/** Kept once the cue was closed or the game resumed: it is not shown again. */
export const CUE_SEEN = 'warsim.cueSeen';

/** Marks the game about to open as one started from the title screen (the cue is for those; a link to a game has none). */
export function askCue(): void {
  try {
    if (localStorage.getItem(CUE_SEEN) === null) sessionStorage.setItem(CUE_ASKED, '1');
  } catch {
    // No storage: no cue.
  }
}

function wanted(): boolean {
  try {
    return sessionStorage.getItem(CUE_ASKED) === '1' && localStorage.getItem(CUE_SEEN) === null;
  } catch {
    return false;
  }
}

/**
 * A first cue (ROADMAP R113, ADR-1102): the first game a player starts from the title screen opens paused on a world
 * of counters with nothing to say what can be done. Three lines under the clock, once: closed by its button or by
 * the first Resume, and not shown again. It takes no click but on its button: the map under it is the map.
 */
export function FirstCue({ paused, phone = false }: { paused: boolean; /** A phone's words: tap and pinch, not click and scroll (R156). */ phone?: boolean }) {
  const [shown, setShown] = useState(wanted);
  const close = (): void => {
    setShown(false);
    try {
      localStorage.setItem(CUE_SEEN, '1');
      sessionStorage.removeItem(CUE_ASKED);
    } catch {
      // No storage: gone for this page.
    }
  };
  // The game resumed: the player has found the clock.
  useEffect(() => {
    if (shown && !paused) close();
  }, [paused, shown]);
  if (!shown) return null;
  return (
    <aside class="first-cue" data-testid="first-cue" role="note">
      <ul>
        <li>{t('cue.resume')}</li>
        <li>{t(phone ? 'cue.nation.touch' : 'cue.nation')}</li>
        <li>{t(phone ? 'cue.zoom.touch' : 'cue.zoom')}</li>
      </ul>
      <button type="button" class="first-cue-close" data-testid="first-cue-close" title={t('cue.close')} onClick={close}>
        {t('cue.gotIt')}
      </button>
    </aside>
  );
}
