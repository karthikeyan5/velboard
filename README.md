<p align="center">
  <img src="./screenshots/dashboard-mobile.png" alt="Clawboard Dashboard" width="300">
</p>

<h1 align="center">🦞 Clawboard</h1>

<p align="center">
  <strong>Stop burning tokens on status checks.</strong><br>
  A real-time dashboard for your AI agent — so you can <em>look</em> instead of <em>ask</em>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.0-c9a84c?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/go-1.22%2B-00ADD8?style=flat-square" alt="Go">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome">
</p>

---

## The Problem

Every time you ask your agent *"what's my CPU?"* or *"how much quota left?"* — that's tokens in, tokens out. Seconds of waiting. Multiply by every routine check, every day.

**You're paying to read a number.**

## The Solution

Clawboard gives your OpenClaw agent a live web dashboard. WebSocket-powered. Telegram-authenticated. Zero tokens burned. Single binary, zero dependencies.

Open a tab. See everything. Done.

- **10 modular panels** — CPU, Memory, Disk, Uptime, Processes, Claude Usage, Crons, Models, OpenClaw Status (plus `_test` for development)
- **Go backend** — Single binary, ~10MB, 76ms full page load, 4ms TTFB
- **Preact+HTM UI** — Zero build step, native ES modules, ~400ms client render
- **Panel contract v1.0** — Standardized props, scoped CSS via `cls()`, error boundaries
- **Live updates** — 2-second WebSocket refresh, no polling
- **Telegram auth** — Mini App (inline) + Login Widget (browser)
- **TEST_MODE** — Auto-login for development, no Telegram needed
- **Data caching** — DeviceStorage (Mini App) + localStorage (browser), 60s TTL
- **Service Worker** — Offline-capable static assets (browser mode)
- **Config-driven** — Name, emoji, colors, traits — one JSON file
- **Personality landing page** — Animated, branded, yours
- **Extensible** — Custom panels, hooks, plugins, themes
- **Security hardened** — HMAC validation, rate limiting, signed cookies, gzip

## Screenshots

<table>
<tr>
<td><strong>Landing Page</strong></td>
<td><strong>Dashboard</strong></td>
</tr>
<tr>
<td><img src="./screenshots/landing-mobile.png" alt="Landing" width="250"></td>
<td><img src="./screenshots/dashboard-mobile.png" alt="Dashboard" width="250"></td>
</tr>
</table>

## Quick Start

```bash
# 1. Clone
git clone https://github.com/karthikeyan5/clawboard.git
cd clawboard

# 2. Build
go build -o clawboard .

# 3. Configure
cp config.example.json config.json
# Edit config.json with your bot token and allowed user IDs

# 4. Run
BOT_TOKEN=your-bot-token ./clawboard
```

Or just send your agent the repo link. It reads `AGENT-SETUP.md` and handles everything.

### Development Mode

```bash
TEST_MODE=true BOT_TOKEN=dummy ./clawboard
```
Auto-login, no Telegram auth needed. Opens `/auth/dev` → sets cookie → dashboard.

## Tech Stack

| Layer | Tech |
|-------|------|
| Server | **Go** `net/http` + gorilla/websocket |
| Metrics | `gopsutil` (CPU, memory, disk, processes) |
| UI | **Preact + HTM** — zero build step, vendored bundle |
| Auth | Telegram HMAC-SHA256 + signed cookies |
| Styling | CSS variables, scoped via `cls()` helper |

## Panels

| Icon | Panel | Size | What it shows |
|------|-------|------|---------------|
| ⚡ | **CPU** | half | Load %, core count, color-coded bar |
| 🧠 | **Memory** | half | Used/total, percentage, bar |
| 💾 | **Disk** | half | Used/total, mount point, bar |
| ⏱ | **Uptime** | half | Days/hours/minutes, hostname |
| ⚙️ | **Processes** | half | Total, running, sleeping, OS |
| 🔧 | **OpenClaw** | half | Version, sessions, memory, channel |
| 📊 | **Claude Usage** | full | 5hr + 7day quotas with reset timers |
| 📅 | **Crons** | full | Jobs list, status, run/disable actions |
| 🤖 | **Models** | full | Primary, fallback, sub-agent routing |

All panels are independent. Disable any in `config.json`. Add your own.

## Testing

```bash
go test ./...
```

## Customization

```json
{
  "name": "My Agent",
  "emoji": "🤖",
  "accent": "#c9a84c",
  "traits": ["Loyal", "Sharp", "Resourceful"],
  "quote": "I don't wait for permission."
}
```

## Architecture

See [`architecture.yaml`](./architecture.yaml) for the machine-readable spec, [`ARCHITECTURE.md`](./ARCHITECTURE.md) for WHY decisions.

```
clawboard/
├── main.go               # Entrypoint — config, init, start
├── internal/             # Go backend
│   ├── auth/             # Telegram HMAC auth + cookie signing
│   ├── data/             # System metrics, usage, crons, status
│   ├── panels/           # Panel discovery + registry
│   ├── schema/           # Validation
│   └── server/           # HTTP server + WebSocket
├── core/                 # Frontend
│   ├── panels/           # 10 built-in panels (manifest.json + ui.js)
│   ├── vendor/           # Vendored Preact+HTM bundle
│   └── public/           # Shell, landing, CSS, service worker
├── custom/               # Your customizations (git-ignored)
├── config.json           # Your config (git-ignored)
└── clawboard.service     # Systemd unit file
```

### Panel Contract v1.0

Each panel is a self-contained folder (`manifest.json` + `ui.js`). Panels receive standardized props (`data`, `error`, `connected`, `cls`, etc.), use scoped CSS via `cls()`, and are validated at startup. See [`CONTRACTS.md`](./CONTRACTS.md) for the full specification.

## Security

- Telegram `initData` validated with **timing-safe HMAC-SHA256**
- Browser auth via **signed, httpOnly cookies**
- **Rate limiting** on all auth endpoints
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- WebSocket auth on connect
- `allowedUsers` whitelist in config
- **Gzip compression** on all responses

## For AI Agents

This is the killer feature: **your agent sets up the dashboard for you.**

Send your OpenClaw agent:

> Set up Clawboard from https://github.com/karthikeyan5/clawboard

It reads [`AGENT-SETUP.md`](./AGENT-SETUP.md), asks you a few questions in chat (bot token, domain), and handles everything.

## Contributing

PRs welcome. Keep it modular. One panel per folder.

```bash
go test ./...
```

## License

[MIT](./LICENSE) — Use it however you want.

---

<p align="center">
  <sub>Built for <a href="https://github.com/openclaw/openclaw">OpenClaw</a> agents. Made with 🦞 by humans and AI.</sub>
</p>
