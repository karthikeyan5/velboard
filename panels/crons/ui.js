import { html, useState, useEffect, useCallback } from '/core/vendor/preact-htm.js';

const fmtSchedule = (s) => {
  if (!s) return '—';
  if (s.kind === 'cron') return s.expr + (s.tz ? ` (${s.tz.replace('Asia/Calcutta','IST').replace('Asia/Kolkata','IST')})` : '');
  if (s.kind === 'every') {
    const ms = s.everyMs;
    if (ms >= 3600000) return `every ${ms/3600000}h`;
    if (ms >= 60000) return `every ${ms/60000}m`;
    return `every ${ms/1000}s`;
  }
  if (s.kind === 'at') return new Date(s.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  return JSON.stringify(s);
};

const fmtAgo = (iso) => {
  if (!iso) return 'never';
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ' + (mins % 60) + 'm ago';
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const fmtNextShort = (iso) => {
  if (!iso) return '';
  const diff = new Date(iso) - Date.now();
  if (diff <= 0) return 'now';
  const mins = Math.floor(diff / 60000), hrs = Math.floor(mins / 60);
  if (hrs < 1) return `in ${mins}m`;
  if (hrs < 24) return `in ${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `in ${days}d`;
};

const statusDot = (j) => {
  if (!j.enabled) return 'var(--text-dim)';
  if (j.lastStatus === 'error') return 'var(--red)';
  if (j.lastStatus === 'ok') return 'var(--green)';
  return 'var(--yellow)';
};

export default function CronsPanel({ data, error, connected, lastUpdate, api, config, cls }) {
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);

  if (error) return html`<div class=${cls('error')}>${error.error}</div>`;
  const d = data || [];

  const jobs = [...d].sort((a, b) => {
    if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  const filtered = filter === 'all' ? jobs
    : filter === 'active' ? jobs.filter(j => j.enabled)
    : filter === 'errors' ? jobs.filter(j => j.enabled && j.lastStatus === 'error')
    : jobs.filter(j => !j.enabled);

  const active = jobs.filter(j => j.enabled).length;
  const errs = jobs.filter(j => j.enabled && j.lastStatus === 'error').length;
  const off = jobs.filter(j => !j.enabled).length;

  const cronAction = async (jobId, action) => {
    try {
      await api.fetch('/api/crons/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action })
      });
    } catch {}
  };

  const summary = `${active} active` + (errs ? ` · ${errs} ⚠` : '') + (off ? ` · ${off} off` : '');
  const filters = ['all', 'active', 'errors', 'disabled'];

  return html`
    <div class=${cls('wrap')}>
      ${!connected && html`<div class=${cls('stale')}>⚠ Stale</div>`}
      <button class=${cls('toggle')} onClick=${() => setOpen(!open)} style="display:flex;align-items:center;gap:8px;width:100%;background:none;border:none;color:var(--text);cursor:pointer;padding:8px 0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent)"></span>
        <span>Scheduled Jobs</span>
        <span style="margin-left:auto;display:flex;align-items:center;gap:6px">
          <span style="font-size:10px;color:var(--text-dim);font-weight:400;text-transform:none;letter-spacing:0;font-family:'JetBrains Mono',monospace">${summary}</span>
          <span style="font-size:10px;transition:transform 0.2s;transform:rotate(${open ? '90' : '0'}deg)">▶</span>
        </span>
      </button>
      ${open && html`
        <div class=${cls('body')}>
          <div class=${cls('filters')} style="display:flex;gap:6px;margin-bottom:12px">
            ${filters.map(f => html`
              <button
                class=${cls('filter-btn')}
                onClick=${() => setFilter(f)}
                style="padding:3px 10px;font-size:10px;border-radius:10px;border:1px solid ${filter === f ? 'var(--accent)' : 'rgba(255,255,255,0.1)'};background:${filter === f ? 'var(--accent)' : 'transparent'};color:${filter === f ? '#000' : 'var(--text-dim)'};cursor:pointer;text-transform:capitalize"
              >${f}</button>
            `)}
          </div>
          ${filtered.map(j => html`
            <div class=${cls('job')} style="display:flex;align-items:center;gap:8px;padding:7px 0;opacity:${j.enabled ? 1 : 0.4}">
              <span style="width:8px;height:8px;border-radius:50%;background:${statusDot(j)};flex-shrink:0"></span>
              <div style="flex:1;min-width:0">
                <div style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${j.name}</div>
                <div style="font-size:10px;color:var(--text-dim);font-family:'JetBrains Mono',monospace;margin-top:1px">
                  ${fmtAgo(j.lastRunAt)}${j.lastDurationMs ? ' · ' + (j.lastDurationMs / 1000).toFixed(1) + 's' : ''}${j.nextRunAt ? ' · next ' + fmtNextShort(j.nextRunAt) : ''}
                </div>
                ${j.lastError && j.consecutiveErrors > 0 && html`<div style="font-size:10px;color:var(--red);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${j.lastError}</div>`}
              </div>
              <div style="display:flex;gap:4px;flex-shrink:0">
                <button onClick=${() => cronAction(j.id, 'run')} style="padding:3px 8px;font-size:9px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:var(--text-dim);cursor:pointer" title="Run now">▶</button>
                <button onClick=${() => cronAction(j.id, j.enabled ? 'disable' : 'enable')} style="padding:3px 8px;font-size:9px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:${j.enabled ? 'var(--red)' : 'var(--green)'};cursor:pointer" title=${j.enabled ? 'Disable' : 'Enable'}>${j.enabled ? '⏸' : '▶'}</button>
              </div>
            </div>
          `)}
        </div>
      `}
    </div>
  `;
}
