const si = require('systeminformation');

module.exports = ({ hooks, config, auth, panel, deps }) => ({
  endpoint: `/api/panels/${panel.id}`,

  handler: async (req, res) => {
    const user = auth.check(req);
    if (!user) return res.status(403).json({ error: 'Unauthorized' });

    const [proc, osInfo] = await Promise.all([si.processes(), si.osInfo()]);
    const data = {
      total: proc.all,
      running: proc.running,
      sleeping: proc.sleeping,
      os: `${osInfo.distro} ${osInfo.release}`
    };

    const filtered = await hooks.filter(`panel.${panel.id}.data`, data, { user });
    res.json(filtered);
  }
});
