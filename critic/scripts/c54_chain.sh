#!/bin/sh
cd /c/Git/Warism
until grep -q SUITEPDONE critic/c54_suiteP.log 2>/dev/null; do sleep 20; done
sh critic/scripts/c54_suiteP2.sh > critic/c54_suiteP2.log 2>&1
