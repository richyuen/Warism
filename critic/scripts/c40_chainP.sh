#!/bin/sh
# Critic run 38: run 37's page suites, two lanes; Q (timing, editor) alone after everything else.
cd /c/Git/Warism
( sh critic/scripts/c40_suiteR.sh > critic/c40_suiteR.out 2>&1; sh critic/scripts/c40_suiteA.sh > critic/c40_suiteA.out 2>&1; sh critic/scripts/c40_suiteN.sh > critic/c40_suiteN.out 2>&1 ) &
( sh critic/scripts/c40_suiteR2.sh > critic/c40_suiteR2.out 2>&1; sh critic/scripts/c40_suiteL.sh > critic/c40_suiteL.out 2>&1; sh critic/scripts/c40_suiteB1.sh > critic/c40_suiteB1.out 2>&1; sh critic/scripts/c40_suiteC1.sh > critic/c40_suiteC1.out 2>&1; sh critic/scripts/c40_suiteN2.sh > critic/c40_suiteN2.out 2>&1 ) &
wait
echo CHAINPDONE > critic/c40_chainP.done
