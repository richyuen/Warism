#!/bin/sh
# Critic run 78: R77-N3's case again (sim unchanged: HEAD's 57 set, which should repeat run 77's 14 of 88), and ADR-1130's
# claim on three new seeds of mine (66211, 66213, 66215): HEAD and R147 off (--lift-far), three years each.
cd /c/Git/Warism
npx tsx tools/diag/warOpening.ts critic/c78_wo_57.json --years 3 57211 57213 57215 > critic/c78_wo_57.log 2>&1 &
npx tsx tools/diag/warOpening.ts critic/c78_wo_66.json --years 3 66211 66213 66215 > critic/c78_wo_66.log 2>&1 &
npx tsx tools/diag/warOpening.ts critic/c78_woFar_66.json --years 3 --lift-far 66211 66213 66215 > critic/c78_woFar_66.log 2>&1 &
wait
node critic/scripts/c77_woCount.mjs critic/c78_wo_57.json critic/c78_wo_66.json critic/c78_woFar_66.json > critic/c78_woCount.log 2>&1
echo done > critic/c78_woAB.done
