#!/usr/bin/env bash
# Takes screenshots of the dashboard for README
# Usage: bash scripts/screenshots.sh

set -euo pipefail
PORT=3791  # Use different port to not conflict with production
DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting test server on port $PORT..."
TEST_MODE=true BOT_TOKEN=test PORT=$PORT node "$DIR/core/server.js" &
SERVER_PID=$!
sleep 3

# Check if server is up
if ! curl -s "http://localhost:$PORT/api/health" > /dev/null; then
  echo "Server failed to start"
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

echo "Taking screenshots..."
# Use playwright or puppeteer CLI if available, otherwise use node script
node -e "
const http = require('http');
// Simple check that pages load
['/', '/dashboard'].forEach(path => {
  http.get('http://localhost:$PORT' + path, res => {
    console.log(path + ' → ' + res.statusCode);
  });
});
"

echo "Screenshots need to be taken manually or via browser tool."
echo "Dashboard URL: http://localhost:$PORT/dashboard"
echo "Landing URL: http://localhost:$PORT/"

# Cleanup
kill $SERVER_PID 2>/dev/null
echo "Done. Server stopped."
