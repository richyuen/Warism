import type { Refusal } from '../shared/commands';
import type { PeaceVerdict } from '../shared/peace';
import { REFUSAL_KEY } from './GodTab';
import { t } from './i18n';
import { displayName } from './NationPanel';
import { peaceWhy, standingText, type Standing } from './standing';

/** The played nation's own items (PLAN 1.33b): shown when the menu acts for it. */
export interface PlayerItems {
  /** At war: whether the enemy would accept peace (PLAN 7.175c); refused, "Offer peace" is greyed out, its title why. */
  peace?: PeaceVerdict | null;
  /** Whether the two are allies: no alliance is proposed. */
  allied: boolean;
  onPeace: (war: number) => void;
  onAlly: () => void;
}

/** God's diplomacy (PLAN 7.175e, the user's request and answers): with God Mode on, for the acting nation. */
export interface GodItems {
  /** Whether the acting nation is allied with this one: Leave alliance is shown. */
  allied: boolean;
  /** At war: whether the acting nation's side fights to the death; null when not at war. */
  toDeath: boolean | null;
  onAlly: () => void;
  onPuppet: () => void;
  onAnnex: () => void;
  onPeace: () => void;
  onToDeath: () => void;
  onLeave: () => void;
}

export interface NationMenuProps {
  /** The nation's name, and its flag's image. */
  name: string;
  flagUrl: string | null;
  /** Where on the page (CSS px): the menu opens beside it, inside the window. */
  x: number;
  y: number;
  /** Its standing with the acting nation (PLAN 7.175b), said under its name; null when no nation acts (God Mode, none played or selected). */
  standing: Standing | null;
  /** The war of the acting nation with this one, if any. */
  war: number | null;
  /** War on it (`forceWar`), when a nation acts and is not at war with it; a bond makes the button "Force war". */
  onWar: (() => void) | null;
  /** The played nation's own items, when the menu acts for it. */
  player: PlayerItems | null;
  /** God's items, with God Mode on and a nation acting. */
  god: GodItems | null;
  /** "Go to country", first (PLAN 7.175f: the menu of an Overview chip): selects it and goes there. */
  onGoTo?: (() => void) | null;
}

/** The menu's width, CSS px, and its height for `items` buttons: it is kept inside the window. */
const MENU_W = 200;
const menuHeight = (items: number): number => 64 + 28 * items;

/** Keeps a box of w × h at (x, y) + 8 inside the window. */
function placed(x: number, y: number, w: number, h: number): { left: string; top: string } {
  const left = Math.max(4, Math.min(x + 8, window.innerWidth - w - 4));
  const top = Math.max(4, Math.min(y + 8, window.innerHeight - h - 4));
  return { left: `${left}px`, top: `${top}px` };
}

/**
 * The menu of a nation opened by a right-click on its ground (`PlayerControl.openMenu`; on a phone
 * the Diplomacy toggle's tap): its standing with the acting nation, war on it (or offer peace in the
 * war with it) and propose an alliance, the Actions tab's commands for that nation; with God Mode
 * on, God's diplomacy too (PLAN 7.175e).
 */
export function NationMenu({ name, flagUrl, x, y, standing, war, onWar, player, god, onGoTo }: NationMenuProps) {
  const btn = (id: string, label: string, onClick: () => void, opts: { disabled?: boolean; title?: string | undefined; active?: boolean; force?: boolean } = {}) => (
    <button type="button" class={opts.active ? 'god-btn active' : 'god-btn'} role="menuitem" data-testid={id} data-force={opts.force === undefined ? undefined : opts.force ? 1 : 0} disabled={opts.disabled} title={opts.title} onClick={onClick}>
      {label}
    </button>
  );
  const items = [
    onGoTo ? btn('nation-menu-goto', t('menu.goTo'), onGoTo) : null,
    war === null && onWar ? btn('nation-menu-war', t(standing?.bond ? 'act.forceWar' : 'god.war'), onWar, { force: standing?.bond ?? false }) : null,
    war !== null && player ? btn('nation-menu-peace', t('act.offerPeace'), () => player.onPeace(war), { disabled: player.peace ? !player.peace.accepted : false, title: player.peace ? peaceWhy(player.peace) || undefined : undefined }) : null,
    player ? btn('nation-menu-ally', t('act.proposeAlliance'), player.onAlly, { disabled: player.allied || war !== null }) : null,
  ].filter((b) => b !== null);
  const godItems = god
    ? [
        btn('nation-menu-god-ally', t('god.ally'), god.onAlly, { disabled: god.allied || war !== null }),
        btn('nation-menu-god-puppet', t('god.puppet'), god.onPuppet),
        btn('nation-menu-god-annex', t('god.annex'), god.onAnnex),
        war !== null ? btn('nation-menu-god-peace', t('god.peace'), god.onPeace) : null,
        war !== null ? btn('nation-menu-god-death', t('god.toDeath'), god.onToDeath, { active: god.toDeath === true }) : null,
        god.allied ? btn('nation-menu-god-leave', t('god.leave'), god.onLeave) : null,
      ].filter((b) => b !== null)
    : [];
  return (
    <div class="nation-menu" data-testid="nation-menu" role="menu" style={placed(x, y, MENU_W, menuHeight(items.length + godItems.length))} onContextMenu={(e) => e.preventDefault()}>
      <div class="nation-menu-title">
        {flagUrl ? <img class="nation-menu-flag" src={flagUrl} alt="" /> : null}
        <span data-testid="nation-menu-name">{displayName(name)}</span>
      </div>
      {standing ? (
        <div class={`nation-menu-standing standing-${standing.kind}`} data-testid="nation-menu-standing" data-standing={standing.kind}>
          {standingText(standing)}
        </div>
      ) : null}
      {items}
      {godItems.length > 0 ? (
        <div class="nation-menu-god" data-testid="nation-menu-god">
          <div class="nation-menu-sub">{t('bar.god')}</div>
          {godItems}
        </div>
      ) : null}
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
