#!/bin/sh
# Critic run 68: after the perf chain, alone: R81b's act and undo times on 7019's year-20 world.
cd /c/Git/Warism
until grep -q PFDONE critic/c75_pf.status 2>/dev/null; do sleep 20; done
export BASE=http://127.0.0.1:5377
timeout 900 node critic/scripts/c75_undoLate.mjs critic/c75_seed7019_y20.bin > critic/c75_undoLate.log 2>&1; echo "undoLate $?"
echo P3DONE
