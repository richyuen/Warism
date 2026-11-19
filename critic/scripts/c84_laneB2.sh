#!/bin/bash
# Critic run 84, lane B2: lane B's random-world bannerFit runs again (in lane B the helper's `s` overwrote the loop's seed,
# so only 84961 at 320 x 568 ran as meant). R193's give-way on the random world, new seeds, at three phone widths.
cd /c/Git/Warism
p() { local b=$1 n=$2 sc=$3; shift 3; echo "== $n $b $* $(date +%T)"; BASE=http://127.0.0.1:$b TAG=_c84_$b DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$sc.mjs "$@" > critic/c84_${n}_$(echo "$*" | tr ' ,' '__')${SCEN:+_$SCEN}_$b.log 2>&1; echo "   exit $?"; }
for sd in 84961 84963 84965; do for wh in "320 568" "360 740" "390 844"; do set -- $wh; SCEN=random DPR=2 p 5409 bfr c81_bannerFit $sd 730 $1 $2; done; done
echo done > critic/c84_laneB2.done
