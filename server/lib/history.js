const db = require('./db');

/** Hourly average AQI for one city over the last `hours` hours. */
async function getAqiHistory({ city, hours }) {
  const { rows } = await db.query(
    `SELECT date_trunc('hour', recorded_at) AS hour,
            ROUND(AVG(aqi_value))::int      AS avg_aqi
     FROM aqi_readings
     WHERE city_id = $1 AND recorded_at >= NOW() - make_interval(hours => $2::int)
     GROUP BY hour
     ORDER BY hour ASC`,
    [city, hours]
  );
  return rows;
}

/** Daily earthquake count and magnitudes (Bucharest time) over the last `days` days. */
async function getEarthquakeHistory({ days }) {
  const { rows } = await db.query(
    `SELECT DATE(occurred_at AT TIME ZONE 'Europe/Bucharest') AS day,
            COUNT(*)::int                  AS total,
            MAX(magnitude)::numeric(3,1)   AS max_mag,
            AVG(magnitude)::numeric(3,1)   AS avg_mag
     FROM earthquakes
     WHERE occurred_at >= NOW() - make_interval(days => $1::int)
     GROUP BY day
     ORDER BY day ASC`,
    [days]
  );
  return rows;
}

module.exports = { getAqiHistory, getEarthquakeHistory };
