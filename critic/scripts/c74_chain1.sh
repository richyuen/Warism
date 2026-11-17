#!/bin/sh
# Critic run 69: the first page chain: c74_pagesA.sh, then c74_pagesC.sh (Malta's 18 and the rest).
cd /c/Git/Warism
sh critic/scripts/c74_pagesA.sh > critic/c74_pagesA.log 2>&1
sh critic/scripts/c74_pagesC.sh > critic/c74_pagesC.log 2>&1
echo done > critic/c74_chain1.done
