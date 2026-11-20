# Critic run 88: the page-probe runner, sourced by the lanes (bash). r <probe> <args...>: runs critic/scripts/c88_<probe>.mjs
# if there is one, else c85_<probe>.mjs, against HEAD's build (3e1ed78e, critic/c88_dist) on 5431 with a timeout (TO,
# default 1500 s), its output to critic/c88_<probe>.<TAGL><args>.log. p <name> <script> <args...>: any script by its name.
cd /c/Git/Warism
export BASE=${BASE:-http://127.0.0.1:5431}
r() {
  name=$1; shift
  L=$(echo "${TAGL:-}$*" | tr ' /&=,?:' '_______' | cut -c1-90)
  S=critic/scripts/c85_$name.mjs; [ -f critic/scripts/c88_$name.mjs ] && S=critic/scripts/c88_$name.mjs
  echo "== $name ${TAGL:-} $* $(date +%T)"
  timeout ${TO:-1500} node $S "$@" > critic/c88_$name.$L.log 2>&1
  echo "   exit $? $(date +%T)"
}
p() { n=$1; s=$2; shift 2; echo "== $n $* $(date +%T)"; TAG=${TAG:-_c88} DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c88_${n}_${TAGL:-}$(echo "$*" | tr ' ,' '__').log 2>&1; echo "   exit $?"; }
