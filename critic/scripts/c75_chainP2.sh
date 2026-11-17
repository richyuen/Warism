#!/bin/sh
# Critic run 68: the performance chain alone and last (run 67's c75_chainP.sh with this run's gates).
cd /c/Git/Warism
until grep -q BULKDONE critic/c75_chainBulk.log 2>/dev/null && [ -f critic/c75_named.done ] && [ -f critic/c75_chainS.done ] && grep -q PAGESBDONE critic/c75_pagesA.log 2>/dev/null && grep -q PAGESCDONE critic/c75_pagesC.log 2>/dev/null; do sleep 20; done
sed -e '/^until /d' critic/scripts/c75_chainP.sh > critic/c75_chainP_body.sh
sh critic/c75_chainP_body.sh
