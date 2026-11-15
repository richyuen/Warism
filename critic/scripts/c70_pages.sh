#!/bin/sh
# Critic run 69 (full): the starts-based page cases, one at a time on the c70 build at 5370, after the starts (to 1991)
# are in it: R83's card and free form (desk, phone; four years), the refused starts, the card at five years, the two
# track ends (1975 now mid-track, and 1991), the stages, the places of 1975 and 1991, the last years' events (R80f-i),
# the phone line, Vietnam 1968, the AI's strikes of 1975, God from 1970, the late world 1965-77 and 1989-93.
cd /c/Git/Warism
until [ -f critic/c70_build.done ]; do sleep 15; done
export BASE=http://127.0.0.1:5370
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 2400 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,:@' '_______').log 2>&1; echo "   exit $?"; }
r c70_r83 1983 51283 1600 900
r c70_r83 1983 51283 390 844
r c70_r83 1941 1938 1600 900 'diplomacy=random'
r c70_r83 1991 51291 1600 900 'aggression=random,traits=random,gold=random,looping=off'
r c70_r83 1975 51275 1600 900 ''
r c70_r83 1962 51262 844 390 'heroes=on'
r c70_x_badyear
r c70_x_badyearsave
r c70_x_badyear2
r c70_x_replaycard 1960 replay
r c70_x_replaycard 1965 replay 390 844
r c70_x_replaycard 1975 free
r c70_x_replaycard 1946 replay
r c70_x_replaycard 1987 replay
r c70_x_replaycard 1991 free 390 844
r c70_x_trackend 1975
r c70_x_trackend91 1991
r c70_x_stage normandy 1944 1944-06-01 1020.6 291.6 7
r c70_x_stage uranus2 1942 1942-12-24 1277.2 296 8
r c70_x_places 1975 newfoundland:705.4:293.8:3000 tuva:1561.6:274.5:3000 bonn:1064.4:281.6:600 madrid:1002.9:355.5:600
r c70_ev91 1990 999 1990-08-03@kuwait:47.98:29.37:600,gulf:47:29:3000 1990-10-04@berlin:13.4:52.5:600,europe:15:50:3000 1991-03-01@kuwait:47.98:29.37:600 1991-07-02@europe:20:50:3000 1991-12-27@moscow:37.6:55.75:3000,kiev:30.5:50.45:600,caucasus:44:41.5:1500,asia:66:42:3000,baltic:24:57:1500,yugo:17:45:1500,world:30:30:20000 1992-01-03@europe:30:50:3000
r c70_ev91 1976 999 1979-01-08@cambodia:104.9:11.6:1500 1980-01-01@afghan:69.2:34.5:1500,iran:51.4:35.7:3000 1982-06-15@falklands:-59:-51.7:600
r c70_ev91 1983 999 1983-10-27@grenada:-61.7:12.1:300 1986-04-01@chad:19:15:3000 1989-12-25@panama:-79.5:9:600,romania:26.1:44.4:1500
r c70_h_phone 390 844
r c70_h_phone 844 390
r c70_x_vietnam 1968 40
r c70_an_ainuke 0 year:1975:6161 y1975 2 400
r c70_h_god70
r c70_x_lateworld 1965 replay 1977 91 1600 900 4242
r c70_x_lateworld 1989 replay 1994 61 1600 900 4242
r c70_x_lateworld 1991 free 2001 182 1600 900 51991
echo PAGESDONE
