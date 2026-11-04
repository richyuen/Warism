#!/bin/sh
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c32_an_ainuke 7019 critic/c32_seed7019_y20.bin 7019y20
r c32_hist 7019 critic/c32_seed7019_y20.bin
r c32_dl_export 7019 critic/c32_seed7019_y20.bin
r c32_pf_lookfps 7019 critic/c32_seed7019_y20.bin
r c32_sk_stacks 4111 30 60 4111
r c32_w_wing 7019
while [ ! -f critic/c32_seed6299_y18.bin ]; do sleep 30; done
r c32_an_ainuke 6299 critic/c32_seed6299_y18.bin 6299y18 3 400
echo SUITECDONE
