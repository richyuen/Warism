#!/bin/sh
# Critic run 77: run 76's page findings re-run on HEAD (5399), two at a time: R76-N1 (dirHand), R76-N3 (director under
# History), R76-N2 (time-lapse: Space, Escape, the tooltip of the month), R76-N4 (an old save's time-lapse), the plate on a
# phone (R153), R76-N6 (heroes by the wheel), the war-to-the-death mark (R156), the phone's layout and Settings' menu.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5399
( node critic/scripts/c77_dirHand.mjs 59955 120 > critic/c77_dh_59955_desk.log 2>&1 ) &
( node critic/scripts/c77_dirHand.mjs 59955 120 390 844 touch > critic/c77_dh_59955_phone.log 2>&1 ) &
wait
( PANEL=history node critic/scripts/c77_director.mjs 59951 100 head 120 > critic/c77_dr_59951_hist_desk.log 2>&1 ) &
( PANEL=history node critic/scripts/c77_director.mjs 59951 100 head 120 390 844 > critic/c77_dr_59951_hist_phone.log 2>&1 ) &
wait
( node critic/scripts/c77_timeLapse.mjs 59941 400 head > critic/c77_tl_59941_desk.log 2>&1 ) &
( node critic/scripts/c77_timeLapse.mjs 59945 400 head 390 844 > critic/c77_tl_59945_phone.log 2>&1 ) &
wait
( node critic/scripts/c77_tlMore.mjs cell 59943 700 > critic/c77_tlMore_cell_59943.log 2>&1 ) &
( node critic/scripts/c77_tlMore.mjs old critic/c75_seed7019_y20.bin 40 > critic/c77_tm_old.log 2>&1 ) &
wait
for s in "56901 430" "58905 330" "59905 300" "59907 300"; do
  set -- $s
  WHEEL=1 node critic/scripts/c77_heroPop.mjs $1 $2 head > critic/c77_hpw_head_$1.log 2>&1
done &
( node critic/scripts/c77_deathTitle.mjs 7019 400 > critic/c77_dt_7019_desk.log 2>&1; node critic/scripts/c77_deathTitle.mjs 7019 400 390 844 > critic/c77_dt_7019_phone.log 2>&1; node critic/scripts/c77_p_phone.mjs > critic/c77_p_phone.log 2>&1 ) &
wait
echo done > critic/c77_laneF.done
