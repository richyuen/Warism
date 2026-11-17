#!/bin/sh
# Critic run 69: the first page chain: c75_pagesA.sh, then c75_pagesC.sh (Malta's 18 and the rest).
cd /c/Git/Warism
sh critic/scripts/c75_pagesA.sh > critic/c75_pagesA.log 2>&1
sh critic/scripts/c75_pagesC.sh > critic/c75_pagesC.log 2>&1
echo done > critic/c75_chain1.done
