#!/bin/sh
# Critic run 50 (full): page probes one at a time on the c50 build at 5311 (run 48's full suite, run 49's cases, R42's).
cd /c/Git/Warism
export BASE=http://127.0.0.1:5311
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c50_lost 3517 desk
r c50_lost 3517 phone 390 844
r c50_lost 3517 land 844 390
export N=6; r c50_lost 3517 desk6; unset N
export N=6; r c50_lost 3517 phone6 390 844; unset N
r c50_rise_page
r c50_hero 20471 17520 desk
r c50_hero 20471 17520 phone 390 844
r c50_hero 20651 26280 desk
r c50_wait_page 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_sh 390 844 30
r c50_wait_page 20861 JAP CHI 1818.5,385.5 1708.5,382.5 3 jap_qd 1600 900 45
r c50_wait_page 20863 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br 1600 900 45
r c50_z_zoom 20865
r c50_seaclick 20867
r c50_seaclick 20869
r c50_c_battle 20871
r c50_a_god_nuke 20873
r c50_q_god_tools 20875
r c50_g_editor 20877
r c50_k_breakthrough 20879
r c50_pl_planes 20881 GER POL 5311
r c50_w_wing 20883
r c50_sb_seaballs 20885
r c50_p_phone
r c50_u_ui
r c50_rg_relations 20887 365 1600 900 desk '&heroes=on'
r c50_rg_relations 20889 365 390 844 phone '&diplo=random'
r c50_phz 20891 40
r c50_os2_scen critic/c26_critic_standoff.warsim-scenario c50
r c50_fw2_forcewar 20893
echo SUITEADONE
