#!/bin/sh
# Critic run 38: run 37's page suites, two lanes; Q (timing, editor) alone after everything else.
cd /c/Git/Warism
( sh critic/scripts/c39_suiteR.sh > critic/c39_suiteR.out 2>&1; sh critic/scripts/c39_suiteA.sh > critic/c39_suiteA.out 2>&1; sh critic/scripts/c39_suiteN.sh > critic/c39_suiteN.out 2>&1 ) &
( sh critic/scripts/c39_suiteR2.sh > critic/c39_suiteR2.out 2>&1; sh critic/scripts/c39_suiteL.sh > critic/c39_suiteL.out 2>&1; sh critic/scripts/c39_suiteB1.sh > critic/c39_suiteB1.out 2>&1; sh critic/scripts/c39_suiteC1.sh > critic/c39_suiteC1.out 2>&1; sh critic/scripts/c39_suiteN2.sh > critic/c39_suiteN2.out 2>&1 ) &
wait
echo CHAINPDONE > critic/c39_chainP.done
