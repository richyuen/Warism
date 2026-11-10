#!/bin/sh
cd /c/Git/Warism
until grep -q SUITEPDONE critic/c61_suiteP.log 2>/dev/null; do sleep 20; done
sh critic/scripts/c61_suiteP2.sh > critic/c61_suiteP2.log 2>&1
