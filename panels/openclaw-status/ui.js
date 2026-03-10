import { html, useState } from '/core/vendor/preact-htm.js';

export default function OpenclawStatusPanel({ data, error, connected, cls }) {
  const [secExpanded, setSecExpanded] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [restartResult, setRestartResult] = useState(null);

  if (error) return html`<div class=${cls('error')}>${error.error}</div>`;

  if (!data) return html`
    <div class=${cls('wrap')}>
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim)">System</div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:8px">
        <span style="width:8px;height:8px;border-radius:50%;background:var(--text-dim)"></span>
        <span style="font-size:13px;color:var(--text-dim)">Loading…</span>
      </div>
    </div>
  `;

  if (data.error || !data.online) {
    return html`
      <div class=${cls('wrap')}>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin-bottom:8px">System</div>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="width:8px;height:8px;border-radius:50%;background:var(--red)"></span>
          <span style="font-size:15px;color:var(--red);font-weight:600">Offline</span>
        </div>
        ${data.error && html`<div style="font-size:10px;color:var(--text-dim);margin-top:6px">${data.error}</div>`}
      </div>
    `;
  }

  const sec = data.security;
  const hasCritical = sec && sec.critical > 0;
  const hasWarn = sec && sec.warn > 0;
  const hasItems = sec && sec.items && sec.items.length > 0;

  const healthColor = hasCritical ? 'var(--red)' : hasWarn ? '#f0ad4e' : 'var(--green)';
  const healthLabel = hasCritical ? 'Needs attention' : hasWarn ? 'Warnings' : 'Healthy';

  const itemLevelColor = (level) => {
    if (level === 'critical') return 'var(--red)';
    if (level === 'warn') return '#f0ad4e';
    return 'var(--text-dim)';
  };

  return html`
    <div class=${cls('wrap')}>
      ${!connected && html`<div class=${cls('stale')}>⚠ Stale</div>`}

      <!-- Health + Heartbeat -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="width:10px;height:10px;border-radius:50%;background:${healthColor};box-shadow:0 0 6px ${healthColor}"></span>
          <span style="font-size:14px;font-weight:600;color:${healthColor}">${healthLabel}</span>
        </div>
        <span style="font-size:10px;color:var(--text-dim);font-family:'JetBrains Mono',monospace">
          ${data.heartbeat || ''}
        </span>
      </div>

      <!-- Badges row -->
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
        ${data.version && html`
          <span style="font-size:10px;padding:3px 8px;border-radius:10px;background:rgba(255,255,255,0.05);color:var(--text-dim);font-family:'JetBrains Mono',monospace">
            v${data.version}
          </span>
        `}
        ${data.update && html`
          <span style="font-size:10px;padding:3px 8px;border-radius:10px;background:rgba(100,180,255,0.15);color:#64b4ff">
            ↑ ${data.update}
          </span>
        `}
        ${hasCritical && html`
          <span
            onClick=${() => hasItems && setSecExpanded(!secExpanded)}
            style="font-size:10px;padding:3px 8px;border-radius:10px;background:rgba(255,82,82,0.15);color:var(--red);cursor:${hasItems ? 'pointer' : 'default'}"
          >
            ${sec.critical} critical ${hasItems ? (secExpanded ? '▾' : '▸') : ''}
          </span>
        `}
        ${hasWarn && html`
          <span
            onClick=${() => hasItems && setSecExpanded(!secExpanded)}
            style="font-size:10px;padding:3px 8px;border-radius:10px;background:rgba(240,173,78,0.15);color:#f0ad4e;cursor:${hasItems ? 'pointer' : 'default'}"
          >
            ${sec.warn} warning${sec.warn > 1 ? 's' : ''} ${hasItems ? (secExpanded ? '▾' : '▸') : ''}
          </span>
        `}
      </div>

      <!-- Expandable security items -->
      ${secExpanded && hasItems && html`
        <div style="margin-bottom:12px;padding:8px;border-radius:6px;background:rgba(255,255,255,0.03)">
          ${sec.items.map((item, i) => html`
            <div style="margin-bottom:${i < sec.items.length - 1 ? '8px' : '0'};padding-bottom:${i < sec.items.length - 1 ? '8px' : '0'};border-bottom:${i < sec.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'}">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                <span style="font-size:8px;text-transform:uppercase;font-weight:600;color:${itemLevelColor(item.level)}">${item.level}</span>
                <span style="font-size:10px;color:var(--text)">${item.title}</span>
              </div>
              ${item.detail && html`<div style="font-size:9px;color:var(--text-dim);margin-top:2px;line-height:1.4">${item.detail}</div>`}
              ${item.fix && html`<div style="font-size:9px;color:#64b4ff;margin-top:3px;line-height:1.4">Fix: ${item.fix}</div>`}
            </div>
          `)}
        </div>
      `}

      <!-- Channel status footer -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid rgba(255,255,255,0.04)">
        <span style="font-size:10px;color:var(--text-dim)">
          ${data.channel?.name || 'telegram'} ${data.channel?.status === 'ON' ? html`<span style="color:var(--green)">✓</span>` : html`<span style="color:var(--red)">✗</span>`}
        </span>
        <button
          onClick=${async () => {
            if (restarting) return;
            if (!confirm('Restart the OpenClaw gateway?')) return;
            setRestarting(true);
            setRestartResult(null);
            try {
              const r = await fetch('/api/gateway/restart', { method: 'POST', credentials: 'same-origin' });
              const d = await r.json();
              setRestartResult(d);
            } catch (e) {
              setRestartResult({ ok: false, error: e.message });
            } finally {
              setRestarting(false);
            }
          }}
          disabled=${restarting}
          style="font-size:9px;padding:2px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);background:${restarting ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)'};color:var(--text-dim);cursor:${restarting ? 'wait' : 'pointer'};font-family:inherit;transition:all 0.15s"
        >
          ${restarting ? '⟳ Restarting…' : '⟳ Restart'}
        </button>
      </div>

      <!-- Restart result -->
      ${restartResult && html`
        <div style="margin-top:8px;padding:8px;border-radius:6px;background:rgba(255,255,255,0.03);border:1px solid ${restartResult.ok ? 'rgba(76,175,80,0.3)' : 'rgba(255,82,82,0.3)'}">
          <div style="font-size:10px;font-weight:600;color:${restartResult.ok ? 'var(--green)' : 'var(--red)'}">
            ${restartResult.ok ? '✓ Gateway restarted' : '✗ Restart failed'}
          </div>
          ${restartResult.output && html`
            <pre style="font-size:9px;color:var(--text-dim);margin-top:4px;white-space:pre-wrap;word-break:break-all;max-height:120px;overflow-y:auto;font-family:'JetBrains Mono',monospace;line-height:1.4">${restartResult.output}</pre>
          `}
          ${restartResult.error && !restartResult.output && html`
            <div style="font-size:9px;color:var(--text-dim);margin-top:4px">${restartResult.error}</div>
          `}
        </div>
      `}
    </div>
  `;
}
