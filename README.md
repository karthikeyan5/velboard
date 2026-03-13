<p align="center">
  <strong>🦞 VelClawBoard</strong>
</p>

<h1 align="center">Your OpenClaw command center.</h1>

<p align="center">
  Monitor and manage your <a href="https://github.com/openclaw/openclaw">OpenClaw</a> instance from your <a href="https://github.com/essdee/vel">Vel</a> dashboard.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-c9a84c?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/panels-5-brightgreen?style=flat-square" alt="Panels">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
</p>

---

## What you get

Five panels purpose-built for OpenClaw operators:

| Panel | What it does |
|-------|-------------|
| **Claude Usage** | Track API usage across 5-hour and 7-day windows. Refresh on demand. |
| **Sessions** | View active sessions, sub-agents, and conversation history. |
| **Models** | See configured model providers and routing. |
| **OpenClaw Status** | Daemon health, version, uptime. Restart from the dashboard. |
| **Updates** | Check for and apply OpenClaw updates. |

---

## Install

```bash
cd /path/to/vel/apps/
git clone https://github.com/karthikeyan5/velclawboard.git
cd /path/to/vel/ && ./vel build
```

---

## Why VelClawBoard?

If you're running OpenClaw on a VPS, you want to know what it's doing without SSHing in. VelClawBoard gives you that visibility — usage, sessions, models, health — all in your Telegram WebApp or browser.

---

## Works with

- **VelMetrics** — Add server monitoring (CPU, memory, disk) alongside OpenClaw monitoring
- **VelBridge** — Add remote browser control for your agent
- Any other Vel app — everything composes

---

<p align="center">
  <sub>Built on <a href="https://github.com/essdee/vel">⚡ Vel</a> — the framework where AI builds and the framework guarantees.</sub>
</p>
