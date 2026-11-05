#!/bin/sh
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c37_an_ainuke 11003 critic/c37_seed11003_y18.bin 11003y18 3 400
r c37_hist 11003 critic/c37_seed11003_y18.bin
r c37_dl_export 11003 critic/c37_seed11003_y18.bin
echo SUITEN2DONE
