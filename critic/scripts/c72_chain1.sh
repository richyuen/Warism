#!/bin/sh
# Critic run 69: the first page chain: c72_pagesA.sh, then c72_pagesC.sh (Malta's 18 and the rest).
cd /c/Git/Warism
sh critic/scripts/c72_pagesA.sh > critic/c72_pagesA.log 2>&1
sh critic/scripts/c72_pagesC.sh > critic/c72_pagesC.log 2>&1
echo done > critic/c72_chain1.done
