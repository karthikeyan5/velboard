import { html, useState, useEffect } from '/core/vendor/preact-htm.js';

const barColor = (pct) => pct < 50 ? 'var(--green)' : pct < 80 ? 'var(--yellow)' : 'var(--red)';

export default function CpuPanel({ data, error, connected, lastUpdate, api, config, cls }) {
  if (error) return html`<div class=${cls('error')}>${error.error}</div>`;
  if (!data) return html`<div class=${cls('loading')}>Loading...</div>`;

  const color = barColor(data.load);

  return html`
    <div class=${cls('wrap')}>
      ${!connected && html`<div class=${cls('stale')}>⚠ Stale</div>`}
      <div class=${cls('icon')}>⚡</div>
      <div class=${cls('label')}>CPU LOAD</div>
      <div class=${cls('value')} style="color: ${color}">${data.load}%</div>
      <div class=${cls('sub')}>${data.cores} cores</div>
      <div class=${cls('bar')}>
        <div class=${cls('fill')} style="width: ${data.load}%; background: ${color}"></div>
      </div>
    </div>
  `;
}
