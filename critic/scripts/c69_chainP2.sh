#!/bin/sh
# Critic run 68: the performance chain alone and last (run 67's c69_chainP.sh with this run's gates).
cd /c/Git/Warism
until grep -q BULKDONE critic/c69_chainBulk.log 2>/dev/null && [ -f critic/c69_named.done ] && [ -f critic/c69_chainS.done ] && grep -q PAGESBDONE critic/c69_pagesA.log 2>/dev/null && grep -q PAGESCDONE critic/c69_pagesC.log 2>/dev/null; do sleep 20; done
sed -e '/^until /d' critic/scripts/c69_chainP.sh > critic/c69_chainP_body.sh
sh critic/c69_chainP_body.sh
