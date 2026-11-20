#!/bin/bash
# Critic run 90, lane P: R216's peace line (ADR-1145) on the page, at the five supported sizes (ADR-1141; the phones by
# touch and pixel ratio 3), on R89-N1's own seeds (89403, 89402, 89404) and new three- and two-nation worlds; each run's
# end hash against the headless world's (c90_headHashR.ts at the last sample's hour: the line's reads must not move it).
. /c/Git/Warism/critic/scripts/c90_r.sh
pc() { s=$1; n=$2; y=$3; wh=$4; t=$5; st=${6:-30}
  echo "== peace $* $(date +%T)"; timeout 1500 node critic/scripts/c90_peace.mjs $s $n $y $wh "$t" $st > critic/c90_peace.$s.$n.$y.$wh$t.log 2>&1; echo "   exit $?"
  last=$(( (y * 365 / st) * st * 24 )); npx tsx critic/scripts/c90_headHashR.ts $s $n $last >> critic/c90_peace_head.log 2>&1
  echo "   page $(grep -o '"hash":[0-9]*' critic/c90_peace.$s.$n.$y.$wh$t.log) head $(tail -n 1 critic/c90_peace_head.log)"; }
pc 89403 3 3 2560x1305 ''
pc 89404 3 4 2560x1305 '' 60
pc 89402 3 3 393x852 touch
pc 90403 3 2 393x659 touch
pc 90405 3 2 734x343 touch
pc 90407 3 2 852x393 touch
pc 90423 2 3 2560x1305 '' 60
pc 90425 2 2 393x852 touch
echo done > /c/Git/Warism/critic/c90_laneP.done
