const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

async function getSystemStatus(exec) {
  try {
    const raw = await exec('openclaw', ['status']);

    const get = (label) => {
      const re = new RegExp(`│\\s*${label}\\s*│\\s*(.+?)\\s*│`, 'i');
      const m = raw.match(re);
      return m ? m[1].trim() : null;
    };

    const version = get('Updated') || get('Version');
    const os = get('OS');
    const channel = get('Channel');
    const tailscale = get('Tailscale');
    const heartbeat = get('Heartbeat');
    const sessions = get('Sessions');
    const gateway = get('Gateway service');
    const agents = get('Agents');
    const memory = get('Memory');

    const secMatch = raw.match(/Summary:\s*(\d+)\s*critical[,·]\s*(\d+)\s*warn[,·]\s*(\d+)\s*info/i);
    const security = secMatch
      ? { critical: parseInt(secMatch[1]), warn: parseInt(secMatch[2]), info: parseInt(secMatch[3]) }
      : null;

    const chanMatch = raw.match(/│\s*(telegram|discord|whatsapp|signal)\s*│\s*(ON|OFF)\s*│/i);
    const chanStatus = chanMatch ? { name: chanMatch[1], status: chanMatch[2] } : null;

    return {
      online: true,
      version: version || 'unknown',
      os: os || 'unknown',
      channel: chanStatus || { name: channel || 'unknown', status: 'ON' },
      heartbeat: heartbeat || 'unknown',
      sessions: sessions || 'unknown',
      gateway: gateway || 'unknown',
      agents: agents || 'unknown',
      memory: memory || 'unknown',
      security,
    };
  } catch {
    return { online: false, error: 'CLI not found or failed' };
  }
}

module.exports = ({ hooks, config, auth, panel, deps }) => ({
  endpoint: `/api/panels/${panel.id}`,

  handler: async (req, res) => {
    const user = auth.check(req);
    if (!user) return res.status(403).json({ error: 'Unauthorized' });

    const exec = deps?.exec || (async (cmd, args) => {
      const result = await execFileAsync(cmd, args, { timeout: 15000, encoding: 'utf8' });
      return result.stdout.trim();
    });

    const data = await getSystemStatus(exec);
    const filtered = await hooks.filter(`panel.${panel.id}.data`, data, { user });
    res.json(filtered);
  }
});
