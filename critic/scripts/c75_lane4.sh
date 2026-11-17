#!/bin/sh
# Critic run 75 (full), the fourth page lane: cases run again with my arguments mended (a tag, not a name), after lane 3.
cd /c/Git/Warism
until grep -q LANE3DONE critic/c75_lane3.log 2>/dev/null; do sleep 15; done
export BASE=http://127.0.0.1:5377
t() { log=$1; shift; echo "== $log $(date +%T)"; timeout 1500 "$@" > critic/$log 2>&1; echo "   exit $?"; }
PLAY=GER t c75_bf_headplay_58901.log node critic/scripts/c75_bannerFlip.mjs 58901 200 headplay 60
( PLAY=JAP timeout 900 node critic/scripts/c75_bannerFlip.mjs 57901 150 headplayJ 60 > critic/c75_bf_headplayJ_57901.log 2>&1 ) &
( PLAY=JAP BASE=http://127.0.0.1:5378 timeout 900 node critic/scripts/c75_bannerFlip.mjs 57901 150 c74playJ 60 > critic/c75_bf_c74playJ_57901.log 2>&1 ) &
wait
t c75_mo_56211_moz.log node critic/scripts/c75_massOff.mjs 56211 200 MOZ
t c75_mo_58623.log node critic/scripts/c75_massOff.mjs 58623 320 ROM
echo LANE4DONE
