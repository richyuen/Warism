#!/bin/bash
# Critic run 86: the rule checkers on new seeds (ADR-917: three five-year seeds a checker for each dimension scored afresh:
# mapVisuals, diplomacyWarDepth, uiUxPolish, performance). Four at a time, before the performance chain starts.
cd /c/Git/Warism
D=1826
(npx tsx tools/diag/diploInvariants.ts 86001 1938 $D > critic/c86_diploinv_86001.log 2>&1; echo "dipl 86001 $?") &
(npx tsx tools/diag/diploInvariants.ts 86003 random $D > critic/c86_diploinv_86003r.log 2>&1; echo "dipl 86003r $?") &
(npx tsx tools/diag/worldInvariants.ts 86051 $D > critic/c86_wi_86051.log 2>&1; echo "wi 86051 $?") &
(npx tsx tools/diag/worldInvariants.ts 86053 $D --heroes > critic/c86_wi_86053h.log 2>&1; echo "wi 86053h $?") &
wait
(npx tsx tools/diag/diploInvariants.ts 86005 1938 $D --heroes > critic/c86_diploinv_86005h.log 2>&1; echo "dipl 86005h $?") &
(npx tsx tools/diag/worldInvariants.ts 86055 $D --world random > critic/c86_wi_86055w.log 2>&1; echo "wi 86055w $?") &
wait
echo done > critic/c86_checkers.done
