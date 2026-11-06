#!/bin/sh
# Critic run 38: run 37's page suites, two lanes; Q (timing, editor) alone after everything else.
cd /c/Git/Warism
( sh critic/scripts/c44_suiteR.sh > critic/c44_suiteR.out 2>&1; sh critic/scripts/c44_suiteA.sh > critic/c44_suiteA.out 2>&1; sh critic/scripts/c44_suiteN.sh > critic/c44_suiteN.out 2>&1 ) &
( sh critic/scripts/c44_suiteR2.sh > critic/c44_suiteR2.out 2>&1; sh critic/scripts/c44_suiteL.sh > critic/c44_suiteL.out 2>&1; sh critic/scripts/c44_suiteB1.sh > critic/c44_suiteB1.out 2>&1; sh critic/scripts/c44_suiteC1.sh > critic/c44_suiteC1.out 2>&1; sh critic/scripts/c44_suiteN2.sh > critic/c44_suiteN2.out 2>&1 ) &
wait
echo CHAINPDONE > critic/c44_chainP.done
