/**
 * SPEC.md's references to the code (ROADMAP R6, ADR-821): every backticked file path, code name
 * and `npm run` script a section of SPEC.md cites must exist in the tracked tree, so a rewritten
 * section cannot name what is gone.
 *
 * `npx tsx tools/spec/refs.ts [section…]` prints each section's misses (all sections when none is
 * given). `tests/unit/specRefs.test.ts` holds the sections already rewritten at 0.
 *
 * A backticked span is judged when it is one token:
 * - a path (it has a `/` or ends in a file extension): the tail of a tracked file's or folder's
 *   path, its extension optional, `<x>` and `*` standing for any part (`.cache/` is run output and
 *   not judged);
 * - `npm run <script>`: a script of package.json;
 * - a name (`foo`, `foo()`, `World.cellPoint`, `CONST_NAME`): each dotted part a word of the
 *   code, data or config (not of the documents).
 * Anything else (numbers, formulas, commands, quoted UI text) is not judged.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');

/** Text files of the code, data and config: what a SPEC name may stand for. */
const CODE_EXT = /\.(ts|tsx|js|mjs|json|yml|yaml|html|css|glsl|frag|vert)$/;

export interface Corpus {
  files: string[];
  dirs: Set<string>;
  names: Set<string>;
  words: Set<string>;
  scripts: Set<string>;
}

export function loadCorpus(root = ROOT): Corpus {
  const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 })
    .split('\n')
    .filter((f) => f && !f.startsWith('reference/'));
  const dirs = new Set<string>();
  const names = new Set<string>();
  for (const f of files) {
    names.add(path.posix.basename(f));
    let d = path.posix.dirname(f);
    while (d !== '.' && !dirs.has(d)) {
      dirs.add(d);
      d = path.posix.dirname(d);
    }
  }
  const words = new Set<string>();
  for (const f of files) {
    if (!CODE_EXT.test(f) || f.startsWith('docs/') || f.startsWith('critic/')) continue;
    let text: string;
    try {
      text = readFileSync(path.join(root, f), 'utf8');
    } catch {
      continue; // listed but deleted in the working tree
    }
    for (const m of text.matchAll(/[A-Za-z_$][\w$]*/g)) words.add(m[0]);
  }
  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as { scripts: Record<string, string> };
  return { files, dirs, names, words, scripts: new Set(Object.keys(pkg.scripts)) };
}

const NAME = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*(\(\))?$/;

function pathPattern(p: string): RegExp {
  const esc = p
    .replace(/^\.\//, '')
    .replace(/\/$/, '')
    .split(/(<[^>]*>|\*\*?)/)
    .map((part, i) => (i % 2 ? '[^]*?' : part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')))
    .join('');
  // SPEC names a module by its path's tail (`systems/air.ts`, `shared/protocol`).
  return new RegExp(`^(?:.*/)?${esc}(?:\\.[a-z]+)?$`);
}

/** Why a backticked span is a miss, or null when it holds (or is not judged). */
export function judge(span: string, c: Corpus): string | null {
  const s = span.trim();
  const npm = /^npm run ([\w:-]+)/.exec(s);
  if (npm) return c.scripts.has(npm[1] ?? '') ? null : `no script ${npm[1]}`;
  if (/\s/.test(s) || s.length < 3) return null;
  if (s.includes('/') || /^[\w.<>*-]+\.(ts|tsx|json|md|js|mjs|yml|html|css|wsz|png|bin|gz)$/.test(s)) {
    if (/^https?:/.test(s) || /^[\d./]+$/.test(s) || /[=+(),;]/.test(s)) return null;
    if (s.startsWith('/')) return null; // a URL path of the page (`/bench.html`)
    if (s.startsWith('.cache/')) return null; // run output, not tracked
    if (!s.includes('/')) {
      const re = pathPattern(s);
      for (const n of c.names) if (re.test(n)) return null;
      return 'no file of that name';
    }
    const re = pathPattern(s);
    for (const f of c.files) if (re.test(f)) return null;
    for (const d of c.dirs) if (re.test(d)) return null;
    return 'no such file';
  }
  if (!NAME.test(s)) return null;
  const parts = s.replace(/\(\)$/, '').split('.');
  for (const p of parts) if (!c.words.has(p)) return `no code word ${p}`;
  return null;
}

export interface Miss {
  line: number;
  span: string;
  why: string;
}

/** The sections of SPEC.md by their number ("3", "10"): their first and last line (1-based). */
export function sections(text: string): Map<string, { from: number; to: number }> {
  const lines = text.split('\n');
  const out = new Map<string, { from: number; to: number }>();
  let cur: string | null = null;
  lines.forEach((line, i) => {
    const m = /^## (\d+)\. /.exec(line);
    if (!m?.[1]) return;
    const last = cur === null ? undefined : out.get(cur);
    if (last) last.to = i;
    cur = m[1];
    out.set(cur, { from: i + 1, to: lines.length });
  });
  return out;
}

export function specMisses(section: string, c: Corpus, text = readFileSync(path.join(ROOT, 'SPEC.md'), 'utf8')): Miss[] {
  const sec = sections(text).get(section);
  if (!sec) throw new Error(`SPEC.md has no section ${section}`);
  const lines = text.split('\n');
  const misses: Miss[] = [];
  let fence = false;
  lines.slice(sec.from - 1, sec.to).forEach((line, k) => {
    if (line.startsWith('```')) fence = !fence;
    if (fence) return;
    for (const m of line.matchAll(/`([^`]+)`/g)) {
      const span = m[1] ?? '';
      const why = judge(span, c);
      if (why) misses.push({ line: sec.from + k, span, why });
    }
  });
  return misses;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const c = loadCorpus();
  const text = readFileSync(path.join(ROOT, 'SPEC.md'), 'utf8');
  const want = process.argv.slice(2);
  const secs = want.length ? want : [...sections(text).keys()];
  for (const s of secs) {
    const misses = specMisses(s, c, text);
    process.stdout.write(`§${s}: ${misses.length} misses\n`);
    for (const m of misses) process.stdout.write(`  ${m.line}: \`${m.span}\` — ${m.why}\n`);
  }
}
