// Tests for the Eurostat indicators. fetch is mocked with small JSON-stat
// answers, so the suite runs offline.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const handlers = require('../handlers');
const { lastTwo } = require('../lib/indicators');
const { call, jsonResponse } = require('./helpers');

/** Minimal JSON-stat 2.0 answer: one geo, one unit, the given periods and values. */
function jsonStat(periods, values) {
  const index = Object.fromEntries(periods.map((p, i) => [p, i]));
  return {
    id: ['unit', 'geo', 'time'],
    size: [1, 1, periods.length],
    dimension: {
      unit: { category: { index: { PC: 0 } } },
      geo: { category: { index: { RO: 0 } } },
      time: { category: { index } },
    },
    value: Object.fromEntries(values.map((v, i) => [i, v]).filter(([, v]) => v != null)),
  };
}

describe('lastTwo', () => {
  it('returns the two latest periods that have a value, oldest first', () => {
    const json = jsonStat(['2026-07', '2026-08', '2026-09', '2026-10'], [6.1, 6.4, 6.3, null]);
    assert.deepEqual(lastTwo(json), [
      { period: '2026-08', value: 6.4 },
      { period: '2026-09', value: 6.3 },
    ]);
  });

  it('refuses a dataset that still has several entries in another dimension', () => {
    const json = jsonStat(['2025', '2026'], [1, 2]);
    json.size[0] = 2;
    assert.throws(() => lastTwo(json), /unfiltered dimensions: unit/);
  });

  it('refuses a series with fewer than two values', () => {
    assert.throws(() => lastTwo(jsonStat(['2025', '2026'], [null, 2])), /fewer than two/);
  });
});

describe('GET /api/indicators', () => {
  it('returns every indicator live, scaled and rounded', async t => {
    t.mock.method(globalThis, 'fetch', async url => {
      if (url.includes('nama_10_pc')) return jsonResponse(jsonStat(['2024', '2025'], [18640, 20100]));
      if (url.includes('gov_10dd_edpt1')) return jsonResponse(jsonStat(['2024', '2025'], [-9.2, -7.8]));
      return jsonResponse(jsonStat(['2026-08', '2026-09'], [6.4, 6.3]));
    });

    const res = await call(handlers.indicators);
    assert.equal(res.body.source, 'live');
    assert.equal(res.body.data.length, 9);

    const byId = Object.fromEntries(res.body.data.map(d => [d.id, d]));
    assert.equal(byId.gdpPerCapita.value, 20.1);      // € → k €
    assert.equal(byId.deficit.value, 7.8);            // net borrowing shown as a positive deficit
    assert.equal(byId.deficit.previous, 9.2);
    assert.equal(byId.unemployment.period, '2026-09');
    assert.equal(byId.unemployment.better, 'lower');
    assert.equal(byId.unemployment.dataset, undefined); // query details stay on the server
    assert.match(globalThis.fetch.mock.calls[0].arguments[0], /[?&]geo=RO&/);
    assert.match(res.headers['cache-control'], /s-maxage=21600\b/);
  });

  it('serves the fallback for a series Eurostat does not answer, marked demo', async t => {
    t.mock.method(console, 'error', () => {});
    t.mock.method(globalThis, 'fetch', async url =>
      url.includes('une_rt_m') ? jsonResponse({}, 503) : jsonResponse(jsonStat(['2025', '2026'], [1, 2])));

    const res = await call(handlers.indicators);
    const unemployment = res.body.data.find(d => d.id === 'unemployment');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.source, 'demo');
    assert.equal(unemployment.source, 'demo');
    assert.equal(typeof unemployment.value, 'number');
    assert.equal(res.body.data.find(d => d.id === 'inflation').source, 'live');
    assert.match(res.headers['cache-control'], /s-maxage=300\b/);
  });
});
