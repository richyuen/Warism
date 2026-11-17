#!/bin/sh
# Critic run 68: the performance chain alone and last (run 67's c74_chainP.sh with this run's gates).
cd /c/Git/Warism
until grep -q BULKDONE critic/c74_chainBulk.log 2>/dev/null && [ -f critic/c74_named.done ] && [ -f critic/c74_chainS.done ] && grep -q PAGESBDONE critic/c74_pagesA.log 2>/dev/null && grep -q PAGESCDONE critic/c74_pagesC.log 2>/dev/null; do sleep 20; done
sed -e '/^until /d' critic/scripts/c74_chainP.sh > critic/c74_chainP_body.sh
sh critic/c74_chainP_body.sh
