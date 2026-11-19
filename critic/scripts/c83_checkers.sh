#!/bin/bash
# Critic run 83 (focused): the rule checkers on new seeds, five years each (ADR-917: three seeds a checker for each of the
# three dimensions scored afresh: uiUxPolish, diplomacyWarDepth, mapVisuals). At most 6 at once (memory).
cd /c/Git/Warism
job() { echo "== $*"; }
run() { n=$1; shift; timeout 3600 npx tsx "$@" > critic/c83_$n.log 2>&1; echo "$n exit $?" >> critic/c83_checkers.status; }
(
run di_83001 tools/diag/diploInvariants.ts 83001 scenario 1826 30,365,1095 &
run di_83003 tools/diag/diploInvariants.ts 83003 random 1826 30,365,1095 &
run di_83005 tools/diag/diploInvariants.ts 83005 scenario 1826 30,365,1095 4 --heroes &
run di_83007 tools/diag/diploInvariants.ts 83007 random 1826 30,365,1095 4 --world random &
run di_83009 tools/diag/diploInvariants.ts 83009 random 1826 30,365,1095 4 --heroes &
run di_83011 tools/diag/diploInvariants.ts 83011 scenario 1826 30,365,1095 &
wait
run di_83013 tools/diag/diploInvariants.ts 83013 random 1826 30,365,1095 &
run di_83015 tools/diag/diploInvariants.ts 83015 scenario 1826 30,365,1095 4 --world random &
run di_83017 tools/diag/diploInvariants.ts 83017 scenario 1826 30,365,1095 4 --heroes &
run wi_83051 tools/diag/worldInvariants.ts 83051 1826 &
run wi_83053 tools/diag/worldInvariants.ts 83053 1826 --diplomacy random --heroes &
run wi_83055 tools/diag/worldInvariants.ts 83055 1826 --world random &
wait
echo done >> critic/c83_checkers.status
)
