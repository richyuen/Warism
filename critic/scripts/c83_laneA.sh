#!/bin/bash
# Critic run 83 (focused), lane A: run 82's named cases (R82-B1, R82-B2, R82-N1 to N5) on HEAD's build (critic/c83_dist,
# 42d0964e, 5407) and run 82's build (critic/c82_dist, 3e560a9c, 5405), with run 82's probes.
cd /c/Git/Warism
p() { b=$1; n=$2; s=$3; shift 3; echo "== $n $b $* $(date +%T)"; BASE=http://127.0.0.1:$b TAG=_c83_$b DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c83_${n}_$(echo "$*" | tr ' ,' '__')${SCEN:+_$SCEN}_$b.log 2>&1; echo "   exit $?"; }
for b in 5407 5405; do
  # R82-B1 and N4: the phone's war-row names
  p $b nl c82_nameLetters 68901 400 368x740,375x667,384x832,390x844
  p $b nl c82_nameLetters 82901 400 375x667
  p $b nl c82_nameLetters 82903 700 375x667
  p $b nl c82_nameLetters 69903 700 375x667,360x740
  SCEN=random DPR=2 p $b bfr c81_bannerFit 64965 730 390 844
  for c in "82901 400 375 667" "68901 400 375 667" "68901 400 320 568" "68901 0 360 740" "69903 700 360 740" "68901 400 390 844" "68901 400 412 915"; do DPR=2 p $b bf c81_bannerFit $c; done
  # R82-B2: the nation Relations hid, chosen again from the Ranking
  p $b rr c82_relRank 68901 844 390 SOV USA
  p $b rr c82_relRank 68901 667 375 SOV USA
  p $b ro c81_relOver 68933 844 390
  p $b ro c81_relOver 68933 390 844
  # R82-N1: the sideways graph
  for wh in "667 375" "844 390" "932 430" "390 844"; do set -- $wh; p $b gs c82_graphSize 68901 $1 $2; done
  p $b gz c82_graphZoom 68901 844 390
  p $b gz c82_graphZoom 68901 667 375
  # R82-N2: Go to country at 360 x 740
  p $b g2 c81_goto2 69937 360 740 400 ITA,USA,ENG
  p $b g2 c81_goto2 68931 390 844 0
  # earlier fixed cases kept
  p $b ho c81_histOver 68901 60 844 390 GER
  p $b mc c81_moreClick 68901 400 1024 768
  p $b df c82_deskFit 68901 400 1280 720 GER
done
echo done > critic/c83_laneA.done
