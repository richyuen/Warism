#!/bin/bash
# Critic run 89: the lanes started after the every-run sim jobs end (memory: 33 GB).
cd /c/Git/Warism
until grep -q LONGDONE critic/c89_long.status 2>/dev/null; do sleep 15; done
for l in B E N T W M; do (nohup bash critic/scripts/c89_lane$l.sh > critic/c89_lane$l.out 2>&1 &); done
