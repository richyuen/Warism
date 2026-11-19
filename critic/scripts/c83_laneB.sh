#!/bin/bash
# Critic run 83 (focused), lane B: new seeds 839xx on HEAD (5407). R183's sized row at phone sizes (nameLetters, bannerFit,
# opened and with a panel), its fit and cost running (phoneRow, both builds), R184/R188 on a new seed (relRank), R185
# (graphSize, graphZoom), R186 at short phones (goto2), R177 kept (histOver).
cd /c/Git/Warism
p() { b=$1; n=$2; s=$3; shift 3; echo "== $n $b $* $(date +%T)"; BASE=http://127.0.0.1:$b TAG=_c83_$b DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c83_${n}_$(echo "$*" | tr ' ,' '__')${SCEN:+_$SCEN}${OPEN:+_open}${PANEL:+_p$PANEL}_$b.log 2>&1; echo "   exit $?"; }
p 5407 nl c82_nameLetters 83901 400 320x568,360x640,360x740,375x667,384x832,390x844,412x915
p 5407 nl c82_nameLetters 83903 700 320x568,360x640,360x740,375x667,384x832,390x844,412x915
SCEN=random DPR=2 p 5407 bfr c81_bannerFit 83965 730 375 667
SCEN=random DPR=2 p 5407 bfr c81_bannerFit 83965 730 360 740
for wh in "320 568" "375 667" "390 844" "667 375" "844 390" "932 430"; do set -- $wh; DPR=2 p 5407 bf c81_bannerFit 83901 400 $1 $2; done
for wh in "375 667" "844 390" "667 375"; do set -- $wh; OPEN=1 DPR=2 p 5407 bf c81_bannerFit 83903 700 $1 $2; PANEL=GER DPR=2 p 5407 bf c81_bannerFit 83903 700 $1 $2; done
for b in 5407 5405; do p $b pr c83_phoneRow 83901 200 375 667 90; p $b pr c83_phoneRow 83903 500 844 390 90; done
p 5407 rr c82_relRank 83933 844 390 GER FRA
p 5407 rr c82_relRank 83933 667 375 ITA ENG
p 5407 rr c82_relRank 83933 932 430 JAP USA
for wh in "667 375" "844 390" "932 430" "360 740"; do set -- $wh; p 5407 gs c82_graphSize 83933 $1 $2; done
p 5407 gz c82_graphZoom 83933 667 375
for wh in "320 568" "360 640" "360 740" "375 667"; do set -- $wh; p 5407 g2 c81_goto2 83937 $1 $2 300 ITA,USA,ENG,JAP,BRA; done
p 5405 g2 c81_goto2 83937 360 640 300 ITA,USA,ENG,JAP,BRA
p 5407 gc c82_gotoCost 83937 360 740
p 5405 gc c82_gotoCost 83937 360 740
p 5407 ho c81_histOver 83901 200 844 390 SOV
p 5407 ro c81_relOver 83933 844 390 SOV FRA
p 5407 ro c81_relOver 83933 390 844 SOV FRA
echo done > critic/c83_laneB.done
