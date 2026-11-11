/** The soak's checks on the sweep's way (ADR-959): the constants and the record of one, shared by seed.ts and run.ts. */

/** The world is saved and loaded every this many years. */
export const RELOAD_YEARS = 10;
/** The loaded twin and the world run side by side this many days before their hashes are compared. */
export const TWIN_DAYS = 30;

/** One save and load on the way. */
export interface ReloadCheck {
  year: number;
  tick: number;
  /** The twins' hash after `TWIN_DAYS` days. */
  hash: number;
  ok: boolean;
  failure?: string;
}
