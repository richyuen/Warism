#!/bin/sh
cd /c/Git/Warism
until grep -q SUITEADONE critic/c33_suiteA.log; do sleep 20; done
sh critic/scripts/c33_suiteB.sh > critic/c33_suiteB.log 2>&1
sh critic/scripts/c33_suiteC.sh > critic/c33_suiteC.log 2>&1
echo CHAINDONE >> critic/c33_suiteC.log
