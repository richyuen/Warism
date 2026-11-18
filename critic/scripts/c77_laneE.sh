#!/bin/sh
# Critic run 76: run 75's named page cases (HEAD's build at 5399, c77_lib's default), two lanes of one at a time.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5399
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,?:' '_______' | cut -c1-80).log 2>&1; echo "   exit $?"; }
(
  AFTER=4242 node critic/scripts/c77_bannerOwn.mjs 1942 GER Germany 150 > critic/c77_bo_1942_GER_after4242.log 2>&1
  AFTER=4242 TAG=phone node critic/scripts/c77_bannerOwn.mjs 1942 GER Germany 150 390 844 > critic/c77_bo_1942_GER_after4242_phone.log 2>&1
  r c77_takescore 1942 GER 240
  node critic/scripts/c77_massSeen.mjs 56211 'Soviet Union' Romania 1218,300 40,55,65,72,75 > critic/c77_ms_56211.log 2>&1
  r c77_heropanel 55929
  r c77_undo2 41211
  r c77_undo2y 51231
  r c77_godpeace 1942 JAP 'United States'
  r c77_god42 1942 53542 replay
  r c77_x_stage normandyD 1944 1944-06-05 1020.6 291.6 50
  r c77_x_continue 58415 40 GER 60
  r c77_peacebtn 58217 GER POL 40 5 844 390
) > critic/c77_laneE1.out 2>&1 &
(
  until [ -f critic/c77_named.done ]; do sleep 15; done
  npx tsx tools/diag/seaBattlesLook.ts critic/c77_sb_58061.json --out critic/c77_sbl_58061.json > critic/c77_sbl_58061.log 2>&1; echo "sbl58061 $?"
  npx tsx tools/diag/seaBattlesLook.ts critic/c77_sb_39061.json --out critic/c77_sbl_39061.json > critic/c77_sbl_39061.log 2>&1; echo "sbl39061 $?"
  r c77_hist 32019 critic/c77_seed32019_y20.bin
  node critic/scripts/c77_look.mjs 56901 1600 900 45,180,400 > critic/c77_look_56901_desk.log 2>&1
  for s in "56901 430" "57905 230"; do set -- $s; WHEEL=1 node critic/scripts/c77_heroPop.mjs $1 $2 head > critic/c77_hpw_head_$1.log 2>&1; done
) > critic/c77_laneE2.out 2>&1 &
wait
echo done > critic/c77_laneE.done
