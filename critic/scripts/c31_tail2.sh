#!/bin/sh
# Critic run 29: after the headless queue: OS2 again (G's export now exists), run 28's new page probes, then the
# ten-year page watch heroes off (run 28's case) and on (R5a), then PF, each alone in the browser.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c31_os2_scen
r c31_os2_scen critic/c26_critic_standoff.warsim-scenario c25
r c31_pup_panel 4583 60
r c31_phz 2671 40
r c31_rw 6143 80 3
r c31_an_ainuke 7019 critic/c31_seed7019_y20.bin 7019y20
r c31_pg2_played 4583 ITA YUG GER 24 rome
r c31_long_watch2 6151 10 '' def
r c31_long_watch2 6151 10 '&heroes=on' hon
r c31_long_watch2 4111 10 '&heroes=on' hon
r c31_long_watch2 4111 10 '' def
r c31_pf_lookfps 7019 critic/c31_seed7019_y20.bin
echo TAIL2DONE
