#!/bin/sh
# Critic run 29: run 28's page suites re-run on HEAD (5299), one after another (one browser at a time).
cd /c/Git/Warism
sh critic/scripts/c29_clicks.sh > critic/c29_clicks.log 2>&1
sh critic/scripts/c29_misc.sh > critic/c29_misc.log 2>&1
sh critic/scripts/c29_new.sh > critic/c29_new.log 2>&1
sh critic/scripts/c29_page.sh > critic/c29_page.log 2>&1
sh critic/scripts/c29_suite2.sh > critic/c29_suite2.log 2>&1
sh critic/scripts/c29_suite1.sh > critic/c29_suite1.log 2>&1
echo PAGESUITESDONE > critic/c29_pagesuites.done
