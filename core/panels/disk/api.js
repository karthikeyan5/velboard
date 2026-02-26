const si = require('systeminformation');

module.exports = ({ hooks, config, auth, panel, deps }) => ({
  endpoint: `/api/panels/${panel.id}`,

  handler: async (req, res) => {
    const user = auth.check(req);
    if (!user) return res.status(403).json({ error: 'Unauthorized' });

    const disk = await si.fsSize();
    const rootDisk = disk.find(d => d.mount === '/') || disk[0] || {};
    const data = {
      total: rootDisk.size || 0,
      used: rootDisk.used || 0,
      free: (rootDisk.size || 0) - (rootDisk.used || 0),
      pct: Math.round((rootDisk.use || 0) * 10) / 10,
      mount: rootDisk.mount || '/'
    };

    const filtered = await hooks.filter(`panel.${panel.id}.data`, data, { user });
    res.json(filtered);
  }
});
