import type { Refusal } from '../shared/commands';
import type { PeaceVerdict } from '../shared/peace';
import { REFUSAL_KEY } from './GodTab';
import { t } from './i18n';
import { displayName } from './NationPanel';
import { peaceWhy, standingText, type Standing } from './standing';

export interface NationMenuProps {
  /** The nation's name, and its flag's image. */
  name: string;
  flagUrl: string | null;
  /** Where on the page (CSS px): the menu opens beside it, inside the window. */
  x: number;
  y: number;
  /** The war of the played nation with this one, if any: peace is offered in it instead of war declared. */
  war: number | null;
  /** Whether the two are allies: no alliance is proposed. */
  allied: boolean;
  /** Its standing with the played nation (PLAN 7.175b): said under its name; a bond makes the war button "Force war". */
  standing: Standing;
  /** At war: whether the enemy would accept peace (PLAN 7.175c); refused, "Offer peace" is greyed out, its title why. */
  peace?: PeaceVerdict | null;
  onWar: () => void;
  onPeace: (war: number) => void;
  onAlly: () => void;
}

/** The menu's width and most height, CSS px: it is kept inside the window. */
const MENU_W = 200;
const MENU_H = 130;

/** Keeps a box of w × h at (x, y) + 8 inside the window. */
function placed(x: number, y: number, w: number, h: number): { left: string; top: string } {
  const left = Math.max(4, Math.min(x + 8, window.innerWidth - w - 4));
  const top = Math.max(4, Math.min(y + 8, window.innerHeight - h - 4));
  return { left: `${left}px`, top: `${top}px` };
}

/**
 * The menu of a nation opened by a right-click on its ground while the player plays another
 * (`PlayerControl.openMenu`): declare war on it (or offer peace in the war with it) and propose
 * an alliance, the Actions tab's commands for that nation.
 */
export function NationMenu({ name, flagUrl, x, y, war, allied, standing, peace, onWar, onPeace, onAlly }: NationMenuProps) {
  return (
    <div class="nation-menu" data-testid="nation-menu" role="menu" style={placed(x, y, MENU_W, MENU_H)} onContextMenu={(e) => e.preventDefault()}>
      <div class="nation-menu-title">
        {flagUrl ? <img class="nation-menu-flag" src={flagUrl} alt="" /> : null}
        <span data-testid="nation-menu-name">{displayName(name)}</span>
      </div>
      <div class={`nation-menu-standing standing-${standing.kind}`} data-testid="nation-menu-standing" data-standing={standing.kind}>
        {standingText(standing)}
      </div>
      {war === null ? (
        <button type="button" class="god-btn" role="menuitem" data-testid="nation-menu-war" data-force={standing.bond ? 1 : 0} onClick={onWar}>
          {t(standing.bond ? 'act.forceWar' : 'god.war')}
        </button>
      ) : (
        <button type="button" class="god-btn" role="menuitem" data-testid="nation-menu-peace" disabled={peace ? !peace.accepted : false} title={peace ? peaceWhy(peace) : undefined} onClick={() => onPeace(war)}>
          {t('act.offerPeace')}
        </button>
      )}
      <button type="button" class="god-btn" role="menuitem" data-testid="nation-menu-ally" disabled={allied || war !== null} onClick={onAlly}>
        {t('act.proposeAlliance')}
      </button>
    </div>
  );
}

/** The words of a refusal of the menu's action, where the menu was. */
export function NationMenuNotice({ name, x, y, reason }: { name: string; x: number; y: number; reason: number }) {
  const key = REFUSAL_KEY[reason as Exclude<Refusal, 0>];
  if (!key) return null;
  return (
    <div class="nation-menu nation-menu-notice" data-testid="nation-menu-notice" role="status" style={placed(x, y, MENU_W, 60)}>
      <div class="nation-menu-title">{displayName(name)}</div>
      <div class="panel-note">{t(key)}</div>
    </div>
  );
}
