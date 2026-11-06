#!/bin/sh
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c43_an_ainuke 7019 critic/c32_seed7019_y20.bin 7019y20
r c43_hist 7019 critic/c32_seed7019_y20.bin
r c43_dl_export 7019 critic/c32_seed7019_y20.bin
r c43_pf_lookfps 7019 critic/c32_seed7019_y20.bin
r c43_sk_stacks 1212 20 60 1212
r c43_sk_stacks 8123 30 60 8123
r c43_w_wing 7019
r c43_w_wing 8431
r c43_z_zoom 8123
r c43_c_battle 8573
r c43_a_god_nuke 8999
r c43_q_god_tools 8807
r c43_phz 8233 40
echo SUITECDONE
