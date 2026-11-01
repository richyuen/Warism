#!/bin/sh
# Critic run 21: run 20's page probes re-run on HEAD (port 5299), one after another.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
r c22_q_god_tools 6421
r c22_k_breakthrough 2203
r c22_play 6011
r c22_g_editor 4877
r c22_fight 5381 21
r c22_fp2_fight 4877
OUT=c22_os_c10fmt1.json TAG=c10fmt1 r c22_oldsave critic/c10_seed4877_y20.bin 4877 1
r c22_a_god_nuke 4219
r c22_z_zoom 5861
r c22_c_battle 7019
r c22_ww_watch 3301
while [ ! -f critic/c22_ident.done ]; do sleep 20; done
r c22_dl_export 7019 critic/c22_seed7019_y20.bin
r c22_hist 7019 critic/c22_seed7019_y20.bin
echo SUITE1DONE
