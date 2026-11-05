#!/bin/sh
cd /c/Git/Warism
sh critic/scripts/c34_suiteL.sh > critic/c34_suiteL.log 2>&1
sh critic/scripts/c34_suiteA.sh > critic/c34_suiteA.log 2>&1
sh critic/scripts/c34_suiteB.sh > critic/c34_suiteB.log 2>&1
sh critic/scripts/c34_suiteC.sh > critic/c34_suiteC.log 2>&1
echo CHAINDONE >> critic/c34_suiteC.log
