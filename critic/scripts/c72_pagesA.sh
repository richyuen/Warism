#!/bin/sh
# Critic run 72 (full): run 71's named page cases, the batch's own (R86a-f) and the default game from the title, one at a
# time, on the c72 build at 5372 (starts to 1991 in it).
cd /c/Git/Warism
until [ -f critic/c72_build.done ]; do sleep 15; done
export BASE=http://127.0.0.1:5372
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3000 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,:@' '_______' | cut -c1-60).log 2>&1; echo "   exit $?"; }
r c72_title2 55201 365
r c72_title2 55203 180 390 844
r c72_title2 55205 120 1600 900 1975
r c72_title2 55207 120 1600 900 1991
r c72_title2 55209 120 1600 900 1946
r c72_godpeace 1942 JAP 'United States'
r c72_godpeace 1942 GER 'Soviet Union' 390 844
r c72_takescore 1942 GER 240
r c72_takescore 1943 JAP 90
r c72_h_godtab 1600 900
r c72_h_godtab 390 844
r c72_x_replaycard 1943 free
r c72_x_replaycard 1975 free 390 844
r c72_x_replaycard 1983 free
r c72_x_replaycard 1991 free 390 844
r c72_god42 1942 53542 replay
r c72_god42 1943 53543 free
r c72_ev91 1975 999 1975-12-31@china:120:36:4000,java:106.8:-6.2:1500,volga:44.5:48.7:1500,korea:127:37.5:1500
r c72_ev91 1975 999 1975-12-31@angola:17:-8:3000
r c72_ev91 1990 999 1991-12-31@zimbabwe:31:-17.8:1500,madagascar:47.5:-18.9:1500,bangladesh:90.4:23.7:1500,gambia:-16.6:13.45:1000,canton:113.3:23.1:1500,leningrad:30.3:59.9:1500,europe:28:50:3000
r c72_ev91 1990 999 1992-01-03@europe:28:50:3000
r c72_ev91 1938 999 1938-01-02@africa:20:0:8000,congo:23:-3:3000
MODE=free r c72_ev91 1951 999 1951-01-05@korea:127:37.5:1500,china:116:40:3000
MODE=free r c72_ev91 1983 999 1983-01-05@china:116:40:3000,congo:20:-3:3000
r c72_histnames 1991 replay 1938 1991 28
r c72_histnames 1975 replay 1938 1975 28
r c72_histnames 1991 replay 1945 1991 56
r c72_histnames 1991 replay 1938 1991 67
r c72_undo2 41211
r c72_undo2y 51231
r c72_heroorder 55221 GER
r c72_heroes60 1960 55260
r c72_r83 1962 55262
r c72_x_trackend91 1990
echo PAGESADONE
