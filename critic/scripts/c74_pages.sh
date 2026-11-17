#!/bin/sh
# Critic run 73 (focused): the page probes, one at a time, on the c74 build at 5375. Run 72's named page cases, then a
# cut of run 72's suite on new seeds 56xxx (1938 games with heroes on, as a game from the title has them). Guarded.
cd /c/Git/Warism
mkdir critic/c74_pages.lock 2>/dev/null || { echo "already running"; exit 0; }
export BASE=http://127.0.0.1:5375
export EXTRA='&heroes=on'
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,?:@' '________' | cut -c1-80).log 2>&1; echo "   exit $?"; }
rp() { EXTRA_SAVE=$EXTRA; export EXTRA=; r "$@"; export EXTRA=$EXTRA_SAVE; }
# Run 72's named page cases that need no built year
r c74_heropanel 55929
r c74_undo2 41211
r c74_undo2y 51231
# The suite's cut, new seeds
r c74_z_zoom 57911
r c74_a_god_nuke 57917
r c74_q_god_tools 57919
rp c74_x_editor 57443
r c74_c_battle 57915
r c74_k_breakthrough 57979
r c74_pl_planes 57925 GER POL 5375
r c74_w_wing 57927
r c74_p_phone
r c74_u_ui
r c74_x_mouse 57421 10 1600 900
r c74_x_keys 57423
r c74_saveload_page 57937 200
r c74_x_continue 57415 40 GER 60
r c74_seaclick 57913
r c74_rg_relations 57929 365 1600 900 desk '&heroes=on'
r c74_rg_relations 57931 730 390 844 phone '&diplo=random'
r c74_phz 57933 40
r c74_hero 57425 300 hon
r c74_os2_scen critic/c26_critic_standoff.warsim-scenario c74
echo PAGES1DONE
until [ -f critic/c74_build.done ]; do sleep 15; done
r c74_godpeace 1942 JAP 'United States'
# takescore: run by c74_pagesN.sh C
r c74_h_godtab 390 844
r c74_x_replaycard 1983 free
r c74_ev91 1975 999 1975-01-02@tashkent:69.3:41.3:1500,moscow:37.6:55.75:1500 1975-12-31@korea:127:37.5:1500,china:120:36:4000
r c74_ev91 1990 999 1991-12-31@zimbabwe:31:-17.8:1500,madagascar:47.5:-18.9:1500,bangladesh:90.4:23.7:1500,gambia:-16.6:13.45:1000,canton:113.3:23.1:1500,moscow:37.6:55.75:1500,paris:2.35:48.85:1500
r c74_histnames 1991 replay 1938 1991 28
r c74_histnames 1975 replay 1938 1975 28
r c74_x_stage normandyD 1944 1944-06-05 1020.6 291.6 50
r c74_god42 1942 53542 replay
echo PAGES2DONE
until grep -q '^done:' critic/c74_seed7019_save.log 2>/dev/null && grep -q '^done:' critic/c74_seed32019_save.log 2>/dev/null; do sleep 20; done
rp c74_hist 32019 critic/c74_seed32019_y20.bin
rp c74_dl_export 32019 critic/c74_seed32019_y20.bin
rp c74_an_ainuke 7019 critic/c74_seed7019_y20.bin 7019y20 2 400
echo PAGES3DONE
echo "== c74_g_editor 57921 $(date +%T)"; timeout 420 node critic/scripts/c74_g_editor.mjs 57921 > critic/c74_g_editor.57921.log 2>&1; echo "   exit $?"
echo PAGES4DONE
