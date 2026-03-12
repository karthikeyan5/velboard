#!/usr/bin/env bash
# claude-usage-watcher.sh — Watches for on-demand poll triggers
# Run as a background daemon: nohup bash claude-usage-watcher.sh &
# The token-swap server writes .usage-poll-trigger when a client requests fresh data.

set -euo pipefail

WORKSPACE="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
TRIGGER_FILE="$WORKSPACE/.usage-poll-trigger"
POLL_SCRIPT="$(dirname "$0")/claude-usage-poll.sh"

log() { echo "[usage-watcher] $(date '+%H:%M:%S') $*" >&2; }

log "Watching for triggers at $TRIGGER_FILE"

while true; do
  if [[ -f "$TRIGGER_FILE" ]]; then
    rm -f "$TRIGGER_FILE"
    log "Trigger detected — running poll"
    bash "$POLL_SCRIPT" 2>&1 || true
    log "Poll complete"
  fi
  sleep 2
done
