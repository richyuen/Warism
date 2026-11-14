#!/bin/sh
# Critic run 66: after c68_pages.sh, run 65's two page suites (UI, God, editor, stats named cases), then chainE (the
# editor re-runs, Malta's 18, the 15-year watch). Waits for the year-20 save of 32019.
cd /c/Git/Warism
until grep -q PAGESDONE critic/c68_pages.log 2>/dev/null && grep -q "32019 --years 20" critic/c68_named.progress; do sleep 15; done
sh critic/scripts/c68_suite.sh > critic/c68_suite.log 2>&1
sh critic/scripts/c68_suite2.sh > critic/c68_suite2.log 2>&1
sh critic/scripts/c68_chainE.sh > critic/c68_chainE.log 2>&1
echo PAGES2DONE >> critic/c68_suite2.log
