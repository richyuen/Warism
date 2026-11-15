#!/bin/sh
# Critic run 68: the performance chain alone and last (run 67's c70_chainP.sh with this run's gates).
cd /c/Git/Warism
until grep -q BULKDONE critic/c70_chainBulk.log 2>/dev/null && [ -f critic/c70_named.done ] && [ -f critic/c70_chainS.done ] && grep -q PAGESBDONE critic/c70_pagesA.log 2>/dev/null && grep -q PAGESCDONE critic/c70_pagesC.log 2>/dev/null; do sleep 20; done
sed -e '/^until /d' critic/scripts/c70_chainP.sh > critic/c70_chainP_body.sh
sh critic/c70_chainP_body.sh
