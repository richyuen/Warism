#!/bin/sh
# Critic run 68: landingFuzz started beside the named queue (its runner's shell stopped, its xargs left running), so the
# bulk chain can follow it sooner; c73_named.done written when the queue's xargs ends.
cd /c/Git/Warism
( while tasklist //FI "PID eq 53852" 2>/dev/null | grep -q xargs; do sleep 20; done; echo done > critic/c73_named.done ) &
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 41101 --jobs 6 > critic/c73_landingFuzz.log 2>&1
echo done > critic/c73_fuzz.done
wait
