#!/bin/bash
# Critic run 84 (focused), lane A: run 83's named cases (R83-B1 "seen fixed when", R83-N2, N3, N4 (R192), the R193 objection)
# on HEAD's build (critic/c84_dist, 764aa144, 5409) and run 83's build (critic/c83_dist, 42d0964e, 5408), and run 83's
# kept page cases on HEAD.
cd /c/Git/Warism
p() { b=$1; n=$2; s=$3; shift 3; echo "== $n $b $* $(date +%T)"; BASE=http://127.0.0.1:$b TAG=_c84_$b DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c84_${n}_$(echo "$*" | tr ' ,' '__')${SCEN:+_$SCEN}${OPEN:+_open}${PANEL:+_p$PANEL}_$b.log 2>&1; echo "   exit $?"; }
for b in 5409 5408; do
  # R83-B1
  p $b pd c83_phoneToDesk 68901 400
  p $b pd c83_phoneToDesk 83903 700 375x667,1280x720,1024x768,375x667
  p $b pd c83_phoneToDesk 83901 400 384x832,1366x768,1024x768,384x832
  p $b rot c83_rotate 68901 400 GER 20
  p $b rot c83_rotate 83903 700 GER 30
  # R83-N2
  p $b ps c83_panelShort 83941 120 320 568 GER
  p $b ps c83_panelShort 83941 120 360 640 GER
  # R83-N3
  p $b rc c83_relCover 83903 700 667 375 GER
  p $b rc c83_relCover 83903 700 844 390 GER
  # N4 (R192, not taken)
  p $b rr c82_relRank 68901 844 390 SOV USA
  p $b rr c82_relRank 68901 667 375 SOV USA
  # R185 kept after R191
  for wh in "667 375" "844 390" "932 430"; do set -- $wh; p $b gs c82_graphSize 68901 $1 $2; done
  # R193 objection
  SCEN=random DPR=2 p $b bfr c81_bannerFit 64965 730 390 844
  p $b nl c82_nameLetters 68901 400 368x740,375x667,384x832,390x844
  p $b nl c82_nameLetters 69903 700 375x667,360x740
  p $b nl c82_nameLetters 82903 700 375x667
  # R186 kept after R190
  p $b g2 c81_goto2 69937 360 740 400 ITA,USA,ENG
done
# kept cases, HEAD only
for wh in "844 390" "667 375" "932 430" "390 844"; do set -- $wh; p 5409 ho c81_histOver 68901 60 $1 $2 GER; done
for wh in "390 844" "844 390"; do set -- $wh; p 5409 mp c81_menuPinch 68933 $1 $2; done
p 5409 dh c81_dirHand 59955 120 844 390 touch
p 5409 dh c81_dirHand 59955 120 390 844 touch
p 5409 mc c81_moreClick 68901 400 1024 768
p 5409 df c82_deskFit 68901 400 1280 720 GER
p 5409 ro c81_relOver 68933 844 390
p 5409 ro c81_relOver 68933 390 844
p 5409 rb c83_rankBar 83951 300 667 375
p 5409 g2 c81_goto2 68931 390 844 0
echo done > critic/c84_laneA.done
