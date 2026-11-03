#!/bin/sh
# Critic run 29: run 28's page suites re-run on HEAD (5299), one after another (one browser at a time).
cd /c/Git/Warism
sh critic/scripts/c30_clicks.sh > critic/c30_clicks.log 2>&1
sh critic/scripts/c30_misc.sh > critic/c30_misc.log 2>&1
sh critic/scripts/c30_new.sh > critic/c30_new.log 2>&1
sh critic/scripts/c30_page.sh > critic/c30_page.log 2>&1
sh critic/scripts/c30_suite2.sh > critic/c30_suite2.log 2>&1
sh critic/scripts/c30_suite1.sh > critic/c30_suite1.log 2>&1
echo PAGESUITESDONE > critic/c30_pagesuites.done
