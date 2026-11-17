#!/bin/sh
# Critic run 69: the first page chain: c73_pagesA.sh, then c73_pagesC.sh (Malta's 18 and the rest).
cd /c/Git/Warism
sh critic/scripts/c73_pagesA.sh > critic/c73_pagesA.log 2>&1
sh critic/scripts/c73_pagesC.sh > critic/c73_pagesC.log 2>&1
echo done > critic/c73_chain1.done
