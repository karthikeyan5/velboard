import { html, useState, useEffect, useRef } from '/core/vendor/preact-htm.js';

function detectPlatform() {
  const ua = navigator.userAgent || '';
  const pl = navigator.platform || '';
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return null;
  if (/Win/i.test(pl)) return 'windows';
  if (/Mac/i.test(pl)) return 'mac';
  if (/Linux/i.test(pl)) return 'linux';
  return null;
}

const PLATFORM_LABELS = { linux: 'Linux', mac: 'Mac', windows: 'Windows' };
const ALL_PLATFORMS = ['linux', 'mac', 'windows'];

const STATE_CONFIG = {
  disconnected: { color: '#666', icon: '⚫', label: 'No browser connected' },
  connected:    { color: '#22c55e', icon: '🟢', label: 'Browser connected' },
  agent_active: { color: '#0af', icon: '🤖', label: 'AI is using the browser' },
};

export default function BrowserRelayPanel({ data, error, connected, lastUpdate, api, config, cls }) {
  const [status, setStatus] = useState({ state: 'disconnected' });
  const pollRef = useRef(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const resp = await fetch('/relay/status');
        if (resp.ok) setStatus(await resp.json());
      } catch(e) {}
    };
    poll();
    pollRef.current = setInterval(poll, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  const cfg = STATE_CONFIG[status.state] || STATE_CONFIG.disconnected;
  const platform = detectPlatform();
  const others = ALL_PLATFORMS.filter(p => p !== platform);
  const [showOther, setShowOther] = useState(false);

  const sinceText = status.connectedSince
    ? 'since ' + new Date(status.connectedSince).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const styles = {
    wrap: { padding: '16px', fontFamily: '-apple-system, system-ui, sans-serif', color: '#e0e0e0', minHeight: '120px' },
    header: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
    dot: { width: '10px', height: '10px', borderRadius: '50%', background: cfg.color, display: 'inline-block', boxShadow: status.state !== 'disconnected' ? `0 0 6px ${cfg.color}` : 'none' },
    label: { fontSize: '14px', fontWeight: 600, color: cfg.color },
    sub: { fontSize: '12px', color: '#888', marginBottom: '12px' },
    activeTab: { color: '#0af', fontSize: '12px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '8px' },
    link: { color: '#0af', fontSize: '11px', cursor: 'pointer', textDecoration: 'none', opacity: 0.8 },
    btn: { padding: '6px 14px', border: '1px solid #0af', borderRadius: '4px', background: 'rgba(0,170,255,0.1)', color: '#0af', cursor: 'pointer', fontSize: '12px' },
    desc: { color: '#777', fontSize: '12px', lineHeight: '1.5', marginBottom: '12px' },
  };

  return html`
    <div style=${styles.wrap}>
      <div style=${styles.header}>
        <span style=${styles.dot}></span>
        <span style=${styles.label}>${cfg.label}</span>
      </div>

      ${sinceText && html`<div style=${styles.sub}>${sinceText}${status.msgCount ? ` · ${status.msgCount} messages` : ''}</div>`}

      ${status.activeTab && html`<div style=${styles.activeTab}>Working on: ${status.activeTab}</div>`}

      ${status.state === 'disconnected' && html`
        <div style=${styles.desc}>
          Download and run the launcher to connect your browser.
        </div>
      `}

      <div>
        ${platform ? html`
          <button style=${styles.btn} onclick=${() => window.open('/relay/download?platform=' + platform, '_blank')}>
            ⬇ Download for ${PLATFORM_LABELS[platform]}
          </button>
          <div style=${{ marginTop: '6px' }}>
            <span style=${{ ...styles.link, opacity: 0.5 }} onclick=${() => setShowOther(!showOther)}>
              ${showOther ? '▾' : '▸'} Other platforms
            </span>
            ${showOther && html`
              <div style=${{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                ${others.map(p => html`
                  <a href=${'/relay/download?platform=' + p} style=${styles.link}>⬇ ${PLATFORM_LABELS[p]}</a>
                `)}
              </div>
            `}
          </div>
        ` : html`
          <div style=${{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            ${ALL_PLATFORMS.map(p => html`
              <a href=${'/relay/download?platform=' + p} style=${styles.link}>⬇ ${PLATFORM_LABELS[p]}</a>
            `)}
          </div>
        `}
      </div>
    </div>
  `;
}
