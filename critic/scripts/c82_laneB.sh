#!/bin/bash
# Critic run 82 (focused), lane B: new seeds on HEAD (5405). R178's row at twelve sizes (bannerFit), opened and with a panel;
# R182 at the three sideways sizes (relOver, relSame); R180 (deskFit) at four desk sizes; Go to country's cost (gotoCost);
# the monkeys and resizes at phone and desk sizes.
cd /c/Git/Warism
p() { n=$1; s=$2; shift 2; echo "== $n $*"; BASE=http://127.0.0.1:5405 TAG=_c82_5405 timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c82_${n}_$(echo "$*" | tr ' ,' '__')${SCEN:+_$SCEN}${OPEN:+_open}${PANEL:+_p$PANEL}_5405.log 2>&1; echo "   exit $?"; }
for wh in "320 568" "360 740" "375 667" "390 844" "412 915" "667 375" "844 390" "932 430" "1024 768" "1280 720" "1600 900"; do
  set -- $wh
  DPR=2 p bf c81_bannerFit 82901 400 $1 $2
  DPR=2 p bf c81_bannerFit 82903 700 $1 $2
done
for wh in "360 740" "320 568" "844 390"; do set -- $wh; OPEN=1 DPR=2 p bf c81_bannerFit 82903 700 $1 $2; PANEL=GER DPR=2 p bf c81_bannerFit 82903 700 $1 $2; done
SCEN=random DPR=2 p bf c81_bannerFit 82965 730 360 740
SCEN=random DPR=2 p bf c81_bannerFit 82965 730 1024 768
for wh in "844 390" "667 375" "932 430"; do set -- $wh; p ro c81_relOver 82933 $1 $2 SOV FRA; p rs c82_relSame 82933 $1 $2 GER ITA 200; done
for wh in "1024 768" "1152 864" "1280 720" "1366 768"; do set -- $wh; p df c82_deskFit 82901 400 $1 $2 GER; p df c82_deskFit 82903 700 $1 $2 SOV; done
p gc c82_gotoCost 82937 360 740
p g2 c81_goto2 82937 360 740 300 ITA,USA,ENG,JAP,BRA
p g2 c81_goto2 82937 375 667 300 ITA,USA,ENG,JAP,BRA
p g2 c81_goto2 82937 844 390 300 ITA,USA,ENG,JAP,BRA
p g2 c81_goto2 82937 1600 900 300 ITA,USA,ENG,JAP,BRA
p ho c81_histOver 82901 200 844 390 SOV
p ho c81_histOver 82901 200 667 375 FRA
echo done > critic/c82_laneB.done
