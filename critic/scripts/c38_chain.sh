#!/bin/sh
cd /c/Git/Warism
sh critic/scripts/c38_suiteL.sh > critic/c38_suiteL.log 2>&1
sh critic/scripts/c38_suiteA.sh > critic/c38_suiteA.log 2>&1
sh critic/scripts/c38_suiteB.sh > critic/c38_suiteB.log 2>&1
sh critic/scripts/c38_suiteC.sh > critic/c38_suiteC.log 2>&1
echo CHAINDONE >> critic/c38_suiteC.log
