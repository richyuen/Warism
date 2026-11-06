// Critic run 46: per c46_<prefix>*.json, landed hours per id, NextVoyage/LeftLanding counts, and voyage-state hours (ready, gathering, waiting, nextVoyage) per id.
const fs = require('fs'); const path = require('path'); const D = path.join(__dirname, '..');
const re = new RegExp(process.argv[2] ?? '^c46_x_');
const land = (j) => (j.ids ?? Object.keys(j.landed)).map((id) => j.landed[id] ? (Array.isArray(j.landed[id]) ? j.landed[id][0] : j.landed[id].h) : '-').join('/');
for (const f of fs.readdirSync(D).sort()) {
  if (!re.test(f) || !f.endsWith('.json')) continue;
  let j; try { j = JSON.parse(fs.readFileSync(path.join(D, f), 'utf8')); } catch { console.log(f, 'BAD'); continue; }
  if (!j.landed) continue;
  const nv = (j.events ?? []).filter((e) => e.includes('NextVoyage')).map((e) => e.split(' ').slice(0, 3).join(' '));
  const rej = (j.events ?? []).filter((e) => e.includes('MoveRejected')).length;
  const voy = j.voy ? Object.entries(j.voy).map(([id, v]) => `${id}{${Object.entries(v).filter(([k]) => k !== 'none' && k !== 'toPort' && k !== 'atSea').map(([k, n]) => k.slice(0, 4) + n).join(',')}}`).join(' ') : '';
  console.log(`${f.replace(/\.json$/, '').padEnd(36)} ${land(j).padEnd(28)} nv[${nv.join(';')}] rej${rej} ${voy}`);
}
