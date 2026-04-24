const db = require('../../server/lib/db');

// GET /api/history/earthquakes?days=7 — Vercel Serverless Function
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.DATABASE_URL) {
    return res.json({ ok: true, data: [] });
  }

  try {
    const days = Math.min(30, Math.max(1, parseInt(req.query.days) || 7));
    const { rows } = await db.query(
      `SELECT
         DATE(occurred_at AT TIME ZONE 'Europe/Bucharest') AS day,
         COUNT(*)::int AS total,
         MAX(magnitude)::numeric(3,1) AS max_mag,
         AVG(magnitude)::numeric(3,1) AS avg_mag
       FROM earthquakes
       WHERE occurred_at >= NOW() - ($1 || ' days')::interval
       GROUP BY day
       ORDER BY day ASC`,
      [days]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
