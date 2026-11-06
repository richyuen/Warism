// Critic run 47: each c47_<case>.json (HEAD f464db35) beside run 46's c46_<case>.json (4040cad6): landed hours per id.
const fs = require('fs'); const path = require('path'); const D = path.join(__dirname, '..');
const re = new RegExp(process.argv[2] ?? '.');
const land = (f) => { try { const j = JSON.parse(fs.readFileSync(path.join(D, f), 'utf8')); if (!j.landed) return null; const ids = j.ids ?? Object.keys(j.landed); return ids.map((id) => j.landed[id] ? (Array.isArray(j.landed[id]) ? j.landed[id][0] : (j.landed[id].h ?? j.landed[id])) : '-').join('/'); } catch { return null; } };
let same = 0, diff = 0, missing = 0;
for (const f of fs.readdirSync(D).sort()) {
  if (!/^c47_.*\.json$/.test(f) || !re.test(f) || /^c47_(far|sunk|lost|li|q)_/.test(f)) continue;
  const head = land(f); if (head === null) continue;
  const a = land(f.replace(/^c47_/, 'c46_'));
  if (a === null) { missing++; console.log(`${f.padEnd(44)} HEAD ${head}  run46 n/a`); continue; }
  if (a === head) same++; else { diff++; console.log(`${f.replace(/\.json$/, '').padEnd(44)} HEAD ${String(head).padEnd(26)} run46 ${a}  *`); }
}
console.log(`same ${same}, different ${diff}, no run-46 file ${missing}`);
