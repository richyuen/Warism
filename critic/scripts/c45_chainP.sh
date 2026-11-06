#!/bin/sh
# Critic run 38: run 37's page suites, two lanes; Q (timing, editor) alone after everything else.
cd /c/Git/Warism
( sh critic/scripts/c45_suiteR.sh > critic/c45_suiteR.out 2>&1; sh critic/scripts/c45_suiteA.sh > critic/c45_suiteA.out 2>&1; sh critic/scripts/c45_suiteN.sh > critic/c45_suiteN.out 2>&1 ) &
( sh critic/scripts/c45_suiteR2.sh > critic/c45_suiteR2.out 2>&1; sh critic/scripts/c45_suiteL.sh > critic/c45_suiteL.out 2>&1; sh critic/scripts/c45_suiteB1.sh > critic/c45_suiteB1.out 2>&1; sh critic/scripts/c45_suiteC1.sh > critic/c45_suiteC1.out 2>&1; sh critic/scripts/c45_suiteN2.sh > critic/c45_suiteN2.out 2>&1 ) &
wait
echo CHAINPDONE > critic/c45_chainP.done
