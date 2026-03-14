#!/bin/bash
set -euo pipefail

echo "Starting Virtual Clinic demo recording..."
echo "Starting dev server on port 3000..."
npm run dev >/tmp/virtual-clinic-dev.log 2>&1 &
SERVER_PID=$!

cleanup() {
  if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

for i in {1..60}; do
  if curl -sSf http://localhost:3000 >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -sSf http://localhost:3000 >/dev/null 2>&1; then
  echo "Server failed to start. Check /tmp/virtual-clinic-dev.log"
  exit 1
fi

echo "Seeding demo users..."
node scripts/seed-demo-users.js

echo "Recording full demo journey..."
npx playwright test e2e/demo-05-full-journey.spec.ts \
  --project=chromium \
  --headed \
  --reporter=html

echo ""
echo "Recording individual feature demos..."
npx playwright test e2e/demo-01-landing.spec.ts \
  e2e/demo-02-patient.spec.ts \
  e2e/demo-03-provider.spec.ts \
  e2e/demo-04-employer.spec.ts \
  --project=chromium \
  --headed \
  --reporter=html

echo ""
echo "Videos saved in: test-results/"
echo "Open report: npx playwright show-report"
