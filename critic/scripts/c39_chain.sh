#!/bin/sh
cd /c/Git/Warism
sh critic/scripts/c39_suiteL.sh > critic/c39_suiteL.log 2>&1
sh critic/scripts/c39_suiteA.sh > critic/c39_suiteA.log 2>&1
sh critic/scripts/c39_suiteB.sh > critic/c39_suiteB.log 2>&1
sh critic/scripts/c39_suiteC.sh > critic/c39_suiteC.log 2>&1
echo CHAINDONE >> critic/c39_suiteC.log
