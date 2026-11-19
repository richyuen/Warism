#!/bin/bash
# Critic run 85, completion: R85-N1 (R197) and R85-N2 (R198) "seen fixed when" on bd85eb10 (5411), and off their cases.
cd /c/Git/Warism
p() { b=$1; n=$2; s=$3; shift 3; echo "== $n $b $* $(date +%T)"; BASE=http://127.0.0.1:$b TAG=_c85b_$b DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c85b_${n}_$(echo "$*" | tr ' ,' '__')${SCEN:+_$SCEN}_$b.log 2>&1; echo "   exit $?"; }
p 5411 dr c85_deskRow 84901 400 800
p 5411 dr c85_deskRow 85903 700 900
p 5411 ex c85_explore 84901 400
p 5411 dr c85_deskRow 85901 400 800
p 5411 dr c85_deskRow 85905 200 720
SCEN=random p 5411 dr c85_deskRow 85965 730 800
p 5411 rw c84_rowShot 84901 400 620x900,640x800,683x768,700x800,768x1024
p 5411 cw c84_crossWidth 85901 400 1280x800,800x800,770x800,740x800,700x800,660x800,640x800,620x800,601x800,600x800,601x800,640x800,700x800,770x800,1280x800
p 5411 cw c84_crossWidth 84901 400 steps
p 5411 df c82_deskFit 68901 400 1280 720 GER
p 5411 mc c81_moreClick 68901 400 1024 768
for wh in "620 900" "640 800"; do set -- $wh; p 5411 mc c81_moreClick 84901 400 $1 $2; done
p 5411 rs c84_relSide 84903 400
p 5411 rf c85_relFoot 84903 400
p 5411 gs c82_graphSize 68901 568 320
echo done > critic/c85_laneG.done
