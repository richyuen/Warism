#!/bin/sh
# Critic run 38: lwt5 (lwt4 + the notice's shot and order-news rows) on R25's page cases.
cd /c/Git/Warism
while ! grep -q SUITER3DONE critic/c43_suiteR3.log 2>/dev/null; do sleep 20; done
r() { tag=$1; shift; echo "== $tag $* $(date +%T)"; timeout 3600 "$@" > critic/c43_suiteR4_$tag.log 2>&1; echo "   exit $?"; }
r two_s42 env NPX=0.01 NPY=42 node critic/scripts/c43_lwt5.mjs 3517 2 30 24 near 1600 900 two_s42
r four_alls42 env NPX=0.01 NPY=42 node critic/scripts/c43_lwt5.mjs 3517 4 60 24 allnear 1600 900 four_alls42
r two_s42_ph env NPX=0.01 NPY=10 node critic/scripts/c43_lwt5.mjs 3517 2 30 24 near 390 844 two_s10_phone
r two_w42 env NPX=-42 NPY=0 node critic/scripts/c43_lwt5.mjs 3517 2 30 24 near 1600 900 two_w42
r two_far_fuzhou_t env FX=1703.5 FY=445.5 node critic/scripts/c43_lwt3.mjs 3517 2 30 24 far 1600 900 two_far_fuzhou_long
echo SUITER4DONE
