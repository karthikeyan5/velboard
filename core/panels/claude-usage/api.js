const path = require('path');
const fs = require('fs');

module.exports = ({ hooks, config, auth, panel, deps }) => ({
  endpoint: `/api/panels/${panel.id}`,

  handler: async (req, res) => {
    const user = auth.check(req);
    if (!user) return res.status(403).json({ error: 'Unauthorized' });

    const readFile = deps?.readFile || ((p, enc) => fs.promises.readFile(p, enc));
    const WORKSPACE = path.resolve(__dirname, '..', '..', '..', '..');
    const usagePath = path.join(WORKSPACE, 'claude-usage.json');

    try {
      const raw = await readFile(usagePath, 'utf8');
      const data = JSON.parse(raw);
      const filtered = await hooks.filter(`panel.${panel.id}.data`, data, { user });
      res.json(filtered);
    } catch {
      res.json(null);
    }
  }
});
