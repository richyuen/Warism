#!/bin/sh
cd /c/Git/Warism
sh critic/scripts/c36_suiteL.sh > critic/c36_suiteL.log 2>&1
sh critic/scripts/c36_suiteA.sh > critic/c36_suiteA.log 2>&1
sh critic/scripts/c36_suiteB.sh > critic/c36_suiteB.log 2>&1
sh critic/scripts/c36_suiteC.sh > critic/c36_suiteC.log 2>&1
echo CHAINDONE >> critic/c36_suiteC.log
