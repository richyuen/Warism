#!/bin/sh
# Critic run 58: the rest of run 57's named cases on HEAD (5358).
cd /c/Git/Warism
export BASE=http://127.0.0.1:5358
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,|' '______').log 2>&1; echo "   exit $?"; }
CANCELAT=66 ORDERAT=198 ORDERTO=1106.5,383.5 ORDERIDS=323,324 SHOTAT=78,198,240,420 r c58_retstuck 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 ita_malta6_reclick 480
for s in 27123 27127 27129; do r c58_lland $s ENG GER 1023.5,275.5 1072.5,259.5 10 eng_br10 400; done
NOASSIST=1 r c58_dip_player 28403 GER POL HUN,ENG 30
r c58_peacebtn 29403 JAP CHI 120 5 390 844
env SEED=24033 ORDERDAYS=8 DIV=367 npx tsx critic/scripts/c58_orderdays.ts > critic/c58_od_24033_8.log 2>&1
echo SUITECDONE
