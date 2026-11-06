#!/bin/sh
cd /c/Git/Warism
sh critic/scripts/c45_suiteL.sh > critic/c45_suiteL.log 2>&1
sh critic/scripts/c45_suiteA.sh > critic/c45_suiteA.log 2>&1
sh critic/scripts/c45_suiteB.sh > critic/c45_suiteB.log 2>&1
sh critic/scripts/c45_suiteC.sh > critic/c45_suiteC.log 2>&1
echo CHAINDONE >> critic/c45_suiteC.log
