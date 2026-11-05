#!/bin/sh
# Critic run 38: run 37's page suites, two lanes; Q (timing, editor) alone after everything else.
cd /c/Git/Warism
( sh critic/scripts/c38_suiteR.sh > critic/c38_suiteR.out 2>&1; sh critic/scripts/c38_suiteA.sh > critic/c38_suiteA.out 2>&1; sh critic/scripts/c38_suiteN.sh > critic/c38_suiteN.out 2>&1 ) &
( sh critic/scripts/c38_suiteR2.sh > critic/c38_suiteR2.out 2>&1; sh critic/scripts/c38_suiteL.sh > critic/c38_suiteL.out 2>&1; sh critic/scripts/c38_suiteB1.sh > critic/c38_suiteB1.out 2>&1; sh critic/scripts/c38_suiteC1.sh > critic/c38_suiteC1.out 2>&1; sh critic/scripts/c38_suiteN2.sh > critic/c38_suiteN2.out 2>&1 ) &
wait
echo CHAINPDONE > critic/c38_chainP.done
