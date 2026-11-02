#!/bin/sh
# Critic run 23: run 22's probes re-run on HEAD (port 5297).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
r c26_q_god_tools 6421
r c26_k_breakthrough 2203
r c26_play 6011
r c26_g_editor 4877
r c26_fight 5381 21
r c26_fp2_fight 4877
OUT=c26_os_c10fmt1.json TAG=c10fmt1 r c26_oldsave critic/c10_seed4877_y20.bin 4877 1
r c26_a_god_nuke 4219
r c26_z_zoom 5861
r c26_c_battle 7019
r c26_ww_watch 3301
while [ ! -f critic/c26_batch.done ]; do sleep 20; done
r c26_dl_export 7019 critic/c26_seed7019_y20.bin
r c26_hist 7019 critic/c26_seed7019_y20.bin
echo SUITE1DONE
