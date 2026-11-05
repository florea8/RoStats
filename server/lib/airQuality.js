const db = require('./db');
const { CITIES } = require('./cities');

// Open-Meteo Air Quality API: CAMS European model, no API key required.
// One request returns current US AQI for every city.
const OPEN_METEO_URL =
  'https://air-quality-api.open-meteo.com/v1/air-quality' +
  `?latitude=${CITIES.map(c => c.lat).join(',')}` +
  `&longitude=${CITIES.map(c => c.lng).join(',')}` +
  '&current=us_aqi&timezone=Europe%2FBucharest';

// Typical values, used only when Open-Meteo is unreachable (source: 'demo').
const DEMO_AQI = {
  bucuresti: 42, cluj: 31, timisoara: 27,
  iasi: 58, constanta: 36, brasov: 22,
};

async function fetchLiveAQI() {
  const res = await fetch(OPEN_METEO_URL, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error('Open-Meteo request failed: ' + res.status);
  const json = await res.json();
  // Multi-location requests return an array in the same order as the coordinates.
  const locations = Array.isArray(json) ? json : [json];

  const data = {};
  CITIES.forEach((city, i) => {
    const value = locations[i]?.current?.us_aqi;
    if (typeof value === 'number') data[city.id] = Math.round(value);
  });
  if (Object.keys(data).length === 0) throw new Error('Open-Meteo returned no AQI values');
  return data;
}

// Stores at most one reading per city every 10 minutes, so frequent page
// refreshes don't flood the table. Demo values are never stored.
async function saveReadings(data) {
  const ids = Object.keys(data);
  await db.query(
    `INSERT INTO aqi_readings (city_id, city_name, aqi_value)
     SELECT r.city_id, r.city_name, r.aqi_value
     FROM unnest($1::text[], $2::text[], $3::int[]) AS r(city_id, city_name, aqi_value)
     WHERE NOT EXISTS (
       SELECT 1 FROM aqi_readings a
       WHERE a.city_id = r.city_id
         AND a.recorded_at > NOW() - INTERVAL '10 minutes'
     )`,
    [ids, ids.map(id => CITIES.find(c => c.id === id).name), ids.map(id => data[id])]
  );
}

/**
 * Returns { data: { bucuresti: 54, ... }, source: 'live' | 'demo' }.
 * Never throws on upstream failure; DB errors are logged, not surfaced.
 */
async function getAQI() {
  try {
    const data = await fetchLiveAQI();
    if (process.env.DATABASE_URL) {
      await saveReadings(data).catch(err => console.error('AQI save failed:', err.message));
    }
    return { data, source: 'live' };
  } catch (err) {
    console.error('AQI fetch failed, serving demo values:', err.message);
    return { data: { ...DEMO_AQI }, source: 'demo' };
  }
}

module.exports = { getAQI };
