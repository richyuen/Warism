#!/bin/bash
# Critic run 86: the second set of rule checkers on new seeds (ADR-917: three five-year seeds a checker for each dimension scored afresh:
# mapVisuals, diplomacyWarDepth, uiUxPolish, performance). Four at a time, before the performance chain starts.
cd /c/Git/Warism
D=1826
(npx tsx tools/diag/diploInvariants.ts 86007 1938 $D > critic/c86_diploinv_86007.log 2>&1; echo "dipl 86007 $?") &
(npx tsx tools/diag/diploInvariants.ts 86009 random $D > critic/c86_diploinv_86009r.log 2>&1; echo "dipl 86009r $?") &
(npx tsx tools/diag/worldInvariants.ts 86057 $D > critic/c86_wi_86057.log 2>&1; echo "wi 86057 $?") &
(npx tsx tools/diag/worldInvariants.ts 86059 $D --heroes > critic/c86_wi_86059h.log 2>&1; echo "wi 86059h $?") &
wait
(npx tsx tools/diag/diploInvariants.ts 86011 1938 $D --heroes > critic/c86_diploinv_86011h.log 2>&1; echo "dipl 86011h $?") &
(npx tsx tools/diag/worldInvariants.ts 86061 $D --world random > critic/c86_wi_86061w.log 2>&1; echo "wi 86061w $?") &
wait
echo done > critic/c86_checkers2.done
