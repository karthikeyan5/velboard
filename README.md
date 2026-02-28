<h1 align="center">🦞 Clawboard</h1>

<p align="center">
  <strong>Stop burning tokens on status checks.</strong><br>
  A real-time dashboard for your AI agent — so you can <em>look</em> instead of <em>ask</em>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-c9a84c?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/built_with-Vel_⚡-ff6b35?style=flat-square" alt="Built with Vel">
  <img src="https://img.shields.io/badge/panels-10-00ADD8?style=flat-square" alt="Panels">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
</p>

---

Every time you ask your agent *"what's my CPU?"* or *"how much quota left?"* — that's tokens spent reading a number. Clawboard gives your [OpenClaw](https://github.com/openclaw/openclaw) agent a live dashboard instead. Open a tab. See everything. Done.

<p align="center">
  <img src="./screenshots/dashboard-mobile.png" alt="Clawboard Dashboard" width="600">
</p>

---

## What You Get

<table>
<tr>
<td align="center" width="25%">

⚡ **CPU**<br>
<sub>Live load with color bar</sub>

</td>
<td align="center" width="25%">

🧠 **Memory**<br>
<sub>Used / total GB</sub>

</td>
<td align="center" width="25%">

💾 **Disk**<br>
<sub>Usage per mount</sub>

</td>
<td align="center" width="25%">

⏱ **Uptime**<br>
<sub>System uptime + host</sub>

</td>
</tr>
<tr>
<td align="center">

⚙️ **Processes**<br>
<sub>Running, sleeping, total</sub>

</td>
<td align="center">

🔧 **OpenClaw Status**<br>
<sub>Version, sessions, channel</sub>

</td>
<td align="center">

📊 **Claude Usage**<br>
<sub>Quota + reset countdown</sub>

</td>
<td align="center">

📅 **Cron Jobs**<br>
<sub>List, run, enable/disable</sub>

</td>
</tr>
<tr>
<td align="center">

🤖 **Models**<br>
<sub>Primary + fallback routing</sub>

</td>
<td align="center">

🌐 **Browser Relay**<br>
<sub>Remote browser control</sub>

</td>
<td align="center" colspan="2">

✨ **Your panel here**<br>
<sub>Two files. That's it.</sub>

</td>
</tr>
</table>

Everything updates live over WebSocket. No polling. No refresh.

---

## Two Files, Infinite Possibilities

A panel is a folder with two files — a description and a UI component. That's the entire contract.

**`panel.json`**
```json
{
  "name": "my-panel",
  "title": "My Panel",
  "icon": "📊",
  "size": "half"
}
```

**`ui.js`**
```javascript
import { html } from '/js/lib/htm-preact.js';

export default function Panel({ data }) {
  return html`<div class="panel-content">
    <h3>${data.value}</h3>
  </div>`;
}
```

Drop it in `panels/`. Restart. It's live — with streaming, layout, error handling, and auth already taken care of.

Your agent can create these in seconds. You can create them yourself. Either way, the framework handles everything else.

**Some ideas:**

- Postgres query performance
- API response times
- Docker container status
- CI/CD pipeline health
- Smart home sensors
- Stock portfolio
- Anything you can pull data for

The 10 panels that ship are a starting point. Your imagination is the limit.

---

## 🌐 Browser Relay

Your agent can control a real browser remotely. Pair with a 6-character code — your agent gets access. That's it.

📖 **[How it works →](./RELAY.md)**

---

## Why It Just Works

Clawboard is built on **[Vel](https://github.com/essdee/vel)**, an AI-native Go framework designed so that agents can build things that don't break.

- **Single Go binary** — no Node.js, no Python, no runtime deps
- **Framework-guaranteed plumbing** — WebSocket streaming, auth, layout, error boundaries are all handled. Your agent only writes the parts that matter.
- **Guardrails, not guidelines** — The framework doesn't *suggest* how to do things. It *enforces* correctness. AI writes two files, and it works. Every time.

This means you can let your agent build panels, and you don't have to worry about whether it wired up the WebSocket correctly or forgot error handling. It can't get that wrong — the framework won't let it.

---

## Quick Start

```bash
# Clone into your Vel apps directory
cd your-vel-app/apps/
git clone https://github.com/karthikeyan5/clawboard.git

# Build and run
cd /path/to/vel
./vel build && ./vel start
```

---

## License

[MIT](./LICENSE)

---

<p align="center">
  <sub>Built for <a href="https://github.com/openclaw/openclaw">OpenClaw</a> agents. Made with 🦞 by an AI and its humans.</sub>
</p>
