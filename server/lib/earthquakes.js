const db = require('./db');

// EMSC — European-Mediterranean Seismological Centre (better Romania coverage than USGS).
// Bounding box covers Romania plus the Vrancea zone's surroundings.
const EMSC_BASE =
  'https://www.seismicportal.eu/fdsnws/event/1/query?format=json' +
  '&minlat=43.5&maxlat=48.5&minlon=20.0&maxlon=30.0' +
  '&minmag=1.0&orderby=time&limit=500';

const WINDOW_DAYS = 30;

function emscUrl() {
  const start = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString().slice(0, 19);
  return `${EMSC_BASE}&starttime=${start}`;
}

// Flattens an EMSC GeoJSON feature into the shape the API returns.
function normalize(f) {
  return {
    id:        f.id,
    magnitude: f.properties.mag,
    place:     f.properties.flynn_region || 'ROMANIA',
    depth_km:  Math.round(f.properties.depth ?? 0),
    lat:       f.geometry.coordinates[1],
    lng:       f.geometry.coordinates[0],
    time:      new Date(f.properties.time).toISOString(),
  };
}

// One multi-row upsert instead of one query per event.
async function saveEvents(events) {
  if (events.length === 0) return;
  await db.query(
    `INSERT INTO earthquakes (id, magnitude, place, depth_km, lat, lng, occurred_at)
     SELECT * FROM unnest(
       $1::text[], $2::numeric[], $3::text[], $4::int[],
       $5::float8[], $6::float8[], $7::timestamptz[]
     )
     ON CONFLICT (id) DO NOTHING`,
    [
      events.map(e => e.id),
      events.map(e => e.magnitude),
      events.map(e => e.place),
      events.map(e => e.depth_km),
      events.map(e => e.lat),
      events.map(e => e.lng),
      events.map(e => e.time),
    ]
  );
}

/**
 * Earthquakes in the Romania bbox over the last 30 days, newest first.
 * Persists them to PostgreSQL when DATABASE_URL is set.
 */
async function getEarthquakes() {
  const res = await fetch(emscUrl(), { signal: AbortSignal.timeout(8000) });
  // EMSC answers 204 No Content when there are no events in the window.
  if (res.status === 204) return [];
  if (!res.ok) throw new Error('EMSC request failed: ' + res.status);

  const json = await res.json();
  const events = (json.features ?? []).map(normalize);

  if (process.env.DATABASE_URL) {
    await saveEvents(events).catch(err => console.error('Earthquake save failed:', err.message));
  }
  return events;
}

module.exports = { getEarthquakes };
