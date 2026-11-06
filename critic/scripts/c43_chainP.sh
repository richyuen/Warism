#!/bin/sh
# Critic run 38: run 37's page suites, two lanes; Q (timing, editor) alone after everything else.
cd /c/Git/Warism
( sh critic/scripts/c43_suiteR.sh > critic/c43_suiteR.out 2>&1; sh critic/scripts/c43_suiteA.sh > critic/c43_suiteA.out 2>&1; sh critic/scripts/c43_suiteN.sh > critic/c43_suiteN.out 2>&1 ) &
( sh critic/scripts/c43_suiteR2.sh > critic/c43_suiteR2.out 2>&1; sh critic/scripts/c43_suiteL.sh > critic/c43_suiteL.out 2>&1; sh critic/scripts/c43_suiteB1.sh > critic/c43_suiteB1.out 2>&1; sh critic/scripts/c43_suiteC1.sh > critic/c43_suiteC1.out 2>&1; sh critic/scripts/c43_suiteN2.sh > critic/c43_suiteN2.out 2>&1 ) &
wait
echo CHAINPDONE > critic/c43_chainP.done
