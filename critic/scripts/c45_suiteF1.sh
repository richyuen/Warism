#!/bin/sh
# Critic run 43 (full): run 39's page probes on new seeds, lane 1.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c45_z_zoom 18101
r c45_c_battle 18203
r c45_c_battle 18307
r c45_w_wing 18411
r c45_a_god_nuke 18101
r c45_q_god_tools 18203
r c45_k_breakthrough 18307
r c45_phz 18411 40
r c45_sk_stacks 18513 20 60 18513
echo SUITEF1DONE
