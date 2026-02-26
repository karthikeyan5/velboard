const si = require('systeminformation');

module.exports = ({ hooks, config, auth, panel, deps }) => ({
  endpoint: `/api/panels/${panel.id}`,

  handler: async (req, res) => {
    const user = auth.check(req);
    if (!user) return res.status(403).json({ error: 'Unauthorized' });

    const mem = await si.mem();
    const data = {
      total: mem.total,
      used: mem.used,
      free: mem.free,
      available: mem.available,
      pct: Math.round((mem.used / mem.total) * 1000) / 10
    };

    const filtered = await hooks.filter(`panel.${panel.id}.data`, data, { user });
    res.json(filtered);
  }
});
