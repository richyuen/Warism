#!/bin/sh
# Critic run 69: c73_ev91.mjs's three cases with short log names (the chain's names were too long for Windows).
cd /c/Git/Warism
export BASE=http://127.0.0.1:5373
node critic/scripts/c73_ev91.mjs 1990 999 1990-08-03@kuwait:47.98:29.37:600,gulf:47:29:3000 1990-10-04@berlin:13.4:52.5:600,europe:15:50:3000 1991-03-01@kuwait:47.98:29.37:600 1991-07-02@europe:20:50:3000 1991-12-27@moscow:37.6:55.75:3000,kiev:30.5:50.45:600,caucasus:44:41.5:1500,asia:66:42:3000,baltic:24:57:1500,yugo:17:45:1500,world:30:30:20000 1992-01-03@europe:30:50:3000 > critic/c73_ev91_1990.log 2>&1
node critic/scripts/c73_ev91.mjs 1976 999 1979-01-08@cambodia:104.9:11.6:1500 1980-01-01@afghan:69.2:34.5:1500,iran:51.4:35.7:3000 1982-06-15@falklands:-59:-51.7:600 > critic/c73_ev91_1976.log 2>&1
node critic/scripts/c73_ev91.mjs 1983 999 1983-10-27@grenada:-61.7:12.1:300 1986-04-01@chad:19:15:3000 1989-12-25@panama:-79.5:9:600,romania:26.1:44.4:1500 > critic/c73_ev91_1983.log 2>&1
echo done > critic/c73_ev91run.done
