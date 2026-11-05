#!/bin/sh
# Critic run 38 (focused): R37-B1's page case and R25's edges, by real clicks (NPX/NPY px off Shanghai's centre).
cd /c/Git/Warism
r() { tag=$1; shift; echo "== $tag $* $(date +%T)"; timeout 3600 "$@" > critic/c38_suiteR3_$tag.log 2>&1; echo "   exit $?"; }
r two_s42 env NPX=0.01 NPY=42 node critic/scripts/c38_lwt4.mjs 3517 2 30 24 near 1600 900 two_s42
r two_s21 env NPX=0.01 NPY=21 node critic/scripts/c38_lwt4.mjs 3517 2 30 24 near 1600 900 two_s21
r two_s63 env NPX=0.01 NPY=63 node critic/scripts/c38_lwt4.mjs 3517 2 30 24 near 1600 900 two_s63
r two_s105 env NPX=0.01 NPY=105 node critic/scripts/c38_lwt4.mjs 3517 2 30 24 near 1600 900 two_s105
r four_alls42 env NPX=0.01 NPY=42 node critic/scripts/c38_lwt4.mjs 3517 4 12 24 allnear 1600 900 four_alls42
r four_alls63 env NPX=0.01 NPY=63 node critic/scripts/c38_lwt4.mjs 3517 4 12 24 allnear 1600 900 four_alls63
r two_far_fuzhou env FX=1703.5 FY=445.5 node critic/scripts/c38_lwt3.mjs 3517 2 12 24 far 1600 900 two_far_fuzhou
r two_far_fuzhou_ph env FX=1703.5 FY=445.5 node critic/scripts/c38_lwt3.mjs 3517 2 12 24 far 390 844 two_far_fuzhou_ph2
echo SUITER3DONE
