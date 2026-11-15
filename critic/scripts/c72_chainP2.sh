#!/bin/sh
# Critic run 68: the performance chain alone and last (run 67's c72_chainP.sh with this run's gates).
cd /c/Git/Warism
until grep -q BULKDONE critic/c72_chainBulk.log 2>/dev/null && [ -f critic/c72_named.done ] && [ -f critic/c72_chainS.done ] && grep -q PAGESBDONE critic/c72_pagesA.log 2>/dev/null && grep -q PAGESCDONE critic/c72_pagesC.log 2>/dev/null; do sleep 20; done
sed -e '/^until /d' critic/scripts/c72_chainP.sh > critic/c72_chainP_body.sh
sh critic/c72_chainP_body.sh
