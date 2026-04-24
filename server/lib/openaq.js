const db = require('./db');

const CITIES = [
  { id: 'bucuresti', name: 'București',   lat: 44.43, lng: 26.10 },
  { id: 'cluj',      name: 'Cluj-Napoca', lat: 46.77, lng: 23.62 },
  { id: 'timisoara', name: 'Timișoara',   lat: 45.75, lng: 21.21 },
  { id: 'iasi',      name: 'Iași',        lat: 47.16, lng: 27.60 },
  { id: 'constanta', name: 'Constanța',   lat: 44.17, lng: 28.64 },
  { id: 'brasov',    name: 'Brașov',      lat: 45.64, lng: 25.59 },
];

const AQI_BASE = {
  bucuresti: 42, cluj: 31, timisoara: 27,
  iasi: 58, constanta: 36, brasov: 22,
};

function simulateAQI(cityId) {
  const base = AQI_BASE[cityId] ?? 40;
  return Math.max(5, Math.round(base + (Math.random() - 0.5) * 14));
}

/**
 * Fetches AQI values from OpenAQ for each city, falling back to simulated values.
 * If DATABASE_URL is set, inserts a reading into aqi_readings per city.
 * Returns an object keyed by city id: { bucuresti: 42, cluj: 31, ... }
 */
async function fetchAndSaveAQI() {
  const result = {};

  for (const city of CITIES) {
    let aqi;
    try {
      const url =
        `https://api.openaq.org/v3/locations` +
        `?coordinates=${city.lat},${city.lng}&radius=20000&limit=5&order_by=lastUpdated`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error('OpenAQ ' + res.status);
      const data = await res.json();
      const location = data.results?.[0];
      const pm25 = location?.sensors?.find(s => s.parameter?.name === 'pm25')?.latest?.value;
      aqi = pm25 ? Math.round(pm25 * 4.5) : simulateAQI(city.id);
    } catch {
      aqi = simulateAQI(city.id);
    }

    if (process.env.DATABASE_URL) {
      await db.query(
        'INSERT INTO aqi_readings (city_id, city_name, aqi_value) VALUES ($1, $2, $3)',
        [city.id, city.name, aqi]
      );
    }

    result[city.id] = aqi;
  }

  return result;
}

module.exports = { fetchAndSaveAQI };
