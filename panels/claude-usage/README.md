# Claude Usage Panel

Displays real-time Claude Max/Pro subscription usage (5-hour session window, 7-day weekly window, per-model breakdown).

## Requirements

- **Claude Max or Pro subscription** (won't work for API-only accounts)
- **Claude Code CLI** installed and authenticated via OAuth
- **jq** installed (`sudo apt install -y jq`)

## Setup

### 1. Install Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
```

### 2. Authenticate via OAuth (NOT setup-token)

```bash
claude login
```

This opens a browser for OAuth. You **must** use `claude login`, not `claude setup-token` — the usage API requires the `user:profile` scope which only OAuth provides.

On headless servers, run `claude login` from a machine with a browser, then copy `~/.claude/.credentials.json` to the server.

### 3. Set up the polling cron

Add to system crontab (`crontab -e`):

```cron
*/5 * * * * /path/to/velboard/panels/claude-usage/scripts/claude-usage-poll.sh >> /tmp/claude-usage-poll.log 2>&1
```

This polls the Anthropic usage API every 5 minutes and writes results to `~/.openclaw/workspace/claude-usage.json`.

### 4. Configure Velboard data source

In `velboard/app.json`, ensure this data source exists:

```json
"data_sources": {
  "claude-usage": {
    "type": "file",
    "path": "~/.openclaw/workspace/claude-usage.json",
    "interval": "10s"
  }
}
```

This is already configured by default in Velboard.

## Output Format

The script writes JSON to `~/.openclaw/workspace/claude-usage.json`:

```json
{
  "fetched_at": "2026-03-08T14:30:00Z",
  "five_hour": {
    "utilization_pct": 42,
    "resets_at": "2026-03-08T18:00:00Z"
  },
  "seven_day": {
    "utilization_pct": 31,
    "resets_at": "2026-03-12T00:00:00Z"
  },
  "seven_day_opus": {
    "utilization_pct": 55,
    "resets_at": "2026-03-12T00:00:00Z"
  },
  "seven_day_sonnet": {
    "utilization_pct": 18,
    "resets_at": "2026-03-12T00:00:00Z"
  },
  "summary": "5hr: 42% | 7day: 31% | Opus: 55% | Sonnet: 18%"
}
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `No credentials found` | Run `claude login` (full OAuth, not setup-token) |
| `Token missing 'user:profile' scope` | You used `claude setup-token`. Delete `~/.claude/.credentials.json` and run `claude login` instead |
| `Token refresh failed` | Re-run `claude login` — refresh token may have expired |
| Panel shows "No data" | Check cron is running: `cat /tmp/claude-usage-poll.log` |
| All values null | Your account may be API-only (no Max/Pro subscription) |

## Environment Variables (optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_USAGE_OUTPUT` | `~/.openclaw/workspace/claude-usage.json` | Output file path |
| `CLAUDE_CREDENTIALS_FILE` | `~/.claude/.credentials.json` | Credentials file path |
