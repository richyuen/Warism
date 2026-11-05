#!/bin/sh
# Critic run 39 (full): the page probes on new seeds (13xxx), not compared.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c39_z_zoom 13109
r c39_c_battle 13313
r c39_c_battle 13519
r c39_w_wing 13417
r c39_a_god_nuke 13007
r c39_q_god_tools 13211
r c39_k_breakthrough 13109
r c39_phz 13109 40
r c39_sk_stacks 13313 20 60 13313
r c39_rg_relations 13109 365 1600 900 desk '&heroes=on'
r c39_pl_planes 13417 GER POL 5299
r c39_hf_herofold 13007 730 0 1600 900 desk
r c39_an_ainuke 13007 critic/c39_seed13007_y18.bin 13007y18 3 400
r c39_hist 13007 critic/c39_seed13007_y18.bin
r c39_dl_export 13007 critic/c39_seed13007_y18.bin
echo SUITENEWDONE
