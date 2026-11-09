// Critic run 56: the landings bar's row data (`landingRows`, what the worker sends the bar) for division DIV's nation at
// hours AT (comma list) of a landingInvariants case. Usage: SEED=24033 DIV=367 AT=1850,2100,2400,2800 npx tsx critic/scripts/c59_rows.ts
import { landingBreaks } from '../../tests/helpers/landingInvariants';
import { landingRows } from '../../src/sim/systems/landings';
const seed = Number(process.env.SEED ?? 24033);
const div = Number(process.env.DIV ?? 367);
const at = (process.env.AT ?? '1850,2100,2400,2800').split(',').map(Number);
landingBreaks({
  seed, setup: Number(process.env.SETUP ?? 3517), days: Math.ceil(Math.max(...at) / 24) + 1, orders: Number(process.env.ORDERS ?? seed), probeDays: [30, 90], groups: Number(process.env.GROUPS ?? 2),
  onHour: (w) => {
    if (!at.includes(w.tick)) return;
    const c = w.formations.cols;
    const rows = landingRows(w, c.nation[div]!);
    console.log(`t${w.tick} ${JSON.stringify(rows, (k, v) => (v instanceof Map ? [...v] : typeof v === 'number' && !Number.isFinite(v) ? String(v) : v))}`);
    console.log(`   div ${div} order: ${JSON.stringify(w.playerOrders.get(div) ?? null)} moving ${c.moving[div]} at ${c.x[div]!.toFixed(1)},${c.y[div]!.toFixed(1)}`);
  },
});
console.log('done:');
