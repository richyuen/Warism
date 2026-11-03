#!/bin/sh
# Critic run 31: run 30's heroes page probes (HF, HFT, HFT2, HG, HWP, RGZ, RGT) and run 29's (heroes_page) on HEAD (5299).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1800 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c31_hf_herofold 5521 0 0 1600 900 desk
r c31_hf_herofold 5521 0 0 390 844 phone
r c31_hf_herofold 5521 0 9000 1600 900 desk
r c31_hf_herofold 4111 365 0 1600 900 desk
r c31_hf_herofold 7019 730 0 1600 900 desk
r c31_hft_foldtouch 5521
r c31_hft2_shot
r c31_hg_herogoto 4111 2485 3925
r c31_hwp_waitport 4111 15600 1 ger
r c31_rgz_zoom 4111 365
r c31_rgt_tap 4111 365
echo HEROES2DONE
