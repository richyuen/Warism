#!/bin/bash
# Critic run 80 (full), lane C: run 75's whole-brief page suite, part 2 (God Mode, the editor's file, battles of every
# arm, planes, nukes, History, the long watches) and run 78's page cases of God, take control and peace; new seeds 68xxx.
. /c/Git/Warism/critic/scripts/c81_r.sh
export EXTRA='&heroes=on'
rp() { EXTRA_SAVE=$EXTRA; export EXTRA=; r "$@"; export EXTRA=$EXTRA_SAVE; }
r a_god_nuke 69917
r q_god_tools 69919
r g_editor 69921
r os2_scen critic/c26_critic_standoff.warsim-scenario c70
rp sb_seaballs 20885 107 1188.17 328.5
r k_breakthrough 69979
r kwhist 69951
rp c_battle 7781
r c_battle 69915
r seaclick 69913
r kw_breakthrough 69923
r pl_planes 69925 GER POL 5403
r w_wing 69927
r u_ui
r phz 69933 40
r fw2_forcewar 69935
r hero 69425 300 hon
r hero 69427 300 hphone 390 844
r takescore 1942 GER 240
r heropanel 69929
r undo2 41211
r undo2y 51231
r godpeace 1942 JAP 'United States'
r god42 1942 69542 replay
waitfile critic/c81_seed7019_save.log
waitfile critic/c81_seed32019_save.log
rp an_ainuke 7019 critic/c81_seed7019_y20.bin 7019y20 2 400
rp an_ainuke 32019 critic/c81_seed32019_y20.bin 32019y20 2 400
rp hist 32019 critic/c81_seed32019_y20.bin
rp dl_export 32019 critic/c81_seed32019_y20.bin
waitfile critic/c81_seed69511_save.log
rp an_ainuke 69511 critic/c81_seed69511_y13.bin 69511y13 2 400
waitfile critic/c81_hero_7019_20.log
r hist 7019 critic/c81_hseed7019_y20.bin
r an_ainuke 7019 critic/c81_hseed7019_y20.bin h7019y20 2 400
TO=3600 r long_watch2 69941 12 '&heroes=on' hon
export EXTRA=; TO=3600 r long_watch2 69943 12 '' plain; export EXTRA='&heroes=on'
echo done > critic/c81_laneC.done
