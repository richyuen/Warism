#!/bin/sh
# Critic run 65: after the second page suite: the two editor cases again (the probe now waits for the build), Malta's 18
# (due: the sim changed), and the track's 15-year watch at Max (run 64's 0-of-57 case).
cd /c/Git/Warism
until grep -q SUITE2DONE critic/c68_suite2.log 2>/dev/null; do sleep 15; done
export BASE=http://127.0.0.1:5368
node critic/scripts/c68_x_editor.mjs 32443 > critic/c68_x_editor.32443.rerun.log 2>&1
MAINSTART=1 node critic/scripts/c68_x_editor.mjs 32441 > critic/c68_x_editor.32441.rerun.log 2>&1
P=3 sh critic/scripts/c68_malta.sh > critic/c68_malta.log 2>&1
node critic/scripts/c68_h_watch.mjs 1600 900 1954 91 desk > critic/c68_h_watch.log 2>&1
echo done > critic/c68_chainE.done
