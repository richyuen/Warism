#!/bin/sh
# Critic run 51 (full): page probes one at a time on the c51 build at 5321 (run 48's full suite, run 49's cases, R42's).
cd /c/Git/Warism
export BASE=http://127.0.0.1:5321
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c51_lost 3517 desk
r c51_lost 3517 phone 390 844
r c51_lost 3517 land 844 390
export N=6; r c51_lost 3517 desk6; unset N
export N=6; r c51_lost 3517 phone6 390 844; unset N
r c51_rise_page
r c51_hero 20471 17520 desk
r c51_hero 20471 17520 phone 390 844
r c51_hero 20651 26280 desk
r c51_wait_page 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_sh 390 844 30
r c51_wait_page 20861 JAP CHI 1818.5,385.5 1708.5,382.5 3 jap_qd 1600 900 45
r c51_wait_page 20863 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br 1600 900 45
r c51_z_zoom 20865
r c51_seaclick 20867
r c51_seaclick 20869
r c51_c_battle 20871
r c51_a_god_nuke 20873
r c51_q_god_tools 20875
r c51_g_editor 20877
r c51_k_breakthrough 20879
r c51_pl_planes 20881 GER POL 5321
r c51_w_wing 20883
r c51_sb_seaballs 20885
r c51_p_phone
r c51_u_ui
r c51_rg_relations 20887 365 1600 900 desk '&heroes=on'
r c51_rg_relations 20889 365 390 844 phone '&diplo=random'
r c51_phz 20891 40
r c51_os2_scen critic/c26_critic_standoff.warsim-scenario c51
r c51_fw2_forcewar 20893
echo SUITEADONE
