// Critic run 59 (new): the NextVoyage (and other order-news) events of given divisions in a landingInvariants run.
// Usage: SEED=28037 SETUP=3517 GROUPS=2 ORDERDAYS=8 DIVS=365,366 npx tsx critic/scripts/c59_told.ts
import { landingBreaks } from '../../tests/helpers/landingInvariants';
import { EventKind } from '../../src/shared/events';
const seed = Number(process.env.SEED), divs = new Set((process.env.DIVS ?? '').split(',').map(Number));
const names = new Map(Object.entries(EventKind).map(([k, v]) => [v as number, k]));
const br = landingBreaks({
  seed, setup: Number(process.env.SETUP ?? 3517), days: Number(process.env.DAYS ?? 60), orders: seed, probeDays: [30, 90], groups: Number(process.env.KEEPG ?? 2),
  ...(process.env.ORDERDAYS ? { orderDays: Number(process.env.ORDERDAYS) } : {}), notes: [],
  events: (w, ev) => { for (let i = 0; i < ev.length; i += 6) if (divs.has(ev[i + 2]!)) { const k = names.get(ev[i + 1]!) ?? ev[i + 1]; console.log(`t${w.tick} ${ev[i + 2]} ${k} b=${ev[i + 3]}`); } },
  onHour: (w, click) => { if (click && click.ids.some((id) => divs.has(id))) console.log(`t${w.tick} CLICK ${click.ids.join(',')} -> ${click.x.toFixed(1)},${click.y.toFixed(1)}`); },
});
console.log(`broken ${br.length}`);
console.log('done:');
