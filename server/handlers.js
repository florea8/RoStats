// HTTP handlers shared by the Express dev server (server/index.js) and the
// Vercel serverless functions (api/*.js). Both pass Express-compatible
// (req, res) objects, so each endpoint is implemented exactly once.
const { z } = require('zod');
const { CITY_IDS } = require('./lib/cities');
const { getWeather } = require('./lib/weather');
const { getAQI } = require('./lib/airQuality');
const { getEarthquakes } = require('./lib/earthquakes');
const { getAqiHistory, getEarthquakeHistory } = require('./lib/history');

const schemas = {
  weather:     z.object({ city: z.enum(CITY_IDS).optional() }),
  aqiHistory:  z.object({
    city:  z.enum(CITY_IDS).default('bucuresti'),
    hours: z.coerce.number().int().min(1).max(168).default(24),
  }),
  eqHistory:   z.object({
    days: z.coerce.number().int().min(1).max(30).default(7),
  }),
};

// Lets Vercel's CDN serve repeated requests without hitting upstream APIs.
function cacheFor(res, seconds) {
  res.setHeader('Cache-Control', `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 2}`);
}

function badRequest(res, error) {
  return res.status(400).json({ ok: false, error: error.issues[0].message });
}

async function weather(req, res) {
  const parsed = schemas.weather.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: 'Invalid parameter. city must be one of: ' + CITY_IDS.join(', '),
    });
  }
  // Without ?city= the response covers every city in one request.
  const { city } = parsed.data;
  const { data, source } = await getWeather(city ? [city] : undefined);
  cacheFor(res, source === 'live' ? 600 : 60);
  res.json({ ok: true, data: city ? data[city] : data, source });
}

async function aqi(_req, res) {
  const { data, source } = await getAQI();
  cacheFor(res, source === 'live' ? 600 : 60);
  res.json({ ok: true, data, source });
}

async function earthquakes(_req, res) {
  try {
    const data = await getEarthquakes();
    cacheFor(res, 300);
    res.json({ ok: true, data, count: data.length, source: 'live' });
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
}

async function aqiHistory(req, res) {
  const parsed = schemas.aqiHistory.safeParse(req.query);
  if (!parsed.success) return badRequest(res, parsed.error);
  if (!process.env.DATABASE_URL) return res.json({ ok: true, data: [] });
  try {
    cacheFor(res, 300);
    res.json({ ok: true, data: await getAqiHistory(parsed.data) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

async function earthquakeHistory(req, res) {
  const parsed = schemas.eqHistory.safeParse(req.query);
  if (!parsed.success) return badRequest(res, parsed.error);
  if (!process.env.DATABASE_URL) return res.json({ ok: true, data: [] });
  try {
    cacheFor(res, 300);
    res.json({ ok: true, data: await getEarthquakeHistory(parsed.data) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

function health(_req, res) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}

// Vercel functions receive every HTTP method; Express routes are GET-only already.
function getOnly(handler) {
  return (req, res) => {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return handler(req, res);
  };
}

module.exports = { weather, aqi, earthquakes, aqiHistory, earthquakeHistory, health, getOnly };
