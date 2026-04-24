const express = require('express');
const { z } = require('zod');
const db = require('../lib/db');

const router = express.Router();

const VALID_CITIES = ['bucuresti', 'cluj', 'timisoara', 'iasi', 'constanta', 'brasov'];

const aqiSchema = z.object({
  city:  z.enum(VALID_CITIES).default('bucuresti'),
  hours: z.coerce.number().int().min(1).max(168).default(24),
});

const eqSchema = z.object({
  days: z.coerce.number().int().min(1).max(30).default(7),
});

// GET /api/history/aqi?city=bucuresti&hours=24
router.get('/aqi', async (req, res) => {
  if (!process.env.DATABASE_URL) return res.json({ ok: true, data: [] });
  const r = aqiSchema.safeParse(req.query);
  if (!r.success) return res.status(400).json({ ok: false, error: r.error.issues[0].message });
  const { city, hours } = r.data;
  try {
    const { rows } = await db.query(
      `SELECT date_trunc('hour', recorded_at) AS hour, ROUND(AVG(aqi_value))::int AS avg_aqi
       FROM aqi_readings
       WHERE city_id = $1 AND recorded_at >= NOW() - ($2 || ' hours')::interval
       GROUP BY hour ORDER BY hour ASC`,
      [city, hours]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/history/earthquakes?days=7
router.get('/earthquakes', async (req, res) => {
  if (!process.env.DATABASE_URL) return res.json({ ok: true, data: [] });
  const r = eqSchema.safeParse(req.query);
  if (!r.success) return res.status(400).json({ ok: false, error: r.error.issues[0].message });
  const { days } = r.data;
  try {
    const { rows } = await db.query(
      `SELECT DATE(occurred_at AT TIME ZONE 'Europe/Bucharest') AS day,
              COUNT(*)::int AS total,
              MAX(magnitude)::numeric(3,1) AS max_mag,
              AVG(magnitude)::numeric(3,1) AS avg_mag
       FROM earthquakes
       WHERE occurred_at >= NOW() - ($1 || ' days')::interval
       GROUP BY day ORDER BY day ASC`,
      [days]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
