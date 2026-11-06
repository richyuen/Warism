#!/bin/sh
cd /c/Git/Warism
sh critic/scripts/c43_suiteL.sh > critic/c43_suiteL.log 2>&1
sh critic/scripts/c43_suiteA.sh > critic/c43_suiteA.log 2>&1
sh critic/scripts/c43_suiteB.sh > critic/c43_suiteB.log 2>&1
sh critic/scripts/c43_suiteC.sh > critic/c43_suiteC.log 2>&1
echo CHAINDONE >> critic/c43_suiteC.log
