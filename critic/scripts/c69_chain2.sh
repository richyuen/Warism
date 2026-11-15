#!/bin/sh
# Critic run 69: the second page chain: the starts-based cases (c69_pages.sh), then run 68's left-out suites (suite,
# suite2, chainE without Malta, which c69_pagesC.sh runs), then suite B.
cd /c/Git/Warism
sh critic/scripts/c69_pages.sh > critic/c69_pages.log 2>&1
sh critic/scripts/c69_pages2.sh > critic/c69_pages2.log 2>&1
sh critic/scripts/c69_suiteB.sh > critic/c69_suiteB.log 2>&1
echo done > critic/c69_chain2.done
