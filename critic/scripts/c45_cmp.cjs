// Critic run 45: each c45_<case>.json of the landing probes beside run 44's c44_<case>.json (0fba90d8) and, for sx, c44_sxwt (813eb375);
// and each c45_n_<case> beside c45_nwt_<case> (0fba90d8). Prints landed hours per id and the spread of each one-click group.
// Usage: node critic/scripts/c45_cmp.cjs <prefix regex>
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, '..');
const re = new RegExp(process.argv[2] ?? '.');
const land = (f) => { try { const j = JSON.parse(fs.readFileSync(path.join(D, f), 'utf8')); if (!j.landed) return null; const ids = j.ids ?? Object.keys(j.landed); return ids.map((id) => j.landed[id] ? (Array.isArray(j.landed[id]) ? j.landed[id][0] : j.landed[id].h) : '-').join('/'); } catch { return null; } };
const rows = [];
for (const f of fs.readdirSync(D).sort()) {
  if (!/^c45_.*\.json$/.test(f) || f.startsWith('c45_nwt_') || !re.test(f)) continue;
  const head = land(f);
  if (head === null) continue;
  let prev, older;
  if (f.startsWith('c45_n_')) prev = land(f.replace('c45_n_', 'c45_nwt_'));
  else { prev = land(f.replace('c45_', 'c44_')); if (f.startsWith('c45_sx_')) older = land(f.replace('c45_sx_', 'c44_sxwt_')); }
  rows.push(`${f.replace(/\.json$/, '').padEnd(40)} HEAD ${String(head).padEnd(26)} 0fba90d8 ${String(prev ?? 'n/a').padEnd(26)}${older ? ` 813eb375 ${older}` : ''}${prev && prev !== head ? '  *' : ''}`);
}
console.log(rows.join('\n'));
