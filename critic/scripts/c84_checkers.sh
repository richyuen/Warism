#!/bin/bash
# Critic run 84 (focused): the rule checkers on new seeds, five years each (ADR-917: three seeds a checker for each of the
# three dimensions scored afresh: uiUxPolish, diplomacyWarDepth, mapVisuals). At most 6 at once (memory).
cd /c/Git/Warism
job() { echo "== $*"; }
run() { n=$1; shift; timeout 3600 npx tsx "$@" > critic/c84_$n.log 2>&1; echo "$n exit $?" >> critic/c84_checkers.status; }
(
run di_84001 tools/diag/diploInvariants.ts 84001 scenario 1826 30,365,1095 &
run di_84003 tools/diag/diploInvariants.ts 84003 random 1826 30,365,1095 &
run di_84005 tools/diag/diploInvariants.ts 84005 scenario 1826 30,365,1095 4 --heroes &
run di_84007 tools/diag/diploInvariants.ts 84007 random 1826 30,365,1095 4 --world random &
run di_84009 tools/diag/diploInvariants.ts 84009 random 1826 30,365,1095 4 --heroes &
run di_84011 tools/diag/diploInvariants.ts 84011 scenario 1826 30,365,1095 &
wait
run di_84013 tools/diag/diploInvariants.ts 84013 random 1826 30,365,1095 &
run di_84015 tools/diag/diploInvariants.ts 84015 scenario 1826 30,365,1095 4 --world random &
run di_84017 tools/diag/diploInvariants.ts 84017 scenario 1826 30,365,1095 4 --heroes &
run wi_84051 tools/diag/worldInvariants.ts 84051 1826 &
run wi_84053 tools/diag/worldInvariants.ts 84053 1826 --diplomacy random --heroes &
run wi_84055 tools/diag/worldInvariants.ts 84055 1826 --world random &
wait
echo done >> critic/c84_checkers.status
)
