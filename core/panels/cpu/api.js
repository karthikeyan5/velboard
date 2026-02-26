const si = require('systeminformation');

module.exports = ({ hooks, config, auth, panel, deps }) => ({
  endpoint: `/api/panels/${panel.id}`,

  handler: async (req, res) => {
    const user = auth.check(req);
    if (!user) return res.status(403).json({ error: 'Unauthorized' });

    const cpu = await si.currentLoad();
    const data = {
      load: Math.round(cpu.currentLoad * 10) / 10,
      cores: cpu.cpus?.length || 0
    };

    const filtered = await hooks.filter(`panel.${panel.id}.data`, data, { user });
    res.json(filtered);
  }
});
