#!/usr/bin/env sh
# Starts a built image and checks that it actually serves, so an image that
# builds but crashes on start (e.g. a server import missing from the runtime
# stage) never gets merged or pushed. Used by the ci and docker workflows.
#   sh scripts/smoke-test-image.sh <image>
set -eu

image="$1"
name="smoke-test-$$"
port=3999

docker run -d --name "$name" -p "$port:3000" "$image" >/dev/null
trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT

fail() {
  echo "::error::$1"
  echo "--- container logs ---"
  docker logs "$name" 2>&1 || true
  exit 1
}

# Wait up to 30s for the server; stop early if the container already died.
for _ in $(seq 1 30); do
  curl -fsS "http://localhost:$port/api/health" >/dev/null 2>&1 && break
  [ "$(docker inspect -f '{{.State.Running}}' "$name")" = true ] || fail "Container exited during startup."
  sleep 1
done

expect() {
  got=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$port$2")
  [ "$got" = "$1" ] || fail "GET $2 returned $got, expected $1."
  echo "GET $2 -> $got"
}

expect 200 /api/health     # server is up
expect 401 /api/v1/me      # /api/v1 and the shared src/ modules it imports loaded
expect 200 /               # frontend bundle is served
expect 200 /trash          # client-side routes fall back to index.html
