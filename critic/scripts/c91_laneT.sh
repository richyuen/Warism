#!/bin/bash
# Critic run 91 (copy of run 90's) (copy of run 89's), lane T: tanks, aircraft and the AI's nukes on the page (touched by src/sim; last fresh in run 85): run
# 85's probes on new seeds 89xxx, heroes on as from the title, at 2560 x 1305 (VW, VH read by c85_lib's launch).
. /c/Git/Warism/critic/scripts/c91_r.sh
export EXTRA='&heroes=on' VW=2560 VH=1305
rp() { EXTRA_SAVE=$EXTRA; export EXTRA=; r "$@"; export EXTRA=$EXTRA_SAVE; }
r k_breakthrough 91979
r kwhist 91951
rp c_battle 7781
r c_battle 91915
r kw_breakthrough 91923
r pl_planes 91925 GER POL 5491
r w_wing 91927
r hero 91425 300 hon
r hero 91427 300 hphone 393 852
r heropanel 91929
waitfile critic/c91_seed7019_save.log
waitfile critic/c91_seed32019_save.log
rp an_ainuke 7019 critic/c91_seed7019_y20.bin 7019y20 2 400
rp an_ainuke 32019 critic/c91_seed32019_y20.bin 32019y20 2 400
waitfile critic/c91_seed91511_save.log
rp an_ainuke 91511 critic/c91_seed91511_y13.bin 91511y13 2 400
rp an_ainuke 64511 critic/c79_seed64511_y13.bin 64511y13 2 400
echo done > /c/Git/Warism/critic/c91_laneT.done
