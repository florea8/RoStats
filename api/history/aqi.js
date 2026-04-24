const db = require('../../server/lib/db');

const VALID_CITIES = ['bucuresti', 'cluj', 'timisoara', 'iasi', 'constanta', 'brasov'];

// GET /api/history/aqi?city=bucuresti&hours=24 — Vercel Serverless Function
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.DATABASE_URL) {
    return res.json({ ok: true, data: [] });
  }

  const city = VALID_CITIES.includes(req.query.city) ? req.query.city : 'bucuresti';
  const hours = Math.min(168, Math.max(1, parseInt(req.query.hours) || 24));

  try {
    const { rows } = await db.query(
      `SELECT
         date_trunc('hour', recorded_at) AS hour,
         ROUND(AVG(aqi_value))::int AS avg_aqi
       FROM aqi_readings
       WHERE city_id = $1
         AND recorded_at >= NOW() - ($2 || ' hours')::interval
       GROUP BY hour
       ORDER BY hour ASC`,
      [city, hours]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
