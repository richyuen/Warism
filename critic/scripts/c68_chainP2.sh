#!/bin/sh
# Critic run 68: the performance chain alone and last (run 67's c68_chainP.sh with this run's gates).
cd /c/Git/Warism
until grep -q BULKDONE critic/c68_chainBulk.log 2>/dev/null && [ -f critic/c68_named.done ] && [ -f critic/c68_chainS.done ] && grep -q PAGESBDONE critic/c68_pagesA.log 2>/dev/null && grep -q PAGESCDONE critic/c68_pagesC.log 2>/dev/null; do sleep 20; done
sed -e '/^until /d' critic/scripts/c68_chainP.sh > critic/c68_chainP_body.sh
sh critic/c68_chainP_body.sh
