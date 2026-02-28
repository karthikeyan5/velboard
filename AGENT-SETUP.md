# Clawboard — Agent Setup Guide

**For AI agents:** Step-by-step instructions to install Clawboard into an existing Vel instance.

**Prerequisites:** [Vel](https://github.com/essdee/vel) must be installed. Go 1.22+ required.

---

## Step 1 — Install

```bash
cd <vel-app-dir>/apps/
git clone https://github.com/karthikeyan5/clawboard.git
```

## Step 2 — Build (required)

Clawboard has Go server code for the browser relay, so `vel build` is required:

```bash
cd <vel-app-dir>
./vel build
```

## Step 3 — Configure panel order

Edit `<vel-app-dir>/config.json`:

```json
{
  "panels": {
    "order": ["cpu", "memory", "disk", "uptime", "processes", "claude-usage", "openclaw-status", "crons", "models", "browser-relay"],
    "disabled": []
  }
}
```

## Step 4 — Restart

```bash
sudo systemctl restart vel
```

Verify:
```bash
curl -s http://localhost:3700/api/panels | python3 -m json.tool
```

All 10 panels should appear with `app:clawboard` source.

## Step 5 — Claude Usage (optional)

The claude-usage panel reads from `~/.openclaw/workspace/claude-usage.json` (configured as a data source in `app.json`).

## Updating

```bash
cd <vel-app-dir>/apps/clawboard
git pull
cd ../..
./vel build
sudo systemctl restart vel
```

## Troubleshooting

- **Panels not showing** → check `apps/clawboard/panels/` exists with manifest.json files
- **Build fails** → check Go 1.22+, run `./vel build --mode bypass` to see violations
- **Relay not working** → verify build succeeded (relay is compiled Go code, not loaded dynamically)
