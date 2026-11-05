#!/bin/sh
# Critic run 38: lwt5 (lwt4 + the notice's shot and order-news rows) on R25's page cases.
cd /c/Git/Warism
r() { tag=$1; shift; echo "== $tag $* $(date +%T)"; timeout 3600 "$@" > critic/c39_suiteR5_$tag.log 2>&1; echo "   exit $?"; }
r two_s42 env NPX=0.01 NPY=42 node critic/scripts/c39_lwt5.mjs 3517 2 30 24 near 1600 900 two_s42
r four_alls42 env NPX=0.01 NPY=42 node critic/scripts/c39_lwt5.mjs 3517 4 60 24 allnear 1600 900 four_alls42
r two_w42 env NPX=-42 NPY=0 node critic/scripts/c39_lwt5.mjs 3517 2 30 24 near 1600 900 two_w42
r two_e14 env NPX=14 NPY=0 node critic/scripts/c39_lwt5.mjs 3517 2 30 24 near 1600 900 two_e14
echo SUITER5DONE
