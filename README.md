<p align="center">
  <img src="./screenshots/dashboard-mobile.png" alt="Velboard Dashboard" width="300">
</p>

<h1 align="center">⚡ Velboard</h1>

<p align="center">
  <strong>The dashboard that builds itself.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-c9a84c?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/built_with-Vel_⚡-ff6b35?style=flat-square" alt="Built with Vel">
  <img src="https://img.shields.io/badge/panels-11-00ADD8?style=flat-square" alt="Panels">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
</p>

<p align="center">
  <sub>A <a href="https://github.com/essdee/vel">Vel</a> app — built by an AI agent, for AI agents.</sub>
</p>

---

## The dashboard that builds itself

Every other dashboard was built by a human developer who decided what panels you need. Velboard was built by an AI agent, on a framework designed for AI agents. The thing that built it can keep building it. For you. Based on what you actually need.

You don't need to know how it works. You just need to know what you want to see. Your agent handles the rest, and the framework makes sure it can't mess it up.

## What you get on day one

| Panel | What it shows |
|-------|---------------|
| **CPU** | Load %, core count, color-coded bar |
| **Memory** | Used/total GB, percentage bar |
| **Disk** | Usage per mount point |
| **Uptime** | System uptime + hostname |
| **Processes** | Running/sleeping/total |
| **OpenClaw Status** | Version, sessions, channel |
| **Claude Usage** | 5-hour + 7-day quotas with reset countdowns |
| **Cron Jobs** | List, status, run/enable/disable buttons |
| **Models** | Primary, fallback, sub-agent routing |
| **Sessions** | Active agent sessions |
| **Browser Relay** | VelBridge connection status |

All panels update every 2 seconds. No polling. Real-time WebSocket.

## Screenshots

<table>
<tr>
<td><img src="./screenshots/landing-mobile.png" alt="Landing" width="280"></td>
<td><img src="./screenshots/dashboard-mobile.png" alt="Dashboard" width="280"></td>
</tr>
</table>

## Don't wait for PRs

Every dashboard has the same bottleneck: you need a panel, you open an issue, maybe someone builds it. Maybe in a week. Maybe never.

Need a panel that doesn't exist? Your agent builds it. Right now. Two files — a manifest and a component — and the framework validates it at build time. No breaking other panels. No approval queue. Done.

## The last dashboard you'll ever install

See something you like on someone else's dashboard? Screenshot it, send it to your agent, you have it.

That's not a feature request. That's a Tuesday.

## Install

You need [Vel](https://github.com/essdee/vel) installed and running.

```bash
cd your-vel-app/apps/
git clone https://github.com/karthikeyan5/velboard.git
```

Restart Vel. All panels auto-discover.

### For AI Agents

Send your agent:

> Install Velboard from https://github.com/karthikeyan5/velboard

It reads [`AGENT-SETUP.md`](./AGENT-SETUP.md) and handles everything.

## See Also

- **[VelBridge](https://github.com/karthikeyan5/velbridge)** — Your agent can use your browser. Pair with a code, watch it work. Another Vel app.

## Built on Vel

Velboard is a **[Vel](https://github.com/essdee/vel)** app. Vel is an AI-native Go framework — your agent builds, the framework guarantees. For framework docs, see the [Vel repo](https://github.com/essdee/vel).

## License

[MIT](./LICENSE)

---

<p align="center">
  <sub>Built on <a href="https://github.com/essdee/vel">Vel ⚡</a> for <a href="https://github.com/openclaw/openclaw">OpenClaw</a> agents.</sub>
</p>
