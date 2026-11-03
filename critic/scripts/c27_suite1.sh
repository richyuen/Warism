#!/bin/sh
# Critic run 23: run 22's probes re-run on HEAD (port 5299).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
r c27_q_god_tools 6421
r c27_k_breakthrough 2203
r c27_play 6011
r c27_g_editor 4877
r c27_fight 5381 21
r c27_fp2_fight 4877
OUT=c27_os_c10fmt1.json TAG=c10fmt1 r c27_oldsave critic/c10_seed4877_y20.bin 4877 1
r c27_a_god_nuke 4219
r c27_z_zoom 5861
r c27_c_battle 7019
r c27_ww_watch 3301
while [ ! -f critic/c27_batch.done ]; do sleep 20; done
r c27_dl_export 7019 critic/c27_seed7019_y20.bin
r c27_hist 7019 critic/c27_seed7019_y20.bin
echo SUITE1DONE
