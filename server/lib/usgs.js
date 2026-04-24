const db = require('./db');

// EMSC — European-Mediterranean Seismological Centre (better Romania coverage than USGS)
const EMSC_BASE =
  'https://www.seismicportal.eu/fdsnws/event/1/query?format=json' +
  '&minlat=43.5&maxlat=48.5&minlon=20.0&maxlon=30.0' +
  '&minmag=1.0&orderby=time&limit=20';

/**
 * Fetches recent earthquakes from EMSC for Romania bbox.
 * If DATABASE_URL is set, upserts each event into the earthquakes table.
 * Returns normalized objects compatible with the frontend shape.
 */
async function fetchAndSaveEarthquakes() {
  const res = await fetch(EMSC_BASE);
  if (!res.ok) throw new Error('EMSC request failed: ' + res.status);
  const json = await res.json();
  const features = json.features ?? [];

  const normalized = features.map(f => ({
    id:          f.id,
    magnitude:   f.properties.mag,
    place:       f.properties.flynn_region || 'România',
    depth_km:    Math.round(f.properties.depth ?? 0),
    lat:         f.geometry.coordinates[1],
    lng:         f.geometry.coordinates[0],
    occurred_at: new Date(f.properties.time).toISOString(),
    // keep raw properties for frontend compatibility
    properties: {
      mag:   f.properties.mag,
      place: f.properties.flynn_region || 'România',
      time:  new Date(f.properties.time).getTime(),
    },
    geometry: f.geometry,
  }));

  if (process.env.DATABASE_URL) {
    for (const q of normalized) {
      await db.query(
        `INSERT INTO earthquakes (id, magnitude, place, depth_km, lat, lng, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [q.id, q.magnitude, q.place, q.depth_km, q.lat, q.lng, q.occurred_at]
      );
    }
  }

  return normalized;
}

module.exports = { fetchAndSaveEarthquakes };


module.exports = { fetchAndSaveEarthquakes };
