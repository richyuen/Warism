#!/bin/sh
# Critic run 69: the first page chain: c69_pagesA.sh, then c69_pagesC.sh (Malta's 18 and the rest).
cd /c/Git/Warism
sh critic/scripts/c69_pagesA.sh > critic/c69_pagesA.log 2>&1
sh critic/scripts/c69_pagesC.sh > critic/c69_pagesC.log 2>&1
echo done > critic/c69_chain1.done
