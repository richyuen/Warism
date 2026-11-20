# Critic run 87: the page-probe runner, sourced by the lanes (bash). r <probe> <args...>: runs critic/scripts/c85_<probe>.mjs
# against HEAD's build on 5421 with a timeout (TO, default 1500 s), its output to critic/c87_<probe>.<TAGL><args>.log.
cd /c/Git/Warism
export BASE=${BASE:-http://127.0.0.1:5421}
r() {
  name=$1; shift
  L=$(echo "${TAGL:-}$*" | tr ' /&=,?:' '_______' | cut -c1-90)
  echo "== $name ${TAGL:-} $* $(date +%T)"
  timeout ${TO:-1500} node critic/scripts/c85_$name.mjs "$@" > critic/c87_$name.$L.log 2>&1
  echo "   exit $? $(date +%T)"
}
