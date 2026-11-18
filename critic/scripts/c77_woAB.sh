#!/bin/sh
# Critic run 77: R147's rule (ADR-1126) off on HEAD (--lift-far) on run 76's nine warOpening seeds, three years, to set
# beside HEAD's own runs (c77_warOpening*.json): does R147 make the bare openings on the same seeds?
cd /c/Git/Warism
npx tsx tools/diag/warOpening.ts critic/c77_woFar.json --years 3 --lift-far 58211 58213 58215 > critic/c77_woFar.log 2>&1 &
npx tsx tools/diag/warOpening.ts critic/c77_woFar_56.json --years 3 --lift-far 56211 56213 56215 > critic/c77_woFar_56.log 2>&1 &
npx tsx tools/diag/warOpening.ts critic/c77_woFar_57.json --years 3 --lift-far 57211 57213 57215 > critic/c77_woFar_57.log 2>&1 &
wait
echo done > critic/c77_woAB.done
