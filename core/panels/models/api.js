const path = require('path');
const fs = require('fs');

function getAgentInfo(readFileSync) {
  const WORKSPACE = path.resolve(__dirname, '..', '..', '..', '..');
  const cfgPath = path.join(WORKSPACE, '..', 'openclaw.json');

  try {
    const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
    const agent = cfg.agents?.defaults || {};
    const model = agent.model || {};
    return {
      primary: model.primary || 'unknown',
      fallbacks: model.fallbacks || [],
      subagent: agent.subagents?.model || null,
      heartbeat: agent.heartbeat?.model || null,
      heartbeatInterval: agent.heartbeat?.every || null,
      context: '200k',
      channel: cfg.channels?.telegram?.enabled ? 'Telegram' : 'unknown',
      streamMode: cfg.channels?.telegram?.streamMode || 'off',
      name: cfg.ui?.assistant?.name || 'Agent'
    };
  } catch {
    return null;
  }
}

module.exports = ({ hooks, config, auth, panel, deps }) => ({
  endpoint: `/api/panels/${panel.id}`,

  handler: async (req, res) => {
    const user = auth.check(req);
    if (!user) return res.status(403).json({ error: 'Unauthorized' });

    const data = getAgentInfo(fs.readFileSync);
    if (!data) return res.status(500).json({ error: 'Agent config not found' });

    const filtered = await hooks.filter(`panel.${panel.id}.data`, data, { user });
    res.json(filtered);
  }
});
