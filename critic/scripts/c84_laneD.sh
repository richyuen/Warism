#!/bin/bash
# Critic run 84 (focused), lane D: where Batch 51 changed code and lanes A and B do not reach: the phone row running at
# speed after R193's sizeRow and R189's fit reset (phoneRow, both builds), the row beside a panel and opened on a new seed
# (bannerFit PANEL / OPEN), R184 routes after R191 moved the header (relRoutes), R191's cost at 568 x 320 (graphSize,
# both builds), relSide on run 83's build at the same sizes.
cd /c/Git/Warism
p() { b=$1; n=$2; s=$3; shift 3; echo "== $n $b $* $(date +%T)"; BASE=http://127.0.0.1:$b TAG=_c84_$b DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c84_${n}_$(echo "$*" | tr ' ,' '__')${SCEN:+_$SCEN}${OPEN:+_open}${PANEL:+_p$PANEL}_$b.log 2>&1; echo "   exit $?"; }
for b in 5409 5408; do p $b pr c83_phoneRow 83901 200 375 667 90; p $b pr c83_phoneRow 83903 500 844 390 90; done
for wh in "375 667" "844 390" "667 375"; do set -- $wh; PANEL=GER DPR=2 p 5409 bf c81_bannerFit 84901 400 $1 $2; OPEN=1 DPR=2 p 5409 bf c81_bannerFit 84901 400 $1 $2; done
p 5409 rt c83_relRoutes 83903 700 667 375 SOV
p 5409 rt c83_relRoutes 83903 700 932 430 POL
p 5409 rt c83_relRoutes 68901 400 844 390 SOV
for b in 5409 5408; do p $b gs c82_graphSize 68901 568 320; p $b gs c82_graphSize 84933 568 320; done
p 5408 rs c84_relSide 84903 400 932x430,1280x480,390x844,667x375
echo done > critic/c84_laneD.done
