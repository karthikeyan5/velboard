import { html, useState } from '/core/vendor/preact-htm.js';

const fmtTokens = (n) => {
  if (!n || n === 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
};

const fmtAge = (mins) => {
  if (mins < 1) return 'now';
  if (mins < 60) return Math.floor(mins) + 'm';
  if (mins < 1440) return Math.floor(mins / 60) + 'h';
  return Math.floor(mins / 1440) + 'd';
};

const kindColor = {
  main: 'var(--accent)',
  cron: 'var(--green)',
  spawn: '#8b5cf6',
  dm: '#3b82f6',
  other: 'var(--text-dim)',
};

const kindIcon = { main: '●', cron: '⏱', spawn: '⚡', dm: '💬', other: '○' };

const ctxBarColor = (pct) => {
  if (pct > 80) return 'var(--red)';
  if (pct > 50) return '#f0ad4e';
  return 'var(--green)';
};

export default function SessionsPanel({ data, error, connected, cls }) {
  const [showAll, setShowAll] = useState(false);

  if (error) return html`<div class=${cls('error')}>${error.error}</div>`;
  if (!data || data.error) return html`<div style="color:var(--text-dim);font-size:12px;line-height:1.5">
    Sessions data not found — run <code style="background:rgba(255,255,255,0.08);padding:1px 4px;border-radius:3px;font-size:11px">sessions-gen.sh</code> and add it to crontab.
    See Velboard <strong>AGENT-SETUP.md Step 4</strong>.
  </div>`;

  const { total, active, byKind, byModel, recent } = data;
  const shown = showAll ? recent : recent.filter(s => s.active);
  const displayList = shown.length > 0 ? shown : recent.slice(0, 5);

  return html`
    <div class=${cls('wrap')}>
      ${!connected && html`<div class=${cls('stale')}>⚠ Stale</div>`}

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);font-weight:600">Sessions</span>
          <span style="font-size:10px;color:var(--accent);font-family:'JetBrains Mono',monospace">${active} active</span>
          <span style="font-size:10px;color:var(--text-dim);font-family:'JetBrains Mono',monospace">/ ${total}</span>
        </div>
        <button
          onClick=${() => setShowAll(!showAll)}
          style="font-size:9px;padding:2px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:${showAll ? 'var(--accent)' : 'transparent'};color:${showAll ? '#000' : 'var(--text-dim)'};cursor:pointer"
        >${showAll ? 'Active' : 'All'}</button>
      </div>

      <!-- Model badges -->
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
        ${Object.entries(byModel).map(([model, count]) => html`
          <span style="font-size:9px;padding:2px 8px;border-radius:8px;background:rgba(255,255,255,0.05);color:var(--text-dim);font-family:'JetBrains Mono',monospace">
            ${model.replace('claude-', '')} <span style="color:var(--text)">${count}</span>
          </span>
        `)}
      </div>

      <!-- Session list -->
      ${displayList.map(s => {
        const pct = s.contextPct || 0;
        const hasCtx = s.usedTokens > 0 || s.totalTokens > 0;
        const maxCtx = s.maxContextTokens || 200000;
        const used = s.usedTokens || s.totalTokens || 0;
        return html`
          <div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.03);opacity:${s.active ? 1 : 0.5}">
            <!-- Top row: icon, label, tokens, age -->
            <div style="display:flex;align-items:center;gap:8px">
              <span style="color:${kindColor[s.kind] || 'var(--text-dim)'};font-size:10px;flex-shrink:0;width:14px;text-align:center" title=${s.kind}>${kindIcon[s.kind] || '○'}</span>
              <div style="flex:1;min-width:0">
                <div style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.label}</div>
              </div>
              <span style="font-size:9px;color:var(--text-dim);font-family:'JetBrains Mono',monospace;flex-shrink:0">${fmtTokens(s.totalTokens)} tok</span>
              <span style="font-size:9px;color:${s.active ? 'var(--green)' : 'var(--text-dim)'};font-family:'JetBrains Mono',monospace;flex-shrink:0;width:28px;text-align:right">${fmtAge(s.ageMins)}</span>
            </div>
            <!-- Context bar -->
            ${hasCtx && html`
              <div style="display:flex;align-items:center;gap:8px;margin-top:4px;padding-left:22px">
                <div style="flex:1;height:3px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden">
                  <div style="height:100%;width:${Math.min(pct, 100)}%;background:${ctxBarColor(pct)};border-radius:2px;transition:width 0.3s"></div>
                </div>
                <span style="font-size:8px;color:var(--text-dim);font-family:'JetBrains Mono',monospace;flex-shrink:0;min-width:60px;text-align:right">
                  ${fmtTokens(used)}/${fmtTokens(maxCtx)} (${Math.round(pct)}%)
                </span>
              </div>
            `}
          </div>
        `;
      })}

      <!-- Kind summary -->
      <div style="display:flex;gap:12px;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.05)">
        ${Object.entries(byKind).filter(([,v]) => v > 0).map(([kind, count]) => html`
          <span style="font-size:9px;color:${kindColor[kind] || 'var(--text-dim)'};font-family:'JetBrains Mono',monospace">
            ${kindIcon[kind]} ${kind} ${count}
          </span>
        `)}
      </div>
    </div>
  `;
}
