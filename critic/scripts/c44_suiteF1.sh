#!/bin/sh
# Critic run 43 (full): run 39's page probes on new seeds, lane 1.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c44_z_zoom 18101
r c44_c_battle 18203
r c44_c_battle 18307
r c44_w_wing 18411
r c44_a_god_nuke 18101
r c44_q_god_tools 18203
r c44_k_breakthrough 18307
r c44_phz 18411 40
r c44_sk_stacks 18513 20 60 18513
echo SUITEF1DONE
