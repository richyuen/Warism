#!/bin/bash
# Critic run 90 (copy of run 89's), lane T: tanks, aircraft and the AI's nukes on the page (touched by src/sim; last fresh in run 85): run
# 85's probes on new seeds 89xxx, heroes on as from the title, at 2560 x 1305 (VW, VH read by c85_lib's launch).
. /c/Git/Warism/critic/scripts/c90_r.sh
export EXTRA='&heroes=on' VW=2560 VH=1305
rp() { EXTRA_SAVE=$EXTRA; export EXTRA=; r "$@"; export EXTRA=$EXTRA_SAVE; }
r k_breakthrough 90979
r kwhist 90951
rp c_battle 7781
r c_battle 90915
r kw_breakthrough 90923
r pl_planes 90925 GER POL 5451
r w_wing 90927
r hero 90425 300 hon
r hero 90427 300 hphone 393 852
r heropanel 90929
waitfile critic/c90_seed7019_save.log
waitfile critic/c90_seed32019_save.log
rp an_ainuke 7019 critic/c90_seed7019_y20.bin 7019y20 2 400
rp an_ainuke 32019 critic/c90_seed32019_y20.bin 32019y20 2 400
waitfile critic/c90_seed90511_save.log
rp an_ainuke 90511 critic/c90_seed90511_y13.bin 90511y13 2 400
rp an_ainuke 64511 critic/c79_seed64511_y13.bin 64511y13 2 400
echo done > /c/Git/Warism/critic/c90_laneT.done
