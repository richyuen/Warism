#!/bin/sh
# Critic run 66: after c67_pages.sh, run 65's two page suites (UI, God, editor, stats named cases), then chainE (the
# editor re-runs, Malta's 18, the 15-year watch). Waits for the year-20 save of 32019.
cd /c/Git/Warism
until grep -q PAGESDONE critic/c67_pages.log 2>/dev/null && grep -q "32019 --years 20" critic/c67_named.progress; do sleep 15; done
sh critic/scripts/c67_suite.sh > critic/c67_suite.log 2>&1
sh critic/scripts/c67_suite2.sh > critic/c67_suite2.log 2>&1
sh critic/scripts/c67_chainE.sh > critic/c67_chainE.log 2>&1
echo PAGES2DONE >> critic/c67_suite2.log
