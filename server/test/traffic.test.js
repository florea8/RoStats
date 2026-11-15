// Tests for the TomTom traffic endpoint. fetch is mocked, so no key or
// network is needed.
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const handlers = require('../handlers');
const { stateFor, period } = require('../lib/traffic');
const { call, jsonResponse } = require('./helpers');

const flow = (currentSpeed, freeFlowSpeed, roadClosure = false) =>
  jsonResponse({ flowSegmentData: { currentSpeed, freeFlowSpeed, roadClosure } });

beforeEach(() => {
  delete process.env.TOMTOM_KEY;
});

describe('stateFor', () => {
  it('maps the share of free-flow speed to a state', () => {
    assert.equal(stateFor(0.95), 'FREE');
    assert.equal(stateFor(0.8), 'FREE');
    assert.equal(stateFor(0.6), 'SLOW');
    assert.equal(stateFor(0.3), 'HEAVY');
  });
});

describe('period', () => {
  it('reads the hour in Romania, not on the server', () => {
    // 05:30 UTC is 07:30 in Bucharest in winter (UTC+2): rush hour.
    assert.equal(period(new Date('2026-11-16T05:30:00Z')), 'rush');
    // 21:30 UTC is 23:30 in Bucharest: night.
    assert.equal(period(new Date('2026-11-16T21:30:00Z')), 'offPeak');
    assert.equal(period(new Date('2026-11-16T10:00:00Z')), 'normal');
  });
});

describe('GET /api/traffic', () => {
  it('serves typical states, marked simulated, without a TomTom key', async t => {
    t.mock.method(globalThis, 'fetch', async () => { throw new Error('must not be called'); });

    const res = await call(handlers.traffic);
    assert.equal(res.body.source, 'simulated');
    assert.equal(res.body.data.length, 8);
    assert.ok(res.body.data.every(road => ['FREE', 'SLOW', 'HEAVY'].includes(road.status)));
    assert.equal(globalThis.fetch.mock.callCount(), 0);
    assert.match(res.headers['cache-control'], /s-maxage=300\b/);
  });

  it('measures every road at its point, one request each', async t => {
    process.env.TOMTOM_KEY = 'test-key';
    // A2 is congested; every other road flows freely.
    t.mock.method(globalThis, 'fetch', async url =>
      url.includes('point=44.44269,26.78527') ? flow(40, 120) : flow(110, 120));

    const res = await call(handlers.traffic);
    const byId = Object.fromEntries(res.body.data.map(road => [road.id, road]));
    assert.equal(res.body.source, 'live');
    assert.equal(globalThis.fetch.mock.callCount(), 8);
    assert.deepEqual(byId.a2, { id: 'a2', name: 'A2  BUC – CONSTANȚA', status: 'HEAVY', speed: 40, freeFlow: 120 });
    assert.equal(byId['a1-east'].status, 'FREE');
    // Two stretches of the A1 are listed apart, so ids must not repeat.
    assert.equal(new Set(res.body.data.map(road => road.id)).size, 8);
    assert.match(res.headers['cache-control'], /s-maxage=1800\b/);
  });

  it('counts a closed road as heavy', async t => {
    process.env.TOMTOM_KEY = 'test-key';
    t.mock.method(globalThis, 'fetch', async () => flow(100, 100, true));

    const res = await call(handlers.traffic);
    assert.ok(res.body.data.every(road => road.status === 'HEAVY'));
  });

  it('falls back to typical states when TomTom fails', async t => {
    process.env.TOMTOM_KEY = 'test-key';
    t.mock.method(console, 'error', () => {});
    t.mock.method(globalThis, 'fetch', async () => jsonResponse({}, 403));

    const res = await call(handlers.traffic);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.source, 'simulated');
    assert.equal(res.body.data[0].speed, undefined);
  });
});
