#!/bin/sh
# Critic run 69: the first page chain: c70_pagesA.sh, then c70_pagesC.sh (Malta's 18 and the rest).
cd /c/Git/Warism
sh critic/scripts/c70_pagesA.sh > critic/c70_pagesA.log 2>&1
sh critic/scripts/c70_pagesC.sh > critic/c70_pagesC.log 2>&1
echo done > critic/c70_chain1.done
