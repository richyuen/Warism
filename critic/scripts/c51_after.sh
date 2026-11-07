#!/bin/sh
cd /c/Git/Warism
until grep -q SUITEPDONE critic/c51_suiteP.out; do sleep 20; done
sh critic/scripts/c51_suite2.sh > critic/c51_suite2.out 2>&1
