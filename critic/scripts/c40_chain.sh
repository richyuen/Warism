#!/bin/sh
cd /c/Git/Warism
sh critic/scripts/c40_suiteL.sh > critic/c40_suiteL.log 2>&1
sh critic/scripts/c40_suiteA.sh > critic/c40_suiteA.log 2>&1
sh critic/scripts/c40_suiteB.sh > critic/c40_suiteB.log 2>&1
sh critic/scripts/c40_suiteC.sh > critic/c40_suiteC.log 2>&1
echo CHAINDONE >> critic/c40_suiteC.log
