#!/bin/bash
# Critic run 82 (focused): the rule checkers on new seeds, five years each (ADR-917: three seeds a checker for each of the
# three dimensions scored afresh: uiUxPolish, diplomacyWarDepth, mapVisuals). At most 6 at once (memory).
cd /c/Git/Warism
job() { echo "== $*"; }
run() { n=$1; shift; timeout 3600 npx tsx "$@" > critic/c82_$n.log 2>&1; echo "$n exit $?" >> critic/c82_checkers.status; }
(
run di_82001 tools/diag/diploInvariants.ts 82001 scenario 1826 30,365,1095 &
run di_82003 tools/diag/diploInvariants.ts 82003 random 1826 30,365,1095 &
run di_82005 tools/diag/diploInvariants.ts 82005 scenario 1826 30,365,1095 4 --heroes &
run di_82007 tools/diag/diploInvariants.ts 82007 random 1826 30,365,1095 4 --world random &
run di_82009 tools/diag/diploInvariants.ts 82009 random 1826 30,365,1095 4 --heroes &
run di_82011 tools/diag/diploInvariants.ts 82011 scenario 1826 30,365,1095 &
wait
run di_82013 tools/diag/diploInvariants.ts 82013 random 1826 30,365,1095 &
run di_82015 tools/diag/diploInvariants.ts 82015 scenario 1826 30,365,1095 4 --world random &
run di_82017 tools/diag/diploInvariants.ts 82017 scenario 1826 30,365,1095 4 --heroes &
run wi_82051 tools/diag/worldInvariants.ts 82051 1826 &
run wi_82053 tools/diag/worldInvariants.ts 82053 1826 --diplomacy random --heroes &
run wi_82055 tools/diag/worldInvariants.ts 82055 1826 --world random &
wait
echo done >> critic/c82_checkers.status
)
