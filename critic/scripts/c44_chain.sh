#!/bin/sh
cd /c/Git/Warism
sh critic/scripts/c44_suiteL.sh > critic/c44_suiteL.log 2>&1
sh critic/scripts/c44_suiteA.sh > critic/c44_suiteA.log 2>&1
sh critic/scripts/c44_suiteB.sh > critic/c44_suiteB.log 2>&1
sh critic/scripts/c44_suiteC.sh > critic/c44_suiteC.log 2>&1
echo CHAINDONE >> critic/c44_suiteC.log
