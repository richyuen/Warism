#!/bin/bash
# Critic run 81 (full), lane A: Batch 48's own cases. HEAD's build on 5403, run 80's build (critic/c80_dist) on 5404.
#  R174 (banner names on a phone): run 80's named set (c81_bnSet.sh, both builds), then c81_bannerFit (the row as a whole:
#   overflow, overlaps, squeezed swatches and swords, the "+n" button) at twelve sizes, the random world, opened.
#  R175 (Relations over a nation panel): run 80's menuPinch 68933 on both builds; c81_relOver (A, Relations, B, A again,
#   a node, closed) at both phone sizes, both builds and new seeds.
#  R176 (Go to country): run 80's goto 68931 on both builds; c81_goto2 (the capital's place after the flight) at desk,
#   phone and landscape, days 0 and 700.
cd /c/Git/Warism
H=http://127.0.0.1:5403; O=http://127.0.0.1:5404
sh critic/scripts/c81_bnSet.sh
bf() { b=$1; shift; echo "== bannerFit $b $*"; BASE=http://127.0.0.1:$b TAG=_$b DPR=2 timeout 900 node critic/scripts/c81_bannerFit.mjs "$@" > critic/c81_bf_$(echo "$*" | tr ' ' '_')_${SCEN:-1938}${OPEN:+_open}_$b.log 2>&1; echo "   exit $?"; }
for wh in "320 568" "360 740" "375 667" "390 844" "412 915" "430 932" "667 375" "844 390" "1024 768" "1280 720" "1600 900" "2560 1440"; do
  set -- $wh
  bf 5403 68901 400 $1 $2
  bf 5403 69901 400 $1 $2
  bf 5403 69903 700 $1 $2
done
for c in "68901 0 320 568" "68901 0 360 740" "68901 400 360 740" "68901 400 390 844" "69903 700 360 740"; do bf 5404 $c; done
for c in "64965 730 360 740" "64965 730 390 844" "64965 730 1600 900" "69965 730 390 844" "69965 730 1280 720"; do SCEN=random bf 5403 $c; done
SCEN=random bf 5404 64965 730 390 844
OPEN=1 bf 5403 68901 400 390 844
OPEN=1 bf 5403 69903 700 360 740
for b in 5403 5404; do
  for wh in "390 844" "844 390"; do set -- $wh
    echo "== menuPinch $b $wh"; BASE=http://127.0.0.1:$b TAG=_$b timeout 600 node critic/scripts/c81_menuPinch.mjs 68933 $1 $2 > critic/c81_menuPinch_68933_$1x$2_$b.log 2>&1; echo "   exit $?"
    echo "== relOver $b $wh"; BASE=http://127.0.0.1:$b TAG=_$b timeout 600 node critic/scripts/c81_relOver.mjs 68933 $1 $2 > critic/c81_relOver_68933_$1x$2_$b.log 2>&1; echo "   exit $?"
  done
  echo "== goto $b"; BASE=http://127.0.0.1:$b TAG=_$b timeout 600 node critic/scripts/c81_goto.mjs 68931 > critic/c81_goto_68931_$b.log 2>&1; echo "   exit $?"
done
for c in "69933 390 844 SOV JAP" "69933 844 390 ENG FRA" "69935 360 740 USA CHI"; do set -- $c
  echo "== relOver $c"; BASE=$H TAG=_5403 timeout 600 node critic/scripts/c81_relOver.mjs $c > critic/c81_relOver_$1_$2x$3_$4_5403.log 2>&1; echo "   exit $?"
done
for c in "68931 390 844 0" "68931 844 390 0" "69931 1600 900 700 GER,SOV,FRA,CHI" "69931 390 844 700 GER,SOV,FRA,CHI" "69937 360 740 400 ITA,USA,ENG"; do set -- $c
  echo "== goto2 $c"; BASE=$H TAG=_5403 timeout 900 node critic/scripts/c81_goto2.mjs $c > critic/c81_goto2_$1_$2x$3_$4_5403.log 2>&1; echo "   exit $?"
done
echo done > critic/c81_laneA.done
