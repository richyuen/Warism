#!/bin/bash
# Critic run 84 (focused), lane B: new seeds 849xx on HEAD (5409): R193's give-way (nameLetters, bannerFit on 1938 and the
# random world), R189 off its route (crossWidth), R190 off its route (goChain), R191 off its route (relSide), R192's case
# on a new seed (relRank), the narrow desk row (rowShot).
cd /c/Git/Warism
p() { b=$1; n=$2; s=$3; shift 3; echo "== $n $b $* $(date +%T)"; BASE=http://127.0.0.1:$b TAG=_c84_$b DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c84_${n}_$(echo "$*" | tr ' ,' '__')${SCEN:+_$SCEN}_$b.log 2>&1; echo "   exit $?"; }
p 5409 nl c82_nameLetters 84901 400 320x568,360x640,360x740,375x667,384x832,390x844,412x915
p 5409 nl c82_nameLetters 84903 700 320x568,360x640,360x740,375x667,384x832,390x844,412x915
for s in 84961 84963 84965; do for wh in "320 568" "360 740" "390 844"; do set -- $wh; SCEN=random DPR=2 p 5409 bfr c81_bannerFit $s 730 $1 $2; done; done
for wh in "667 375" "844 390"; do set -- $wh; DPR=2 p 5409 bf c81_bannerFit 84903 700 $1 $2; done
for r in steps short opened; do p 5409 cw c84_crossWidth 84903 700 $r; done
p 5409 gc c84_goChain 84937 300 320 568 FRA JAP
p 5409 gc c84_goChain 84939 500 375 667 ENG USA
p 5409 rs c84_relSide 84933 300
p 5409 rr c82_relRank 84933 844 390 GER FRA
p 5409 rw c84_rowShot 84903 700 640x800,683x768,700x900
p 5408 rw c84_rowShot 84903 700 640x800,683x768,700x900
echo done > critic/c84_laneB.done
