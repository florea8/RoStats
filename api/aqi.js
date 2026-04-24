const { fetchAndSaveAQI } = require('../server/lib/openaq');

// GET /api/aqi — Vercel Serverless Function
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const data = await fetchAndSaveAQI();
    res.json({ ok: true, data });
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
};
