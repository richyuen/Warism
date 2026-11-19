#!/bin/bash
# Critic run 82 (focused), lane A: run 81's named cases (R81-B1, R81-N1 to N5) on HEAD's build (critic/c82_dist, 5405) and
# run 81's build (critic/c81_dist, 7c64529e, 5406), with run 81's probes.
cd /c/Git/Warism
p() { b=$1; n=$2; s=$3; shift 3; echo "== $n $b $*"; BASE=http://127.0.0.1:$b TAG=_c82_$b DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c82_${n}_$(echo "$*" | tr ' ,' '__')_$b.log 2>&1; echo "   exit $?"; }
for b in 5405 5406; do
  # R81-B1: History over a nation panel, sideways and upright
  for wh in "844 390" "667 375" "932 430" "390 844"; do set -- $wh; p $b ho c81_histOver 68901 60 $1 $2 GER; done
  p $b dh c81_dirHand 59955 120 844 390 touch
  p $b dh c81_dirHand 59955 120 390 844 touch
  # R81-N1: swatches and glyphs on small phones
  for c in "68901 0 360 740" "69903 700 360 740" "68901 400 320 568" "68901 400 375 667"; do DPR=2 p $b bf c81_bannerFit $c; done
  SCEN=random DPR=2 p $b bfr c81_bannerFit 64965 730 390 844
  # R81-N2: Go to country on a phone
  p $b g2 c81_goto2 68931 390 844 0
  p $b g2 c81_goto2 69931 390 844 700 GER,SOV,FRA,CHI
  p $b g2 c81_goto2 69937 360 740 400 ITA,USA,ENG
  # R81-N3: "+n" at 1024 x 768
  p $b mc c81_moreClick 68901 400 1024 768
  # R81-N4 / N5: relations over a panel
  for wh in "390 844" "844 390"; do set -- $wh; p $b ro c81_relOver 68933 $1 $2; p $b mp c81_menuPinch 68933 $1 $2; done
  p $b ro c81_relOver 69933 390 844 SOV JAP
  p $b ro c81_relOver 69935 360 740 USA CHI
done
echo done > critic/c82_laneA.done
