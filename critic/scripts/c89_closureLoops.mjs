// Critic run 89 (new): SPEC §2.6's new rule (ADR-1143): "a loop's own bounds and counters are written in the loop's
// function, never by a closure it calls". A coarse read of src/sim and src/worker: every arrow function or inner
// function declared inside a function body that assigns (++, --, +=, -=, =) a variable NOT declared in itself, where
// that variable also stands in the condition of a for or while loop of the enclosing file (within 80 lines after the
// closure). Prints file:line, the closure's name, the variable and the loop's line. A lead list for reading by hand.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
const roots = process.argv.slice(2).length ? process.argv.slice(2) : ['src/sim', 'src/worker'];
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = path.join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith('.ts')) files.push(p); } };
roots.forEach(walk);
let hits = 0;
for (const f of files) {
  const L = readFileSync(f, 'utf8').split('\n');
  for (let i = 0; i < L.length; i++) {
    const m = /^(\s*)(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*[\w<>\[\]| ]+)?\s*=>\s*\{\s*$/.exec(L[i]) ?? /^(\s+)function\s+(\w+)\s*\([^)]*\)[^{]*\{\s*$/.exec(L[i]);
    if (!m || m[1].length < 2) continue; // only closures inside a function
    const ind = m[1];
    let j = i + 1; const body = [];
    while (j < L.length && !(L[j].startsWith(ind + '}') )) body.push(L[j++]);
    const text = body.join('\n');
    const declared = new Set([...text.matchAll(/(?:const|let|var)\s+(\w+)/g)].map((x) => x[1]));
    const written = new Set([...text.matchAll(/(?<![\w.\]])(\w+)\s*(?:\+\+|--|\+=|-=|=(?!=))/g), ...text.matchAll(/(?:\+\+|--)(\w+)/g)].map((x) => x[1]).filter((v) => !declared.has(v)));
    if (!written.size) continue;
    for (let k = j; k < Math.min(L.length, j + 80); k++) {
      const loop = /\b(for|while)\s*\((.*)\)\s*\{?\s*$/.exec(L[k]);
      if (!loop) continue;
      const cond = loop[1] === 'for' ? (loop[2].split(';')[1] ?? '') : loop[2];
      for (const v of written) if (new RegExp('\\b' + v + '\\b').test(cond)) {
        // is the closure called inside that loop's next 60 lines?
        const calls = L.slice(k, k + 60).some((s) => new RegExp('\\b' + m[2] + '\\(').test(s));
        if (calls) { hits++; console.log(`${f.split(path.sep).join('/')}:${i + 1} closure ${m[2]} writes '${v}' | loop at ${k + 1}: ${L[k].trim().slice(0, 110)}`); }
      }
    }
  }
}
console.log(`files ${files.length}, hits ${hits}`);
