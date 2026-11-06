// Critic run 47 (copy of run 46): each c47_<case>.json (HEAD 4040cad6) beside run 45's c45_<case>.json (7e09b7b3); with ARM=wt: beside c47_<p>wt_ and c47_<p>wt2_ (813eb375). Landed hours per id.
const fs = require('fs'); const path = require('path'); const D = path.join(__dirname, '..');
const re = new RegExp(process.argv[2] ?? '.');
const land = (f) => { try { const j = JSON.parse(fs.readFileSync(path.join(D, f), 'utf8')); if (!j.landed) return null; const ids = j.ids ?? Object.keys(j.landed); return ids.map((id) => j.landed[id] ? (Array.isArray(j.landed[id]) ? j.landed[id][0] : j.landed[id].h) : '-').join('/'); } catch { return null; } };
for (const f of fs.readdirSync(D).sort()) {
  if (!/^c47_.*\.json$/.test(f) || /^c47_[gx]wt/.test(f) || !re.test(f)) continue;
  const head = land(f); if (head === null) continue;
  let a, b;
  if (process.env.ARM === 'wt') { const m = f.match(/^c47_([gx])_(.*)$/); if (!m) continue; a = land(`c47_${m[1]}wt_${m[2]}`); b = land(`c47_${m[1]}wt2_${m[2]}`); }
  else a = land(f.replace(/^c47_/, 'c45_'));
  console.log(`${f.replace(/\.json$/, '').padEnd(40)} HEAD ${String(head).padEnd(24)} ${process.env.ARM ? '7e09b7b3' : 'run45'} ${String(a ?? 'n/a').padEnd(24)}${b !== undefined ? ` 813eb375 ${b ?? 'n/a'}` : ''}${a && a !== head ? '  *' : ''}`);
}
