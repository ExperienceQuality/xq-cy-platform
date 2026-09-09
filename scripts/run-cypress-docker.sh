#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

docker run --rm --init \
  --volume "$repo_root:/e2e" \
  --volume xq-cy-platform-node-modules:/e2e/node_modules \
  --workdir /e2e \
  --env CI=1 \
  --env DUMMY_API_URL=http://127.0.0.1:4310 \
  --entrypoint bash \
  cypress/included:15.21.1 \
  -lc '
    set -euo pipefail
    npm ci --ignore-scripts
    npm run build:platform

    node apps/dummy-api/src/server.ts >/tmp/dummy-api.log 2>&1 &
    api_pid=$!
    trap "kill \"$api_pid\" 2>/dev/null || true" EXIT

    for attempt in $(seq 1 30); do
      if node --input-type=module -e "const response = await fetch(\"http://127.0.0.1:4310/health\"); process.exit(response.ok ? 0 : 1)" >/dev/null 2>&1; then
        break
      fi
      if [ "$attempt" = 30 ]; then
        cat /tmp/dummy-api.log
        exit 1
      fi
      sleep 1
    done

    npx cypress run \
      --project /e2e/tests/consumer-e2e \
      --config-file /e2e/tests/consumer-e2e/cypress.config.ts \
      --browser chrome
  '
