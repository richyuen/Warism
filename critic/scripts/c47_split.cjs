// Critic run 47 (copy of run 46): for c47_<arm>_*.json of the grid, the spread of landed hours among the one-click group (the 'who' of the first order) and whether any of it never landed; flags spread > 24 h.
const fs = require('fs'); const path = require('path'); const D = path.join(__dirname, '..');
const re = new RegExp(process.argv[2]);
let n = 0, bad = 0;
for (const f of fs.readdirSync(D).sort()) {
  if (!re.test(f) || !f.endsWith('.json')) continue;
  let j; try { j = JSON.parse(fs.readFileSync(path.join(D, f), 'utf8')); } catch { continue; }
  if (!j.landed || !j.orders?.length) continue;
  n++;
  const who = j.orders[0].who.map((i) => j.ids[i]);
  const hs = who.map((id) => j.landed[id] ? (Array.isArray(j.landed[id]) ? j.landed[id][0] : j.landed[id].h) : null);
  const got = hs.filter((h) => h !== null);
  const spread = got.length ? Math.max(...got) - Math.min(...got) : 0;
  const miss = hs.some((h) => h === null);
  if (spread > 24 || (miss && got.length)) { bad++; console.log('SPLIT', f, hs.join('/')); }
}
console.log(`${n} cases, ${bad} split`);
