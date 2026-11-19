#!/bin/bash
# Critic run 85 (full), lane A: Batch 52 (R194 to R196) on its cases and off them, and run 84's named cases.
# HEAD's build (critic/c85_dist, a9736eb5) on 5411; run 84's build (critic/c84_dist, 764aa144) on 5410.
#  R194 (R84-N1, the narrow desk's war row): run 84's "seen fixed when" (c84_rowShot 84901 400 at five widths, 84903 700
#   at three), moreClick at the four widths, both builds; off its case: c85_deskRow (one window narrowed and widened in
#   20 px steps, 1100 to 560, stale fits, cut names, "+n" alone), 1938 and the random world, new seeds, both builds on one;
#   c84_crossWidth's desk route across 600 to 800 px.
#  R195 (R84-N2, the graph at 568 x 320): c82_graphSize 68901 and 84933 at 568 x 320, both builds; graphZoom; relSide.
#  R196 (R84-N3, the footer): c85_relFoot at eleven sizes on 84903 400 (both builds) and new seeds.
#  Run 84's kept page cases on HEAD.
cd /c/Git/Warism
p() { b=$1; n=$2; s=$3; shift 3; echo "== $n $b $* $(date +%T)"; BASE=http://127.0.0.1:$b TAG=_c85_$b DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c85_${n}_$(echo "$*" | tr ' ,' '__')${SCEN:+_$SCEN}${OPEN:+_open}${PANEL:+_p$PANEL}_$b.log 2>&1; echo "   exit $?"; }
for b in 5411 5410; do
  # R84-N1 (R194)
  p $b rw c84_rowShot 84901 400 620x900,640x800,683x768,700x800,768x1024
  p $b rw c84_rowShot 84903 700 640x800,683x768,700x900
  for wh in "620 900" "640 800" "683 768" "700 800"; do set -- $wh; p $b mc c81_moreClick 84901 400 $1 $2; done
  p $b dr c85_deskRow 84901 400 800
  # R84-N2 (R195)
  p $b gs c82_graphSize 68901 568 320
  p $b gs c82_graphSize 84933 568 320
  # R84-N3 (R196)
  p $b rf c85_relFoot 84903 400
  p $b rs c84_relSide 84903 400
done
# Off their cases, HEAD
p 5411 dr c85_deskRow 85901 400 800
p 5411 dr c85_deskRow 85903 700 900
p 5411 dr c85_deskRow 85905 200 720
SCEN=random p 5411 dr c85_deskRow 85965 730 800
SCEN=random p 5410 dr c85_deskRow 85965 730 800
p 5411 cw c84_crossWidth 85901 400 1280x800,800x800,770x800,740x800,700x800,660x800,640x800,620x800,601x800,600x800,601x800,640x800,700x800,770x800,1280x800
p 5411 cw c84_crossWidth 84901 400 steps
p 5411 cw c84_crossWidth 84901 400 short
p 5411 cw c84_crossWidth 84901 400 opened
p 5411 rw c84_rowShot 85903 700 610x800,640x800,660x800,700x800,740x800,770x800,800x800
p 5411 rf c85_relFoot 85933 300
p 5411 rf c85_relFoot 68901 700 568x320,600x320,640x340,667x375,568x320
p 5411 rs c84_relSide 85933 300
p 5411 gz c82_graphZoom 84933 568 320
p 5411 gz c82_graphZoom 85933 568 320
p 5411 gs c82_graphSize 85933 568 320
for wh in "667 375" "844 390" "932 430"; do set -- $wh; p 5411 gs c82_graphSize 68901 $1 $2; done
# Run 84's (and 83's) kept cases, HEAD
p 5411 pd c83_phoneToDesk 68901 400
p 5411 pd c83_phoneToDesk 83903 700 375x667,1280x720,1024x768,375x667
p 5411 pd c83_phoneToDesk 83901 400 384x832,1366x768,1024x768,384x832
p 5411 rot c83_rotate 68901 400 GER 20
p 5411 ps c83_panelShort 83941 120 320 568 GER
p 5411 rc c83_relCover 83903 700 667 375 GER
p 5411 rc c83_relCover 83903 700 844 390 GER
p 5411 rr c82_relRank 68901 844 390 SOV USA
p 5411 rr c82_relRank 68901 667 375 SOV USA
SCEN=random DPR=2 p 5411 bfr c81_bannerFit 64965 730 390 844
p 5411 nl c82_nameLetters 84901 400 320x568,360x640,375x667,390x844,412x915
p 5411 g2 c81_goto2 69937 360 740 400 ITA,USA,ENG
p 5411 gc c84_goChain 84937 300 320 568 FRA JAP
for wh in "844 390" "667 375" "932 430" "390 844"; do set -- $wh; p 5411 ho c81_histOver 68901 60 $1 $2 GER; done
for wh in "390 844" "844 390"; do set -- $wh; p 5411 mp c81_menuPinch 68933 $1 $2; done
p 5411 dh c81_dirHand 59955 120 844 390 touch
p 5411 dh c81_dirHand 59955 120 390 844 touch
p 5411 mc c81_moreClick 68901 400 1024 768
p 5411 df c82_deskFit 68901 400 1280 720 GER
p 5411 ro c81_relOver 68933 844 390
p 5411 rb c83_rankBar 83951 300 667 375
p 5411 pr c83_phoneRow 83901 200 375 667 90
p 5411 pr c83_phoneRow 83903 500 844 390 90
echo done > critic/c85_laneA.done
