# Critic run 80: the page-probe runner, sourced by the lanes (bash). r <probe> <args...>: runs critic/scripts/c85_<probe>.mjs
# with a timeout (TO, default 1500 s), its output to critic/c85_<probe>.<TAGL><args>.log; prints the exit code.
cd /c/Git/Warism
export BASE=${BASE:-http://127.0.0.1:5411}
r() {
  name=$1; shift
  L=$(echo "${TAGL:-}$*" | tr ' /&=,?:' '_______' | cut -c1-90)
  echo "== $name ${TAGL:-} $* $(date +%T)"
  timeout ${TO:-1500} node critic/scripts/c85_$name.mjs "$@" > critic/c85_$name.$L.log 2>&1
  echo "   exit $? $(date +%T)"
}
waitfile() { until grep -q "${2:-^done:}" "$1" 2>/dev/null; do sleep 20; done; }
