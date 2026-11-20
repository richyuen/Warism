#!/bin/bash
# Critic run 91, lane P: R219's AT on the page (c90_peaceWeek.mjs on R90-B1's two cases), R222's PeaceHeld rows in
# History at the five supported sizes (c91_peaceHistPage.mjs on 89403, 55404 and new seeds), and the peace line on new
# few-nation worlds at the sizes with each run's end hash against the headless world's (c90_peace.mjs, c90_headHashR.ts).
. /c/Git/Warism/critic/scripts/c91_r.sh
echo "== peaceWeek 90441 $(date +%T)"; timeout 1500 node critic/scripts/c90_peaceWeek.mjs 90441 2 88 98 > critic/c91_pw_90441.log 2>&1; echo "   exit $?"; cp critic/c90_pw_90441.json critic/c91_pw_90441.json 2>/dev/null
echo "== peaceWeek 89401 $(date +%T)"; timeout 2400 node critic/scripts/c90_peaceWeek.mjs 89401 3 1595 1604 > critic/c91_pw_89401.log 2>&1; echo "   exit $?"; cp critic/c90_pw_89401.json critic/c91_pw_89401.json 2>/dev/null
ph() { echo "== phh $* $(date +%T)"; timeout 1500 node critic/scripts/c91_peaceHistPage.mjs "$@" > critic/c91_phh.$(echo "$*" | tr ' ' '_').log 2>&1; echo "   exit $?"; }
ph 89403 3 60 2560x1305
ph 89403 3 60 393x852 touch
ph 89403 3 60 734x343 touch
ph 89403 3 60 852x393 touch
ph 55404 3 120 2560x1305
ph 55404 3 120 393x659 touch
ph 91403 3 400 2560x1305
ph 91405 3 400 393x852 touch
ph 91443 2 400 852x393 touch
ph 91445 2 400 734x343 touch
pc() { s=$1; n=$2; y=$3; wh=$4; t=$5; st=${6:-30}
  echo "== peace $* $(date +%T)"; timeout 1500 node critic/scripts/c90_peace.mjs $s $n $y $wh "$t" $st > critic/c91_peace.$s.$n.$y.$wh$t.log 2>&1; echo "   exit $?"
  last=$(( (y * 365 / st) * st * 24 )); npx tsx critic/scripts/c90_headHashR.ts $s $n $last >> critic/c91_peace_head.log 2>&1
  echo "   page $(grep -o '"hash":[0-9]*' critic/c91_peace.$s.$n.$y.$wh$t.log) head $(tail -n 1 critic/c91_peace_head.log)"; }
pc 91403 3 3 2560x1305 ''
pc 91407 3 2 393x659 touch
pc 91409 3 2 852x393 touch
pc 91447 2 3 2560x1305 '' 60
pc 91449 2 2 734x343 touch
echo done > /c/Git/Warism/critic/c91_laneP.done
