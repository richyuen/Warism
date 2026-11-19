#!/bin/bash
# Critic run 85 (full; copy of run 81's lane C, new seeds 85xxx on HEAD's build, 5411; the heroes 7019 year-20 save is run 81's, sim unchanged).
# arm, planes, nukes, History, the long watches) and run 78's page cases of God, take control and peace; new seeds 68xxx.
. /c/Git/Warism/critic/scripts/c85_r.sh
export EXTRA='&heroes=on'
rp() { EXTRA_SAVE=$EXTRA; export EXTRA=; r "$@"; export EXTRA=$EXTRA_SAVE; }
r a_god_nuke 85917
r q_god_tools 85919
r g_editor 85921
r os2_scen critic/c26_critic_standoff.warsim-scenario c70
rp sb_seaballs 20885 107 1188.17 328.5
r k_breakthrough 85979
r kwhist 85951
rp c_battle 7781
r c_battle 85915
r seaclick 85913
r kw_breakthrough 85923
r pl_planes 85925 GER POL 5411
r w_wing 85927
r u_ui
r phz 85933 40
r fw2_forcewar 85935
r hero 85425 300 hon
r hero 85427 300 hphone 390 844
r takescore 1942 GER 240
r heropanel 85929
r undo2 41211
r undo2y 51231
r godpeace 1942 JAP 'United States'
r god42 1942 85542 replay
waitfile critic/c85_seed7019_save.log
waitfile critic/c85_seed32019_save.log
rp an_ainuke 7019 critic/c85_seed7019_y20.bin 7019y20 2 400
rp an_ainuke 32019 critic/c85_seed32019_y20.bin 32019y20 2 400
rp hist 32019 critic/c85_seed32019_y20.bin
rp dl_export 32019 critic/c85_seed32019_y20.bin
waitfile critic/c85_seed85511_save.log
rp an_ainuke 85511 critic/c85_seed85511_y13.bin 85511y13 2 400
r hist 7019 critic/c81_hseed7019_y20.bin
r an_ainuke 7019 critic/c81_hseed7019_y20.bin h7019y20 2 400
TO=3600 r long_watch2 85941 12 '&heroes=on' hon
export EXTRA=; TO=3600 r long_watch2 85943 12 '' plain; export EXTRA='&heroes=on'
echo done > critic/c85_laneC.done
