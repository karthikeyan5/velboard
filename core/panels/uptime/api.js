const si = require('systeminformation');

module.exports = ({ hooks, config, auth, panel, deps }) => ({
  endpoint: `/api/panels/${panel.id}`,

  handler: async (req, res) => {
    const user = auth.check(req);
    if (!user) return res.status(403).json({ error: 'Unauthorized' });

    const [time, osInfo] = await Promise.all([si.time(), si.osInfo()]);
    const data = {
      uptime: time.uptime,
      hostname: osInfo.hostname
    };

    const filtered = await hooks.filter(`panel.${panel.id}.data`, data, { user });
    res.json(filtered);
  }
});
