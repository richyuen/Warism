#!/bin/sh
# Critic run 73 (focused): the page probes, one at a time, on the c73 build at 5373. Run 72's named page cases, then a
# cut of run 72's suite on new seeds 56xxx (1938 games with heroes on, as a game from the title has them). Guarded.
cd /c/Git/Warism
mkdir critic/c73_pages.lock 2>/dev/null || { echo "already running"; exit 0; }
export BASE=http://127.0.0.1:5373
export EXTRA='&heroes=on'
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,?:@' '________' | cut -c1-80).log 2>&1; echo "   exit $?"; }
rp() { EXTRA_SAVE=$EXTRA; export EXTRA=; r "$@"; export EXTRA=$EXTRA_SAVE; }
# Run 72's named page cases that need no built year
r c73_heropanel 55929
r c73_undo2 41211
r c73_undo2y 51231
# The suite's cut, new seeds
r c73_z_zoom 56911
r c73_a_god_nuke 56917
r c73_q_god_tools 56919
rp c73_x_editor 56443
r c73_g_editor 56921
r c73_c_battle 56915
r c73_k_breakthrough 56979
r c73_pl_planes 56925 GER POL 5373
r c73_w_wing 56927
r c73_p_phone
r c73_u_ui
r c73_x_mouse 56421 10 1600 900
r c73_x_keys 56423
r c73_saveload_page 56937 200
r c73_x_continue 56415 40 GER 60
r c73_seaclick 56913
r c73_rg_relations 56929 365 1600 900 desk '&heroes=on'
r c73_rg_relations 56931 730 390 844 phone '&diplo=random'
r c73_phz 56933 40
r c73_hero 56425 300 hon
r c73_os2_scen critic/c26_critic_standoff.warsim-scenario c73
echo PAGES1DONE
until [ -f critic/c73_build.done ]; do sleep 15; done
r c73_godpeace 1942 JAP 'United States'
r c73_takescore 1942 GER 240
r c73_h_godtab 390 844
r c73_x_replaycard 1983 free
r c73_ev91 1975 999 1975-01-02@tashkent:69.3:41.3:1500,moscow:37.6:55.75:1500 1975-12-31@korea:127:37.5:1500,china:120:36:4000
r c73_ev91 1990 999 1991-12-31@zimbabwe:31:-17.8:1500,madagascar:47.5:-18.9:1500,bangladesh:90.4:23.7:1500,gambia:-16.6:13.45:1000,canton:113.3:23.1:1500,moscow:37.6:55.75:1500,paris:2.35:48.85:1500
r c73_histnames 1991 replay 1938 1991 28
r c73_histnames 1975 replay 1938 1975 28
r c73_x_stage normandyD 1944 1944-06-05 1020.6 291.6 50
r c73_god42 1942 replay 53542
echo PAGES2DONE
until grep -q '^done:' critic/c73_seed7019_save.log 2>/dev/null && grep -q '^done:' critic/c73_seed32019_save.log 2>/dev/null; do sleep 20; done
rp c73_hist 32019 critic/c73_seed32019_y20.bin
rp c73_dl_export 32019 critic/c73_seed32019_y20.bin
rp c73_an_ainuke 7019 critic/c73_seed7019_y20.bin 7019y20 2 400
echo PAGES3DONE
