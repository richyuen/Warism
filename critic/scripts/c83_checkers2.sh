#!/bin/bash
# Critic run 83: six more worldInvariants on new seeds, five years (nine a checker for three dimensions afresh). 3 at once.
cd /c/Git/Warism
run() { n=$1; shift; timeout 3600 npx tsx "$@" > critic/c83_$n.log 2>&1; echo "$n exit $?" >> critic/c83_checkers2.status; }
run wi_83057 tools/diag/worldInvariants.ts 83057 1826 & run wi_83059 tools/diag/worldInvariants.ts 83059 1826 --heroes & run wi_83061 tools/diag/worldInvariants.ts 83061 1826 --diplomacy random & wait
run wi_83063 tools/diag/worldInvariants.ts 83063 1826 --world random --heroes & run wi_83065 tools/diag/worldInvariants.ts 83065 1826 & run wi_83067 tools/diag/worldInvariants.ts 83067 1826 --diplomacy random --heroes & wait
echo done >> critic/c83_checkers2.status
