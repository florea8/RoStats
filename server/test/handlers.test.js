// Handler tests. Upstream APIs are replaced with a mocked fetch, so the
// suite runs offline and always sees the same data.
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const handlers = require('../handlers');
const { CITY_IDS } = require('../lib/cities');
const { call, jsonResponse } = require('./helpers');

beforeEach(() => {
  // Never touch a real database or API key from the developer's environment.
  delete process.env.DATABASE_URL;
  delete process.env.OWM_KEY;
});

describe('GET /api/weather', () => {
  const owmBody = { main: { temp: 4.6, feels_like: 2.2, humidity: 87 }, weather: [{ description: 'broken clouds' }], wind: { speed: 1.4 } };

  it('rejects an unknown city', async () => {
    const res = await call(handlers.weather, { city: 'paris' });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.ok, false);
  });

  it('serves demo values for every city when OWM_KEY is missing', async () => {
    const res = await call(handlers.weather);
    assert.equal(res.body.source, 'demo');
    assert.deepEqual(Object.keys(res.body.data), CITY_IDS);
    assert.match(res.headers['cache-control'], /s-maxage=60\b/);
  });

  it('returns live, rounded values for all cities', async t => {
    process.env.OWM_KEY = 'test-key';
    t.mock.method(globalThis, 'fetch', async () => jsonResponse(owmBody));

    const res = await call(handlers.weather);
    assert.equal(res.body.source, 'live');
    assert.deepEqual(res.body.data.cluj, {
      temp: 5, feels_like: 2, humidity: 87, description: 'broken clouds', wind: 1,
    });
    assert.match(res.headers['cache-control'], /s-maxage=600\b/);
  });

  it('returns a single city object when ?city= is given', async t => {
    process.env.OWM_KEY = 'test-key';
    t.mock.method(globalThis, 'fetch', async () => jsonResponse(owmBody));

    const res = await call(handlers.weather, { city: 'iasi' });
    assert.equal(res.body.data.temp, 5);
    assert.equal(globalThis.fetch.mock.callCount(), 1);
  });

  it('marks the response as demo when one city fails', async t => {
    process.env.OWM_KEY = 'test-key';
    t.mock.method(globalThis, 'fetch', async url =>
      url.includes('id=681290') ? jsonResponse({}, 500) : jsonResponse(owmBody));

    const res = await call(handlers.weather);
    assert.equal(res.body.source, 'demo');
    assert.equal(res.body.data.cluj.description, 'light rain'); // demo value
    assert.equal(res.body.data.iasi.description, 'broken clouds'); // live value
  });
});

describe('GET /api/aqi', () => {
  it('returns live US AQI values from Open-Meteo', async t => {
    t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse(CITY_IDS.map((_, i) => ({ current: { us_aqi: 40.4 + i } }))));

    const res = await call(handlers.aqi);
    assert.equal(res.body.source, 'live');
    assert.equal(res.body.data.bucuresti, 40);
    assert.equal(res.body.data.brasov, 45);
  });

  it('falls back to demo values when Open-Meteo is unreachable', async t => {
    t.mock.method(console, 'error', () => {});
    t.mock.method(globalThis, 'fetch', async () => { throw new Error('network down'); });

    const res = await call(handlers.aqi);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.source, 'demo');
    assert.deepEqual(Object.keys(res.body.data), CITY_IDS);
  });
});

describe('GET /api/earthquakes', () => {
  const feature = {
    id: '20261106_0000106',
    properties: { mag: 2.6, flynn_region: 'ROMANIA', depth: 16.4, time: '2026-11-06T07:51:46.48Z' },
    geometry: { coordinates: [27.0988, 45.4891, -16.4] },
  };

  it('returns a flat shape with a positive depth', async t => {
    t.mock.method(globalThis, 'fetch', async () => jsonResponse({ features: [feature] }));

    const res = await call(handlers.earthquakes);
    assert.equal(res.body.count, 1);
    assert.deepEqual(res.body.data[0], {
      id: '20261106_0000106',
      magnitude: 2.6,
      place: 'ROMANIA',
      depth_km: 16,
      lat: 45.4891,
      lng: 27.0988,
      time: '2026-11-06T07:51:46.480Z',
    });
  });

  it('treats 204 No Content as an empty list', async t => {
    t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 204 }));

    const res = await call(handlers.earthquakes);
    assert.deepEqual(res.body.data, []);
  });

  it('answers 502 when EMSC fails', async t => {
    t.mock.method(globalThis, 'fetch', async () => jsonResponse({}, 503));

    const res = await call(handlers.earthquakes);
    assert.equal(res.statusCode, 502);
    assert.equal(res.body.ok, false);
  });
});

describe('GET /api/history/*', () => {
  it('rejects hours outside 1–168', async () => {
    const res = await call(handlers.aqiHistory, { hours: '999' });
    assert.equal(res.statusCode, 400);
  });

  it('rejects days outside 1–30', async () => {
    const res = await call(handlers.earthquakeHistory, { days: '0' });
    assert.equal(res.statusCode, 400);
  });

  it('returns an empty list when no database is configured', async () => {
    const res = await call(handlers.aqiHistory, { city: 'cluj' });
    assert.deepEqual(res.body, { ok: true, data: [] });
  });
});

describe('getOnly', () => {
  it('answers 405 to non-GET requests', async () => {
    const res = await call(handlers.getOnly(handlers.health), {}, 'POST');
    assert.equal(res.statusCode, 405);
  });
});
