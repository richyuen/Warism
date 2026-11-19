#!/bin/bash
# Critic run 83 (focused), lane D: run 82's remaining named page cases on HEAD (5407), and the off-route attacks of this
# run (phoneToDesk, rotate, relRoutes, relCover, panelShort, rankBar, graphSize at desk sizes), most on both builds.
cd /c/Git/Warism
p() { b=$1; n=$2; s=$3; shift 3; echo "== $n $b $* $(date +%T)"; BASE=http://127.0.0.1:$b TAG=_c83_$b DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c83_${n}_$(echo "$*" | tr ' ,' '__')_$b.log 2>&1; echo "   exit $?"; }
# run 82's re-run table, kept cases
for wh in "390 844" "844 390"; do set -- $wh; p 5407 mp c81_menuPinch 68933 $1 $2; done
p 5407 dh c81_dirHand 59955 120 844 390 touch
p 5407 dh c81_dirHand 59955 120 390 844 touch
for wh in "667 375" "932 430" "390 844"; do set -- $wh; p 5407 ho c81_histOver 68901 60 $1 $2 GER; done
p 5407 g2 c81_goto2 69931 390 844 700 GER,SOV,FRA,CHI
p 5407 ro c81_relOver 69933 390 844 SOV JAP
p 5407 ro c81_relOver 69935 360 740 USA CHI
p 5407 rr c82_relRank 68901 667 375 SOV USA
# off-route attacks, new seeds
for b in 5407 5405; do
  p $b pd c83_phoneToDesk 83901 400 384x832,1366x768,1024x768,384x832
  p $b pd c83_phoneToDesk 83903 700 375x667,1280x720,1024x768,375x667
  p $b rot c83_rotate 83903 700 GER 30
  for wh in "1600 900" "1024 768"; do set -- $wh; p $b gs c82_graphSize 83933 $1 $2; done
  p $b rc c83_relCover 83903 700 667 375 GER
  p $b ps c83_panelShort 83941 120 320 568 GER
  p $b rb c83_rankBar 83951 300 667 375
done
p 5407 rt c83_relRoutes 83903 700 667 375 SOV
p 5407 rt c83_relRoutes 83903 700 932 430 POL
echo done > critic/c83_laneD.done
