# Critic run 75: one-time patch of c75_massTold.ts (the copy of run 74's) to read MassingCalledOff (R129).
import io
p = 'critic/scripts/c75_massTold.ts'
s = io.open(p, encoding='utf-8', newline='').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, a
    s = s.replace(a, b)
rep("let nTold = 0, nDecl = 0, nGiven = 0, nTwice = 0, declAll = 0, declNoMass = 0;",
    "let nTold = 0, nDecl = 0, nGiven = 0, nTwice = 0, declAll = 0, declNoMass = 0, nOff = 0, nOffOrphan = 0, nOffWar = 0, nOffNaN = 0, nSilent = 0, nRetold = 0;\n  /** Run 75 (R129): the day a pair's massing was last called off. */\n  const lastOff = new Map<number, number>();")
rep("    const declToday: [number, number][] = [];\n",
    "    const declToday: [number, number][] = [];\n    const offToday: [number, number, number][] = [];\n")
rep("        else if (ev[i + 1] === EventKind.WarDeclared) declToday.push([ev[i + 2]!, ev[i + 3]!]);\n",
    "        else if (ev[i + 1] === EventKind.WarDeclared) declToday.push([ev[i + 2]!, ev[i + 3]!]);\n        else if (ev[i + 1] === EventKind.MassingCalledOff) offToday.push([ev[i + 2]!, ev[i + 3]!, ev[i + 4]!]);\n")
rep("      told.set(a, { t: b, day: d });\n    }\n",
    "      told.set(a, { t: b, day: d });\n      const lo = lastOff.get(a * 65536 + b);\n      if (lo !== undefined) { nRetold++; rows.push(`d${d} ${tag(a)}>${tag(b)} TOLD AGAIN ${d - lo} days after it was called off`); }\n    }\n")
rep("    // Massings that ended today with no declaration: given up.\n    for (const [a, m] of [...told]) {\n      if (!w.massing.has(a) || w.massing.get(a)!.target !== m.t) { nGiven++; told.delete(a); rows.push(`d${m.day} ${tag(a)}>${tag(m.t)} told, GIVEN UP d${d} (+${d - m.day}), no row of it`); }\n    }\n",
    "    // Run 75 (R129): the rows that call a massing off.\n    const offSet = new Set(offToday.map(([a, b]) => a * 65536 + b));\n    for (const [a, b, x] of offToday) {\n      nOff++;\n      lastOff.set(a * 65536 + b, d);\n      if (Number.isNaN(x)) { nOffNaN++; rows.push(`d${d} ${tag(a)}>${tag(b)} called off with no place (NaN)`); }\n      if (w.wars.atWar(a, b)) { nOffWar++; rows.push(`d${d} ${tag(a)}>${tag(b)} CALLED OFF BUT AT WAR at the day's end`); }\n      const m = told.get(a);\n      if (!m || m.t !== b) { nOffOrphan++; rows.push(`d${d} ${tag(a)}>${tag(b)} CALLED OFF with no row told in course (declared today: ${declToday.some(([p, q]) => p === a && q === b)})`); }\n    }\n    // Massings that ended today with no declaration: given up.\n    for (const [a, m] of [...told]) {\n      if (!w.massing.has(a) || w.massing.get(a)!.target !== m.t) {\n        nGiven++; told.delete(a);\n        const off = offSet.has(a * 65536 + m.t);\n        if (!off) nSilent++;\n        rows.push(`d${m.day} ${tag(a)}>${tag(m.t)} told, GIVEN UP d${d} (+${d - m.day}), ${off ? 'called off in a row' : `no row of it (at war with it: ${w.wars.atWar(a, m.t)}; living ${w.nations.cols.living[a]},${w.nations.cols.living[m.t]}; massing again: ${w.massing.has(a)})`}`);\n      }\n    }\n")
rep("twice ${nTwice}; wars declared", "twice ${nTwice}; called off ${nOff} (no place ${nOffNaN}, at war ${nOffWar}, orphan ${nOffOrphan}), given up in silence ${nSilent}, told again after a call-off ${nRetold}; wars declared")
rep("T += nTold; Tdecl += nDecl; Tgiven += nGiven; Topen += open; Ttwice += nTwice;", "T += nTold; Tdecl += nDecl; Tgiven += nGiven; Topen += open; Ttwice += nTwice; Toff += nOff; Tsilent += nSilent; Tretold += nRetold; TnoPlace += nOffNaN; Torphan += nOffOrphan; ToffWar += nOffWar;")
rep("let T = 0, Tdecl = 0, Tgiven = 0, Topen = 0, Ttwice = 0;", "let T = 0, Tdecl = 0, Tgiven = 0, Topen = 0, Ttwice = 0, Toff = 0, Tsilent = 0, Tretold = 0, TnoPlace = 0, Torphan = 0, ToffWar = 0;")
rep(r"given up ${Tgiven}, open ${Topen}, twice ${Ttwice}\n", r"given up ${Tgiven}, open ${Topen}, twice ${Ttwice}; called off ${Toff} (no place ${TnoPlace}, at war ${ToffWar}, orphan ${Torphan}), given up in silence ${Tsilent}, told again after a call-off ${Tretold}\n")
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('ok')
