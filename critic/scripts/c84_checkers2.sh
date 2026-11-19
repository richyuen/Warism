#!/bin/bash
# Critic run 84: six more worldInvariants on new seeds, five years (nine a checker for three dimensions afresh). 3 at once.
cd /c/Git/Warism
run() { n=$1; shift; timeout 3600 npx tsx "$@" > critic/c84_$n.log 2>&1; echo "$n exit $?" >> critic/c84_checkers2.status; }
run wi_84057 tools/diag/worldInvariants.ts 84057 1826 & run wi_84059 tools/diag/worldInvariants.ts 84059 1826 --heroes & run wi_84061 tools/diag/worldInvariants.ts 84061 1826 --diplomacy random & wait
run wi_84063 tools/diag/worldInvariants.ts 84063 1826 --world random --heroes & run wi_84065 tools/diag/worldInvariants.ts 84065 1826 & run wi_84067 tools/diag/worldInvariants.ts 84067 1826 --diplomacy random --heroes & wait
echo done >> critic/c84_checkers2.status
