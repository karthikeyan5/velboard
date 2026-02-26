import { html, useState, useEffect } from '/core/vendor/preact-htm.js';

export default function ProcessesPanel({ data, error, connected, lastUpdate, api, config, cls }) {
  if (error) return html`<div class=${cls('error')}>${error.error}</div>`;
  if (!data) return html`<div class=${cls('loading')}>Loading...</div>`;

  const rows = [
    { label: 'Total', value: data.total, style: '' },
    { label: 'Running', value: data.running, style: 'color: var(--green)' },
    { label: 'Sleeping', value: data.sleeping, style: '' },
    { label: 'OS', value: data.os || '—', style: 'font-size: 11px' },
  ];

  return html`
    <div class=${cls('wrap')}>
      ${!connected && html`<div class=${cls('stale')}>⚠ Stale</div>`}
      <div class=${cls('icon')}>⚙️</div>
      <div class=${cls('label')}>PROCESSES</div>
      ${rows.map(r => html`
        <div class=${cls('row')} style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03)">
          <span style="color: var(--text-dim); font-size: 12px">${r.label}</span>
          <span style="${r.style}">${r.value}</span>
        </div>
      `)}
    </div>
  `;
}
