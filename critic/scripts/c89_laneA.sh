#!/bin/bash
# Critic run 89 (copy of run 88's lane), lane A: run 87's named cases on HEAD (3e1ed78e, 5441): R87-B1 (c87_legendOpen, c87_legendShot; R203),
# R87-N2 (c87_rowJitter; R204), the relations footer (c86_relSaid; R205), R200's and R202's cases (c86_modeRow, c86_deskAttack).
. /c/Git/Warism/critic/scripts/c89_r.sh
MODES=political,seaControl,airControl,fallout,puppets p lo c87_legendOpen 84901 400
WAIT=4000 p ls c87_legendShot 84901 400 700 800 fallout
WAIT=4000 p ls c87_legendShot 84901 400 700 800 seaControl
p rj c87_rowJitter 87601 300
p mr c86_modeRow 85901 400 800 seaControl,airControl,fallout
p mr c86_modeRow 84901 400 800 political,seaControl,airControl,fallout,puppets
p rs c86_relSaid 84903 400
p da c86_deskAttack 84901 400
p da c86_deskAttack 84901 400 wide
echo done > critic/c89_laneA.done
