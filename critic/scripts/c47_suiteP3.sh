#!/bin/sh
# Critic run 47: run 46's suites P and P2 on HEAD (preview 127.0.0.1:5298), then the phone recall hover and the new lost/edge probes.
cd /c/Git/Warism
sh critic/scripts/c47_suiteP.sh
sh critic/scripts/c47_suiteP2.sh
r() { tag=$1; shift; echo "== $tag $* $(date +%T)"; timeout 3600 "$@" > critic/c47_$tag.log 2>&1; echo "   exit $? $tag $(date +%T)"; }
r rcp_d3 env RECALL=72 node critic/scripts/c47_rcp_recall.mjs 3517 40 phone_d3 &
r lost_desk node critic/scripts/c47_lost.mjs 3517 desk 1600 900 &
r lost_phone node critic/scripts/c47_lost.mjs 3517 phone 390 844 &
wait
echo SUITEP3DONE
