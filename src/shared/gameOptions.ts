/** New-game options (PLAN 1.39b1; applied by src/sim/gameOptions.ts). */
export interface GameOptions {
  loopingMap?: boolean;
  aggression?: 'scenario' | 'random';
  traits?: 'scenario' | 'random';
  gold?: 'scenario' | 'random' | 'equal';
  /**
   * The alliances, guarantees and wars at the start (PLAN 7.182): the scenario's, or as many drawn
   * by the seed. Puppets stay the scenario's.
   */
  diplomacy?: 'scenario' | 'random';
  /** The random world only (PLAN 2.16): how many nations it starts with. */
  nations?: number;
  ceMode?: 'dynamic' | 'progressive' | 'static' | 'locked' | 'random';
  /** The map's size, an id of its map's `sizes` (PLAN 7.1b6): the scenario's own when not given. */
  size?: string;
}
