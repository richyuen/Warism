import { useState } from 'preact/hooks';
import { daysWith, priceWith } from '../shared/traits';
import type { Command } from '../shared/commands';
import type { NationStat, PlayerWing, TemplateInfo, WarStat } from '../shared/protocol';
import { t, type MessageKey } from './i18n';
import { displayName } from './NationPanel';
import { peaceVerdict } from '../shared/peace';
import { allyWhy, peaceWhy, standingOf, standingText } from './standing';
import { UnitIcon } from './UnitIcon';

export interface ActionsTabProps {
  nation: NationStat;
  nations: NationStat[];
  wars: WarStat[];
  templates: TemplateInfo[];
  /** Current day (ticks / 24), for "ready in N days". */
  day: number;
  onCommand: (cmd: Command) => void;
  /** Its air wings (PLAN 5.8v1), the order armed for the next map click, and the arming of one. */
  wings: PlayerWing[];
  wingOrder: { wing: number; kind: WingOrderKind } | null;
  onArmWing: (wing: number, kind: WingOrderKind) => void;
  /** The wing selected by its name, which the camera follows (ADR-766), and the selecting of one. */
  followedWing?: number | null;
  onFollowWing?: (wing: number) => void;
  /** The formations selected (PLAN 5.8v2), whether their paradrop is armed, and the arming of it. */
  selected: number;
  dropArmed: boolean;
  onArmDrop: () => void;
  /** The AI assist (ADR-759): the mask of the AI's layers that act for this nation, and its change. */
  assist?: { layers: number; onChange: (layers: number) => void } | null;
}

/** The AI assist's boxes (ADR-759), in the order shown, with their bits (`AiLayer` of the sim). */
const ASSIST: readonly { key: 'army' | 'navy' | 'air' | 'diplomacy' | 'economy' | 'nukes'; bit: number }[] = [
  { key: 'army', bit: 1 },
  { key: 'navy', bit: 2 },
  { key: 'air', bit: 4 },
  { key: 'diplomacy', bit: 8 },
  { key: 'economy', bit: 16 },
  { key: 'nukes', bit: 32 },
];

/** A wing's order at a place (PLAN 5.8v1); `WingOrder` of the page's player control. */
export type WingOrderKind = 'patrol' | 'strike' | 'supply' | 'rebase';

const num = (v: number): string => Math.round(v).toLocaleString('en-US');

/**
 * Actions of the nation the player controls (PLAN 1.33b): diplomacy that the other side may
 * refuse (declare war, offer peace per war, propose an alliance); production is the Build tab's (`BuildTab`,
 * ROADMAP R53h). Its air wings (PLAN 5.8v1):
 * each with its base and mission, and its orders, armed by a button and given by the next click
 * on the map (patrol, strike, supply for a transport, rebase); and a paradrop of the formations
 * selected, the same way (PLAN 5.8v2).
 */
/** Where a wing is (PLAN 7.170): at sea on its way to a new base, at its airbase, or on its carrier's fleet. */
function wingWhere(wg: PlayerWing, templates: readonly { nameKey: string }[]): string {
  if (wg.ferryDays > 0) return t('act.wingFerry', { n: wg.ferryDays });
  if (wg.carrier) return wg.fleet !== 0 ? t('act.wingOn', { fleet: t('formation.name', { kind: t((templates[wg.fleetTemplate]?.nameKey ?? 'template.carrier_group') as MessageKey), n: wg.fleet }) }) : t('act.wingCarrier');
  return wg.base !== '' ? t('act.wingAt', { base: wg.base }) : t('act.wingAirbase');
}

