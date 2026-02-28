<p align="center">
  <img src="./screenshots/dashboard-mobile.png" alt="Clawboard Dashboard" width="300">
</p>

<h1 align="center">🦞 Clawboard</h1>

<p align="center">
  <strong>Real-time dashboard + browser relay for OpenClaw agents.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-c9a84c?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/built_with-Vel_⚡-ff6b35?style=flat-square" alt="Built with Vel">
  <img src="https://img.shields.io/badge/panels-10-00ADD8?style=flat-square" alt="Panels">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
</p>

---

## What is this?

Clawboard is a **[Vel](https://github.com/essdee/vel) app** that provides:

1. **Panel pack** — 10 monitoring panels for OpenClaw AI agents
2. **Browser relay server** — Go server code for remote browser control via CDP

It ships both frontend panels and backend Go code compiled into the Vel binary via `vel build`.

---

## Panels

| Icon | Panel | Size | What it shows |
|------|-------|------|---------------|
| ⚡ | **CPU** | half | Load %, core count, color-coded bar |
| 🧠 | **Memory** | half | Used/total GB, percentage bar |
| 💾 | **Disk** | half | Usage per mount point |
| ⏱ | **Uptime** | half | System uptime + hostname |
| ⚙️ | **Processes** | half | Running/sleeping/total |
| 🔧 | **OpenClaw Status** | half | Version, sessions, channel |
| 📊 | **Claude Usage** | full | 5-hour + 7-day quotas with reset countdowns |
| 📅 | **Cron Jobs** | full | List, status, run/enable/disable buttons |
| 🤖 | **Models** | full | Primary, fallback, sub-agent routing |
| 🌐 | **Browser Relay** | full | Relay status, connected tab, message count |

All panels update via WebSocket. No polling.

---

## Browser Relay

The `server/` directory contains Go server code that implements a **browser relay** — allowing OpenClaw agents to remotely control a user's browser via Chrome DevTools Protocol (CDP).

### Architecture

```
┌──────────┐     WebSocket      ┌─────────────┐     WebSocket      ┌──────────┐
│  Browser  │ ◄──────────────► │  Vel Server  │ ◄──────────────► │  Agent   │
│ (bridge)  │                   │ (relay code) │                   │(OpenClaw)│
└──────────┘                   └─────────────┘                   └──────────┘
```

- **Bridge**: JavaScript running in the browser that connects to the relay and forwards CDP commands
- **Relay**: Go server code (compiled into Vel binary) that routes messages between browser and agent
- **Agent**: OpenClaw connects via WebSocket or CDP-compatible endpoints

### Pairing Flow

1. Bridge page requests a pairing code (`/relay/pair/new`) — no auth required
2. Bridge displays a 6-character code (e.g., `A3K7MN`)
3. User tells their agent the code
4. Agent activates the code via `/relay/pair/activate` (bot token auth)
5. Bridge polls `/relay/pair/status` and receives a relay token
6. Bridge connects WebSocket to `/relay/ws?token=<relay_token>`
7. Agent connects to `/relay/cdp?token=<relay_token>` or uses CDP-compatible endpoints

### Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `/relay/token` | Cookie | Get relay token for authenticated user |
| `/relay/ws` | Token | Browser-side WebSocket |
| `/relay/cdp` | Token | Agent-side WebSocket (envelope format) |
| `/relay/json` | Token | Cached target list |
| `/relay/status` | Cookie | Relay status for dashboard panel |
| `/relay/bridge` | None | Bridge page (served over HTTPS) |
| `/relay/download` | None | Launcher script download |
| `/relay/pair/new` | None | Create pairing code |
| `/relay/pair/status` | Token | Poll pairing status |
| `/relay/pair/activate` | Bot token | Activate pairing code |
| `/relay/connect` | None | Pairing page |
| **CDP-compatible** | | |
| `/relay/cdp/json/version` | Token | CDP `/json/version` equivalent |
| `/relay/cdp/json/list` | Token | CDP `/json/list` with per-target WS URLs |
| `/relay/cdp/ws` | Token | Raw CDP WebSocket proxy (no envelope) |
| `/relay/cdp/status` | Token | Enhanced status with target list |
| `/relay/cdp-info` | Launcher ID | Launcher↔bridge CDP info exchange |

### CDP-Compatible Proxy

The `/relay/cdp/*` endpoints speak standard CDP JSON-RPC (no envelope wrapping), making the relay compatible with tools that expect a direct CDP connection. The proxy:

- Responds to `Target.getTargets` from cached target list
- Translates `Target.attachToTarget` into relay connect envelopes
- Forwards all other CDP messages transparently

### Launcher Scripts

Launcher scripts (~30 lines) launch Chrome with `--remote-debugging-port` and `--remote-allow-origins` restricted to the server domain (not wildcard), then POST the CDP WebSocket URL to `/relay/cdp-info`. The bridge page polls this endpoint to discover the local Chrome instance.

---

## app.json

```json
{
  "name": "clawboard",
  "version": "1.0.0",
  "title": "Clawboard",
  "description": "Real-time monitoring dashboard for OpenClaw agents",
  "panels": "panels",
  "routes": {
    "/relay/connect": {"type": "page", "dir": "pages/relay-connect"}
  },
  "data_sources": {
    "claude-usage": {
      "type": "file",
      "path": "~/.openclaw/workspace/claude-usage.json",
      "interval": "10s"
    }
  },
  "server": {
    "package": "server"
  },
  "capabilities": {
    "net": {},
    "github.com/gorilla/websocket": {}
  }
}
```

---

## Install & Deploy

### Prerequisites

- [Vel](https://github.com/essdee/vel) installed
- Go 1.22+

### Install

```bash
cd your-vel-app/apps/
git clone https://github.com/karthikeyan5/clawboard.git
```

### Build (required — Clawboard has Go server code)

```bash
cd /path/to/vel
./vel build
```

### Run

```bash
./vel start
# or
./vel
```

### Update

```bash
cd apps/clawboard && git pull && cd ../..
./vel build
sudo systemctl restart vel
```

---

## Directory Structure

```
clawboard/
├── app.json              # App manifest
├── panels/               # Dashboard panels
│   ├── browser-relay/    # Relay status panel
│   ├── claude-usage/     # Claude quota monitoring
│   ├── cpu/              # CPU load
│   ├── crons/            # Cron job management
│   ├── disk/             # Disk usage
│   ├── memory/           # RAM usage
│   ├── models/           # AI model config
│   ├── openclaw-status/  # OpenClaw agent status
│   ├── processes/        # System processes
│   └── uptime/           # System uptime
├── pages/
│   └── relay-connect/    # Browser pairing page
├── server/               # Go server code (browser relay)
│   ├── register.go       # vel.RegisterApp init
│   ├── relay.go          # Core relay (WebSocket, handlers)
│   ├── session.go        # Session management
│   ├── pairing.go        # Pairing code logic
│   ├── pair_handlers.go  # Pairing HTTP handlers
│   ├── cdp_proxy.go      # CDP-compatible proxy endpoints
│   ├── launcher.go       # Launcher↔bridge coordination
│   └── download.go       # Launcher script download
└── screenshots/
```

---

## Screenshots

<table>
<tr>
<td><img src="./screenshots/landing-mobile.png" alt="Landing" width="280"></td>
<td><img src="./screenshots/dashboard-mobile.png" alt="Dashboard" width="280"></td>
</tr>
</table>

---

## For AI Agents

See [`AGENT-SETUP.md`](./AGENT-SETUP.md) for installation instructions.

## License

[MIT](./LICENSE)

---

<p align="center">
  <sub>Built on <a href="https://github.com/essdee/vel">Vel ⚡</a> for <a href="https://github.com/openclaw/openclaw">OpenClaw</a> agents.</sub>
</p>
