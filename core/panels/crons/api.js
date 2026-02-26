const path = require('path');
const fs = require('fs');

function getCronJobs(readFileSync) {
  const WORKSPACE = path.resolve(__dirname, '..', '..', '..', '..');
  const cronPaths = [
    path.join(WORKSPACE, '..', 'cron', 'jobs.json'),
    path.join(WORKSPACE, '..', 'agents', 'main', 'cron-jobs.json')
  ];

  for (const p of cronPaths) {
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(readFileSync(p, 'utf8'));
        const jobs = Array.isArray(data) ? data : (data.jobs || []);
        return jobs.map(j => ({
          id: j.id,
          name: j.name || 'Unnamed',
          enabled: j.enabled !== false,
          schedule: j.schedule || null,
          sessionTarget: j.sessionTarget || null,
          model: j.payload?.model || null,
          payloadKind: j.payload?.kind || null,
          lastStatus: j.state?.lastStatus || null,
          lastRunAt: j.state?.lastRunAtMs ? new Date(j.state.lastRunAtMs).toISOString() : null,
          lastDurationMs: j.state?.lastDurationMs || null,
          nextRunAt: j.state?.nextRunAtMs ? new Date(j.state.nextRunAtMs).toISOString() : null,
          consecutiveErrors: j.state?.consecutiveErrors || 0,
          lastError: j.state?.lastError || null
        }));
      } catch {}
    }
  }
  return [];
}

module.exports = ({ hooks, config, auth, panel, deps }) => ({
  endpoint: `/api/panels/${panel.id}`,

  handler: async (req, res) => {
    const user = auth.check(req);
    if (!user) return res.status(403).json({ error: 'Unauthorized' });

    // Use sync readFile for backward compat (getCronJobs uses sync reads)
    const data = getCronJobs(fs.readFileSync);
    const filtered = await hooks.filter(`panel.${panel.id}.data`, data, { user });
    res.json(filtered);
  }
});
