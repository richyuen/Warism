#!/bin/sh
# Critic run 75 (full), the second page lane, one probe at a time on HEAD's build (5377); run 74's build on 5378 where a
# figure is compared. Run 74's and run 73's named page cases, the batch's own (R125, R128 to R131), then run 71's and
# 72's named cases (c75_laneA.sh) and run 69's (c75_pagesR.sh).
cd /c/Git/Warism
export BASE=http://127.0.0.1:5377
t() { log=$1; shift; echo "== $log $(date +%T)"; timeout 1800 "$@" > critic/$log 2>&1; echo "   exit $?"; }
# Run 74's cases: R74-N3 (the row, R130), R74-N2 (called off, R129), R73-N1 (the player's wars)
t c75_br_57901.log node critic/scripts/c75_bannerRank.mjs 57901 150
t c75_br_57903.log node critic/scripts/c75_bannerRank.mjs 57903 150
t c75_br_58901.log node critic/scripts/c75_bannerRank.mjs 58901 150
t c75_br_58903_phone.log node critic/scripts/c75_bannerRank.mjs 58903 120 390 844
for sd in "57901 150" "57903 120" "58901 200"; do set -- $sd
  ( timeout 900 node critic/scripts/c75_bannerFlip.mjs $1 $2 head 60 > critic/c75_bf_head_$1.log 2>&1 ) &
  ( BASE=http://127.0.0.1:5378 timeout 900 node critic/scripts/c75_bannerFlip.mjs $1 $2 c74build 60 > critic/c75_bf_c74build_$1.log 2>&1 ) &
  wait
done
( timeout 900 node critic/scripts/c75_bannerFlip.mjs 57901 150 headphone 60 390 844 > critic/c75_bf_headphone_57901.log 2>&1 ) &
( BASE=http://127.0.0.1:5378 timeout 900 node critic/scripts/c75_bannerFlip.mjs 57901 150 c74phone 60 390 844 > critic/c75_bf_c74phone_57901.log 2>&1 ) &
wait
PLAY=Germany t c75_bf_headplay_58901.log node critic/scripts/c75_bannerFlip.mjs 58901 200 headplay 60
t c75_mo_56211.log node critic/scripts/c75_massOff.mjs 56211 200 Mozambique
t c75_mo_58611.log node critic/scripts/c75_massOff.mjs 58611 300 Romania
t c75_mh_56211.log node critic/scripts/c75_massHist.mjs 56211 80 Romania
t c75_ms_56211.log node critic/scripts/c75_massSeen.mjs 56211 'Soviet Union' Romania 1218,300 40,55,65,72,75
AFTER=4242 t c75_bo_1942_GER_after4242.log node critic/scripts/c75_bannerOwn.mjs 1942 GER Germany 150
AFTER=4242 TAG=phone t c75_bo_1942_GER_after4242_phone.log node critic/scripts/c75_bannerOwn.mjs 1942 GER Germany 150 390 844
t c75_takescore_1942_GER_240.log node critic/scripts/c75_takescore.mjs 1942 GER 240
# Run 73's look (map visuals), desk and phone, its seeds and a new one
t c75_look_56901_desk.log node critic/scripts/c75_look.mjs 56901 1600 900 45,180,400
t c75_look_56903_phone.log node critic/scripts/c75_look.mjs 56903 390 844 60,240 phone
t c75_look_58901_desk.log node critic/scripts/c75_look.mjs 58901 1600 900 45,180,400
t c75_look_58903_phone.log node critic/scripts/c75_look.mjs 58903 390 844 60,240 phone
t c75_heropanel_55929.log node critic/scripts/c75_heropanel.mjs 55929
# Left out by run 74 for time
t c75_tagsChrome_56973.log node critic/scripts/c75_tagsChrome.mjs 56973
t c75_tagsChrome_58973.log node critic/scripts/c75_tagsChrome.mjs 58973
t c75_stripe_56981.log node critic/scripts/c75_stripe.mjs 56981
t c75_waits_56961.log node critic/scripts/c75_waits.mjs 56961
t c75_waits_56963.log node critic/scripts/c75_waits.mjs 56963
t c75_detvp.log node critic/scripts/c75_detvp.mjs
t c75_charts_58995.log node critic/scripts/c75_charts.mjs 58995
t c75_godpeace_phone_hist.log node critic/scripts/c75_godpeace.mjs 1942 GER 'Soviet Union' 390 844
echo LANE2A DONE
sh critic/scripts/c75_laneA.sh
sh critic/scripts/c75_pagesR.sh
echo LANE2DONE
