import { html, useState, useEffect } from '/core/vendor/preact-htm.js';

const barColor = (pct) => pct < 50 ? 'var(--green)' : pct < 80 ? 'var(--yellow)' : 'var(--red)';
const fmtBytes = (b) => {
  if (b >= 1073741824) return (b / 1073741824).toFixed(1) + ' GB';
  if (b >= 1048576) return (b / 1048576).toFixed(0) + ' MB';
  return (b / 1024).toFixed(0) + ' KB';
};

export default function DiskPanel({ data, error, connected, lastUpdate, api, config, cls }) {
  if (error) return html`<div class=${cls('error')}>${error.error}</div>`;
  if (!data) return html`<div class=${cls('loading')}>Loading...</div>`;

  const color = barColor(data.pct);

  return html`
    <div class=${cls('wrap')}>
      ${!connected && html`<div class=${cls('stale')}>⚠ Stale</div>`}
      <div class=${cls('icon')}>💾</div>
      <div class=${cls('label')}>DISK${data.mount ? ` (${data.mount})` : ''}</div>
      <div class=${cls('value')} style="color: ${color}">${data.pct}%</div>
      <div class=${cls('sub')}>${fmtBytes(data.used)} / ${fmtBytes(data.total)}</div>
      <div class=${cls('bar')}>
        <div class=${cls('fill')} style="width: ${data.pct}%; background: ${color}"></div>
      </div>
    </div>
  `;
}
