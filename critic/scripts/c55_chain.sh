#!/bin/sh
cd /c/Git/Warism
until grep -q SUITEPDONE critic/c55_suiteP.log 2>/dev/null; do sleep 20; done
sh critic/scripts/c55_suiteP2.sh > critic/c55_suiteP2.log 2>&1
