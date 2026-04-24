const { fetchAndSaveEarthquakes } = require('../server/lib/usgs');

// GET /api/earthquakes — Vercel Serverless Function
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const features = await fetchAndSaveEarthquakes();
    res.json({ ok: true, data: features, count: features.length });
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
};
