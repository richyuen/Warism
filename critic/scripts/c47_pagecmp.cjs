// Critic run 47: run 46's page JSONs (c46_<kind>_<tag>.json) beside HEAD's (c47_...): landed hours, panel texts, errors.
const fs = require('fs'); const path = require('path'); const D = path.join(__dirname, '..');
const kinds = /^c47_(se|rc|mk|mk2|mk4|uw|uh|sib|sp|pn|fs|hs|tm|lwt5)_.*\.json$/;
const pick = (j) => {
  if (!j) return null;
  const landed = j.landed ? Object.entries(j.landed).map(([k, v]) => `${k}:${Array.isArray(v) ? v[0] : (v && v.h !== undefined ? v.h : v)}`).join(' ') : '';
  const errs = (j.errors ?? []).filter((e) => /pageerror|error:/.test(e)).length;
  return { landed, errs, fatal: j.fatal ? String(j.fatal).slice(0, 80) : '' };
};
for (const f of fs.readdirSync(D).sort()) {
  if (!kinds.test(f)) continue;
  const read = (n) => { try { return JSON.parse(fs.readFileSync(path.join(D, n), 'utf8')); } catch { return null; } };
  const a = pick(read(f)), b = pick(read(f.replace(/^c47_/, 'c46_')));
  const same = b && a.landed === b.landed;
  console.log(`${f.padEnd(36)} ${same ? 'same' : 'DIFF'}  HEAD[${a.landed}] err ${a.errs} ${a.fatal}  | run46[${b ? b.landed : 'n/a'}] err ${b ? b.errs : '-'}`);
}
