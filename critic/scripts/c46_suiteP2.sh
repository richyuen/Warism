#!/bin/sh
# Critic run 46: run 45's page probes of R45-B1/N1 (uw_wait) and R45-N2/N3 (sea hover), on HEAD (preview on 127.0.0.1:5297).
cd /c/Git/Warism
r() { tag=$1; shift; echo "== $tag $* $(date +%T)"; timeout 3600 "$@" > critic/c46_$tag.log 2>&1; echo "   exit $? $tag $(date +%T)"; }
r uw_three18705 env NRE=3 node critic/scripts/c46_uw_wait.mjs 18705 60 three18705 &
r uw_four node critic/scripts/c46_uw_wait.mjs 3517 60 four &
r uw_four15101 node critic/scripts/c46_uw_wait.mjs 15101 60 four15101 &
wait
r uh_desk node critic/scripts/c46_uh_seahover.mjs 3517 50 desk 1600 900 &
r uh_phone node critic/scripts/c46_uh_seahover.mjs 3517 50 phone 390 844 &
r uw_three19101 env NRE=3 node critic/scripts/c46_uw_wait.mjs 19101 60 three19101 &
wait
r sib_freshfirst env AT=24,240,480,540,600,640 node critic/scripts/c46_sib_panel.mjs 3517 40 freshfirst &
r sib_freshfirst_19101 env AT=24,240,480,540,600,640 node critic/scripts/c46_sib_panel.mjs 19101 40 freshfirst_19101 &
wait
echo SUITEP2DONE
