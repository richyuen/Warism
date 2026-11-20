#!/bin/sh
# Critic run 89: the replay's yearly starts rebuilt on HEAD's sim (src/sim changed since run 85's, which earlier runs
# copied), into critic/c89_starts, then put in HEAD's build; compared with run 85's (cmp of each .sav).
cd /c/Git/Warism
until grep -q LONGDONE critic/c89_long.status 2>/dev/null; do sleep 15; done
npm run saves -- critic/c89_starts > critic/c89_starts.log 2>&1; echo "saves exit $?" >> critic/c89_starts.log
same=0; diff=0; for f in critic/c89_starts/*.sav; do if cmp -s $f critic/c85_starts/$(basename $f); then same=$((same+1)); else diff=$((diff+1)); echo "DIFF $f" >> critic/c89_starts.log; fi; done
echo "starts same $same differ $diff" >> critic/c89_starts.log
rm -rf critic/c89_dist/data/scenarios/1938h/start && cp -r critic/c89_starts critic/c89_dist/data/scenarios/1938h/start
echo done > critic/c89_starts.done
