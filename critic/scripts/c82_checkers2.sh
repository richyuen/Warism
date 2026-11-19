#!/bin/bash
# Critic run 82: six more worldInvariants on new seeds, five years (nine a checker for three dimensions afresh). 3 at once.
cd /c/Git/Warism
run() { n=$1; shift; timeout 3600 npx tsx "$@" > critic/c82_$n.log 2>&1; echo "$n exit $?" >> critic/c82_checkers2.status; }
run wi_82057 tools/diag/worldInvariants.ts 82057 1826 & run wi_82059 tools/diag/worldInvariants.ts 82059 1826 --heroes & run wi_82061 tools/diag/worldInvariants.ts 82061 1826 --diplomacy random & wait
run wi_82063 tools/diag/worldInvariants.ts 82063 1826 --world random --heroes & run wi_82065 tools/diag/worldInvariants.ts 82065 1826 & run wi_82067 tools/diag/worldInvariants.ts 82067 1826 --diplomacy random --heroes & wait
echo done >> critic/c82_checkers2.status
