#!/bin/sh
# Critic run 40: run 39's mark and touch probes (R27b/R28b), and lwt5's four re-clicked three cells SW.
cd /c/Git/Warism
r() { tag=$1; shift; echo "== $tag $* $(date +%T)"; timeout 3600 "$@" > critic/c40_$tag.log 2>&1; echo "   exit $?"; }
r mk_mixed_s2 node critic/scripts/c40_mk_mark.mjs 3517 mixed 0 2 40 1600 900 mixed_s2
r mk_aboard_s2 node critic/scripts/c40_mk_mark.mjs 3517 aboard 0 2 40 1600 900 aboard_s2
r mk_aboard_s3 node critic/scripts/c40_mk_mark.mjs 3517 aboard 0 3 40 1600 900 aboard_s3
r mk_mixedlow_s2 env FRESHLOW=60 node critic/scripts/c40_mk_mark.mjs 3517 mixed 0 2 40 1600 900 mixedlow_s2
r mk_phone_s2 node critic/scripts/c40_mk_mark.mjs 3517 aboard 0 2 40 390 844 phone_s2
r tm_touch node critic/scripts/c40_tm_touch.mjs
r lwt5_four_allsw63 env NPX=-63 NPY=63 node critic/scripts/c40_lwt5.mjs 3517 4 60 24 allnear 1600 900 four_allsw63
echo SUITEMKDONE
