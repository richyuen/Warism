#!/bin/sh
# Critic run 29: run 28's page suites re-run on HEAD (5299), one after another (one browser at a time).
cd /c/Git/Warism
sh critic/scripts/c31_clicks.sh > critic/c31_clicks.log 2>&1
sh critic/scripts/c31_misc.sh > critic/c31_misc.log 2>&1
sh critic/scripts/c31_new.sh > critic/c31_new.log 2>&1
sh critic/scripts/c31_page.sh > critic/c31_page.log 2>&1
sh critic/scripts/c31_suite2.sh > critic/c31_suite2.log 2>&1
sh critic/scripts/c31_suite1.sh > critic/c31_suite1.log 2>&1
echo PAGESUITESDONE > critic/c31_pagesuites.done
