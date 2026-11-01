#!/bin/sh
# Critic run 23: run 22's probes re-run on HEAD (port 5299).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
r c23_q_god_tools 6421
r c23_k_breakthrough 2203
r c23_play 6011
r c23_g_editor 4877
r c23_fight 5381 21
r c23_fp2_fight 4877
OUT=c23_os_c10fmt1.json TAG=c10fmt1 r c23_oldsave critic/c10_seed4877_y20.bin 4877 1
r c23_a_god_nuke 4219
r c23_z_zoom 5861
r c23_c_battle 7019
r c23_ww_watch 3301
while [ ! -f critic/c23_batch.done ]; do sleep 20; done
r c23_dl_export 7019 critic/c23_seed7019_y20.bin
r c23_hist 7019 critic/c23_seed7019_y20.bin
echo SUITE1DONE
