#!/bin/sh
# Critic run 47: R38d cases on HEAD and on 4040cad6 (the script copied into critic/wt so its imports hit critic/wt/src).
cd /c/Git/Warism
run() { tag=$1; shift; ( cd /c/Git/Warism && env "$@" npx tsx critic/scripts/c47_far.ts 3517 critic/c47_far_${tag}_head.json > critic/c47_far_${tag}_head.log 2>&1 ) & ( cd /c/Git/Warism/critic/wt && env "$@" npx tsx critic/scripts/c47_far.ts 3517 /c/Git/Warism/critic/c47_far_${tag}_wt.json > /c/Git/Warism/critic/c47_far_${tag}_wt.log 2>&1 ) & wait; }
run usachi_eng TAG=USA FOE=ENG FROM=-87.6,41.9 TO=1.3,52.6 N=1 DAYS=200
run sovmos_cyp TAG=SOV FOE=ENG FROM=37.6,55.75 TO=33.0,35.1 N=1 DAYS=200
run sovmos_got TAG=SOV FOE=SWE FROM=37.6,55.75 TO=18.5,57.5 N=1 DAYS=200
run gerkon_eng TAG=GER FOE=ENG FROM=20.5,54.7 TO=1.3,52.6 N=1 DAYS=200
echo FARDONE
