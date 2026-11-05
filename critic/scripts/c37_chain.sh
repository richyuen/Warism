#!/bin/sh
cd /c/Git/Warism
sh critic/scripts/c37_suiteL.sh > critic/c37_suiteL.log 2>&1
sh critic/scripts/c37_suiteA.sh > critic/c37_suiteA.log 2>&1
sh critic/scripts/c37_suiteB.sh > critic/c37_suiteB.log 2>&1
sh critic/scripts/c37_suiteC.sh > critic/c37_suiteC.log 2>&1
echo CHAINDONE >> critic/c37_suiteC.log
