#!/bin/sh
cd /c/Git/Warism
sh critic/scripts/c35_suiteL.sh > critic/c35_suiteL.log 2>&1
sh critic/scripts/c35_suiteA.sh > critic/c35_suiteA.log 2>&1
sh critic/scripts/c35_suiteB.sh > critic/c35_suiteB.log 2>&1
sh critic/scripts/c35_suiteC.sh > critic/c35_suiteC.log 2>&1
echo CHAINDONE >> critic/c35_suiteC.log
