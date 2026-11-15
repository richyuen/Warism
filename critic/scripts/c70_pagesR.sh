#!/bin/sh
# Critic run 70 (focused): the page cases behind run 69's "seen fixed" lines and the batch's new features, one at a time
# on the c70 build at 5370 (starts to 1991 in it).
cd /c/Git/Warism
until [ -f critic/c70_build.done ]; do sleep 15; done
export BASE=http://127.0.0.1:5370
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 2400 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,:@' '_______').log 2>&1; echo "   exit $?"; }
r c70_ev91 1990 999 1990-08-03@kuwait:47.98:29.37:600 1990-08-04@kuwait2:47.98:29.37:600 1991-12-27@caucasus:44:41.5:1500,world:30:30:20000,casia:65:43:3000,lanka:80.7:7.8:1500,benin:2.3:9.5:1500,zaire:23:-2:6000,myanmar:96:20:3000 1992-01-03@europe:28:50:3000
r c70_r83 1983 51283 1600 900
r c70_r83 1960 53260 1600 900 'heroes=on'
r c70_r83 1983 53283 390 844 'heroes=on'
r c70_x_replaycard 1991 free 390 844
r c70_undo2y 51231
r c70_undo2y 53231
echo "== sbl 39061"; npx tsx tools/diag/seaBattles.ts 39061 scenario --years 3 --out critic/c70_sb_39061.json > critic/c70_sb_39061.log 2>&1; npx tsx tools/diag/seaBattlesLook.ts critic/c70_sb_39061.json --out critic/c70_sbl_39061.json > critic/c70_sbl_39061.log 2>&1; echo "  exit $?"
echo PAGESDONE
