#!/bin/sh
# Critic run 31 (full): new page probes on new seeds, after the re-run suites (one browser at a time, port 5299).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c31_df_default 7019 POL -800 220 pol
r c31_hf_herofold 1201 0 0 390 844 phone
r c31_hf_herofold 1201 0 0 1600 900 desk
r c31_hf_herofold 6977 365 0 390 844 phone
r c31_hft_foldtouch 1201
r c31_hft_foldtouch 6977
r c31_z_zoom 1201
r c31_c_battle 2417
r c31_hwp_waitport 4637 132000 19 fra
r c31_long_watch2 1201 10 '&heroes=on' hon
while [ ! -f critic/c31_seed6299_y18.bin ]; do sleep 30; done
r c31_an_ainuke 6299 critic/c31_seed6299_y18.bin 6299y18 3 400
echo EXTRADONE
