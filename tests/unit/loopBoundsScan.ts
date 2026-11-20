import ts from 'typescript';

/**
 * ADR-1143's rule, read from the source (ROADMAP R215): a loop's own bounds and counters are written in the loop's
 * function, never by a closure the loop calls. Found: a `for`, `while` or `do` loop whose condition reads a variable
 * that a function nested in the loop's own function writes (`=`, `+=`, `++`, …), when that nested function is written
 * inside the loop or is called by its name from it. `enemyDistance` before R209 is the case: its search loop,
 * `for (head = 0; head < tail && left > 0; head++)`, called `reach`, which wrote `tail` and `left`.
 */
export interface LoopBoundHit {
  file: string;
  line: number;
  /** The variables of the loop's condition that the closure writes. */
  names: string[];
  /** The closure's name, or '(inline)' for one written in the loop. */
  closure: string;
}

const isFunction = (n: ts.Node): n is ts.FunctionLikeDeclaration => ts.isArrowFunction(n) || ts.isFunctionExpression(n) || ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n) || ts.isConstructorDeclaration(n) || ts.isGetAccessorDeclaration(n) || ts.isSetAccessorDeclaration(n);
const isLoop = (n: ts.Node): n is ts.ForStatement | ts.WhileStatement | ts.DoStatement => ts.isForStatement(n) || ts.isWhileStatement(n) || ts.isDoStatement(n);

/** The function a node is written in (the file for none). */
function ownerOf(n: ts.Node): ts.Node {
  let p = n.parent;
  while (p && !isFunction(p) && !ts.isSourceFile(p)) p = p.parent;
  return p ?? n.getSourceFile();
}

/** The identifiers an expression reads as variables (not a property's name, not an object key). */
function readsOf(e: ts.Node): Set<string> {
  const out = new Set<string>();
  const walk = (n: ts.Node): void => {
    if (isFunction(n)) return;
    if (ts.isIdentifier(n)) {
      const p = n.parent;
      if (ts.isPropertyAccessExpression(p) && p.name === n) return;
      if (ts.isPropertyAssignment(p) && p.name === n) return;
      out.add(n.text);
      return;
    }
    n.forEachChild(walk);
  };
  walk(e);
  return out;
}

/** The names a function declares itself (parameters and its own `let`, `const`, `var`), which hide the outer ones. */
function localsOf(fn: ts.FunctionLikeDeclaration): Set<string> {
  const out = new Set<string>();
  const bind = (b: ts.BindingName): void => {
    if (ts.isIdentifier(b)) out.add(b.text);
    else for (const el of b.elements) if (!ts.isOmittedExpression(el)) bind(el.name);
  };
  for (const p of fn.parameters) bind(p.name);
  const walk = (n: ts.Node): void => {
    if (n !== fn && isFunction(n)) return;
    if (ts.isVariableDeclaration(n)) bind(n.name);
    n.forEachChild(walk);
  };
  if (fn.body) walk(fn.body);
  return out;
}

/** The outer variables a function writes: assigned, or stepped by `++` and `--`; those of the functions inside it too. */
function writesOf(fn: ts.FunctionLikeDeclaration): Set<string> {
  const out = new Set<string>();
  const walk = (n: ts.Node, hidden: ReadonlySet<string>): void => {
    let hide = hidden;
    if (isFunction(n)) hide = new Set([...hidden, ...localsOf(n)]);
    const target = (e: ts.Expression): void => {
      if (ts.isIdentifier(e)) {
        if (!hide.has(e.text)) out.add(e.text);
      } else if (ts.isArrayLiteralExpression(e)) for (const el of e.elements) target(ts.isSpreadElement(el) ? el.expression : el);
      else if (ts.isParenthesizedExpression(e)) target(e.expression);
    };
    if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment) target(n.left);
    if ((ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) && (n.operator === ts.SyntaxKind.PlusPlusToken || n.operator === ts.SyntaxKind.MinusMinusToken)) target(n.operand);
    n.forEachChild((c) => walk(c, hide));
  };
  walk(fn, new Set());
  return out;
}

/** The name a nested function is called by: a `function` declaration's, or the `const` an arrow is given to. */
function nameOf(fn: ts.FunctionLikeDeclaration): string | null {
  if (ts.isFunctionDeclaration(fn) && fn.name) return fn.name.text;
  const p = fn.parent;
  if (ts.isVariableDeclaration(p) && p.initializer === fn && ts.isIdentifier(p.name)) return p.name.text;
  return null;
}

const within = (n: ts.Node, outer: ts.Node): boolean => n.pos >= outer.pos && n.end <= outer.end;

/** The loops of `text` that break the rule. */
export function loopBoundHits(file: string, text: string): LoopBoundHit[] {
  const src = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const hits: LoopBoundHit[] = [];
  const loops: (ts.ForStatement | ts.WhileStatement | ts.DoStatement)[] = [];
  const fns: ts.FunctionLikeDeclaration[] = [];
  const collect = (n: ts.Node): void => {
    if (isLoop(n)) loops.push(n);
    if (isFunction(n)) fns.push(n);
    n.forEachChild(collect);
  };
  collect(src);
  for (const loop of loops) {
    const cond = ts.isForStatement(loop) ? loop.condition : loop.expression;
    if (!cond) continue;
    const reads = readsOf(cond);
    if (reads.size === 0) continue;
    const owner = ownerOf(loop);
    // What the loop's own text names: the closures it can call.
    const named = readsOf(loop.statement);
    for (const n of readsOf(cond)) named.add(n);
    for (const fn of fns) {
      // A function written in the loop's own function, not that function itself, and not one the loop is written in.
      if (fn === owner || !within(fn, owner) || within(loop, fn) || ownerOf(fn) !== owner) continue;
      const inline = within(fn, loop.statement);
      const name = nameOf(fn);
      if (!inline && (name === null || !named.has(name))) continue;
      const names = [...writesOf(fn)].filter((w) => reads.has(w)).sort();
      if (names.length === 0) continue;
      hits.push({ file, line: src.getLineAndCharacterOfPosition(loop.getStart()).line + 1, names, closure: inline ? '(inline)' : name! });
    }
  }
  return hits;
}