export function ActionsTab({ nation, nations, wars, templates, onCommand, wings, wingOrder, onArmWing, followedWing, onFollowWing, selected, dropArmed, onArmDrop, assist }: ActionsTabProps) {
  const n = nation.id;
  const others = nations.filter((o) => o.id !== n).sort((a, b) => displayName(a.name).localeCompare(displayName(b.name)));
  const [target, setTarget] = useState(0);
  // No nation until one is chosen (PLAN 7.164): the list opened on the first by name, one click from war.
  const tgt = target !== 0 && others.some((o) => o.id === target) ? target : 0;
  const myWars = wars.filter((w) => w.attackers.includes(n) || w.defenders.includes(n));
  // The chosen nation's standing with this one (PLAN 7.175b): a bond makes the war "Force war".
  const byId = new Map([nation, ...nations].map((o) => [o.id, o]));
  const standing = tgt !== 0 ? standingOf(n, tgt, (id) => byId.get(id), wars) : null;
  // Why an alliance proposal would be turned down (PLAN 7.192): greyed, the reason its title.
  const allyNo = tgt !== 0 ? allyWhy(n, tgt, (id) => byId.get(id)) : '';
  const nameOf = (id: number): string => {
    const o = nations.find((x) => x.id === id);
    return o ? displayName(o.name) : `#${id}`;
  };
  return (
    <section class="god-tab actions-tab" data-testid="panel-actions">
      {assist ? (
        <>
          <div class="panel-sub" title={t('act.assistHint')}>
            {t('act.assist')}
          </div>
          <div class="act-assist" data-testid="act-assist" title={t('act.assistHint')}>
            {ASSIST.map(({ key, bit }) => (
              <label key={key} class="act-assist-box">
                <input type="checkbox" data-testid={`act-assist-${key}`} checked={(assist.layers & bit) !== 0} onChange={(e) => assist.onChange((e.currentTarget as HTMLInputElement).checked ? assist.layers | bit : assist.layers & ~bit)} />
                {t(`act.assist.${key}` as MessageKey)}
              </label>
            ))}
          </div>
        </>
      ) : null}
      <div class="panel-sub">{t('god.diplomacy')}</div>
      <div class="god-row">
        <select data-testid="act-target" value={tgt} onChange={(e) => setTarget(Number((e.currentTarget as HTMLSelectElement).value))}>
          <option value={0} disabled>
            {t('act.chooseNation')}
          </option>
          {others.map((o) => (
            <option key={o.id} value={o.id}>
              {displayName(o.name)}
            </option>
          ))}
        </select>
      </div>
      {standing ? (
        <div class={`panel-note standing-${standing.kind}`} data-testid="act-standing" data-standing={standing.kind}>
          {standingText(standing)}
        </div>
      ) : null}
      <div class="god-row">
        <button type="button" class="god-btn" data-testid="act-war" data-force={standing?.bond ? 1 : 0} disabled={tgt === 0 || standing?.kind === 'war' || standing?.kind === 'beside'} title={standing?.kind === 'beside' ? t('refusal.beside') : undefined} onClick={() => onCommand({ kind: 'forceWar', attacker: n, defender: tgt })}>
          {t(standing?.bond ? 'act.forceWar' : 'god.war')}
        </button>
        <button type="button" class="god-btn" data-testid="act-ally" disabled={tgt === 0 || standing?.kind === 'war' || allyNo !== ''} title={allyNo || undefined} onClick={() => onCommand({ kind: 'proposeAlliance', from: n, to: tgt })}>
          {t('act.proposeAlliance')}
        </button>
      </div>
      {myWars.map((w) => {
        const mine = w.attackers.includes(n) ? w.score : -w.score;
        // As the right-click menu's (ROADMAP R56d; critic run 57, R57-N2: pressed at +0, nothing happened and nothing
        // was said): greyed while the enemy would refuse, the reason in its title (`peaceVerdict`, one rule with the sim).
        const verdict = peaceVerdict(w.score, w.exhaustion, w.toDeath, w.attackers.includes(n) ? 0 : 1);
        return (
          <div key={w.id}>
            <div class="god-row">
              <span class="god-war-name">
                {nameOf(w.attackers[0] ?? 0)} {'⚔'} {nameOf(w.defenders[0] ?? 0)} ({mine >= 0 ? '+' : ''}
                {Math.round(mine)})
              </span>
              <button type="button" class="god-btn" data-testid={`act-peace-${w.id}`} disabled={!verdict.accepted} title={peaceWhy(verdict) || undefined} onClick={() => onCommand({ kind: 'offerPeace', war: w.id, from: n })}>
                {t('act.offerPeace')}
              </button>
            </div>
            {/* The reason in a line under the row, read on a phone too: a touch shows no title (ROADMAP R57d; critic run 58, R58-N3). */}
            {verdict.accepted ? null : (
              <div class="panel-note act-why" data-testid={`act-why-peace-${w.id}`}>
                {peaceWhy(verdict)}
              </div>
            )}
          </div>
        );
      })}

      {wings.length > 0 ? (
        <>
          <div class="panel-sub">{t('act.air')}</div>
          {wingOrder || dropArmed ? (
            <div class="panel-note" data-testid="act-wing-armed">
              {t('act.wingArmed', { order: wingOrder ? t(`act.wingOrder.${wingOrder.kind}` as MessageKey) : t('act.dropOrder', { n: selected }) })}
            </div>
          ) : null}
          {wings.some((wg) => wg.transport) ? (
            <div class="god-row">
              <span class="god-war-name">{t('act.drop', { n: selected })}</span>
              <button type="button" class={dropArmed ? 'god-btn active' : 'god-btn'} data-testid="act-drop" disabled={selected === 0} title={t('act.dropHint')} onClick={onArmDrop}>
                {t('act.dropButton')}
              </button>
            </div>
          ) : null}
          {wings.map((wg) => (
            <div class={followedWing === wg.id ? 'god-row act-wing followed' : 'god-row act-wing'} key={wg.id} data-testid={`act-wing-${wg.id}`}>
              <UnitIcon
                template={templates[wg.template]}
                onClick={() => onFollowWing?.(wg.id)}
                pressed={followedWing === wg.id}
                label={t('act.wingFollowHint')}
                testId={`act-wing-${wg.id}-icon`}
              />
              {/* Two lines (PLAN 7.170): its name, as a division's ("Fighter group 412"), and where it is;
                  then its mission beside its orders. */}
              <div class="act-wing-body">
                <span
                  class="act-wing-name"
                  role="button"
                  tabIndex={0}
                  aria-pressed={followedWing === wg.id}
                  data-testid={`act-wing-${wg.id}-name`}
                  title={t('act.wingFollowHint')}
                  onClick={() => onFollowWing?.(wg.id)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    onFollowWing?.(wg.id);
                  }}
                >
                  {/* Short of room, the kind gives way ("Tactical bomber gr…"; its icon shows it): the number
                      and the place tell the rows apart. */}
                  <span class="act-wing-kind">{t((templates[wg.template]?.nameKey ?? 'template.fighter_group') as MessageKey)}</span>
                  <span class="act-wing-tail" data-testid={`act-wing-${wg.id}-tail`}>
                    {`\u00a0${wg.id}`}
                    <span class="act-cost" data-testid={`act-wing-${wg.id}-where`}>
                      {' · '}
                      {wingWhere(wg, templates)}
                    </span>
                  </span>
                </span>
                <div class="act-wing-orders">
                  <span class="act-cost act-wing-mission">
                    {t(`act.mission.${wg.mission ?? 'none'}` as MessageKey)}
                    {wg.flying ? ` · ${t('act.wingFlying')}` : ''}
                  </span>
                  {(['patrol', 'strike', 'supply', 'rebase'] as const)
                    .filter((k) => k === 'rebase' || (wg.transport ? k === 'supply' : k !== 'supply'))
                    .map((k) => (
                      <button
                        type="button"
                        key={k}
                        class={wingOrder && wingOrder.wing === wg.id && wingOrder.kind === k ? 'god-btn active' : 'god-btn'}
                        data-testid={`act-wing-${wg.id}-${k}`}
                        // At sea it takes no order until it is at its new base (PLAN 7.142, `orderFerry`).
                        disabled={wg.ferryDays > 0}
                        title={t(`act.wingOrder.${k}` as MessageKey)}
                        onClick={() => onArmWing(wg.id, k)}
                      >
                        {t(`act.wingButton.${k}` as MessageKey)}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </>
      ) : null}

    </section>
  );
}

/** The kinds of the Build tab (ROADMAP R53h), in the order shown: the land's by its marker's symbol, then the sea's and the air's. */
export const BUILD_KINDS = ['infantry', 'armour', 'sea', 'air'] as const;
export type BuildKind = (typeof BUILD_KINDS)[number];

/** A template's kind in the Build tab: armour and motorised are Armour, the land's others Infantry. */
export function buildKind(tp: Pick<TemplateInfo, 'domain' | 'symbol'>): BuildKind {
  if (tp.domain === 1) return 'sea';
  if (tp.domain === 2) return 'air';
  return tp.symbol === 'armour' || tp.symbol === 'motorised' ? 'armour' : 'infantry';
}

export interface BuildTabProps {
  nation: NationStat;
  templates: TemplateInfo[];
  day: number;
  onCommand: (cmd: Command) => void;
}

/**
 * The played nation's production (ROADMAP R53h; PLAN 1.33b): its templates by kind (Infantry, Armour, Navy, Air), each a
 * tile that builds it, with its price and days or why it cannot; then the training queue. A kind's tiles fit the panel
 * on a phone (critic run 54: in the Actions tab 16 of its Build buttons were below the screen).
 */
export function BuildTab({ nation, templates, day, onCommand }: BuildTabProps) {
  const n = nation.id;
  const [kind, setKind] = useState<BuildKind>('infantry');
  const count = (k: BuildKind): number => templates.filter((tp) => !tp.hero && buildKind(tp) === k).length;
  return (
    <section class="god-tab" data-testid="panel-build">
      <div class="build-kinds" role="group" aria-label={t('act.production')}>
        {BUILD_KINDS.map((k) => (
          <button type="button" key={k} class={kind === k ? 'build-kind active' : 'build-kind'} aria-pressed={kind === k} data-testid={`build-kind-${k}`} onClick={() => setKind(k)}>
            {t(`build.kind.${k}` as MessageKey)}
            <span class="build-kind-n">{count(k)}</span>
          </button>
        ))}
      </div>
      <div class="build-grid" data-testid="build-grid">
        {templates.map((tp, i) => {
          // Every template of the kind but a hero's (PLAN 7.184). `i` stays the template's index.
          if (tp.hero || buildKind(tp) !== kind) return null;
          // Its own price and days (ROADMAP R16b): industry and build speed of its traits.
          const gold = priceWith(nation.traits, tp.gold);
          const days = daysWith(nation.traits, tp.days);
          const affordable = nation.gold >= gold && nation.manpower >= tp.manpower;
          // The sim refuses a template whose techs the nation does not know (PLAN 3.1a), a fleet of a
          // nation with no port (PLAN 4.2e), and a wing of one with no airbase with room for it (PLAN 5.8s1).
          const known = (nation.techs[0] & tp.techs[0]) >>> 0 === tp.techs[0] && (nation.techs[1] & tp.techs[1]) >>> 0 === tp.techs[1];
          const port = tp.domain === 0 || (tp.domain === 1 ? nation.shipyard : nation.airRoom >= tp.aircraft);
          const name = t(tp.nameKey as MessageKey);
          return (
            <button
              type="button"
              key={i}
              class="build-tile"
              data-testid={`act-build-${i}`}
              disabled={!affordable || !known || !port}
              title={`${t('act.build')}: ${name} · ${t('act.templateInfo', { men: num(tp.men), gold: num(gold), manpower: num(tp.manpower), days })}`}
              onClick={() => onCommand({ kind: 'queueFormation', nation: n, template: i })}
            >
              <UnitIcon template={tp} />
              <span class="build-tile-text">
                <span class="build-tile-name">{name}</span>
                <span class="act-cost">{!known ? t('act.needsResearch') : !port ? t(tp.domain === 1 ? 'act.needsPort' : 'act.needsAirfield') : t('act.cost', { gold: num(gold), days })}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div class="panel-sub">{t('act.queue')}</div>
      {nation.queue.length === 0 ? (
        <div class="panel-note">{t('act.queueEmpty')}</div>
      ) : (
        <ul class="act-queue" data-testid="act-queue">
          {nation.queue.map((q, i) => (
            <li key={i} data-testid="act-queue-row">
              <UnitIcon template={templates[q.template]} />
              {t((templates[q.template]?.nameKey ?? 'template.infantry_div') as MessageKey)} · {t('act.readyIn', { n: Math.max(0, q.readyDay - day) })}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
