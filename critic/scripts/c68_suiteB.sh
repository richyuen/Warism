#!/bin/sh
# Critic run 67 (full): run 63's whole-brief page probes on new seeds (35xxx -> 39xxx; 351xx -> 399xx), one at a time, at 5368.
cd /c/Git/Warism
until grep -q SUITE2DONE critic/c68_suite2.log 2>/dev/null; do sleep 20; done
export BASE=http://127.0.0.1:5368
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3000 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,?:' '_______').log 2>&1; echo "   exit $?"; }
M="1095.5,344.5 1106.5,383.5"; J="1818.5,385.5 1715.5,413.5"
# The batch's newest UI (R58b-d) on new seeds
r c68_nvpage 39211 ITA ENG $M 12 360
r c68_nvpage 39213 JAP CHI 1808.9,389.5 1715.0,413.7 10 480
r c68_whotold 39215 ITA ENG $M 6 300
r c68_peacebtn 39217 GER POL 40 5 844 390
r c68_peacebtn 39217 GER POL 40 5 1600 900
r c68_manywars 39219 GER POL,CZE,FRA,ENG,SOV,BEL,HOL,DEN,NOR,SWE 390 844
# Landings, new seeds
SHOTAT=30,36,48 r c68_turnback 39901 JAP CHI $J 3 jap_cancel3 26 60
SHOTAT=40,60,90 r c68_lhold 39905 ITA ENG $M 2 ita_malta 200
r c68_lland 39903 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3 240
r c68_lland 39907 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
STEP=2 r c68_lland 39909 JAP CHI $J 3 jap_sh3 200
r c68_lbar 39221 JAP CHI $J 3 jap_sh3_phone 390 844 12
r c68_lbox 39223 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 844 390 5
# Earlier batches' UI
r c68_new mine 39303 1600 900 GER 365
r c68_new mine 39303 390 844 GER 365
r c68_new filter 39305 1600 900
r c68_new filter 39305 390 844
r c68_new corridor 39307 1600 900
CORRM=3000 r c68_new corridor 39307 390 844
r c68_new build 39301 390 844
r c68_new build 39301 844 390
r c68_rg_relations 39929 365 1600 900 desk '&heroes=on'
r c68_rg_relations 39939 365 1600 900 desk ''
r c68_rg_relations 39931 730 390 844 phone '&diplo=random'
r c68_os2_scen critic/c26_critic_standoff.warsim-scenario c68
r c68_sb_seaballs 20885 107 1188.17 328.5
r c68_k_breakthrough 39979
r c68_kwhist 39951
r c68_c_battle 7781
r c68_c_battle 39915
r c68_z_zoom 39911
r c68_seaclick 39913
r c68_a_god_nuke 39917
r c68_q_god_tools 39919
r c68_g_editor 39921
r c68_kw_breakthrough 39923
r c68_pl_planes 39925 GER POL 5368
r c68_w_wing 39927
r c68_p_phone
r c68_u_ui
r c68_phz 39933 40
r c68_fw2_forcewar 39935
r c68_saveload_page 39937 200
r c68_rw_random 39965 365
r c68_histgrep 39309 FRA 540 joined
r c68_warsof 39309 FRA 540
echo SUITEBDONE
until grep -q '^done:' critic/c68_seed7019_save.log 2>/dev/null && grep -q '^done:' critic/c68_seed32019_save.log 2>/dev/null; do sleep 20; done
r c68_an_ainuke 7019 critic/c68_seed7019_y20.bin 7019y20 2 400
r c68_an_ainuke 32019 critic/c68_seed32019_y20.bin 32019y20 2 400
r c68_long_watch2 39941 12 '&heroes=on' hon
r c68_long_watch2 39943 12 '' plain

# Run 61's own x probes on new seeds
r c68_x_mouse 39421 10 1600 900
r c68_x_keys 39423
r c68_x_continue 39415 40 GER 60
r c68_x_title
r c68_x_few 39403 3 3
r c68_x_play rnd_large random large 90
r c68_hero 39425 300 hon
r c68_joinseen 39427 GER 120
until grep -q '^done:' critic/c68_seed39505_save.log 2>/dev/null; do sleep 20; done
r c68_an_ainuke 39505 critic/c68_seed39505_y13.bin 39505y13 2 400
until [ -s critic/c68_sb_39061.json ] && grep -q . critic/c68_sb_39061.log; do sleep 20; done
echo "== sbl 39061"; BASE=http://127.0.0.1:5368 npx tsx tools/diag/seaBattlesLook.ts critic/c68_sb_39061.json --out critic/c68_sbl_39061.json > critic/c68_sbl_39061.log 2>&1; echo "  exit $?"
echo SUITEB2DONE
# Run 66's left-outs, owed in a full run, and the batch's own cases (R76d, R77: Normandy's 50-day window, Stalingrad's
# arrivals; R76b free card at phone size).
r c68_h_zoom
r c68_h_blank 120
r c68_x_building b1938 1600 900 '/?scenario=1938&seed=39601' 20
r c68_x_building b1938h 1600 900 '/?scenario=1938h&seed=1938' 20
r c68_x_building b1975 390 844 '/?scenario=1938h&seed=1938&year=1975&mode=free&after=6161' 20
r c68_h_godtab 390 844 god-world-ai
r c68_x_lateworld 1975 free 1977 91 1600 900 6161
r c68_x_lateworld 1965 replay 1977 91 1600 900 4242
r c68_x_stage normandyD 1944 1944-06-05 1020.6 291.6 50
r c68_x_stage stalin 1942 1942-10-22 1277.2 296 12
r c68_x_replaycard 1975 free 390 844
r c68_long_watch2 39945 12 '' plain2
echo SUITEB3DONE
