#!/bin/sh
# Critic run 38 (copy of run 37): run 36's R36-B1/B2 page cases re-run (real clicks NPX px east of Shanghai), and R24's edges.
cd /c/Git/Warism
r() { tag=$1; shift; echo "== $tag $* $(date +%T)"; timeout 3600 "$@" > critic/c39_suiteR2_$tag.log 2>&1; echo "   exit $?"; }
r four_allnear14 env NPX=14 node critic/scripts/c39_lwt2.mjs 3517 4 12 24 allnear 1600 900 four_allnear14
r two_near14 env NPX=14 node critic/scripts/c39_lwt2.mjs 3517 2 30 24 near 1600 900 two_near14
r two_near8 env NPX=8 node critic/scripts/c39_lwt2.mjs 3517 2 30 24 near 1600 900 two_near8
r four_allnear8 env NPX=8 node critic/scripts/c39_lwt2.mjs 3517 4 60 24 allnear 1600 900 four_allnear8
r two_near42 env NPX=42 node critic/scripts/c39_lwt2.mjs 3517 2 30 24 near 1600 900 two_near42
r two_near63 env NPX=63 node critic/scripts/c39_lwt2.mjs 3517 2 30 24 near 1600 900 two_near63
r four_allnear42 env NPX=42 node critic/scripts/c39_lwt2.mjs 3517 4 12 24 allnear 1600 900 four_allnear42
r four_far_fuzhou env FX=1703.5 FY=445.5 node critic/scripts/c39_lwt3.mjs 3517 4 12 24 far 1600 900 four_far_fuzhou
r two_far_fuzhou_phone env FX=1703.5 FY=445.5 node critic/scripts/c39_lwt3.mjs 3517 2 12 24 far 390 844 two_far_fuzhou_phone
echo SUITER2DONE
