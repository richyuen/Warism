#!/bin/sh
# Critic run 76: run 75's named page cases (HEAD's build at 5399, c76_lib's default), two lanes of one at a time.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5399
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,?:' '_______' | cut -c1-80).log 2>&1; echo "   exit $?"; }
(
  AFTER=4242 node critic/scripts/c76_bannerOwn.mjs 1942 GER Germany 150 > critic/c76_bo_1942_GER_after4242.log 2>&1
  AFTER=4242 TAG=phone node critic/scripts/c76_bannerOwn.mjs 1942 GER Germany 150 390 844 > critic/c76_bo_1942_GER_after4242_phone.log 2>&1
  r c76_takescore 1942 GER 240
  node critic/scripts/c76_massSeen.mjs 56211 'Soviet Union' Romania 1218,300 40,55,65,72,75 > critic/c76_ms_56211.log 2>&1
  r c76_heropanel 55929
  r c76_undo2 41211
  r c76_undo2y 51231
  r c76_godpeace 1942 JAP 'United States'
  r c76_god42 1942 53542 replay
  r c76_x_stage normandyD 1944 1944-06-05 1020.6 291.6 50
  r c76_x_continue 58415 40 GER 60
  r c76_peacebtn 58217 GER POL 40 5 844 390
) > critic/c76_laneE1.out 2>&1 &
(
  until [ -f critic/c76_named.done ]; do sleep 15; done
  npx tsx tools/diag/seaBattlesLook.ts critic/c76_sb_58061.json --out critic/c76_sbl_58061.json > critic/c76_sbl_58061.log 2>&1; echo "sbl58061 $?"
  npx tsx tools/diag/seaBattlesLook.ts critic/c76_sb_39061.json --out critic/c76_sbl_39061.json > critic/c76_sbl_39061.log 2>&1; echo "sbl39061 $?"
  r c76_hist 32019 critic/c76_seed32019_y20.bin
  node critic/scripts/c76_look.mjs 56901 1600 900 45,180,400 > critic/c76_look_56901_desk.log 2>&1
  for s in "56901 430" "57905 230"; do set -- $s; WHEEL=1 node critic/scripts/c76_heroPop.mjs $1 $2 head > critic/c76_hpw_head_$1.log 2>&1; done
) > critic/c76_laneE2.out 2>&1 &
wait
echo done > critic/c76_laneE.done
