#!/bin/sh
# Critic run 91: the replay's yearly starts rebuilt on HEAD's sim (src/sim changed: R220's inReach, R219, R222), into
# critic/c91_starts, compared with run 90's (cmp of each .sav), then put in HEAD's build.
cd /c/Git/Warism
npm run saves -- critic/c91_starts > critic/c91_starts.log 2>&1; echo "saves exit $?" >> critic/c91_starts.log
same=0; diff=0; for f in critic/c91_starts/*.sav; do if cmp -s $f critic/c90_starts/$(basename $f); then same=$((same+1)); else diff=$((diff+1)); echo "DIFF $f" >> critic/c91_starts.log; fi; done
echo "starts same $same differ $diff" >> critic/c91_starts.log
rm -rf critic/c91_dist/data/scenarios/1938h/start && cp -r critic/c91_starts critic/c91_dist/data/scenarios/1938h/start
echo done > critic/c91_starts.done
