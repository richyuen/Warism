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
  /**
   * Heroes (PLAN 7.184): on, each of seven great powers of 1938 starts with a named land and sea
   * unit much stronger than any other. The 1938 world only.
   */
  heroes?: 'off' | 'on';
  /** The random world only (PLAN 2.16): how many nations it starts with. */
  nations?: number;
  ceMode?: 'dynamic' | 'progressive' | 'static' | 'locked' | 'random';
  /** The map's size, an id of its map's `sizes` (PLAN 7.1b6): the scenario's own when not given. */
  size?: string;
  /**
   * The historical track's second seed (ROADMAP R62d, SPEC §7.7): every stream is derived again from it when the track
   * ends, so the world after it differs from game to game. Rolled by the new-game form; 0 or absent: none.
   */
  after?: number;
}
